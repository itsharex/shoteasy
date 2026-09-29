// —— Gradientshub 本地渐变图 ——
// 根目录放原图、thumbnails/ 放同名 webp 缩略图；文件名数字前缀是入库序号。
// 倒序排列（数字大 = 最近加入 = 排最前）；缩略图缺失时回退原图，原图缺失的编号不生效。
const GRADIENT_EXT_PRIORITY = ['png', 'jpg', 'jpeg', 'webp'];

const collectGradientsByNumber = (modules) => {
    const byNumber = new Map();
    Object.entries(modules).forEach(([path, url]) => {
        const name = path.slice(path.lastIndexOf('/') + 1);
        const number = Number.parseInt(name, 10);
        if (!Number.isFinite(number)) return;
        const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
        const existing = byNumber.get(number);
        // 同号多格式（如 11 同时有 jpg/png）取优先级高的
        if (!existing || GRADIENT_EXT_PRIORITY.indexOf(ext) < GRADIENT_EXT_PRIORITY.indexOf(existing.ext)) {
            byNumber.set(number, { url, ext });
        }
    });
    return byNumber;
};

const gradientshubOriginals = collectGradientsByNumber(
    import.meta.glob('@assets/gradients/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' })
);
const gradientshubThumbnails = collectGradientsByNumber(
    import.meta.glob('@assets/gradients/thumbnails/*.webp', { eager: true, query: '?url', import: 'default' })
);

// 键前缀 gh_img_ 与远程 cosmic_img_N 区分（本地 10/11/13/15 与远程编号撞号）
const gradientshubLocalConfig = Object.fromEntries(
    [...gradientshubOriginals.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([number, { url }]) => [
            `gh_img_${number}`,
            {
                class: url,
                preview: gradientshubThumbnails.get(number)?.url || url,
                fill: { type: 'image', url },
            },
        ])
);

const ADDITIONAL_GRADIENT_STOPS = [
    ['#f5f7fa', '#c3cfe2', '#e0c3fc','#8ec5fc'],
    ['#ff9a9e', '#fecfef', '#c1dfc4', '#deecdd'],
    ['#2193b0', '#6dd5ed', '#cc2b5e', '#753a88'],
    ['#43e97b', '#38f9d7', '#fa7199'],
    ['#5ee7df', '#b490ca', '#43cea2', '#185a9d', '#6713d2'],
    ['#09203f', '#537895', '#243949'],
    ['#13547a', '#80d0c7', '#07a3b2', '#d9afd9', '#ff7a72'],
    ['#0ba360', '#3cba92', '#30dd8a'],
    ['#ff9a9e', '#fecfef', '#fad0c4'],
    ['#c1dfc4', '#deecdd', '#7de2fc', '#b9b6e5'],
    ['#f5f7fa', '#c3cfe2', '#e0c3fc', '#8ec5fc'],
    ['#48c6ef', '#6f86d6', '#c471ed', '#f64f59'],
    ['#89f7fe', '#66a6ff', '#48c6ef'],
    ['#00dbde', '#fc00ff', '#0093e9'],
    ['#4481eb', '#04befe', '#3f5efb', '#fc466b'],
    ['#30e8bf', '#ff8235', '#feac5e'],
    ['#f43b47', '#453a94', '#0250c5'],
    ['#ffecd2', '#fcb69f', '#fd1d1d', '#833ab4', '#405de6'],
    ['#0250c5', '#d43f8d', '#0fd850'],
    ['#834d9b', '#d04ed6', '#1cd8d2'],
    ['#d9afd9', '#97d9e1', '#a7a6cb'],
    ['#eecda3', '#ef629f', '#78ffd6'],
    ['#667db6', '#0082c8', '#0082c8', '#667db6'],
    ['#764ba2', '#667eea', '#63b3ed', '#434343'],
    ['#209cff', '#68e0cf', '#96fbc4', '#f9f586', '#f6d5f7'],
    ['#37ecba', '#72afd3', '#ff4b1f', '#1fddff'],
    ['#fff1eb', '#ace0f9', '#a18cd1', '#fbc2eb'],
    ['#373b44', '#4286f4', '#00c6ff'],
    ['#ff0844', '#ffb199', '#ff8177'],
    ['#a1c4fd', '#c2e9fb', '#93a5cf'],
    ['#ed6ea0', '#ec8c69', '#f7186a', '#fbb03b'],
    ['#fdfcfb', '#e2d1c3', '#f5f7fa', '#c3cfe2'],
    ['#b465da', '#cf6cc9', '#ee609c', '#ee609c', '#f59c65'],
    ['#ff8008', '#ffc837', '#ff0099'],
    ['#00c6fb', '#005bea', '#21d4fd', '#b721ff'],
    ['#b721ff', '#21d4fd', '#0052d4', '#4364f7', '#6fb1fc'],
    ['#74ebd5', '#acb6e5', '#0fd850'],
    ['#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
    ['#000000', '#434343', '#ffffff'],
    ['#f5f5f5', '#bdbdbd', '#424242', '#000000'],
    ['#111111', '#537895', '#09203f'],
    ['#0f2027', '#203a43', '#2c5364'],
    ['#ff512f', '#f09819', '#ff6a00'],
    ['#00f5a0', '#00d9f5', '#7a00ff'],
    ['#134e5e', '#71b280', '#dce35b'],
    ['#ff6fd8', '#3813c2', '#00dbde'],
];

const additionalGradientConfig = Object.fromEntries(
    ADDITIONAL_GRADIENT_STOPS.map((stops, index) => {
        const key = `gradient_${index + 4}`;
        return [key, {
            class: 'bg-transparent',
            previewStyle: { background: `linear-gradient(135deg, ${stops.join(', ')})` },
            fill: {
                type: 'linear',
                from: 'top-left',
                to: 'bottom-right',
                stops,
            },
        }];
    })
);

const formatGradientPreviewStop = (stop) => {
    if (typeof stop === 'string') return stop;
    const percentage = Number((Number(stop.offset) * 100).toFixed(3));
    return `${stop.color} ${percentage}%`;
};

const createLinearGradientConfig = (stops, { angle, from, to }) => ({
    class: 'bg-transparent',
    gradientAngle: angle,
    previewStyle: {
        background: `linear-gradient(${angle}deg, ${stops.map(formatGradientPreviewStop).join(', ')})`,
    },
    fill: {
        type: 'linear',
        from,
        to,
        stops,
    },
});

const createAngularGradientConfig = (stops, angle) => ({
    class: 'bg-transparent',
    gradientAngle: angle,
    previewStyle: {
        background: `conic-gradient(from ${angle}deg, ${stops.map(formatGradientPreviewStop).join(', ')})`,
    },
    fill: {
        type: 'angular',
        from: 'center',
        rotation: angle,
        stops,
    },
});

// default_3 使用近似 1px 的极窄过渡，保留 Grabient 原始的分段色带效果。
const createHardStops = (colors) => {
    // Grabient 的第一个颜色也占据一个完整区间，因此区间数等于颜色数。
    const segmentCount = Math.max(1, colors.length);
    const gap = Math.min(0.001, 1 / segmentCount / 4);
    const stops = [{ offset: 0, color: colors[0] }];
    for (let index = 0; index < colors.length - 1; index += 1) {
        const boundary = (index + 1) / segmentCount;
        stops.push({ offset: boundary, color: colors[index] });
        stops.push({ offset: Math.min(1, boundary + gap), color: colors[index + 1] });
    }
    stops.push({ offset: 1, color: colors[colors.length - 1] });
    return stops;
};

const DEFAULT_3_STOPS = createHardStops([
    '#c8d5c8', '#d0d3bd', '#d4ceaf', '#d5c59e', '#d2b88c', '#cbaa79',
    '#c19865', '#b48651', '#a5723f', '#935f2e', '#804b20', '#6c3914',
    '#59290b', '#461c06', '#341105', '#250908', '#18060e', '#0e0617',
    '#080924', '#051033', '#061b45', '#0b2958', '#13396b', '#1f4b7f',
    '#2d5e92', '#3e72a4', '#5085b3', '#6498c1', '#77a9cb', '#8bb8d2',
    '#9dc4d5', '#aecdd4', '#bcd3d0', '#c7d5c8',
]);

const legacyBackgroundConfig = {
    default_1: createLinearGradientConfig(
        ['#f5f7fa', '#c3cfe2', '#e0c3fc', '#8ec5fc'],
        { angle: 90, from: 'left', to: 'right' }
    ),
    default_2: createLinearGradientConfig(
        ['#002e5d', '#002e5d', '#2774ae'],
        { angle: 90, from: 'left', to: 'right' }
    ),
    default_3: createLinearGradientConfig(
        DEFAULT_3_STOPS,
        { angle: 90, from: 'left', to: 'right' }
    ),
    default_4: createLinearGradientConfig(
        ['#cedefd', '#b1d7f5', '#8fc6ed', '#6daae4', '#4b87dc', '#2e5ed4'],
        { angle: 180, from: 'top', to: 'bottom' }
    ),
    default_5: createLinearGradientConfig(
        ['#434343', '#000000'],
        { angle: 90, from: 'left', to: 'right' }
    ),
    default_6: createLinearGradientConfig(
        ['#c9bce0', '#bed3d4', '#d3e2bd', '#f5ddaf', '#ffc8b6', '#f0b5cb', '#ceb5de', '#bdc8de', '#ceddcb'],
        { angle: 225, from: 'top-right', to: 'bottom-left' }
    ),
    default_7: createLinearGradientConfig(
        ['#09203f', '#537895'],
        { angle: 0, from: 'bottom', to: 'top' }
    ),
    default_8: createLinearGradientConfig(
        ['#0a0000', '#250a26', '#49457a', '#767baa', '#aba9b5'],
        { angle: 0, from: 'bottom', to: 'top' }
    ),
    default_9: createLinearGradientConfig(
        ['#140e0c', '#1b121f', '#231733', '#2a1e48', '#33275d', '#3c3172', '#453c87', '#4e479a', '#5951ad', '#635cbf', '#6e65cf', '#796ede', '#8574ea', '#9179f4', '#9d7cfc', '#aa7dff', '#b67cff', '#c478ff', '#d173ff', '#df6cfe', '#ed63f7'],
        { angle: 0, from: 'bottom', to: 'top' }
    ),
    default_10: createAngularGradientConfig([
        '#000021', '#00000b', '#000000', '#000000', '#000000', '#000000', '#000000',
        '#180000', '#320000', '#4b0000', '#630000', '#7a0100', '#8d1700', '#9d2e02',
        '#a94518', '#af5b2e', '#b07045', '#ac825c', '#a39270', '#969e83', '#84a692',
        '#6faa9e', '#57aaa5', '#3ea5a9', '#259ba7', '#0c8ea2', '#007e98', '#006b8a',
        '#005579', '#003f65', '#002850', '#001139', '#000022', '#00000c',
    ], 180),
    default_11: createLinearGradientConfig(
        ['#ffc488', '#ffa375', '#ff907a', '#ff9394', '#ffacb0', '#ffcdb9', '#ffe6aa'],
        { angle: 315, from: 'bottom-right', to: 'top-left' }
    ),
    default_12: createLinearGradientConfig(
        ['#193132', '#0f5a65', '#32918b', '#74bda5', '#becab1', '#f2b2b0'],
        { angle: 90, from: 'left', to: 'right' }
    ),
    default_13: createLinearGradientConfig(
        ['#fda373', '#ffdbb0', '#fcffe4', '#ccffff', '#8bf1ff', '#4ec0e4', '#2585b0'],
        { angle: 90, from: 'left', to: 'right' }
    ),
    solid_1: {
        class: 'bg-transparent',
        fill: {
            type: 'solid',
            color: '#ffffff00',
        },
    },
    solid_2: {
        class: 'bg-slate-400',
        fill: {
            type: 'solid',
            color: '#94a3b8',
        },
    },
    solid_3: {
        class: 'bg-gray-400',
        fill: {
            type: 'solid',
            color: '#9ca3af',
        },
    },
    solid_4: {
        class: 'bg-stone-400',
        fill: {
            type: 'solid',
            color: '#a8a29e',
        },
    },
    solid_5: {
        class: 'bg-red-400',
        fill: {
            type: 'solid',
            color: '#f87171',
        },
    },
    solid_6: {
        class: 'bg-orange-400',
        fill: {
            type: 'solid',
            color: '#fb923c',
        },
    },
    solid_7: {
        class: 'bg-amber-400',
        fill: {
            type: 'solid',
            color: '#facc15',
        },
    },
    solid_8: {
        class: 'bg-yellow-400',
        fill: {
            type: 'solid',
            color: '#fbbf24',
        },
    },
    solid_9: {
        class: 'bg-lime-400',
        fill: {
            type: 'solid',
            color: '#a3e635',
        },
    },
    solid_10: {
        class: 'bg-green-400',
        fill: {
            type: 'solid',
            color: '#4ade80',
        },
    },
    solid_11: {
        class: 'bg-emerald-400',
        fill: {
            type: 'solid',
            color: '#34d399',
        },
    },
    solid_12: {
        class: 'bg-teal-400',
        fill: {
            type: 'solid',
            color: '#2dd4bf',
        },
    },
    solid_13: {
        class: 'bg-cyan-400',
        fill: {
            type: 'solid',
            color: '#22d3ee',
        },
    },
    solid_14: {
        class: 'bg-sky-400',
        fill: {
            type: 'solid',
            color: '#38bdf8',
        },
    },
    solid_15: {
        class: 'bg-blue-400',
        fill: {
            type: 'solid',
            color: '#60a5fa',
        },
    },
    solid_16: {
        class: 'bg-indigo-400',
        fill: {
            type: 'solid',
            color: '#818cf8',
        },
    },
    solid_17: {
        class: 'bg-violet-400',
        fill: {
            type: 'solid',
            color: '#a78bfa',
        },
    },
    solid_18: {
        class: 'bg-purple-400',
        fill: {
            type: 'solid',
            color: '#c084fc',
        },
    },
    solid_19: {
        class: 'bg-fuchsia-400',
        fill: {
            type: 'solid',
            color: '#e879f9',
        },
    },
    solid_20: {
        class: 'bg-pink-400',
        fill: {
            type: 'solid',
            color: '#f472b6',
        },
    },
    solid_21: {
        class: 'bg-rose-400',
        fill: {
            type: 'solid',
            color: '#fb7185',
        },
    },
    gradient_1: {
        class: 'bg-gradient-to-br from-[#ff6432] from-12.8% via-[#ff0065] via-43.52% to-[#7b2eff] to-84.34%',
        fill: {
            type: 'linear',
            from: 'top-left',
            to: 'bottom-right',
            stops: [
                { offset: 0.12, color: '#ff6432' },
                { offset: 0.44, color: '#ff0065' },
                { offset: 0.84, color: '#7b2eff' },
            ],
        },
    },
    gradient_2: {
        class: 'bg-gradient-to-br from-[#69eacb] from-0% via-[#eaccf8] via-48% to-[#6654f1] to-100%',
        fill: {
            type: 'linear',
            from: 'top-left',
            to: 'bottom-right',
            stops: [
                { offset: 0, color: '#69eacb' },
                { offset: 0.48, color: '#eaccf8' },
                { offset: 1, color: '#6654f1' },
            ],
        },
    },
    gradient_3: {
        class: 'bg-gradient-to-br from-[#f9f047] to-[#0fd850]',
        fill: {
            type: 'linear',
            from: 'top-left',
            to: 'bottom-right',
            stops: ['#f9f047', '#0fd850'],
        },
    },
    ...additionalGradientConfig,
    // Gradientshub 本地图排在远程图前面（倒序：最近加入的最前）
    ...gradientshubLocalConfig,
    cosmic_img_1: {
        class: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxfHxncmFkaWVudHxlbnwwfHx8fDE3MDMwNjAzNjh8MA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxfHxncmFkaWVudHxlbnwwfHx8fDE3MDMwNjAzNjh8MA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_2: {
        class: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwzfHxncmFkaWVudHxlbnwwfHx8fDE3MDMwNjAzNjh8MA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwzfHxncmFkaWVudHxlbnwwfHx8fDE3MDMwNjAzNjh8MA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_3: {
        class: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxN3x8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDYwMzY4fDA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxN3x8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDYwMzY4fDA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_4: {
        class: 'https://images.unsplash.com/photo-1618397746666-63405ce5d015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyN3x8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDM3NjcwfDA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618397746666-63405ce5d015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyN3x8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDM3NjcwfDA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_5: {
        class: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwzNnx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDM3NjcwfDA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwzNnx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDM3NjcwfDA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_6: {
        class: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw0Nnx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDMyNzM1fDA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw0Nnx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDMyNzM1fDA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_7: {
        class: 'https://images.unsplash.com/photo-1636990649778-fd699d27c875?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw1Mnx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDMyNzM1fDA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1636990649778-fd699d27c875?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw1Mnx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDMyNzM1fDA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_8: {
        class: 'https://images.unsplash.com/photo-1640177155742-835de7b2a9a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw5MHx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDU0Njg3fDA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1640177155742-835de7b2a9a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw5MHx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDU0Njg3fDA&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_9: {
        class: 'https://images.unsplash.com/photo-1523396206913-a003efa7861b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxMTh8fGdyYWRpZW50fGVufDB8fHx8MTcwMzEyMDMzOHww&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1523396206913-a003efa7861b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxMTh8fGdyYWRpZW50fGVufDB8fHx8MTcwMzEyMDMzOHww&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_10: {
        class: 'https://images.unsplash.com/photo-1552152370-fb05b25ff17d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxNjJ8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA3ODE5Mnww&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1552152370-fb05b25ff17d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxNjJ8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA3ODE5Mnww&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_11: {
        class: 'https://images.unsplash.com/photo-1635776063043-ab23b4c226f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyMjZ8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA4MjI2NHww&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1635776063043-ab23b4c226f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyMjZ8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA4MjI2NHww&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_12: {
        class: 'https://images.unsplash.com/photo-1640963269654-3fe248c5fba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyNTZ8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA4NDU3Nnww&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1640963269654-3fe248c5fba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyNTZ8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA4NDU3Nnww&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_13: {
        class: 'https://images.unsplash.com/photo-1595131264179-84bb2f9e17b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyNjh8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA2NzI3OXww&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1595131264179-84bb2f9e17b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwyNjh8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA2NzI3OXww&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_14: {
        class: 'https://images.unsplash.com/photo-1642116876554-b17f937ee90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxNzV8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA3ODE5Mnww&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1642116876554-b17f937ee90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHwxNzV8fGdyYWRpZW50fGVufDB8fHx8MTcwMzA3ODE5Mnww&ixlib=rb-4.0.3&q=80'
        }
    },
    cosmic_img_15: {
        class: 'https://images.unsplash.com/photo-1586455122341-927f2dec0691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw3MHx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDQ3MjE1fDA&ixlib=rb-4.0.3&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1586455122341-927f2dec0691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTY5OTZ8MHwxfHNlYXJjaHw3MHx8Z3JhZGllbnR8ZW58MHx8fHwxNzAzMDQ3MjE1fDA&ixlib=rb-4.0.3&q=80'
        }
    },
    // 旧天空图片继续保留原键，已有草稿仍能恢复。
    cloud_img_1: {
        class: 'https://images.unsplash.com/photo-1595865749889-b37a43c4eba4?auto=format&fit=crop&w=2400&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1595865749889-b37a43c4eba4?auto=format&fit=crop&w=2400&q=80'
        }
    },
    cloud_img_2: {
        class: 'https://images.unsplash.com/photo-1566321343730-237ec35e53f3?auto=format&fit=crop&w=2400&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1566321343730-237ec35e53f3?auto=format&fit=crop&w=2400&q=80'
        }
    },
    cloud_img_3: {
        class: 'https://images.unsplash.com/photo-1603376277241-70b32265cf10?auto=format&fit=crop&w=2400&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1603376277241-70b32265cf10?auto=format&fit=crop&w=2400&q=80'
        }
    },
    cloud_img_4: {
        class: 'https://images.unsplash.com/photo-1538449492226-2c34ed994f3e?auto=format&fit=crop&w=2400&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1538449492226-2c34ed994f3e?auto=format&fit=crop&w=2400&q=80'
        }
    },
    cloud_img_5: {
        class: 'https://images.unsplash.com/photo-1668525389832-4632957c56e6?auto=format&fit=crop&w=2400&q=80',
        fill: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1668525389832-4632957c56e6?auto=format&fit=crop&w=2400&q=80'
        }
    },
};

// 城市自然：六种氛围各四张，另加一张沙漠；在界面中作为同一个图库展示。
const NATURE_PHOTOS = [
    // 草原
    ['1500382017468-9049fed747ef', '草原 · 金色山丘'],
    ['1472396961693-142e6e269027', '草原 · 林间牧场'],
    ['1511497584788-876760111969', '草原 · 绿色田野'],
    ['1470071459604-3b5ec3a7fe05', '草原 · 晨雾山谷'],
    // 城市
    ['1519501025264-65ba15a82390', '城市 · 黄昏楼群'],
    ['1480714378408-67cf0d13bc1b', '城市 · 高楼天际线'],
    ['1514565131-fce0801e5785', '城市 · 街道建筑'],
    ['1477959858617-67f85cf4f1df', '城市 · 日光街区'],
    // 雪地
    ['1642155549055-ff351114a8a9', '雪地 · 雪山远景'],
    ['1517299321609-52687d1bc55a', '雪地 · 冰雪森林'],
    ['1418985991508-e47386d96a71', '雪地 · 冬季山岭'],
    ['1485546784815-e380f3297414', '雪地 · 雪峰与云'],
    // 风景
    ['1501785888041-af3ef285b470', '风景 · 山间湖泊'],
    ['1441974231531-c6227db76b6e', '风景 · 阳光树林'],
    ['1433086966358-54859d0ed716', '风景 · 瀑布溪谷'],
    ['1464822759023-fed622ff2c3b', '风景 · 山脉全景'],
    // 海边
    ['1507525428034-b723cf961d3e', '海边 · 碧蓝海岸'],
    ['1473116763249-2faaef81ccda', '海边 · 海浪沙滩'],
    ['1519046904884-53103b34b206', '海边 · 岛屿沙滩'],
    ['1500375592092-40eb2168fd21', '海边 · 近岸浪花'],
    // 夜景
    ['1519681393784-d120267933ba', '夜景 · 繁星雪山'],
    ['1462331940025-496dfbfc7564', '夜景 · 星河'],
    ['1483347756197-71ef80e95f73', '夜景 · 夜空山岭'],
    ['1446776811953-b23d57bd21aa', '夜景 · 地平线星空'],
    // 沙漠
    ['1473580044384-7ba9967e16a0', '沙漠 · 金色沙丘'],
];

// 保留原有 1–5 的键和图片；新壁纸排在后面，避免旧草稿选项失效。
const DESKTOP_PHOTOS = [
    ['1511860810434-a92f84c6f01e', '桌面壁纸 1'],
    ['1554110397-9bac083977c6', '桌面壁纸 2'],
    ['1671180881490-8af6e9c3eaf1', '桌面壁纸 3'],
    ['1671549296089-88b3a6eb347e', '桌面壁纸 4'],
    ['1668718031554-9c05b5d03750', '桌面壁纸 5'],
    ['1761623135394-ce45aaad36ca', '桌面 · 暖色朦胧'],
    ['1516739089214-59baa011fdb9', '桌面 · 白色建筑'],
    ['1533232117614-42803fbf6c45', '桌面 · 深绿叶片'],
    ['1685009498451-a32a731b4150', '桌面 · 奶油浮雕'],
    ['1709377059113-3c429b2e0796', '桌面 · 深色抽象'],
];

const createRemotePhotoConfig = (photos, prefix) => Object.fromEntries(photos.map(([id, label], index) => {
    const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2400&q=80`;
    return [`${prefix}_img_${index + 1}`, {
        class: url,
        preview: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=160&q=60`,
        fill: { type: 'image', url },
        label,
    }];
}));

const natureBackgroundConfig = createRemotePhotoConfig(NATURE_PHOTOS, 'nature');
const desktopBackgroundConfig = createRemotePhotoConfig(DESKTOP_PHOTOS, 'desktop');

const getRemotePreviewUrl = (url) => {
    const previewUrl = new URL(url);
    previewUrl.searchParams.set('w', '160');
    previewUrl.searchParams.set('q', '60');
    return previewUrl.toString();
};

const getBackgroundType = (key) => {
    if (key === 'none') return 'none';
    if (key.startsWith('solid_') || key === 'custom_solid') return 'solid';
    if (key.startsWith('default_') || key.startsWith('gradient_')) return 'gradient';
    if (key.startsWith('gh_img_') || key.startsWith('cosmic_img_') || key.startsWith('cloud_img_') || key.startsWith('desktop_img_') || key.startsWith('nature_img_')) return 'builtin-image';
    return 'solid';
};

const getBackgroundCategory = (key) => {
    if (key === 'none') return 'none';
    if (key.startsWith('default_')) return 'default';
    if (key.startsWith('solid_') || key === 'custom_solid') return 'solid';
    if (key.startsWith('gradient_')) return 'gradient';
    if (key.startsWith('gh_img_') || key.startsWith('cosmic_img_')) return 'cosmic';
    if (key.startsWith('cloud_img_') || key.startsWith('nature_img_')) return 'nature';
    if (key.startsWith('desktop_img_')) return 'desktop';
    return 'custom';
};

const normalizedBackgroundConfig = {
    none: {
        key: 'none',
        type: 'none',
        category: 'none',
        label: '无背景',
        class: 'bg-transparent border border-dashed border-slate-300',
        fill: null,
    },
    custom_solid: {
        key: 'custom_solid',
        type: 'solid',
        category: 'custom',
        label: '自定义颜色',
        class: 'bg-transparent border border-dashed border-slate-300',
        fill: null,
        hidden: true,
    },
    upload_image: {
        key: 'upload_image',
        type: 'upload-image',
        category: 'upload',
        label: '本地图片',
        class: 'bg-transparent border border-dashed border-slate-300',
        fill: null,
        hidden: true,
    },
    ...Object.fromEntries(
        Object.entries(legacyBackgroundConfig).map(([key, value]) => [
            key,
            {
                ...value,
                key,
                type: getBackgroundType(key),
                category: getBackgroundCategory(key),
                label: value.label || key,
                preview: value.preview || (value.class?.startsWith('https://images.unsplash.com/')
                    ? getRemotePreviewUrl(value.class)
                    : undefined),
            },
        ])
    ),
    ...Object.fromEntries(
        Object.entries(natureBackgroundConfig).map(([key, value]) => [key, {
            ...value,
            key,
            type: 'builtin-image',
            category: 'nature',
        }])
    ),
    ...Object.fromEntries(
        Object.entries(desktopBackgroundConfig).map(([key, value]) => [key, {
            ...value,
            key,
            type: 'builtin-image',
            category: 'desktop',
        }])
    ),
};

export const normalizeBackgroundKey = (value) => {
    if (value && typeof value === 'object') {
        return normalizeBackgroundKey(value.presetKey || value.key || value.id);
    }
    return normalizedBackgroundConfig[value] ? value : 'default_1';
};

export const getBackgroundDefinition = (value) => normalizedBackgroundConfig[normalizeBackgroundKey(value)];

/**
 * 检查器「预设」区直出的图片背景（精选 10 张：4 gradientshub 渐变 + 2 城市自然 + 2 宇宙 + 2 桌面，
 * 恰好凑满两行五列网格），免开「更多」抽屉即可一键选中；完整列表仍在抽屉里。
 */
export const QUICK_IMAGE_KEYS = [
    'gh_img_50', 'gh_img_47', 'gh_img_44', 'gh_img_13',
    'nature_img_1', 'nature_img_5',
    'cosmic_img_1', 'cosmic_img_5',
    'desktop_img_1', 'desktop_img_2',
].filter((key) => Boolean(normalizedBackgroundConfig[key]));

export const getBackgroundEntries = (category) => Object.values(normalizedBackgroundConfig)
    .filter((item) => !item.hidden && (!category || item.category === category));

export default normalizedBackgroundConfig;
