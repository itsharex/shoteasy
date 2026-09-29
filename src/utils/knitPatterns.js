/**
 * Small, original knit presets used by the browser renderer.
 *
 * The source Window Sweaters project is a reference for the interaction and
 * material idea. These charts are intentionally kept as local data so this
 * editor does not need to ship catalogue screenshots or a native renderer.
 */
export const KNIT_BAND_MIN = 12;
export const KNIT_BAND_MAX = 48;
export const KNIT_BAND_DEFAULT = 18;
export const KNIT_CORNER_DEFAULT = 36;
export const KNIT_ROWS_MIN = 4;
export const KNIT_ROWS_MAX = 10;
export const KNIT_ROWS_DEFAULT = 6;

export const KNIT_PRESETS = [
    {
        id: 'codex',
        title: '蓝色波纹',
        description: '蓝色波纹与奶油色饰线',
        base: '#1976d2',
        accent: '#f6ecd5',
        pattern: [
            'a.....a.....',
            '.a.....a....',
            '..a.....a...',
            '...a.....a..',
            '..a.....a...',
            '.a.....a....',
        ],
    },
    {
        id: 'finder',
        title: '冰蓝格纹',
        description: '冰蓝格纹与深蓝底色',
        base: '#2587d5',
        accent: '#d9f1ff',
        pattern: [
            'a.a.a.a.a.a.',
            '.a.a.a.a.a.a',
            'a.a.a.a.a.a.',
            '.a.a.a.a.a.a',
            'a.a.a.a.a.a.',
            '.a.a.a.a.a.a',
        ],
    },
    {
        id: 'claude',
        title: '杏色星点',
        description: '杏色羊毛与奶油星点',
        base: '#c67b59',
        accent: '#f8e8c7',
        pattern: [
            '....a.......',
            '...aaa......',
            '..a.a.......',
            '....a.......',
            '............',
            '....a.......',
        ],
    },
    {
        id: 'spotify',
        title: '森林绿',
        description: '森林绿与黄油色棋盘',
        base: '#34734f',
        accent: '#e5d486',
        pattern: [
            'aa..aa..aa..',
            'aa..aa..aa..',
            '..aa..aa..aa',
            '..aa..aa..aa',
            'aa..aa..aa..',
            'aa..aa..aa..',
        ],
    },
    {
        id: 'meadow',
        title: '绿色草原',
        description: '嫩绿底色与浅绿草叶',
        base: '#498b58',
        accent: '#d5e998',
        pattern: ['..a...a...a.', '.aaa.aaa.aaa', '..a...a...a.', 'a...a...a...', 'aa.aaa.aaa..', 'a...a...a...'],
    },
    {
        id: 'midnight',
        title: '黑色针织',
        description: '炭黑羊毛与石墨色纹理',
        base: '#202328',
        accent: '#838b91',
        pattern: ['aa....aa....', '.aa....aa...', '..aa....aa..', '...aa....aa.', '....aa....aa', '.....aa....a'],
    },
    {
        id: 'google',
        title: 'Google 多彩',
        description: '蓝红黄绿交错针脚',
        base: '#3265bc',
        accent: '#fbbc05',
        secondary: '#ea4335',
        tertiary: '#34a853',
        pattern: ['a..b..c..a..', '.b..c..a..b.', '..c..a..b..c', 'c..a..b..c..', '.a..b..c..a.', '..b..c..a..b'],
    },
    {
        id: 'snow',
        title: '白色雪地',
        description: '暖白绒线与冰蓝雪花',
        base: '#e7ebeb',
        accent: '#94bad0',
        pattern: ['....a.......', '...aaa......', '..aaaaa.....', '...aaa......', '....a.......', '............'],
    },
];

const KNIT_PRESET_MAP = Object.fromEntries(KNIT_PRESETS.map((preset) => [preset.id, preset]));

export const getKnitPreset = (presetId) => KNIT_PRESET_MAP[presetId] || KNIT_PRESETS[0];

export const normalizeKnitBand = (value) => {
    const band = Number(value);
    if (!Number.isFinite(band)) return KNIT_BAND_DEFAULT;
    return Math.max(KNIT_BAND_MIN, Math.min(KNIT_BAND_MAX, Math.round(band)));
};

export const normalizeKnitRound = (value) => {
    if (value == null || value === '') return KNIT_CORNER_DEFAULT;
    const round = Number(value);
    if (!Number.isFinite(round)) return KNIT_CORNER_DEFAULT;
    return Math.max(0, Math.min(999, Math.round(round)));
};

export const normalizeKnitRows = (value) => {
    const rows = Number(value);
    if (!Number.isFinite(rows)) return KNIT_ROWS_DEFAULT;
    return Math.max(KNIT_ROWS_MIN, Math.min(KNIT_ROWS_MAX, Math.round(rows)));
};

export default KNIT_PRESETS;
