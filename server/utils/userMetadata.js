const USER_ROLES = Object.freeze([
  'Content Creator',
  'Video Editor',
  'Graphic Designer',
  'Consumer',
  'Other'
]);

const CONTENT_CREATOR_ROLE = USER_ROLES[0];
const VIDEO_EDITOR_ROLE = USER_ROLES[1];
const GRAPHIC_DESIGNER_ROLE = USER_ROLES[2];
const CONSUMER_ROLE = USER_ROLES[3];
const OTHER_ROLE = USER_ROLES[4];

const ROLE_ALIAS_MAP = new Map([
  ['content creator', CONTENT_CREATOR_ROLE],
  ['contentcreator', CONTENT_CREATOR_ROLE],
  ['content_creator', CONTENT_CREATOR_ROLE],
  ['creator', CONTENT_CREATOR_ROLE],
  ['video editor', VIDEO_EDITOR_ROLE],
  ['videoeditor', VIDEO_EDITOR_ROLE],
  ['video_editor', VIDEO_EDITOR_ROLE],
  ['editor', VIDEO_EDITOR_ROLE],
  ['graphic designer', GRAPHIC_DESIGNER_ROLE],
  ['graphicdesigner', GRAPHIC_DESIGNER_ROLE],
  ['graphic_designer', GRAPHIC_DESIGNER_ROLE],
  ['designer', GRAPHIC_DESIGNER_ROLE],
  ['consumer', CONSUMER_ROLE],
  ['other', OTHER_ROLE]
]);

const ROLE_LEGACY_KEY_MAP = new Map([
  [CONTENT_CREATOR_ROLE, 'content_creator'],
  [VIDEO_EDITOR_ROLE, 'video_editor'],
  [GRAPHIC_DESIGNER_ROLE, 'graphic_designer'],
  [CONSUMER_ROLE, 'consumer'],
  [OTHER_ROLE, 'other']
]);

const USER_NICHES = Object.freeze([
  'tech',
  'fitness',
  'fashion',
  'food',
  'travel',
  'gaming',
  'beauty',
  'finance',
  'education',
  'lifestyle',
  'music',
  'comedy',
  'other'
]);

const NICHE_ALIAS_MAP = new Map([
  ['tech', 'tech'],
  ['technology', 'tech'],
  ['fitness', 'fitness'],
  ['fashion', 'fashion'],
  ['food', 'food'],
  ['cooking', 'food'],
  ['travel', 'travel'],
  ['gaming', 'gaming'],
  ['beauty', 'beauty'],
  ['beauty makeup', 'beauty'],
  ['beauty and makeup', 'beauty'],
  ['beauty & makeup', 'beauty'],
  ['finance', 'finance'],
  ['education', 'education'],
  ['lifestyle', 'lifestyle'],
  ['vlogging', 'lifestyle'],
  ['music', 'music'],
  ['comedy', 'comedy'],
  ['other', 'other']
]);

const cleanValue = (value) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/[&]/g, ' and ')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ');

const normalizeRole = (value) => {
  if (!value) return null;

  const raw = String(value).trim();
  if (USER_ROLES.includes(raw)) return raw;

  return ROLE_ALIAS_MAP.get(cleanValue(value)) || null;
};

const toLegacyRoleKey = (value) => {
  const normalized = normalizeRole(value);
  return normalized ? ROLE_LEGACY_KEY_MAP.get(normalized) : null;
};

const getRoleQueryValues = (roles) => {
  const values = Array.isArray(roles) ? roles : [roles];

  return [...new Set(
    values
      .flatMap((role) => {
        const normalized = normalizeRole(role);
        const legacy = toLegacyRoleKey(role);
        return [normalized, legacy].filter(Boolean);
      })
  )];
};

const buildRoleFilter = (roles) => {
  const values = getRoleQueryValues(roles);

  if (values.length === 0) return null;
  if (values.length === 1) return values[0];

  return { $in: values };
};

const isRole = (value, expected) => {
  const normalizedValue = normalizeRole(value);
  const normalizedExpected = normalizeRole(expected);
  return Boolean(normalizedValue && normalizedExpected && normalizedValue === normalizedExpected);
};

const normalizeNiche = (value) => {
  if (!value) return null;

  const cleaned = cleanValue(value);
  return NICHE_ALIAS_MAP.get(cleaned) || null;
};

const normalizeNiches = (values) => {
  const input = Array.isArray(values) ? values : values ? [values] : [];

  return [...new Set(
    input
      .map((value) => normalizeNiche(value))
      .filter(Boolean)
  )];
};

export {
  USER_ROLES,
  USER_NICHES,
  CONTENT_CREATOR_ROLE,
  VIDEO_EDITOR_ROLE,
  GRAPHIC_DESIGNER_ROLE,
  CONSUMER_ROLE,
  OTHER_ROLE,
  normalizeRole,
  normalizeNiche,
  normalizeNiches,
  toLegacyRoleKey,
  getRoleQueryValues,
  buildRoleFilter,
  isRole
};
