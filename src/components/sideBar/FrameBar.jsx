import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Button, Drawer, Input, Segmented, Slider } from 'antd';
import stores from '@stores';
import { cn } from '@utils/utils';
import {
    BROWSER_HEADER_SIZE_MAX,
    BROWSER_HEADER_SIZE_MIN,
    DEVICE_FRAME_INFO,
    getFrameDefinition,
    getFrameGroups,
    isDeviceFrame,
} from '@utils/frameConfig';
import {
    KNIT_BAND_MAX,
    KNIT_BAND_MIN,
    KNIT_ROWS_MAX,
    KNIT_ROWS_MIN,
} from '@utils/knitPatterns';
import { getKnitPreviewDataUrl } from '@utils/knitFrame';
import blueKnitThumbnail from '@assets/thumbnails/knit-blue.png';
import iceKnitThumbnail from '@assets/thumbnails/knit-ice.png';
import claudeKnitThumbnail from '@assets/thumbnails/knit-claude.png';
import forestKnitThumbnail from '@assets/thumbnails/knit-forest.png';
import greenKnitThumbnail from '@assets/thumbnails/knit-green.png';
import blackKnitThumbnail from '@assets/thumbnails/knit-black.png';
import googleKnitThumbnail from '@assets/thumbnails/knit-google.png';
import snowKnitThumbnail from '@assets/thumbnails/knit-snow.png';

const knitThumbnailByPreset = {
    codex: blueKnitThumbnail,
    finder: iceKnitThumbnail,
    claude: claudeKnitThumbnail,
    spotify: forestKnitThumbnail,
    meadow: greenKnitThumbnail,
    midnight: blackKnitThumbnail,
    google: googleKnitThumbnail,
    snow: snowKnitThumbnail,
};

const frameThumbStyle = (frame) => {
    const definition = getFrameDefinition(frame);
    if (definition.kind === 'device') {
        return { backgroundImage: `url(${DEVICE_FRAME_INFO[frame].image})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' };
    }
    if (definition.kind === 'sweater') {
        return {
            backgroundImage: `url(${knitThumbnailByPreset[definition.sweater] || getKnitPreviewDataUrl(definition.sweater)})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
        };
    }
    return undefined;
};

const FrameThumb = ({ frame, compact = false }) => {
    const definition = getFrameDefinition(frame);
    const browserLike = definition.kind === 'browser' || definition.kind === 'arc';
    return (
        <div
            className={cn('shoteasy-frame-thumb', compact && 'is-compact')}
            data-kind={definition.kind}
            data-thumb={definition.thumbnail}
            aria-hidden="true"
        >
            <div className="shoteasy-frame-thumb__surface" style={frameThumbStyle(frame)}>
                {browserLike && (
                    <span className="shoteasy-frame-thumb__traffic">
                        <i /><i /><i />
                    </span>
                )}
                {browserLike && <span className="shoteasy-frame-thumb__address" />}
            </div>
        </div>
    );
};

const FrameOption = ({ frame, selected, onSelect, compact = false, name }) => {
    const definition = getFrameDefinition(frame);
    return (
        <label className={cn('shoteasy-frame-option', selected && 'is-selected')}>
            <input
                type="radio"
                name={name}
                value={frame}
                checked={selected}
                onChange={() => onSelect(frame)}
            />
            <div className="shoteasy-frame-option__content">
                <FrameThumb frame={frame} compact={compact} />
                <span>{definition.title}</span>
                {!compact && definition.description && <small>{definition.description}</small>}
            </div>
        </label>
    );
};

const BrowserFrameSettings = ({ url, headerSize }) => (
    <div className="shoteasy-browser-frame-settings">
        <div className="shoteasy-browser-frame-settings__title">浏览器设置</div>
        <label htmlFor="browser-frame-url">URL</label>
        <Input
            id="browser-frame-url"
            value={url}
            maxLength={160}
            placeholder="example.com"
            onChange={(event) => stores.option.setBrowserUrl(event.target.value, { commit: false })}
            onBlur={(event) => stores.option.setBrowserUrl(event.target.value)}
            onPressEnter={(event) => event.currentTarget.blur()}
            aria-label="浏览器地址栏 URL"
        />
        <div className="shoteasy-browser-frame-settings__slider-heading">
            <label htmlFor="browser-header-size" >顶部尺寸</label>
            <output htmlFor="browser-header-size">{headerSize}%</output>
        </div>
        <Slider
            id="browser-header-size"
            min={BROWSER_HEADER_SIZE_MIN}
            max={BROWSER_HEADER_SIZE_MAX}
            value={headerSize}
            onChange={(value) => stores.option.setBrowserHeaderSize(value, { commit: false })}
            onChangeComplete={(value) => stores.option.setBrowserHeaderSize(value)}
            aria-label="浏览器顶部尺寸"
        />
    </div>
);

const KnitFrameSettings = ({ band, rows, idPrefix = 'knit-frame' }) => (
    <div className="shoteasy-knit-frame-settings">
        <div className="shoteasy-knit-frame-settings__title">针织设置</div>
        <div className="shoteasy-knit-frame-settings__slider-heading">
            <label htmlFor={`${idPrefix}-band`}>边框厚度</label>
            <output htmlFor={`${idPrefix}-band`}>{band}px</output>
        </div>
        <Slider
            id={`${idPrefix}-band`}
            min={KNIT_BAND_MIN}
            max={KNIT_BAND_MAX}
            step={1}
            value={band}
            onChange={(value) => stores.option.setKnitBand(value, { commit: false })}
            onChangeComplete={(value) => stores.option.setKnitBand(value)}
            aria-label="针织外框厚度"
        />
        <div className="shoteasy-knit-frame-settings__slider-heading">
            <label htmlFor={`${idPrefix}-rows`}>针脚密度</label>
            <output htmlFor={`${idPrefix}-rows`}>{rows} 行</output>
        </div>
        <Slider
            id={`${idPrefix}-rows`}
            min={KNIT_ROWS_MIN}
            max={KNIT_ROWS_MAX}
            step={1}
            value={rows}
            onChange={(value) => stores.option.setKnitRows(value, { commit: false })}
            onChangeComplete={(value) => stores.option.setKnitRows(value)}
            aria-label="针织外框针脚密度"
        />
    </div>
);

export default observer(function FrameBar() {
    const [showMore, setShowMore] = useState(false);
    const groups = useMemo(() => {
        const priority = { browser: 0, basic: 1, creative: 2, sweater: 3, device: 4 };
        return getFrameGroups().sort((a, b) => priority[a.id] - priority[b.id]);
    }, []);
    const browserFrames = groups.find((group) => group.id === 'browser')?.items || [];
    const sweaterFrames = groups.find((group) => group.id === 'sweater')?.items || [];
    const selectFrame = (value) => {
        stores.option.setFrame(value);
        if (value === 'macbookpro16') stores.option.setPaddingBg('#000000');
    };
    const device = isDeviceFrame(stores.option.frame);
    const selectedFrame = getFrameDefinition(stores.option.frame);
    const browserSelected = selectedFrame.kind === 'browser' || selectedFrame.kind === 'arc';
    const knitSelected = selectedFrame.kind === 'sweater';
    return (
        <>
            <section className="shoteasy-frame-panel" aria-labelledby="frame-panel-title">
                <div className="shoteasy-frame-panel__heading">
                    <div>
                        <h2 id="frame-panel-title">外框</h2>
                        <span>当前：{selectedFrame.title}</span>
                    </div>
                    <Button type="text" size="small" onClick={() => setShowMore(true)}>
                        查看全部 <Icon.ChevronRight size={14} />
                    </Button>
                </div>
                <div className="shoteasy-frame-panel__subheading">浏览器外框</div>
                <div className="shoteasy-frame-grid is-quick" role="radiogroup" aria-label="常用浏览器外框">
                    <FrameOption
                        frame="none"
                        name="quick-browser-frame"
                        compact
                        selected={stores.option.frame === 'none'}
                        onSelect={selectFrame}
                    />
                    {browserFrames.map((item) => (
                        <FrameOption
                            key={item.id}
                            frame={item.id}
                            name="quick-browser-frame"
                            compact
                            selected={stores.option.frame === item.id}
                            onSelect={selectFrame}
                        />
                    ))}
                </div>
                {browserSelected && (
                    <BrowserFrameSettings
                        url={stores.option.browserUrl}
                        headerSize={stores.option.browserHeaderSize}
                    />
                )}
                <div className="shoteasy-frame-panel__subheading">针织外框</div>
                <div className="shoteasy-frame-grid is-quick" role="radiogroup" aria-label="针织外框">
                    {sweaterFrames.map((item) => (
                        <FrameOption
                            key={item.id}
                            frame={item.id}
                            name="quick-sweater-frame"
                            compact
                            selected={stores.option.frame === item.id}
                            onSelect={selectFrame}
                        />
                    ))}
                </div>
                {knitSelected && (
                    <KnitFrameSettings
                        band={stores.option.knitBand}
                        rows={stores.option.knitRows}
                    />
                )}
            </section>
            <Drawer
                title={
                    <div className="shoteasy-frame-drawer__title">
                        <span>选择外框</span>
                        <small>{selectedFrame.title}</small>
                    </div>
                }
                placement="right"
                closable
                mask={false}
                onClose={() => setShowMore(false)}
                open={showMore}
                getContainer={false}
                width="100%"
                rootClassName="shoteasy-frame-drawer-shell"
                className="[&_.ant-drawer-body]:p-0"
            >
                <div className="shoteasy-frame-drawer">
                    {groups.map((group) => (
                        <section key={group.id} className="shoteasy-frame-section" aria-labelledby={`frame-group-${group.id}`}>
                            <div className="shoteasy-frame-section__heading">
                                <h3 id={`frame-group-${group.id}`}>{group.title}</h3>
                                {group.id === 'device' && (
                                    <Segmented
                                        size="small"
                                        value={stores.option.frameMode}
                                        onChange={(value) => stores.option.setFrameMode(value)}
                                        options={[
                                            { label: '覆盖', value: 'cover' },
                                            { label: '包含', value: 'fit' },
                                            { label: '拉伸', value: 'strench' },
                                        ]}
                                        aria-label="设备图片适配方式"
                                    />
                                )}
                            </div>
                            <div className="shoteasy-frame-grid" role="radiogroup" aria-label={group.title}>
                                {group.items.map((item) => (
                                    <FrameOption
                                        key={item.id}
                                        frame={item.id}
                                        name={`frame-${group.id}`}
                                        selected={stores.option.frame === item.id}
                                        onSelect={selectFrame}
                                    />
                                ))}
                            </div>
                            {group.id === 'sweater' && knitSelected && (
                                <KnitFrameSettings
                                    band={stores.option.knitBand}
                                    rows={stores.option.knitRows}
                                    idPrefix="knit-frame-drawer"
                                />
                            )}
                        </section>
                    ))}
                    {device && <div className="shoteasy-frame-device-note">设备外框当前使用：{selectedFrame.title}</div>}
                </div>
            </Drawer>
        </>
    );
});
