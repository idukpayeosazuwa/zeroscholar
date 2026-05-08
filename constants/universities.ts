export type UniversityCategory = 'Federal' | 'State' | 'Private' | 'Other';

export type UniversityAliasOption = {
  alias: string;
  name?: string;
  category?: UniversityCategory;
};

const KNOWN_UNIVERSITY_ALIAS_OPTIONS: UniversityAliasOption[] = [
  // Seeded from `update_constants.js` (and corrected where needed)
  { alias: 'ABU', name: 'Ahmadu Bello University', category: 'Federal' },
  { alias: 'ATBU', name: 'Abubakar Tafawa Balewa University', category: 'Federal' },
  { alias: 'BUK', name: 'Bayero University Kano', category: 'Federal' },
  { alias: 'FUAAM', name: 'Federal University of Agriculture, Makurdi', category: 'Federal' },
  { alias: 'FUNAAB', name: 'Federal University of Agriculture, Abeokuta', category: 'Federal' },
  { alias: 'FUTA', name: 'Federal University of Technology, Akure', category: 'Federal' },
  { alias: 'FUTMINNA', name: 'Federal University of Technology, Minna', category: 'Federal' },
  { alias: 'FUTO', name: 'Federal University of Technology, Owerri', category: 'Federal' },
  { alias: 'MOUAU', name: 'Michael Okpara University of Agriculture', category: 'Federal' },
  { alias: 'NOUN', name: 'National Open University of Nigeria', category: 'Federal' },
  { alias: 'NOVENA', name: 'Novena University', category: 'Private' },
  { alias: 'OAU', name: 'Obafemi Awolowo University', category: 'Federal' },
  { alias: 'UI', name: 'University of Ibadan', category: 'Federal' },
  { alias: 'UNIBEN', name: 'University of Benin', category: 'Federal' },
  { alias: 'UNIABUJA', name: 'University of Abuja', category: 'Federal' },
  { alias: 'UNICAL', name: 'University of Calabar', category: 'Federal' },
  { alias: 'UNIJOS', name: 'University of Jos', category: 'Federal' },
  { alias: 'UNILAG', name: 'University of Lagos', category: 'Federal' },
  { alias: 'UNILORIN', name: 'University of Ilorin', category: 'Federal' },
  { alias: 'UNIMAID', name: 'University of Maiduguri', category: 'Federal' },
  { alias: 'UNIPORT', name: 'University of Port Harcourt', category: 'Federal' },
  { alias: 'UNIUYO', name: 'University of Uyo', category: 'Federal' },
  { alias: 'UNIZIK', name: 'Nnamdi Azikiwe University', category: 'Federal' },
  { alias: 'UNN', name: 'University of Nigeria, Nsukka', category: 'Federal' },
  { alias: 'UDUSOK', name: 'Usmanu Danfodiyo University', category: 'Federal' },
];

// Extracted from this repo’s scholarship dataset/report (so it matches what the matcher expects).
// Note: some aliases may be unknown/abbreviated; we still include them for consistency.
const DATASET_UNIVERSITY_ALIASES: string[] = [
  'AAUA',
  'ABU',
  'BUK',
  'EKSU',
  'FUGUS',
  'FUNAAB',
  'FUOYE',
  'FUTA',
  'FUTMINNA',
  'KASU',
  'KUST',
  'LAUTECH',
  'OAU',
  'OOU',
  'OSUMEDSCI',
  'OSUSTECH',
  'PAU',
  'PTI',
  'RSU',
  'SSU',
  'SSUE',
  'SSUOE',
  'SUMMIT',
  'TASEUD',
  'TASUED',
  'UDUS',
  'UDUSOK',
  'UI',
  'UNIABUJA',
  'UNIBEN',
  'UNICAL',
  'UNILAG',
  'UNILESA',
  'UNILORIN',
  'UNIMAID',
  'UNIMED',
  'UNIOSUN',
  'UNIPORT',
  'UNIUYO',
  'UNIZIK',
  'UNN',
  'ZSU',
];

const aliasOptionByAlias = new Map<string, UniversityAliasOption>();
for (const opt of KNOWN_UNIVERSITY_ALIAS_OPTIONS) aliasOptionByAlias.set(opt.alias, opt);

for (const alias of DATASET_UNIVERSITY_ALIASES) {
  if (!aliasOptionByAlias.has(alias)) aliasOptionByAlias.set(alias, { alias });
}

export const UNIVERSITY_ALIAS_OPTIONS: UniversityAliasOption[] = Array.from(aliasOptionByAlias.values()).sort(
  (a, b) => a.alias.localeCompare(b.alias)
);

export const UNIVERSITY_ALIAS_DATALIST_VALUES: string[] = UNIVERSITY_ALIAS_OPTIONS.map((opt) =>
  opt.name ? `${opt.alias} - ${opt.name}` : opt.alias
);

const CANONICAL_ALIAS_MAP: Record<string, string> = {
  // Common synonyms / typos seen in data
  UNIBUJA: 'UNIABUJA',
  UNCAL: 'UNICAL',
  TASEUD: 'TASUED',
  UDUS: 'UDUSOK',
};

export function canonicalizeUniversityAlias(alias: string): string {
  const upper = (alias || '').trim().toUpperCase();
  return CANONICAL_ALIAS_MAP[upper] || upper;
}

export function normalizeUniversityAliasInput(input: string): string {
  const raw = String(input || '').trim();
  if (!raw) return '';

  // Accept values like:
  // - "UNILAG"
  // - "UNILAG - University of Lagos"
  // - "UNILAG — University of Lagos"
  // - "UNILAG: University of Lagos"
  const aliasCandidate = raw.split(/\s*(?:-|—|:|–)\s*/)[0] || raw;
  const alias = aliasCandidate.replace(/\s+/g, '').toUpperCase();

  return canonicalizeUniversityAlias(alias);
}

export function isPlausibleUniversityAlias(alias: string): boolean {
  const a = normalizeUniversityAliasInput(alias);
  return /^[A-Z][A-Z0-9]{1,10}$/.test(a) && !['ALL', 'ANY', 'NONE', 'N/A'].includes(a);
}
