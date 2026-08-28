// Standardized Curriculum Level Definitions

// English Levels: Pre-A, A, B, C, D, E, F, G, H, I, 5, 6, 7, 8
// Displayed in REVERSE order as higher levels have more students:
export const ENGLISH_LEVELS_DISPLAY_ORDER = [
  '8',
  '7',
  '6',
  '5',
  'I',
  'H',
  'G',
  'F',
  'E',
  'D',
  'C',
  'B',
  'A',
  'Pre-A',
] as const;

// Math Levels (1 through 32), displayed in REVERSE order (32 down to 1):
export const MATH_LEVELS_DISPLAY_ORDER = Array.from({ length: 32 }, (_, i) => (32 - i).toString());

// Math BTM Levels (Includes special product "Summit", plus levels 32 down to 1)
export const MATH_BTM_LEVELS_DISPLAY_ORDER = [
  'Summit',
  ...MATH_LEVELS_DISPLAY_ORDER
] as const;

// Math CTM Levels (Levels 32 down to 1, plus 'X' for Summit/NA)
export const MATH_CTM_LEVELS_DISPLAY_ORDER = [
  ...MATH_LEVELS_DISPLAY_ORDER,
  'X'
] as const;

export type EnglishLevel = typeof ENGLISH_LEVELS_DISPLAY_ORDER[number];
export type MathBtmLevel = typeof MATH_BTM_LEVELS_DISPLAY_ORDER[number];
export type MathCtmLevel = typeof MATH_CTM_LEVELS_DISPLAY_ORDER[number];

export interface StudentLastLevels {
  english_level?: string | null;
  btm_level?: string | null;
  ctm_level?: string | null;
}

export function formatLevelDisplay(params: {
  subjectName?: string;
  englishLevel?: string | null;
  btmLevel?: string | null;
  ctmLevel?: string | null;
  levelName?: string | null;
}): string {
  const isMath = params.subjectName?.toLowerCase() === 'math';
  
  if (isMath) {
    if (params.btmLevel === 'None' && (params.ctmLevel === 'None' || !params.ctmLevel)) {
      return 'None (Not Enrolled)';
    }

    const parts: string[] = [];
    if (params.btmLevel && params.btmLevel !== 'None') {
      parts.push(params.btmLevel === 'Summit' ? 'Summit (BTM)' : `BTM ${params.btmLevel}`);
    }
    if (params.ctmLevel && params.ctmLevel !== 'None') {
      parts.push(params.ctmLevel === 'X' ? 'CTM: X' : `CTM ${params.ctmLevel}`);
    }
    if (parts.length > 0) return parts.join(' | ');
    return 'None';
  }

  if (params.englishLevel) {
    if (params.englishLevel === 'None') return 'None (Not Enrolled)';
    return `Level ${params.englishLevel}`;
  }

  if (params.levelName) {
    return params.levelName;
  }

  return '—';
}
