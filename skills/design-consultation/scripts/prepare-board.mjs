import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LETTERS = Object.freeze(['A', 'B', 'C']);
const TEMPLATE = fileURLToPath(new URL('../assets/comparison-board.html', import.meta.url));
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isReadableImage = image => {
  try {
    fs.accessSync(image, fs.constants.R_OK);
    return fs.statSync(image).isFile() && /\.(png|jpe?g|webp|gif|avif)$/i.test(image);
  } catch {
    return false;
  }
};
export const imageLink = value => path.isAbsolute(value) ? pathToFileURL(value).href : value.split(path.sep).map(encodeURIComponent).join('/');

function validateRound(input) {
  if (!isObject(input) || typeof input.round !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(input.round)) {
    throw new Error('Round needs a short, nonempty alphanumeric ID (hyphens/underscores allowed).');
  }
  if (!Array.isArray(input.images) || input.images.length < 1 || input.images.length > LETTERS.length) {
    throw new Error('Round images must contain one to three actual successful paths.');
  }
  if (new Set(input.images).size !== input.images.length) throw new Error('Round images must be distinct.');
  for (const image of input.images) {
    if (typeof image !== 'string' || !path.isAbsolute(image) || !isReadableImage(image)) {
      throw new Error('Saved image is not an absolute readable raster file.');
    }
  }
  return { round: input.round, images: [...input.images] };
}

function createRoundDirectory(root, round) {
  for (let bump = 0; ; bump += 1) {
    const dir = path.join(root, `board-${round}${bump ? `-${bump + 1}` : ''}`);
    try {
      fs.mkdirSync(dir);
      return dir;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
}

function renderBoard(config) {
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const cards = [...template.matchAll(/<section class="variant"[\s\S]*?<\/section>/g)];
  if (cards.length !== LETTERS.length) throw new Error('Comparison board template must keep its three example cards.');
  const html = LETTERS.reduce((text, id, index) => {
    if (!(id in config.images)) {
      return text.replace(cards[index][0], '').replaceAll(`<option value="${id}">${id}</option>`, '');
    }
    const url = imageLink(config.images[id]);
    return text.replace(cards[index][0], cards[index][0].replaceAll(`variant-${id}.png`, url));
  }, template).replace('repeat(3, minmax(0, 1fr))', `repeat(${Object.keys(config.images).length}, minmax(0, 1fr))`);
  const json = JSON.stringify(config).replaceAll('<', '\\u003c');
  return html.replace(/  <script>\r?\n/, `  <script type="application/json" id="board-config">${json}</script>\n  <script>\n`);
}

// This local adapter adds round identity; board-images.json stays the upstream ordered path array.
export function prepareBoard(input, artifactDirectory) {
  const round = validateRound(input);
  const root = path.resolve(artifactDirectory);
  if (!fs.statSync(root).isDirectory()) throw new Error('Approved artifact directory is not a directory.');
  const directory = createRoundDirectory(root, round.round);
  try {
    const images = round.images.map(image => path.relative(directory, image));
    const config = { round: path.basename(directory), images: Object.fromEntries(images.map((image, index) => [LETTERS[index], image])) };
    const boardPath = path.join(directory, 'design-board.html');
    const manifestPath = path.join(directory, 'board-images.json');
    fs.writeFileSync(boardPath, renderBoard(config), { flag: 'wx' });
    fs.writeFileSync(manifestPath, `${JSON.stringify(images, null, 2)}\n`, { flag: 'wx' });
    return { boardPath, manifestPath, round: config.round, images };
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true }); // Only this call's exclusively created directory.
    throw error;
  }
}

// Unbound upstream/pasted feedback requires human current-round confirmation, not inferred approval.
export function validateFeedback(feedback, currentRound) {
  if (!isObject(feedback) || !isObject(currentRound) || !Array.isArray(currentRound.images)) throw new Error('Invalid feedback or round.');
  if (feedback.boardRound !== currentRound.round) throw new Error('Feedback is unbound or stale; confirm the current round.');
  const ids = LETTERS.slice(0, currentRound.images.length);
  if (feedback.preferred !== null && !ids.includes(feedback.preferred)) throw new Error('Preferred image is not on this board.');
  if (typeof feedback.regenerated !== 'boolean') throw new Error('Feedback regenerated must be boolean.');
  if (feedback.overall !== null && typeof feedback.overall !== 'string') throw new Error('Overall feedback must be text or null.');
  for (const key of ['ratings', 'comments']) {
    if (!isObject(feedback[key])) throw new Error(`Feedback ${key} must be an object.`);
    for (const [id, value] of Object.entries(feedback[key])) {
      if (!ids.includes(id)) throw new Error(`Feedback names absent variant ${id}.`);
      if (key === 'ratings' && value !== null && !(Number.isInteger(value) && value >= 1 && value <= 5)) throw new Error('Rating must be null or 1–5.');
      if (key === 'comments' && typeof value !== 'string') throw new Error('Comments must be text.');
    }
  }
  if (feedback.regenerated) {
    if (typeof feedback.regenerateAction !== 'string' || !feedback.regenerateAction.trim()) throw new Error('Revision action needs text.');
    if (feedback.regenerateAction.startsWith('more_like_') && !ids.includes(feedback.regenerateAction.slice('more_like_'.length))) throw new Error('More-like source is absent.');
    if (feedback.regenerateAction === 'remix') {
      if (!isObject(feedback.remixSpec) || !Object.keys(feedback.remixSpec).length) throw new Error('Remix needs a source map.');
      for (const [part, id] of Object.entries(feedback.remixSpec)) {
        if (!['layout', 'colors', 'typography'].includes(part) || !ids.includes(id)) throw new Error('Invalid remix source.');
      }
    }
  }
  return feedback; // Validation only: Submit notes still require human revision/final routing.
}

export function resolveApprovedImage(record, recordDirectory, images) {
  if (!isObject(record) || !Array.isArray(images)) throw new Error('Approval needs this round’s manifest.');
  const index = LETTERS.indexOf(record.approved_variant);
  if (index < 0 || index >= images.length || typeof record.approved_path !== 'string' || !record.approved_path) throw new Error('Approval names no current image; reselect from the board.');
  const approved = path.resolve(recordDirectory, record.approved_path);
  if (approved !== path.resolve(recordDirectory, images[index])) throw new Error('Approved path does not match this round; reselect from the board.');
  if (!isReadableImage(approved)) throw new Error('Approved image is missing or unreadable; reselect from the board.');
  return approved;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4) throw new Error('Usage: node prepare-board.mjs <round-input.json> <approved artifact directory>');
    const input = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
    process.stdout.write(`${JSON.stringify(prepareBoard(input, process.argv[3]), null, 2)}\n`);
  } catch (error) {
    const reason = error instanceof SyntaxError ? 'invalid round JSON' : error.code ? 'local input/output failed' : error.message;
    process.stderr.write(`Board unavailable: ${reason}\n`);
    process.exitCode = 1;
  }
}
