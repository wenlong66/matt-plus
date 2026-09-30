/**
 * Pure taxonomy port from gstack/lib/redact-patterns.ts at
 * e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09 (MIT).
 * A local guardrail, not a complete semantic detector or credential validator.
 * Capture group 1 is the candidate span; otherwise the full match is used.
 */
export const SOURCE_REVISION = "e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09";

export function luhnValid(span) {
  const digits = span.replace(/[ \-]/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const digit = digits.charCodeAt(i) - 48;
    const doubled = (digits.length - 1 - i) % 2 === 1 ? digit * 2 : digit;
    sum += doubled > 9 ? doubled - 9 : doubled;
  }
  return sum % 10 === 0;
}

export function shannonEntropy(span) {
  if (!span.length) return 0;
  // Sort a fresh array, never caller-owned data. Count runs without mutable caches.
  const chars = [...span].sort();
  let entropy = 0;
  let start = 0;
  while (start < chars.length) {
    let end = start + 1;
    while (end < chars.length && chars[end] === chars[start]) end += 1;
    const proportion = (end - start) / span.length;
    entropy -= proportion * Math.log2(proportion);
    start = end;
  }
  return entropy;
}

export function isPublicIPv4(ip) {
  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return false;
  const [first, second] = octets;
  return !(
    first === 0 || first === 10 || first === 127 || first >= 224 ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 100 && second >= 64 && second <= 127)
  );
}

function looksLikeWallet(span) {
  if (/^0x[a-fA-F0-9]{40}$/.test(span)) {
    return !/^(.)\1{39}$/.test(span.slice(2).toLowerCase());
  }
  // Upstream provides length/charset checks, NOT BTC/EIP-55 validation.
  return span.length >= 26 && span.length <= 62;
}

export function isPlaceholderSpan(span) {
  // Deliberately no substring /example/ rule: live-shaped examples require an
  // explicit exact benignExamples entry. Suppression is only on the match.
  return /^(?:your[_-]|redacted(?:[_-]|$)|placeholder(?:[_-]|$)|dummy(?:[_-]|$)|fake(?:[_-]|$))/i.test(span) ||
    /^<[^>]*>$/.test(span) || /^\*+$/.test(span) || /^x{6,}$/i.test(span) ||
    /^(?:changeme|test[_-]?(?:key|token|secret)(?:[_-].*)?)$/i.test(span);
}

function hasNonPlaceholderPassword(span) {
  const password = span.match(/:\/\/[^:]+:([^@]+)@/)?.[1] ?? "";
  return password !== "" && !isPlaceholderSpan(password) && !/^\$\{?[A-Z_]+\}?$/.test(password);
}

function hasSecretEntropy(span) {
  return !isPlaceholderSpan(span) && !/^\$\{?[A-Za-z_]/.test(span) && shannonEntropy(span) >= 3.0;
}

export const PATTERNS = Object.freeze([
  // HIGH: genuinely secret credential shapes. Visibility never changes tiers.
  {
    id: "aws.access_key", tier: "HIGH", category: "secret",
    description: "AWS access key ID (AKIA…)",
    regex: /\b(AKIA[0-9A-Z]{16})\b/,
  },
  {
    id: "aws.secret_key", tier: "HIGH", category: "secret",
    description: "AWS secret access key (with aws_secret_access_key nearby)",
    regex: /\b([A-Za-z0-9/+=]{40})\b/,
    nearRegex: /aws.{0,3}secret.{0,3}access.{0,3}key/i, nearWindow: 100,
  },
  {
    id: "github.pat", tier: "HIGH", category: "secret",
    description: "GitHub personal access token (classic)",
    regex: /\b(ghp_[A-Za-z0-9]{36})\b/,
  },
  {
    id: "github.oauth", tier: "HIGH", category: "secret",
    description: "GitHub OAuth token", regex: /\b(gho_[A-Za-z0-9]{36})\b/,
  },
  {
    id: "github.server", tier: "HIGH", category: "secret",
    description: "GitHub server-to-server token", regex: /\b(ghs_[A-Za-z0-9]{36})\b/,
  },
  {
    id: "github.fine_grained", tier: "HIGH", category: "secret",
    description: "GitHub fine-grained PAT", regex: /\b(github_pat_[A-Za-z0-9_]{82})\b/,
  },
  {
    id: "gitlab.token", tier: "HIGH", category: "secret",
    description: "GitLab token (personal/pipeline-trigger/deploy)",
    regex: /\b(gl(?:pat|ptt|dt)-[A-Za-z0-9_-]{20,})\b/,
  },
  {
    id: "huggingface.token", tier: "HIGH", category: "secret",
    description: "HuggingFace access token", regex: /\b(hf_[A-Za-z0-9]{30,})\b/,
  },
  {
    id: "npm.token", tier: "HIGH", category: "secret",
    description: "npm granular access token", regex: /\b(npm_[A-Za-z0-9]{36})\b/,
  },
  {
    id: "digitalocean.token", tier: "HIGH", category: "secret",
    description: "DigitalOcean personal access token", regex: /\b(dop_v1_[a-f0-9]{64})\b/,
  },
  {
    id: "gcp.service_account", tier: "HIGH", category: "secret",
    description: "GCP service-account JSON private key",
    regex: /("private_key"\s*:\s*"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----)/,
    nearRegex: /"private_key_id"/, nearWindow: 300,
  },
  {
    id: "anthropic.key", tier: "HIGH", category: "secret",
    description: "Anthropic API key", regex: /\b(sk-ant-[A-Za-z0-9_\-]{20,})\b/,
  },
  {
    id: "openai.key", tier: "HIGH", category: "secret",
    description: "OpenAI API key (incl. sk-proj-/sk-svcacct-/sk-admin-)",
    regex: /\b(sk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{32,})\b/,
  },
  {
    id: "sendgrid.key", tier: "HIGH", category: "secret",
    description: "SendGrid API key", regex: /\b(SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43})\b/,
  },
  {
    id: "stripe.secret", tier: "HIGH", category: "secret",
    description: "Stripe live SECRET key", regex: /\b(sk_live_[A-Za-z0-9]{24,})\b/,
  },
  {
    id: "slack.token", tier: "HIGH", category: "secret",
    description: "Slack token (bot/user/app)", regex: /\b(xox[baprs]-[A-Za-z0-9-]{10,})\b/,
  },
  {
    id: "slack.webhook", tier: "HIGH", category: "secret",
    description: "Slack incoming webhook URL",
    regex: /(https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]{24})/,
  },
  {
    id: "discord.webhook", tier: "HIGH", category: "secret",
    description: "Discord webhook URL",
    regex: /(https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/[0-9]{17,20}\/[A-Za-z0-9_\-]{60,})/,
  },
  {
    id: "twilio.auth_token", tier: "HIGH", category: "secret",
    description: "Twilio auth token (32 hex, with an Account SID nearby)",
    regex: /\b([a-f0-9]{32})\b/, nearRegex: /\bAC[a-f0-9]{32}\b/, nearWindow: 200,
  },
  {
    id: "pem.private_key", tier: "HIGH", category: "secret",
    description: "PEM private key block",
    regex: /(-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----)/,
  },
  {
    id: "db.url_with_password", tier: "HIGH", category: "secret",
    description: "Database URL with embedded password",
    regex: /\b((?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^:\s/@]+:[^@\s/]+@[^\s/]+)/,
    validate: hasNonPlaceholderPassword,
  },
  {
    id: "creds.basic_auth_url", tier: "HIGH", category: "secret",
    description: "HTTP(S) URL with embedded basic-auth credentials",
    regex: /(https?:\/\/[^:\s/@]+:[^@\s/]+@[^\s/]+)/,
    validate: hasNonPlaceholderPassword,
  },
  // MEDIUM: context-variable credential shapes, PII, internal and legal content.
  {
    id: "stripe.publishable", tier: "MEDIUM", category: "secret",
    description: "Stripe live publishable key (often intentionally public)",
    regex: /\b(pk_live_[A-Za-z0-9]{24,})\b/,
  },
  {
    id: "google.api_key", tier: "MEDIUM", category: "secret",
    description: "Google API key (AIza…; sometimes a public client key)",
    regex: /\b(AIza[0-9A-Za-z\-_]{35})\b/,
  },
  {
    id: "jwt", tier: "MEDIUM", category: "secret",
    description: "JSON Web Token (3-segment base64url)",
    regex: /\b(eyJ[A-Za-z0-9_\-]{8,}\.eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,})\b/,
  },
  {
    id: "env.kv", tier: "MEDIUM", category: "secret",
    description: "Env-style SECRET assignment with high-entropy value",
    regex: /^[ \t]*(?:export[ \t]+)?[A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIALS?|DSN|AUTH|COOKIE|SESSION|PRIVATE)[ \t]*=[ \t]*['"]?([^\s'"]{8,})['"]?/,
    validate: hasSecretEntropy,
  },
  {
    id: "auth.bearer", tier: "MEDIUM", category: "secret",
    description: "Authorization Bearer token (high-entropy, header context)",
    regex: /\bBearer[ \t]+([A-Za-z0-9._~+/=-]{20,})\b/,
    nearRegex: /authorization/i, nearWindow: 80, validate: hasSecretEntropy,
  },
  {
    id: "pii.email", tier: "MEDIUM", category: "pii", description: "Email address",
    regex: /\b([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})\b/,
    autoRedactable: true, redactToken: "<REDACTED-EMAIL>",
  },
  {
    id: "pii.phone.e164", tier: "MEDIUM", category: "pii",
    description: "Phone number (E.164 / common national formats; US/EU-biased)",
    regex: /(?<![\w.])(\+?[1-9]\d{0,2}[ \-.]?\(?\d{2,4}\)?[ \-.]?\d{3,4}[ \-.]?\d{3,4})(?![\w.])/,
    autoRedactable: true, redactToken: "<REDACTED-PHONE>",
    validate: (span) => span.replace(/\D/g, "").length >= 10,
  },
  {
    id: "pii.ssn", tier: "MEDIUM", category: "pii", description: "US Social Security Number",
    regex: /\b(\d{3}-\d{2}-\d{4})\b/,
    autoRedactable: true, redactToken: "<REDACTED-SSN>",
    validate: (span) => {
      const [first, second, third] = span.split("-");
      return first !== "000" && second !== "00" && third !== "0000" && first !== "666" && first[0] !== "9";
    },
  },
  {
    id: "pii.cc", tier: "MEDIUM", category: "pii",
    description: "Credit-card number (Luhn-valid)", regex: /\b((?:\d[ \-]?){13,19})\b/,
    autoRedactable: true, redactToken: "<REDACTED-CC>", validate: luhnValid,
  },
  {
    id: "pii.ip_public", tier: "MEDIUM", category: "pii", description: "Public IPv4 address",
    regex: /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/, validate: isPublicIPv4,
  },
  {
    id: "pii.wallet", tier: "MEDIUM", category: "pii", description: "Crypto wallet address (ETH/BTC)",
    regex: /\b(0x[a-fA-F0-9]{40}|bc1[a-z0-9]{25,39}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/,
    validate: looksLikeWallet,
  },
  {
    id: "internal.hostname", tier: "MEDIUM", category: "internal",
    description: "Internal hostname (*.internal/.corp/.local/.prod/.staging)",
    regex: /\b([a-z0-9][a-z0-9\-]*\.(?:internal|corp|local|lan|prod|staging))\b/i,
  },
  {
    id: "internal.url_private", tier: "MEDIUM", category: "internal",
    description: "localhost URL with a non-trivial path",
    regex: /(https?:\/\/(?:localhost|127\.0\.0\.1):\d{2,5}\/[^\s)]+)/,
  },
  {
    id: "legal.nda_marker", tier: "MEDIUM", category: "legal",
    description: "Confidentiality / NDA marker",
    regex: /\b(CONFIDENTIAL|UNDER NDA|ATTORNEY[- ]CLIENT|PRIVILEGED|DO NOT DISTRIBUTE|EYES ONLY)\b/,
  },
  {
    id: "legal.named_criticism", tier: "MEDIUM", category: "legal",
    description: "Negative judgment near a capitalized full name (semantic pass is primary)",
    regex: /\b(incompetent|negligent|fraudulent|fraud|fired|terminated|harassed|underperforming)\b/i,
    nearRegex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, nearWindow: 80,
  },
  // LOW: surface without gating.
  {
    id: "internal.user_path", tier: "LOW", category: "internal",
    description: "Absolute path under a user home dir",
    regex: /(\/(?:Users|home)\/[a-z][a-z0-9_\-]+\/[^\s)]*)/,
  },
  {
    id: "hygiene.todo", tier: "LOW", category: "hygiene",
    description: "TODO(owner) marker carried into the artifact", regex: /\b(TODO\([^)]+\))/,
  },
].map((pattern) => Object.freeze({
  ...pattern,
  regex: Object.freeze(pattern.regex),
  ...(pattern.nearRegex ? { nearRegex: Object.freeze(pattern.nearRegex) } : {}),
})));

export const PATTERNS_BY_ID = Object.freeze(Object.fromEntries(PATTERNS.map((pattern) => [pattern.id, pattern])));
