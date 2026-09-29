import { svgToDataURL } from '@utils/utils';
import {
    KNIT_BAND_DEFAULT,
    KNIT_ROWS_DEFAULT,
    getKnitPreset,
    normalizeKnitBand,
    normalizeKnitRows,
} from './knitPatterns';

const previewCache = new Map();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const parseHex = (value) => {
    const match = String(value || '').match(/^#([0-9a-f]{6})$/i);
    if (!match) return { r: 128, g: 128, b: 128 };
    const hex = match[1];
    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
};

const toHex = ({ r, g, b }) => `#${[r, g, b]
    .map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0'))
    .join('')}`;

const mix = (first, second, amount) => {
    const a = parseHex(first);
    const b = parseHex(second);
    return toHex({
        r: a.r + (b.r - a.r) * amount,
        g: a.g + (b.g - a.g) * amount,
        b: a.b + (b.b - a.b) * amount,
    });
};

const number = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

const stitchPath = (x, y, width, height) => [
    `M ${x.toFixed(2)} ${(y + height * 0.12).toFixed(2)}`,
    `C ${(x + width * 0.18).toFixed(2)} ${(y + height * 0.45).toFixed(2)} ${(x + width * 0.34).toFixed(2)} ${(y + height * 0.86).toFixed(2)} ${(x + width * 0.5).toFixed(2)} ${(y + height * 0.92).toFixed(2)}`,
    `C ${(x + width * 0.66).toFixed(2)} ${(y + height * 0.86).toFixed(2)} ${(x + width * 0.82).toFixed(2)} ${(y + height * 0.45).toFixed(2)} ${(x + width).toFixed(2)} ${(y + height * 0.12).toFixed(2)}`,
].join(' ');

const drawStitch = (x, y, width, height, color, opacity = 1) => {
    const path = stitchPath(x, y, width, height);
    const dark = mix(color, '#000000', 0.38);
    const light = mix(color, '#ffffff', 0.28);
    const shadowWidth = Math.max(0.85, height * 0.84);
    const yarnWidth = Math.max(0.65, height * 0.57);
    const highlightWidth = Math.max(0.4, height * 0.16);
    return `
        <path d="${path}" fill="none" stroke="${dark}" stroke-width="${shadowWidth.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${(opacity * 0.62).toFixed(2)}" />
        <path d="${path}" fill="none" stroke="${color}" stroke-width="${yarnWidth.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity.toFixed(2)}" />
        <path d="${path}" fill="none" stroke="${light}" stroke-width="${highlightWidth.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${(opacity * 0.75).toFixed(2)}" />
    `;
};

const getPatternSize = (preset, band, rows) => {
    const columns = Math.max(1, ...preset.pattern.map((row) => row.length));
    const stitchHeight = band / rows;
    const stitchWidth = Math.max(3.4, stitchHeight * 1.55);
    return {
        columns,
        stitchHeight,
        stitchWidth,
        width: columns * stitchWidth,
    };
};

const buildPatternContent = (preset, band, rows, patternSize) => {
    const { columns, stitchHeight, stitchWidth, width } = patternSize;
    const baseGround = mix(preset.base, '#000000', 0.22);
    const baseStitch = mix(preset.base, '#ffffff', 0.02);
    let content = `<rect width="${width.toFixed(2)}" height="${band.toFixed(2)}" fill="${baseGround}" />`;

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
        const sourceRow = preset.pattern[Math.floor(rowIndex * preset.pattern.length / rows) % preset.pattern.length] || '';
        const y = rowIndex * stitchHeight;
        for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
            const x = columnIndex * stitchWidth;
            const token = sourceRow[columnIndex] || '.';
            content += drawStitch(x, y, stitchWidth, stitchHeight, baseStitch, 0.94);
            if (token !== '.') {
                const color = token === 'b' ? (preset.secondary || preset.accent)
                    : token === 'c' ? (preset.tertiary || preset.accent)
                        : preset.accent;
                content += drawStitch(x + stitchWidth * 0.08, y + stitchHeight * 0.04, stitchWidth * 0.84, stitchHeight * 0.84, color, 0.98);
            }
        }
    }

    return content;
};

const buildSvg = ({ width, height, band, round, rows, preset }) => {
    const patternSize = getPatternSize(preset, band, rows);
    const patternContent = buildPatternContent(preset, band, rows, patternSize);
    const x = band / 2;
    const y = band / 2;
    const right = width - band / 2;
    const bottom = height - band / 2;
    const maxRadius = Math.max(0, Math.min((right - x) / 2, (bottom - y) / 2));
    const contentRadius = clamp(number(round, 10), 0, maxRadius);
    const centerRadius = clamp(contentRadius + band / 2, band / 2, maxRadius);
    const topStart = x + centerRadius;
    const topEnd = right - centerRadius;
    const sideStart = y + centerRadius;
    const sideEnd = bottom - centerRadius;
    const baseEdge = mix(preset.base, '#000000', 0.16);
    const svgWidth = Math.max(1, width);
    const svgHeight = Math.max(1, height);
    const horizontalPattern = 'knit-horizontal';
    const verticalPattern = 'knit-vertical';
    const cornerPaths = [
        `M ${topStart.toFixed(2)} ${y.toFixed(2)} A ${centerRadius.toFixed(2)} ${centerRadius.toFixed(2)} 0 0 0 ${x.toFixed(2)} ${sideStart.toFixed(2)}`,
        `M ${topEnd.toFixed(2)} ${y.toFixed(2)} A ${centerRadius.toFixed(2)} ${centerRadius.toFixed(2)} 0 0 1 ${right.toFixed(2)} ${sideStart.toFixed(2)}`,
        `M ${right.toFixed(2)} ${sideEnd.toFixed(2)} A ${centerRadius.toFixed(2)} ${centerRadius.toFixed(2)} 0 0 1 ${topEnd.toFixed(2)} ${bottom.toFixed(2)}`,
        `M ${topStart.toFixed(2)} ${bottom.toFixed(2)} A ${centerRadius.toFixed(2)} ${centerRadius.toFixed(2)} 0 0 1 ${x.toFixed(2)} ${sideEnd.toFixed(2)}`,
    ];
    const cornerMarkup = cornerPaths.map((path) => `<path d="${path}" fill="none" stroke="url(#${horizontalPattern})" stroke-width="${band.toFixed(2)}" stroke-linecap="butt" />`).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        <defs>
            <pattern id="${horizontalPattern}" width="${patternSize.width.toFixed(2)}" height="${band.toFixed(2)}" patternUnits="userSpaceOnUse">
                ${patternContent}
            </pattern>
            <pattern id="${verticalPattern}" width="${band.toFixed(2)}" height="${patternSize.width.toFixed(2)}" patternUnits="userSpaceOnUse">
                <g transform="translate(0 ${patternSize.width.toFixed(2)}) rotate(-90)">
                    ${patternContent}
                </g>
            </pattern>
        </defs>
        <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(right - x).toFixed(2)}" height="${(bottom - y).toFixed(2)}" rx="${centerRadius.toFixed(2)}" fill="none" stroke="${baseEdge}" stroke-width="${band.toFixed(2)}" />
        ${cornerMarkup}
        <path d="M ${topStart.toFixed(2)} ${y.toFixed(2)} H ${topEnd.toFixed(2)}" fill="none" stroke="url(#${horizontalPattern})" stroke-width="${band.toFixed(2)}" stroke-linecap="butt" />
        <path d="M ${right.toFixed(2)} ${sideStart.toFixed(2)} V ${sideEnd.toFixed(2)}" fill="none" stroke="url(#${verticalPattern})" stroke-width="${band.toFixed(2)}" stroke-linecap="butt" />
        <path d="M ${topEnd.toFixed(2)} ${bottom.toFixed(2)} H ${topStart.toFixed(2)}" fill="none" stroke="url(#${horizontalPattern})" stroke-width="${band.toFixed(2)}" stroke-linecap="butt" />
        <path d="M ${x.toFixed(2)} ${sideEnd.toFixed(2)} V ${sideStart.toFixed(2)}" fill="none" stroke="url(#${verticalPattern})" stroke-width="${band.toFixed(2)}" stroke-linecap="butt" />
    </svg>`;
};

export const createKnitFrameDataUrl = ({
    width,
    height,
    band = KNIT_BAND_DEFAULT,
    rows = KNIT_ROWS_DEFAULT,
    round = 10,
    presetId,
} = {}) => {
    const safeBand = normalizeKnitBand(band);
    const safeRows = normalizeKnitRows(rows);
    const safeWidth = Math.max(safeBand * 2 + 2, Math.round(number(width, 1)));
    const safeHeight = Math.max(safeBand * 2 + 2, Math.round(number(height, 1)));
    const preset = getKnitPreset(presetId);
    return svgToDataURL(buildSvg({
        width: safeWidth,
        height: safeHeight,
        band: safeBand,
        rows: safeRows,
        round,
        preset,
    }));
};

export const getKnitPreviewDataUrl = (presetId) => {
    if (!previewCache.has(presetId)) {
        previewCache.set(presetId, createKnitFrameDataUrl({
            width: 280,
            height: 160,
            band: 10,
            rows: 5,
            round: 10,
            presetId,
        }));
    }
    return previewCache.get(presetId);
};

