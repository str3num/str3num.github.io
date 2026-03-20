const { Engine, Runner, Bodies, Body, Constraint, Composite } = Matter;

const controls = {
    layerSelect: document.getElementById("layer-select"),
    addLayerBtn: document.getElementById("add-layer-btn"),
    removeLayerBtn: document.getElementById("remove-layer-btn"),
    layerName: document.getElementById("layer-name"),
    layerStart: document.getElementById("layer-start"),
    layerEnd: document.getElementById("layer-end"),
    physicsStart: document.getElementById("physics-start"),
    text: document.getElementById("text-input"),
    fontFamily: document.getElementById("font-family"),
    fontSize: document.getElementById("font-size"),
    fontWeight: document.getElementById("font-weight"),
    writingMode: document.getElementById("writing-mode"),
    flowDirection: document.getElementById("flow-direction"),
    charGap: document.getElementById("char-gap"),
    columnGap: document.getElementById("column-gap"),
    topPadding: document.getElementById("top-padding"),
    anchorLift: document.getElementById("anchor-lift"),
    rightPadding: document.getElementById("right-padding"),
    fillColor: document.getElementById("fill-color"),
    strokeColor: document.getElementById("stroke-color"),
    strokeWidth: document.getElementById("stroke-width"),
    gravityX: document.getElementById("gravity-x"),
    gravityY: document.getElementById("gravity-y"),
    density: document.getElementById("density"),
    frictionAir: document.getElementById("friction-air"),
    restitution: document.getElementById("restitution"),
    linkStiffness: document.getElementById("link-stiffness"),
    linkDamping: document.getElementById("link-damping"),
    dragStiffness: document.getElementById("drag-stiffness"),
    dragDamping: document.getElementById("drag-damping"),
    windRadius: document.getElementById("wind-radius"),
    windStrength: document.getElementById("wind-strength"),
    cutRadius: document.getElementById("cut-radius"),
    groundHeight: document.getElementById("ground-height"),
    maxCharsPerStrand: document.getElementById("max-chars-per-strand"),
    toolMode: document.getElementById("tool-mode"),
    collisionEnabled: document.getElementById("collision-enabled"),
    uprightEnabled: document.getElementById("upright-enabled"),
    timelineDuration: document.getElementById("timeline-duration"),
    timelineTime: document.getElementById("timeline-time"),
    timelineSlider: document.getElementById("timeline-slider"),
    timelineTrack: document.getElementById("timeline-track"),
    timelineZoom: document.getElementById("timeline-zoom"),
    timelineSnap: document.getElementById("timeline-snap"),
    rangeStart: document.getElementById("range-start"),
    rangeEnd: document.getElementById("range-end"),
    kfPosX: document.getElementById("kf-pos-x"),
    kfPosY: document.getElementById("kf-pos-y"),
    kfRotation: document.getElementById("kf-rotation"),
    kfScale: document.getElementById("kf-scale"),
    kfOpacity: document.getElementById("kf-opacity"),
    kfEasing: document.getElementById("kf-easing"),
    kfBezier: document.getElementById("kf-bezier"),
    addKfBtn: document.getElementById("add-kf-btn"),
    updateKfBtn: document.getElementById("update-kf-btn"),
    deleteKfBtn: document.getElementById("delete-kf-btn"),
    playBtn: document.getElementById("play-btn"),
    recordFps: document.getElementById("record-fps"),
    recordBitrate: document.getElementById("record-bitrate"),
    outputWidth: document.getElementById("output-width"),
    outputHeight: document.getElementById("output-height"),
    recordDisablePhysics: document.getElementById("record-disable-physics"),
    recordFrameX: document.getElementById("record-frame-x"),
    recordFrameY: document.getElementById("record-frame-y"),
    recordFrameWidth: document.getElementById("record-frame-width"),
    recordFrameHeight: document.getElementById("record-frame-height"),
    applyBtn: document.getElementById("apply-btn"),
    recordBtn: document.getElementById("record-btn"),
    stopBtn: document.getElementById("stop-btn"),
    resetBtn: document.getElementById("reset-btn")
};

const stage = document.getElementById("stage");
const layout = document.querySelector(".layout");
const panelToggle = document.getElementById("panel-toggle");
const stagePanelToggle = document.getElementById("stage-panel-toggle");
const canvas = document.getElementById("stage-canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status-text");
const modeText = document.getElementById("mode-text");
const timeText = document.getElementById("time-text");
const timelineTrackCtx = controls.timelineTrack.getContext("2d");

const engine = Engine.create({ gravity: { x: 0, y: 0.92 } });
const runner = Runner.create();

const globalDefaults = {
    gravityX: 0,
    gravityY: 0.92,
    dragStiffness: 0.18,
    dragDamping: 0.12,
    windRadius: 190,
    windStrength: 0.003,
    cutRadius: 34,
    groundHeight: 86,
    toolMode: "hand",
    collisionEnabled: true,
    uprightEnabled: false,
    timelineDuration: 8,
    outputWidth: 1920,
    outputHeight: 1080,
    recordFrameX: 80,
    recordFrameY: 60,
    recordFrameWidth: 640,
    recordFrameHeight: 480
};

const layerTemplate = {
    name: "图层",
    text: "文字图层",
    fontFamily: "FangSong",
    fontSize: 34,
    fontWeight: 500,
    charGap: 44,
    columnGap: 62,
    topPadding: 90,
    anchorLift: 72,
    rightPadding: 88,
    fillColor: "#111111",
    strokeColor: "#ffffff",
    strokeWidth: 0,
    writingMode: "horizontal",
    flowDirection: "rtl",
    density: 0.0025,
    frictionAir: 0.05,
    restitution: 0.1,
    linkStiffness: 0.94,
    linkDamping: 0.06,
    freezePhysics: false,
    physicsStart: null,
    maxCharsPerStrand: 100,
    start: 0,
    end: 8,
    keyframes: [
        {
            time: 0,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            easing: "linear",
            bezier: [0.25, 0.1, 0.25, 1]
        }
    ]
};

const state = {
    width: 0,
    height: 0,
    dpr: window.devicePixelRatio || 1,
    options: { ...globalDefaults },
    layers: [],
    selectedLayerId: null,
    strands: [],
    groundBody: null,
    dragConstraint: null,
    pointer: {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        leftActive: false,
        rightActive: false
    },
    timeline: {
        currentTime: 0,
        duration: globalDefaults.timelineDuration,
        rangeStart: 0,
        rangeEnd: globalDefaults.timelineDuration,
        zoom: 1,
        snapEnabled: true,
        playing: false,
        lastNow: 0,
        forceRebuild: false,
        activeSignature: "",
        selectedKeyframe: null
    },
    recording: {
        active: false,
        startAt: 0,
        mediaRecorder: null,
        chunks: [],
        frames: [],
        lastSampleAt: 0,
        recordCanvas: null,
        recordCtx: null
    },
    debug: {
        enabled: false,
        maxEntries: 5000,
        entries: [],
        frameCounter: 0,
        frameSampleEvery: 6
    }
};

function roundNum(value, digits = 3) {
    if (!Number.isFinite(value)) {
        return value;
    }
    const base = 10 ** digits;
    return Math.round(value * base) / base;
}

function summarizeLayer(layer) {
    if (!layer) {
        return null;
    }
    return {
        id: layer.id,
        name: layer.name,
        start: roundNum(layer.start),
        end: roundNum(layer.end),
        physicsStart: Number.isFinite(layer.physicsStart) ? roundNum(layer.physicsStart) : null,
        anchorLift: roundNum(layer.anchorLift),
        topPadding: roundNum(layer.topPadding),
        charGap: roundNum(layer.charGap),
        columnGap: roundNum(layer.columnGap),
        freezePhysics: !!layer.freezePhysics,
        textLength: (layer.text || "").length
    };
}

function debugLog(type, payload = {}) {
    if (!state.debug.enabled) {
        return;
    }
    const entry = {
        ts: roundNum(performance.now(), 2),
        type,
        timeline: roundNum(state.timeline.currentTime, 4),
        payload
    };
    state.debug.entries.push(entry);
    if (state.debug.entries.length > state.debug.maxEntries) {
        state.debug.entries.splice(0, state.debug.entries.length - state.debug.maxEntries);
    }
}

function enableDebug(options = {}) {
    state.debug.enabled = true;
    if (Number.isFinite(options.maxEntries)) {
        state.debug.maxEntries = Math.max(200, Math.floor(options.maxEntries));
    }
    if (Number.isFinite(options.frameSampleEvery)) {
        state.debug.frameSampleEvery = Math.max(1, Math.floor(options.frameSampleEvery));
    }
    debugLog("debug_enabled", {
        maxEntries: state.debug.maxEntries,
        frameSampleEvery: state.debug.frameSampleEvery
    });
}

function disableDebug() {
    debugLog("debug_disabled");
    state.debug.enabled = false;
}

function clearDebugLogs() {
    state.debug.entries = [];
    state.debug.frameCounter = 0;
}

window.__cpDebug = {
    enable: enableDebug,
    disable: disableDebug,
    clear: clearDebugLogs,
    dump() {
        return state.debug.entries.slice();
    },
    save(filename = "character-physics-debug.json") {
        const blob = new Blob([JSON.stringify(state.debug.entries, null, 2)], { type: "application/json" });
        downloadBlob(filename, blob);
    },
    status() {
        return {
            enabled: state.debug.enabled,
            count: state.debug.entries.length,
            maxEntries: state.debug.maxEntries,
            frameSampleEvery: state.debug.frameSampleEvery
        };
    }
};

function clamp(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return fallback;
    }
    return Math.max(min, Math.min(max, n));
}

function makeLayer(index) {
    const defaultAnchorX = state.width > 0 ? Math.max(120, state.width - 80) : 1280;
    return {
        id: `layer-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        ...layerTemplate,
        keyframes: layerTemplate.keyframes.map((kf) => ({ ...kf, bezier: [...kf.bezier] })),
        name: `图层 ${index + 1}`,
        anchorLift: defaultAnchorX,
        text: index === 0
            ? "Character Physics\n可录制真实物理\n停止后自动下载"
            : `文字图层 ${index + 1}`
    };
}

function parseText(rawText, maxCharsPerStrand) {
    const lines = rawText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const strands = [];
    lines.forEach((line) => {
        const chars = Array.from(line);
        for (let i = 0; i < chars.length; i += maxCharsPerStrand) {
            const part = chars.slice(i, i + maxCharsPerStrand).join("");
            if (part) {
                strands.push(part);
            }
        }
    });
    return strands;
}

function sortKeyframes(layer) {
    layer.keyframes.sort((a, b) => a.time - b.time);
}

function parseBezier(text) {
    const values = String(text)
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item));
    if (values.length !== 4) {
        return [0.25, 0.1, 0.25, 1];
    }
    return values.map((v, i) => clamp(v, i % 2 === 0 ? 0 : -2, i % 2 === 0 ? 1 : 2, values[i]));
}

function cubicBezierAt(t, p0, p1, p2, p3) {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function getBezierProgress(x, bezier) {
    const [c1x, c1y, c2x, c2y] = bezier;
    let left = 0;
    let right = 1;
    let t = x;
    for (let i = 0; i < 12; i += 1) {
        const estimateX = cubicBezierAt(t, 0, c1x, c2x, 1);
        if (Math.abs(estimateX - x) < 0.0005) {
            break;
        }
        if (estimateX < x) {
            left = t;
        } else {
            right = t;
        }
        t = (left + right) * 0.5;
    }
    return cubicBezierAt(t, 0, c1y, c2y, 1);
}

function applyEasing(t, easing, bezier) {
    const n = clamp(t, 0, 1, 0);
    if (easing === "easeIn") {
        return n * n;
    }
    if (easing === "easeOut") {
        return 1 - (1 - n) * (1 - n);
    }
    if (easing === "custom") {
        return getBezierProgress(n, bezier);
    }
    return n;
}

function getLayerAnimAtTime(layer, time) {
    if (!layer.keyframes || layer.keyframes.length === 0) {
        return { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
    }
    sortKeyframes(layer);
    if (time <= layer.keyframes[0].time) {
        const kf = layer.keyframes[0];
        return { x: kf.x, y: kf.y, rotation: kf.rotation, scale: kf.scale, opacity: kf.opacity };
    }
    const last = layer.keyframes[layer.keyframes.length - 1];
    if (time >= last.time) {
        return { x: last.x, y: last.y, rotation: last.rotation, scale: last.scale, opacity: last.opacity };
    }

    for (let i = 0; i < layer.keyframes.length - 1; i += 1) {
        const a = layer.keyframes[i];
        const b = layer.keyframes[i + 1];
        if (time < a.time || time > b.time) {
            continue;
        }
        const span = Math.max(0.0001, b.time - a.time);
        const raw = (time - a.time) / span;
        const t = applyEasing(raw, b.easing || "linear", b.bezier || [0.25, 0.1, 0.25, 1]);
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            rotation: a.rotation + (b.rotation - a.rotation) * t,
            scale: a.scale + (b.scale - a.scale) * t,
            opacity: a.opacity + (b.opacity - a.opacity) * t
        };
    }
    return { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
}

function getTimeFromTrackX(x) {
    const w = Math.max(1, controls.timelineTrack.clientWidth);
    const visibleDuration = state.timeline.duration / state.timeline.zoom;
    const viewStart = clamp(
        state.timeline.currentTime - visibleDuration * 0.5,
        0,
        Math.max(0, state.timeline.duration - visibleDuration),
        0
    );
    const ratio = clamp(x / w, 0, 1, 0);
    return viewStart + ratio * visibleDuration;
}

function maybeSnapTime(value) {
    if (!state.timeline.snapEnabled) {
        return value;
    }
    let best = value;
    let bestDist = 0.06;
    state.layers.forEach((layer) => {
        if (!layer.keyframes) {
            return;
        }
        layer.keyframes.forEach((kf) => {
            const d = Math.abs(kf.time - value);
            if (d < bestDist) {
                bestDist = d;
                best = kf.time;
            }
        });
    });
    return best;
}

function drawTimelineTrack() {
    const canvasEl = controls.timelineTrack;
    const width = canvasEl.clientWidth || 300;
    const height = canvasEl.clientHeight || 150;
    const dpr = window.devicePixelRatio || 1;
    if (canvasEl.width !== Math.floor(width * dpr) || canvasEl.height !== Math.floor(height * dpr)) {
        canvasEl.width = Math.floor(width * dpr);
        canvasEl.height = Math.floor(height * dpr);
    }
    timelineTrackCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    timelineTrackCtx.clearRect(0, 0, width, height);
    timelineTrackCtx.fillStyle = "#ffffff";
    timelineTrackCtx.fillRect(0, 0, width, height);

    const rows = Math.max(1, state.layers.length);
    const rowH = Math.max(22, (height - 24) / rows);
    const visibleDuration = state.timeline.duration / state.timeline.zoom;
    const viewStart = clamp(
        state.timeline.currentTime - visibleDuration * 0.5,
        0,
        Math.max(0, state.timeline.duration - visibleDuration),
        0
    );
    const timeToX = (t) => ((t - viewStart) / visibleDuration) * width;

    for (let i = 0; i < rows; i += 1) {
        const y = 18 + i * rowH;
        timelineTrackCtx.fillStyle = i % 2 === 0 ? "#fafafa" : "#f4f4f4";
        timelineTrackCtx.fillRect(0, y, width, rowH);
    }

    state.layers.forEach((layer, index) => {
        const y = 18 + index * rowH + 4;
        const h = rowH - 8;
        const bx = timeToX(layer.start);
        const ex = timeToX(layer.end);
        timelineTrackCtx.fillStyle = layer.id === state.selectedLayerId ? "rgba(34, 98, 255, 0.28)" : "rgba(17,17,17,0.18)";
        timelineTrackCtx.fillRect(Math.max(0, bx), y, Math.max(2, ex - bx), h);

        (layer.keyframes || []).forEach((kf, kfIndex) => {
            const x = timeToX(kf.time);
            if (x < -10 || x > width + 10) {
                return;
            }
            const cy = y + h * 0.5;
            const selected = state.timeline.selectedKeyframe
                && state.timeline.selectedKeyframe.layerId === layer.id
                && state.timeline.selectedKeyframe.index === kfIndex;
            timelineTrackCtx.save();
            timelineTrackCtx.translate(x, cy);
            timelineTrackCtx.rotate(Math.PI / 4);
            timelineTrackCtx.fillStyle = selected ? "#2262ff" : "#111111";
            timelineTrackCtx.fillRect(-5, -5, 10, 10);
            timelineTrackCtx.restore();
        });
    });

    const playheadX = timeToX(state.timeline.currentTime);
    timelineTrackCtx.beginPath();
    timelineTrackCtx.strokeStyle = "#ff3b30";
    timelineTrackCtx.lineWidth = 1.5;
    timelineTrackCtx.moveTo(playheadX, 0);
    timelineTrackCtx.lineTo(playheadX, height);
    timelineTrackCtx.stroke();
}

function getSelectedLayer() {
    return state.layers.find((layer) => layer.id === state.selectedLayerId) || null;
}

function isLayerActive(layer) {
    return state.timeline.currentTime >= layer.start && state.timeline.currentTime <= layer.end;
}

function getActiveLayerSignature() {
    return state.layers.filter(isLayerActive).map((layer) => layer.id).join("|");
}

function resizeStage() {
    const rect = stage.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * state.dpr);
    canvas.height = Math.floor(rect.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    applyRecordFrameControls();
}

function clearWorld() {
    state.strands.forEach((strand) => {
        Composite.remove(engine.world, strand.composite, true);
    });
    state.strands = [];

    if (state.dragConstraint) {
        Composite.remove(engine.world, state.dragConstraint, true);
        state.dragConstraint = null;
    }
    if (state.groundBody) {
        Composite.remove(engine.world, state.groundBody, true);
        state.groundBody = null;
    }
}

function buildCurtain() {
    clearWorld();
    const activeLayers = state.layers.filter(isLayerActive);
    const collisionMask = state.options.collisionEnabled ? 0x0002 : 0x0000;
    debugLog("build_curtain_begin", {
        activeLayerCount: activeLayers.length,
        activeLayerIds: activeLayers.map((layer) => layer.id)
    });

    activeLayers.forEach((layer) => {
        const anim = getLayerAnimAtTime(layer, state.timeline.currentTime);
        const angleRad = (anim.rotation * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const hasPhysicsStart = Number.isFinite(layer.physicsStart);
        const beforePhysics = hasPhysicsStart && state.timeline.currentTime < layer.physicsStart;
        const lines = parseText(layer.text, layer.maxCharsPerStrand);
        lines.forEach((strandText, strandIndex) => {
            const composite = Composite.create();
            const isHorizontal = layer.writingMode !== "vertical";
            const isRtl = layer.flowDirection !== "ltr";
            const nodes = [];
            const links = [];
            let previousBody = null;

            Array.from(strandText).forEach((char, charIndex) => {
                const anchorX = isHorizontal
                    ? (isRtl ? layer.anchorLift : layer.anchorLift)
                    : (isRtl ? layer.anchorLift - strandIndex * layer.columnGap : layer.anchorLift + strandIndex * layer.columnGap);
                const anchorY = isHorizontal
                    ? layer.topPadding + strandIndex * layer.columnGap
                    : layer.topPadding;
                const x = isHorizontal
                    ? (isRtl ? anchorX - (charIndex + 1) * layer.charGap : anchorX + (charIndex + 1) * layer.charGap)
                    : anchorX;
                const y = isHorizontal
                    ? anchorY
                    : anchorY + (charIndex + 1) * layer.charGap;
                const localX = x - anchorX;
                const localY = y - anchorY;
                const scaledX = localX * anim.scale;
                const scaledY = localY * anim.scale;
                const rotX = scaledX * cos - scaledY * sin;
                const rotY = scaledX * sin + scaledY * cos;
                const spawnX = anchorX + anim.x + rotX;
                const spawnY = anchorY + anim.y + rotY;
                const body = Bodies.circle(spawnX, spawnY, layer.fontSize * 0.34, {
                    density: layer.density,
                    frictionAir: layer.frictionAir,
                    restitution: layer.restitution,
                    isStatic: layer.freezePhysics,
                    angle: angleRad,
                    collisionFilter: {
                        category: 0x0002,
                        mask: collisionMask
                    },
                    render: { visible: false }
                });
                nodes.push({
                    char,
                    body,
                    layerId: layer.id,
                    baseX: x,
                    baseY: y,
                    charIndex,
                    strandIndex
                });
                Composite.add(composite, body);

                const link = Constraint.create({
                    bodyA: previousBody,
                    pointA: previousBody ? undefined : { x: anchorX, y: anchorY },
                    bodyB: body,
                    length: layer.charGap,
                    stiffness: layer.linkStiffness,
                    damping: layer.linkDamping,
                    render: { visible: false }
                });
                links.push(link);
                Composite.add(composite, link);
                previousBody = body;
            });

            const strandAnchorX = isHorizontal
                ? layer.anchorLift
                : (isRtl ? layer.anchorLift - strandIndex * layer.columnGap : layer.anchorLift + strandIndex * layer.columnGap);
            const strandAnchorY = isHorizontal
                ? layer.topPadding + strandIndex * layer.columnGap
                : layer.topPadding;
            state.strands.push({ composite, anchor: { x: strandAnchorX, y: strandAnchorY }, nodes, links, layerId: layer.id });
            Composite.add(engine.world, composite);
        });
        debugLog("build_curtain_layer", {
            layer: summarizeLayer(layer),
            strandCount: lines.length,
            nodeCount: lines.reduce((sum, item) => sum + Array.from(item).length, 0)
        });
    });

    if (state.options.groundHeight > 0) {
        const h = Math.max(16, state.options.groundHeight);
        state.groundBody = Bodies.rectangle(
            state.width * 0.5,
            state.height + h * 0.5 - state.options.groundHeight,
            state.width * 2,
            h,
            { isStatic: true, render: { visible: false } }
        );
        Composite.add(engine.world, state.groundBody);
    }
}

function renderSceneToContext(targetCtx, viewport, outWidth, outHeight, drawWindPreview) {
    const scaleX = outWidth / viewport.width;
    const scaleY = outHeight / viewport.height;
    const scale = (scaleX + scaleY) * 0.5;
    const mapX = (x) => (x - viewport.x) * scaleX;
    const mapY = (y) => (y - viewport.y) * scaleY;

    const drawConnector = (x1, y1, x2, y2) => {
        targetCtx.beginPath();
        targetCtx.strokeStyle = "rgba(17, 17, 17, 0.20)";
        targetCtx.lineWidth = 1.5 * scale;
        targetCtx.moveTo(mapX(x1), mapY(y1));
        targetCtx.lineTo(mapX(x2), mapY(y2));
        targetCtx.stroke();
    };

    targetCtx.clearRect(0, 0, outWidth, outHeight);
    targetCtx.fillStyle = "#ffffff";
    targetCtx.fillRect(0, 0, outWidth, outHeight);

    if (state.options.groundHeight > 0) {
        const y = state.height - state.options.groundHeight;
        drawConnector(0, y, state.width, y);
    }

    state.strands.forEach((strand) => {
        strand.links.forEach((link, index) => {
            if (!link) {
                return;
            }
            const prev = index === 0 ? null : strand.nodes[index - 1].body;
            const next = strand.nodes[index].body;
            drawConnector(
                prev ? prev.position.x : strand.anchor.x,
                prev ? prev.position.y : strand.anchor.y,
                next.position.x,
                next.position.y
            );
        });
    });

    state.strands.forEach((strand) => {
        const layer = state.layers.find((item) => item.id === strand.layerId);
        if (!layer) {
            return;
        }
        const anim = getLayerAnimAtTime(layer, state.timeline.currentTime);
        targetCtx.font = `${layer.fontWeight} ${layer.fontSize * scale}px "${layer.fontFamily}"`;
        targetCtx.textAlign = "center";
        targetCtx.textBaseline = "middle";
        targetCtx.globalAlpha = clamp(anim.opacity, 0, 1, 1);
        strand.nodes.forEach((node) => {
            targetCtx.save();
            targetCtx.translate(mapX(node.body.position.x), mapY(node.body.position.y));
            targetCtx.rotate(node.body.angle);
            if (layer.strokeWidth > 0) {
                targetCtx.lineWidth = layer.strokeWidth * scale;
                targetCtx.strokeStyle = layer.strokeColor;
                targetCtx.strokeText(node.char, 0, 0);
            }
            targetCtx.fillStyle = layer.fillColor;
            targetCtx.fillText(node.char, 0, 0);
            targetCtx.restore();
        });
        targetCtx.globalAlpha = 1;
    });

    if (drawWindPreview && state.pointer.leftActive && state.options.toolMode === "wind") {
        targetCtx.beginPath();
        targetCtx.arc(
            mapX(state.pointer.x),
            mapY(state.pointer.y),
            state.options.windRadius * scale,
            0,
            Math.PI * 2
        );
        targetCtx.strokeStyle = "rgba(17, 17, 17, 0.2)";
        targetCtx.lineWidth = 1 * scale;
        targetCtx.stroke();
    }
}

function drawScene() {
    renderSceneToContext(
        ctx,
        { x: 0, y: 0, width: state.width, height: state.height },
        state.width,
        state.height,
        true
    );
}

function getRecordFrame() {
    const maxW = Math.max(64, state.width);
    const maxH = Math.max(64, state.height);
    const w = clamp(state.options.recordFrameWidth, 64, maxW, Math.min(1280, maxW));
    const h = clamp(state.options.recordFrameHeight, 64, maxH, Math.min(720, maxH));
    const x = clamp(state.options.recordFrameX, 0, Math.max(0, state.width - w), 0);
    const y = clamp(state.options.recordFrameY, 0, Math.max(0, state.height - h), 0);
    return { x, y, width: w, height: h };
}

function syncRecordFrameInputs(frame) {
    controls.recordFrameX.value = String(Math.round(frame.x));
    controls.recordFrameY.value = String(Math.round(frame.y));
    controls.recordFrameWidth.value = String(Math.round(frame.width));
    controls.recordFrameHeight.value = String(Math.round(frame.height));
}

function applyRecordFrameControls() {
    const outW = clamp(controls.outputWidth.value, 64, 7680, globalDefaults.outputWidth);
    const outH = clamp(controls.outputHeight.value, 64, 4320, globalDefaults.outputHeight);
    const targetAspect = outW / outH;

    let frameWidth = clamp(controls.recordFrameWidth.value, 64, 20000, globalDefaults.recordFrameWidth);
    let frameHeight = Math.max(64, frameWidth / targetAspect);

    const maxWidth = Math.max(64, state.width);
    const maxHeight = Math.max(64, state.height);
    if (frameHeight > maxHeight) {
        frameHeight = maxHeight;
        frameWidth = frameHeight * targetAspect;
    }
    if (frameWidth > maxWidth) {
        frameWidth = maxWidth;
        frameHeight = frameWidth / targetAspect;
    }

    const x = clamp(controls.recordFrameX.value, 0, Math.max(0, state.width - frameWidth), 0);
    const y = clamp(controls.recordFrameY.value, 0, Math.max(0, state.height - frameHeight), 0);

    state.options.recordFrameX = x;
    state.options.recordFrameY = y;
    state.options.recordFrameWidth = frameWidth;
    state.options.recordFrameHeight = frameHeight;
    syncRecordFrameInputs({
        x,
        y,
        width: frameWidth,
        height: frameHeight
    });
}

function drawOverlay() {
    const frame = getRecordFrame();
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillRect(frame.x + 6, frame.y + 6, 180, 24);
    ctx.fillStyle = "#111111";
    ctx.font = '12px "Noto Sans CJK SC", sans-serif';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`录制框 ${Math.round(frame.width)}×${Math.round(frame.height)}`, frame.x + 12, frame.y + 18);
    ctx.restore();
}

function updateRecordCanvas() {
    if (!state.recording.recordCanvas || !state.recording.recordCtx) {
        return;
    }
    const frame = getRecordFrame();
    const outW = state.recording.recordCanvas.width;
    const outH = state.recording.recordCanvas.height;
    renderSceneToContext(
        state.recording.recordCtx,
        { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
        outW,
        outH,
        false
    );
}

function formatTime(ms) {
    const total = Math.max(0, ms);
    const m = Math.floor(total / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const ms3 = Math.floor(total % 1000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms3).padStart(3, "0")}`;
}

function updateTimelineInputs() {
    controls.timelineDuration.value = String(state.timeline.duration);
    controls.timelineSlider.max = String(state.timeline.duration);
    controls.timelineSlider.value = String(state.timeline.currentTime);
    controls.timelineTime.value = String(Number(state.timeline.currentTime.toFixed(3)));
    controls.rangeStart.value = String(Number(state.timeline.rangeStart.toFixed(3)));
    controls.rangeEnd.value = String(Number(state.timeline.rangeEnd.toFixed(3)));
    controls.timelineZoom.value = String(Number(state.timeline.zoom.toFixed(2)));
    controls.timelineSnap.checked = state.timeline.snapEnabled;
}

function setTimelineTime(value, options = {}) {
    const snap = options.snap === true;
    let t = clamp(value, 0, state.timeline.duration, 0);
    if (snap) {
        t = maybeSnapTime(t);
    }
    state.timeline.currentTime = t;
    updateTimelineInputs();
}

function updateTimeline(now) {
    if (!state.timeline.playing) {
        return;
    }
    if (!state.timeline.lastNow) {
        state.timeline.lastNow = now;
        return;
    }
    const dt = (now - state.timeline.lastNow) / 1000;
    state.timeline.lastNow = now;
    const rangeStart = clamp(state.timeline.rangeStart, 0, state.timeline.duration, 0);
    const rangeEnd = clamp(state.timeline.rangeEnd, rangeStart + 0.01, state.timeline.duration, state.timeline.duration);
    let next = state.timeline.currentTime + dt;
    if (next > rangeEnd) {
        next = rangeStart;
        state.timeline.forceRebuild = true;
        debugLog("timeline_wrap", {
            from: roundNum(state.timeline.currentTime, 4),
            to: roundNum(next, 4),
            rangeStart: roundNum(rangeStart, 4),
            rangeEnd: roundNum(rangeEnd, 4)
        });
    }
    setTimelineTime(next);
}

function updateModeLabel() {
    const map = { hand: "模式：拖拽", wind: "模式：风场", cut: "模式：切断" };
    modeText.textContent = map[state.options.toolMode] || "模式：拖拽";
}

function rebuildIfNeeded(force = false) {
    const signature = getActiveLayerSignature();
    if (force || signature !== state.timeline.activeSignature) {
        debugLog("rebuild", {
            force,
            fromSignature: state.timeline.activeSignature,
            toSignature: signature
        });
        state.timeline.activeSignature = signature;
        buildCurtain();
    }
}

function applyTimelineToBodies() {
    state.strands.forEach((strand) => {
        const layer = state.layers.find((item) => item.id === strand.layerId);
        if (!layer) {
            return;
        }
        const anim = getLayerAnimAtTime(layer, state.timeline.currentTime);
        const hasPhysicsStart = Number.isFinite(layer.physicsStart);
        const beforePhysics = hasPhysicsStart && state.timeline.currentTime < layer.physicsStart;
        const shouldStatic = layer.freezePhysics;
        const angleRad = (anim.rotation * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const anchorX = strand.anchor.x + anim.x;
        const anchorY = strand.anchor.y + anim.y;

        // Keep constraints aligned with the current animated pose to avoid snap on release.
        strand.links.forEach((link) => {
            if (!link) {
                return;
            }
            link.length = layer.charGap * anim.scale;
            if (!link.bodyA) {
                link.pointA.x = anchorX;
                link.pointA.y = anchorY;
            }
        });

        strand.nodes.forEach((node) => {
            const localX = node.baseX - strand.anchor.x;
            const localY = node.baseY - strand.anchor.y;
            const scaledX = localX * anim.scale;
            const scaledY = localY * anim.scale;
            const rotX = scaledX * cos - scaledY * sin;
            const rotY = scaledX * sin + scaledY * cos;
            const targetX = anchorX + rotX;
            const targetY = anchorY + rotY;

            if (shouldStatic) {
                if (!node.body.isStatic) {
                    Body.setStatic(node.body, true);
                }
                Body.setVelocity(node.body, { x: 0, y: 0 });
                Body.setAngularVelocity(node.body, 0);
                Body.setPosition(node.body, { x: targetX, y: targetY });
                Body.setAngle(node.body, angleRad);
                return;
            }

            if (beforePhysics) {
                if (node.body.isStatic) {
                    Body.setStatic(node.body, false);
                }
                Body.setVelocity(node.body, { x: 0, y: 0 });
                Body.setAngularVelocity(node.body, 0);
                Body.setPosition(node.body, { x: targetX, y: targetY });
                Body.setAngle(node.body, angleRad);
                return;
            }

            if (node.body.isStatic) {
                // First frame of physics release: align pose, clear velocity, then unlock.
                Body.setPosition(node.body, { x: targetX, y: targetY });
                Body.setAngle(node.body, angleRad);
                Body.setVelocity(node.body, { x: 0, y: 0 });
                Body.setAngularVelocity(node.body, 0);
                Body.setStatic(node.body, false);
            }
        });
    });
}

function sampleRecordingFrame(now) {
    if (!state.recording.active) {
        return;
    }
    const fps = clamp(controls.recordFps.value, 12, 60, 30);
    const interval = 1000 / fps;
    if (now - state.recording.lastSampleAt < interval) {
        return;
    }
    state.recording.lastSampleAt = now;
    const chars = [];
    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            chars.push({
                char: node.char,
                x: Number(node.body.position.x.toFixed(2)),
                y: Number(node.body.position.y.toFixed(2)),
                angle: Number(node.body.angle.toFixed(4)),
                layerId: strand.layerId
            });
        });
    });
    state.recording.frames.push({
        t: Number(((now - state.recording.startAt) / 1000).toFixed(4)),
        timelineTime: Number(state.timeline.currentTime.toFixed(4)),
        chars
    });
}

function render(now) {
    updateTimeline(now);
    const forceRebuild = state.timeline.forceRebuild;
    state.timeline.forceRebuild = false;
    rebuildIfNeeded(forceRebuild);
    applyTimelineToBodies();
    applyUpright();
    if (repairInvalidBodies()) {
        rebuildIfNeeded(true);
        applyTimelineToBodies();
    }
    drawScene();
    updateRecordCanvas();
    drawOverlay();
    drawTimelineTrack();
    state.debug.frameCounter += 1;
    if (state.debug.enabled && state.debug.frameCounter % state.debug.frameSampleEvery === 0) {
        const sample = [];
        let leftTopCount = 0;
        state.strands.forEach((strand) => {
            strand.nodes.slice(0, 3).forEach((node) => {
                const x = roundNum(node.body.position.x, 2);
                const y = roundNum(node.body.position.y, 2);
                sample.push({
                    layerId: strand.layerId,
                    char: node.char,
                    x,
                    y
                });
                if (x < 64 && y < 64) {
                    leftTopCount += 1;
                }
            });
        });
        debugLog("frame_sample", {
            strandCount: state.strands.length,
            sample,
            leftTopCount
        });
        if (leftTopCount > 0) {
            debugLog("left_top_anomaly", {
                leftTopCount,
                strandCount: state.strands.length
            });
        }
    }
    if (state.recording.active) {
        timeText.textContent = formatTime(now - state.recording.startAt);
        sampleRecordingFrame(now);
    }
    requestAnimationFrame(render);
}

function repairInvalidBodies() {
    let repaired = false;
    state.strands.forEach((strand) => {
        const layer = state.layers.find((item) => item.id === strand.layerId);
        if (!layer) {
            return;
        }
        const anim = getLayerAnimAtTime(layer, state.timeline.currentTime);
        const angleRad = (anim.rotation * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const anchorX = strand.anchor.x + anim.x;
        const anchorY = strand.anchor.y + anim.y;
        strand.nodes.forEach((node) => {
            const p = node.body.position;
            if (Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(node.body.angle)) {
                return;
            }
            const localX = node.baseX - strand.anchor.x;
            const localY = node.baseY - strand.anchor.y;
            const scaledX = localX * anim.scale;
            const scaledY = localY * anim.scale;
            const targetX = anchorX + (scaledX * cos - scaledY * sin);
            const targetY = anchorY + (scaledX * sin + scaledY * cos);
            Body.setPosition(node.body, { x: targetX, y: targetY });
            Body.setVelocity(node.body, { x: 0, y: 0 });
            Body.setAngularVelocity(node.body, 0);
            Body.setAngle(node.body, angleRad);
            repaired = true;
        });
    });
    if (repaired) {
        debugLog("repair_invalid_bodies", {
            timeline: roundNum(state.timeline.currentTime, 4)
        });
    }
    return repaired;
}

function applyUpright() {
    if (!state.options.uprightEnabled) {
        return;
    }
    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            Body.setAngularVelocity(node.body, node.body.angularVelocity * 0.84);
            Body.setAngle(node.body, node.body.angle * 0.92);
        });
    });
}

function getClosestNode(x, y, maxDistance) {
    let best = null;
    let bestDist = maxDistance;
    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            const d = Math.hypot(node.body.position.x - x, node.body.position.y - y);
            if (d < bestDist) {
                bestDist = d;
                best = node;
            }
        });
    });
    return best;
}

function maybeStartDrag(x, y) {
    const node = getClosestNode(x, y, 80);
    if (!node) {
        return;
    }
    releaseDrag();
    state.dragConstraint = Constraint.create({
        pointA: { x, y },
        bodyB: node.body,
        length: 0,
        stiffness: state.options.dragStiffness,
        damping: state.options.dragDamping,
        render: { visible: false }
    });
    Composite.add(engine.world, state.dragConstraint);
}

function updateDrag(x, y) {
    if (!state.dragConstraint) {
        return;
    }
    state.dragConstraint.pointA.x = x;
    state.dragConstraint.pointA.y = y;
}

function releaseDrag() {
    if (!state.dragConstraint) {
        return;
    }
    Composite.remove(engine.world, state.dragConstraint, true);
    state.dragConstraint = null;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) {
        return Math.hypot(px - x1, py - y1);
    }
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    const sx = x1 + t * dx;
    const sy = y1 + t * dy;
    return Math.hypot(px - sx, py - sy);
}

function cutLinks(x, y) {
    const radius = state.options.cutRadius;
    state.strands.forEach((strand) => {
        strand.links.forEach((link, index) => {
            if (!link) {
                return;
            }
            const nodeB = strand.nodes[index].body;
            const nodeA = index === 0 ? null : strand.nodes[index - 1].body;
            const sx = nodeA ? nodeA.position.x : strand.anchor.x;
            const sy = nodeA ? nodeA.position.y : strand.anchor.y;
            const ex = nodeB.position.x;
            const ey = nodeB.position.y;
            if (distanceToSegment(x, y, sx, sy, ex, ey) <= radius) {
                Composite.remove(strand.composite, link, true);
                strand.links[index] = null;
            }
        });
    });
}

function applyWind(x, y, dx, dy) {
    const radius = state.options.windRadius;
    const radiusSq = radius * radius;
    const base = Math.hypot(dx, dy) * state.options.windStrength;
    if (base <= 0) {
        return;
    }
    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            const vx = node.body.position.x - x;
            const vy = node.body.position.y - y;
            const d2 = vx * vx + vy * vy;
            if (d2 > radiusSq) {
                return;
            }
            const d = Math.sqrt(d2);
            const falloff = 1 - d / radius;
            Body.applyForce(node.body, node.body.position, {
                x: dx * base * falloff * 0.002,
                y: dy * base * falloff * 0.002
            });
        });
    });
}

function getStagePoint(event) {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function clearPointer() {
    state.pointer.leftActive = false;
    state.pointer.rightActive = false;
    releaseDrag();
}

function applyLayerToInputs(layer) {
    if (!layer) {
        return;
    }
    controls.layerName.value = layer.name;
    controls.layerStart.value = String(layer.start);
    controls.layerEnd.value = String(layer.end);
    controls.physicsStart.value = Number.isFinite(layer.physicsStart) ? String(layer.physicsStart) : "";
    controls.text.value = layer.text;
    controls.fontFamily.value = layer.fontFamily;
    controls.fontSize.value = String(layer.fontSize);
    controls.fontWeight.value = String(layer.fontWeight);
    controls.writingMode.value = layer.writingMode;
    controls.flowDirection.value = layer.flowDirection;
    controls.charGap.value = String(layer.charGap);
    controls.columnGap.value = String(layer.columnGap);
    controls.topPadding.value = String(layer.topPadding);
    controls.anchorLift.value = String(layer.anchorLift);
    controls.rightPadding.value = String(layer.rightPadding);
    controls.fillColor.value = layer.fillColor;
    controls.strokeColor.value = layer.strokeColor;
    controls.strokeWidth.value = String(layer.strokeWidth);
    controls.density.value = String(layer.density);
    controls.frictionAir.value = String(layer.frictionAir);
    controls.restitution.value = String(layer.restitution);
    controls.linkStiffness.value = String(layer.linkStiffness);
    controls.linkDamping.value = String(layer.linkDamping);
    controls.recordDisablePhysics.checked = layer.freezePhysics;
    controls.maxCharsPerStrand.value = String(layer.maxCharsPerStrand);
    const selectedKf = state.timeline.selectedKeyframe
        && state.timeline.selectedKeyframe.layerId === layer.id
        ? layer.keyframes[state.timeline.selectedKeyframe.index]
        : null;
    const kf = selectedKf || getLayerAnimAtTime(layer, state.timeline.currentTime);
    controls.kfPosX.value = String(Number((kf.x || 0).toFixed(3)));
    controls.kfPosY.value = String(Number((kf.y || 0).toFixed(3)));
    controls.kfRotation.value = String(Number((kf.rotation || 0).toFixed(3)));
    controls.kfScale.value = String(Number((kf.scale || 1).toFixed(3)));
    controls.kfOpacity.value = String(Number((kf.opacity || 1).toFixed(3)));
    controls.kfEasing.value = selectedKf ? (selectedKf.easing || "linear") : "linear";
    controls.kfBezier.value = (selectedKf ? (selectedKf.bezier || [0.25, 0.1, 0.25, 1]) : [0.25, 0.1, 0.25, 1]).join(",");
    debugLog("apply_layer_to_inputs", {
        layer: summarizeLayer(layer)
    });
}

function applyInputsToSelectedLayer() {
    const layer = getSelectedLayer();
    if (!layer) {
        return;
    }
    const before = summarizeLayer(layer);
    layer.name = controls.layerName.value.trim() || "图层";
    const nextStart = clamp(controls.layerStart.value, 0, state.timeline.duration, layer.start);
    const nextEnd = clamp(
        controls.layerEnd.value,
        nextStart + 0.01,
        state.timeline.duration,
        Math.max(nextStart + 0.01, layer.end)
    );
    layer.start = nextStart;
    layer.end = nextEnd;
    const rawPhysicsStart = String(controls.physicsStart.value).trim();
    if (rawPhysicsStart === "") {
        layer.physicsStart = null;
    } else {
        const physicsFallback = Number.isFinite(layer.physicsStart) ? layer.physicsStart : layer.start;
        layer.physicsStart = clamp(rawPhysicsStart, layer.start, layer.end, physicsFallback);
    }
    layer.text = controls.text.value;
    layer.fontFamily = controls.fontFamily.value.trim() || layerTemplate.fontFamily;
    layer.fontSize = clamp(controls.fontSize.value, 16, 72, layer.fontSize);
    layer.fontWeight = clamp(controls.fontWeight.value, 100, 900, layer.fontWeight);
    layer.writingMode = controls.writingMode.value === "vertical" ? "vertical" : "horizontal";
    layer.flowDirection = controls.flowDirection.value === "ltr" ? "ltr" : "rtl";
    layer.charGap = clamp(controls.charGap.value, 18, 90, layer.charGap);
    layer.columnGap = clamp(controls.columnGap.value, 20, 120, layer.columnGap);
    layer.topPadding = clamp(controls.topPadding.value, 0, 1600, layer.topPadding);
    layer.anchorLift = clamp(controls.anchorLift.value, 0, 2400, layer.anchorLift);
    layer.rightPadding = clamp(controls.rightPadding.value, 10, 220, layer.rightPadding);
    layer.fillColor = controls.fillColor.value;
    layer.strokeColor = controls.strokeColor.value;
    layer.strokeWidth = clamp(controls.strokeWidth.value, 0, 12, layer.strokeWidth);
    layer.density = clamp(controls.density.value, 0.0001, 0.02, layer.density);
    layer.frictionAir = clamp(controls.frictionAir.value, 0, 0.5, layer.frictionAir);
    layer.restitution = clamp(controls.restitution.value, 0, 1, layer.restitution);
    layer.linkStiffness = clamp(controls.linkStiffness.value, 0.1, 1, layer.linkStiffness);
    layer.linkDamping = clamp(controls.linkDamping.value, 0, 0.3, layer.linkDamping);
    layer.freezePhysics = controls.recordDisablePhysics.checked;
    layer.maxCharsPerStrand = clamp(controls.maxCharsPerStrand.value, 1, 200, layer.maxCharsPerStrand);
    const after = summarizeLayer(layer);
    debugLog("apply_inputs_to_layer", { before, after });
}

function refreshLayerSelect() {
    controls.layerSelect.innerHTML = "";
    state.layers.forEach((layer) => {
        const option = document.createElement("option");
        option.value = layer.id;
        option.textContent = `${layer.name} [${layer.start.toFixed(1)}-${layer.end.toFixed(1)}s]`;
        if (layer.id === state.selectedLayerId) {
            option.selected = true;
        }
        controls.layerSelect.appendChild(option);
    });
}

function selectLayer(layerId) {
    const prevLayerId = state.selectedLayerId;
    state.selectedLayerId = layerId;
    state.timeline.selectedKeyframe = null;
    refreshLayerSelect();
    const layer = getSelectedLayer();
    applyLayerToInputs(layer);
    debugLog("select_layer", {
        from: prevLayerId,
        to: layerId,
        layer: summarizeLayer(layer)
    });
}

function getKeyframeFromInputs(time) {
    return {
        time: clamp(time, 0, state.timeline.duration, 0),
        x: Number(controls.kfPosX.value) || 0,
        y: Number(controls.kfPosY.value) || 0,
        rotation: Number(controls.kfRotation.value) || 0,
        scale: clamp(controls.kfScale.value, 0.05, 20, 1),
        opacity: clamp(controls.kfOpacity.value, 0, 1, 1),
        easing: controls.kfEasing.value || "linear",
        bezier: parseBezier(controls.kfBezier.value)
    };
}

function findKeyframeIndexAtTime(layer, time, eps = 0.02) {
    if (!layer.keyframes) {
        return -1;
    }
    for (let i = 0; i < layer.keyframes.length; i += 1) {
        if (Math.abs(layer.keyframes[i].time - time) <= eps) {
            return i;
        }
    }
    return -1;
}

function addKeyframe() {
    const layer = getSelectedLayer();
    if (!layer) {
        return;
    }
    const kf = getKeyframeFromInputs(state.timeline.currentTime);
    const index = findKeyframeIndexAtTime(layer, kf.time);
    if (index >= 0) {
        layer.keyframes[index] = kf;
        state.timeline.selectedKeyframe = { layerId: layer.id, index };
    } else {
        layer.keyframes.push(kf);
        sortKeyframes(layer);
        const newIndex = findKeyframeIndexAtTime(layer, kf.time, 0.0001);
        state.timeline.selectedKeyframe = { layerId: layer.id, index: Math.max(0, newIndex) };
    }
    applyLayerToInputs(layer);
}

function updateSelectedKeyframe() {
    const layer = getSelectedLayer();
    if (!layer) {
        return;
    }
    const selected = state.timeline.selectedKeyframe;
    if (!selected || selected.layerId !== layer.id || selected.index < 0 || selected.index >= layer.keyframes.length) {
        addKeyframe();
        return;
    }
    const currentTime = layer.keyframes[selected.index].time;
    layer.keyframes[selected.index] = getKeyframeFromInputs(currentTime);
    sortKeyframes(layer);
    state.timeline.selectedKeyframe = { layerId: layer.id, index: findKeyframeIndexAtTime(layer, currentTime, 0.0001) };
    applyLayerToInputs(layer);
}

function deleteSelectedKeyframe() {
    const layer = getSelectedLayer();
    const selected = state.timeline.selectedKeyframe;
    if (!layer || !selected || selected.layerId !== layer.id) {
        return;
    }
    if (layer.keyframes.length <= 1) {
        return;
    }
    layer.keyframes.splice(selected.index, 1);
    sortKeyframes(layer);
    state.timeline.selectedKeyframe = null;
    applyLayerToInputs(layer);
}

function applyGlobalControls() {
    state.options.gravityX = clamp(controls.gravityX.value, -3, 3, globalDefaults.gravityX);
    state.options.gravityY = clamp(controls.gravityY.value, -3, 3, globalDefaults.gravityY);
    state.options.dragStiffness = clamp(controls.dragStiffness.value, 0.01, 1, globalDefaults.dragStiffness);
    state.options.dragDamping = clamp(controls.dragDamping.value, 0, 0.5, globalDefaults.dragDamping);
    state.options.windRadius = clamp(controls.windRadius.value, 20, 800, globalDefaults.windRadius);
    state.options.windStrength = clamp(controls.windStrength.value, 0.0001, 0.08, globalDefaults.windStrength);
    state.options.cutRadius = clamp(controls.cutRadius.value, 4, 160, globalDefaults.cutRadius);
    state.options.groundHeight = clamp(controls.groundHeight.value, 0, 400, globalDefaults.groundHeight);
    state.options.toolMode = controls.toolMode.value;
    state.options.collisionEnabled = controls.collisionEnabled.checked;
    state.options.uprightEnabled = controls.uprightEnabled.checked;
    state.timeline.duration = clamp(controls.timelineDuration.value, 1, 1200, globalDefaults.timelineDuration);
    state.timeline.zoom = clamp(controls.timelineZoom.value, 1, 20, 1);
    state.timeline.snapEnabled = controls.timelineSnap.checked;
    state.timeline.rangeStart = clamp(controls.rangeStart.value, 0, state.timeline.duration, 0);
    state.timeline.rangeEnd = clamp(controls.rangeEnd.value, state.timeline.rangeStart + 0.01, state.timeline.duration, state.timeline.duration);
    setTimelineTime(clamp(controls.timelineTime.value, 0, state.timeline.duration, 0));
    applyRecordFrameControls();
    engine.gravity.x = state.options.gravityX;
    engine.gravity.y = state.options.gravityY;
    updateModeLabel();
    rebuildIfNeeded(true);
}

function resetAll() {
    state.options = { ...globalDefaults };
    controls.gravityX.value = String(globalDefaults.gravityX);
    controls.gravityY.value = String(globalDefaults.gravityY);
    controls.dragStiffness.value = String(globalDefaults.dragStiffness);
    controls.dragDamping.value = String(globalDefaults.dragDamping);
    controls.windRadius.value = String(globalDefaults.windRadius);
    controls.windStrength.value = String(globalDefaults.windStrength);
    controls.cutRadius.value = String(globalDefaults.cutRadius);
    controls.groundHeight.value = String(globalDefaults.groundHeight);
    controls.toolMode.value = globalDefaults.toolMode;
    controls.collisionEnabled.checked = globalDefaults.collisionEnabled;
    controls.uprightEnabled.checked = globalDefaults.uprightEnabled;
    controls.timelineDuration.value = String(globalDefaults.timelineDuration);
    controls.timelineTime.value = "0";
    controls.timelineSlider.value = "0";
    controls.timelineSlider.max = String(globalDefaults.timelineDuration);
    controls.timelineZoom.value = "1";
    controls.timelineSnap.checked = true;
    controls.rangeStart.value = "0";
    controls.rangeEnd.value = String(globalDefaults.timelineDuration);
    controls.outputWidth.value = String(globalDefaults.outputWidth);
    controls.outputHeight.value = String(globalDefaults.outputHeight);
    controls.recordFrameX.value = String(globalDefaults.recordFrameX);
    controls.recordFrameY.value = String(globalDefaults.recordFrameY);
    controls.recordFrameWidth.value = String(globalDefaults.recordFrameWidth);
    controls.recordFrameHeight.value = String(globalDefaults.recordFrameHeight);

    state.layers = [makeLayer(0)];
    state.selectedLayerId = state.layers[0].id;
    state.timeline.currentTime = 0;
    state.timeline.duration = globalDefaults.timelineDuration;
    state.timeline.rangeStart = 0;
    state.timeline.rangeEnd = globalDefaults.timelineDuration;
    state.timeline.zoom = 1;
    state.timeline.snapEnabled = true;
    state.timeline.playing = false;
    state.timeline.lastNow = 0;
    state.timeline.forceRebuild = false;
    controls.playBtn.textContent = "播放时间轴";
    refreshLayerSelect();
    applyLayerToInputs(getSelectedLayer());
    applyGlobalControls();
}

function setPanelCollapsed(collapsed) {
    layout.classList.toggle("is-panel-collapsed", collapsed);
    panelToggle.textContent = collapsed ? "展开" : "收起";
    panelToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    stagePanelToggle.textContent = collapsed ? "展开参数" : "收起参数";
    stagePanelToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
}

function setRecordUi(active) {
    controls.recordBtn.disabled = active;
    controls.stopBtn.disabled = !active;
    statusText.textContent = active ? "状态：录制中" : "状态：待机";
    if (!active) {
        timeText.textContent = "00:00.000";
    }
}

function getVideoMimeType() {
    const list = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    for (let i = 0; i < list.length; i += 1) {
        if (MediaRecorder.isTypeSupported(list[i])) {
            return list[i];
        }
    }
    return "video/webm";
}

function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function startRecording() {
    if (state.recording.active) {
        return;
    }
    const fps = clamp(controls.recordFps.value, 12, 60, 30);
    const bitrate = clamp(controls.recordBitrate.value, 1, 30, 8) * 1000000;
    const outputWidth = Math.round(clamp(controls.outputWidth.value, 64, 7680, globalDefaults.outputWidth));
    const outputHeight = Math.round(clamp(controls.outputHeight.value, 64, 4320, globalDefaults.outputHeight));
    const frame = getRecordFrame();
    const recordCanvas = document.createElement("canvas");
    recordCanvas.width = outputWidth;
    recordCanvas.height = outputHeight;
    state.recording.recordCanvas = recordCanvas;
    state.recording.recordCtx = recordCanvas.getContext("2d");
    updateRecordCanvas();

    const mimeType = getVideoMimeType();
    const stream = recordCanvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });

    state.recording.active = true;
    state.recording.startAt = performance.now();
    state.recording.chunks = [];
    state.recording.frames = [];
    state.recording.lastSampleAt = 0;
    state.recording.mediaRecorder = recorder;

    recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
            state.recording.chunks.push(event.data);
        }
    });

    recorder.addEventListener("stop", () => {
        const now = new Date();
        const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
        const video = new Blob(state.recording.chunks, { type: mimeType });
        const meta = {
            version: 1,
            duration: Number(((performance.now() - state.recording.startAt) / 1000).toFixed(4)),
            timelineDuration: state.timeline.duration,
            output: { width: outputWidth, height: outputHeight },
            recordFrame: getRecordFrame(),
            layers: state.layers,
            options: state.options,
            frames: state.recording.frames
        };
        downloadBlob(`character-physics-${stamp}.webm`, video);
        downloadBlob(`character-physics-${stamp}.json`, new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" }));
        state.recording.recordCanvas = null;
        state.recording.recordCtx = null;
    });

    recorder.start();
    setRecordUi(true);
}

function stopRecording() {
    if (!state.recording.active || !state.recording.mediaRecorder) {
        return;
    }
    state.recording.active = false;
    setRecordUi(false);
    state.recording.mediaRecorder.stop();
    state.recording.mediaRecorder = null;
}

stage.addEventListener("contextmenu", (event) => event.preventDefault());

stage.addEventListener("pointerdown", (event) => {
    const p = getStagePoint(event);
    state.pointer.x = p.x;
    state.pointer.y = p.y;
    state.pointer.prevX = p.x;
    state.pointer.prevY = p.y;
    if (event.button === 0) {
        state.pointer.leftActive = true;
        if (state.options.toolMode === "hand") {
            maybeStartDrag(p.x, p.y);
        } else if (state.options.toolMode === "cut") {
            cutLinks(p.x, p.y);
        }
    }
    if (event.button === 2) {
        state.pointer.rightActive = true;
    }
});

stage.addEventListener("pointermove", (event) => {
    const p = getStagePoint(event);
    const dx = p.x - state.pointer.prevX;
    const dy = p.y - state.pointer.prevY;
    state.pointer.x = p.x;
    state.pointer.y = p.y;
    if (state.pointer.leftActive && state.options.toolMode === "hand") {
        updateDrag(p.x, p.y);
    } else if (state.pointer.leftActive && state.options.toolMode === "wind") {
        applyWind(p.x, p.y, dx, dy);
    } else if (state.pointer.leftActive && state.options.toolMode === "cut") {
        cutLinks(p.x, p.y);
    }
    if (state.pointer.rightActive) {
        applyWind(p.x, p.y, dx, dy);
    }
    state.pointer.prevX = p.x;
    state.pointer.prevY = p.y;
});

window.addEventListener("pointerup", (event) => {
    if (event.button === 0) {
        state.pointer.leftActive = false;
        releaseDrag();
    }
    if (event.button === 2) {
        state.pointer.rightActive = false;
    }
});
stage.addEventListener("pointerleave", clearPointer);

controls.layerSelect.addEventListener("change", () => selectLayer(controls.layerSelect.value));
controls.addLayerBtn.addEventListener("click", () => {
    const layer = makeLayer(state.layers.length);
    layer.start = 0;
    layer.end = state.timeline.duration;
    layer.physicsStart = null;
    state.layers.push(layer);
    debugLog("add_layer", {
        layer: summarizeLayer(layer),
        totalLayers: state.layers.length
    });
    selectLayer(layer.id);
    rebuildIfNeeded(true);
});
controls.removeLayerBtn.addEventListener("click", () => {
    if (state.layers.length <= 1) {
        return;
    }
    const idx = state.layers.findIndex((layer) => layer.id === state.selectedLayerId);
    if (idx < 0) {
        return;
    }
    state.layers.splice(idx, 1);
    const next = state.layers[Math.max(0, idx - 1)];
    selectLayer(next.id);
    rebuildIfNeeded(true);
});

[
    controls.layerName,
    controls.layerStart,
    controls.layerEnd,
    controls.physicsStart,
    controls.text,
    controls.fontFamily,
    controls.fontSize,
    controls.fontWeight,
    controls.writingMode,
    controls.flowDirection,
    controls.charGap,
    controls.columnGap,
    controls.topPadding,
    controls.anchorLift,
    controls.rightPadding,
    controls.fillColor,
    controls.strokeColor,
    controls.strokeWidth,
    controls.density,
    controls.frictionAir,
    controls.restitution,
    controls.linkStiffness,
    controls.linkDamping,
    controls.recordDisablePhysics,
    controls.maxCharsPerStrand
].forEach((el) => {
    el.addEventListener("input", () => {
        applyInputsToSelectedLayer();
        refreshLayerSelect();
        rebuildIfNeeded(true);
    });
});

controls.addKfBtn.addEventListener("click", () => {
    addKeyframe();
    rebuildIfNeeded(true);
});
controls.updateKfBtn.addEventListener("click", () => {
    updateSelectedKeyframe();
    rebuildIfNeeded(true);
});
controls.deleteKfBtn.addEventListener("click", () => {
    deleteSelectedKeyframe();
    rebuildIfNeeded(true);
});

controls.timelineDuration.addEventListener("input", () => {
    state.timeline.duration = clamp(controls.timelineDuration.value, 1, 1200, globalDefaults.timelineDuration);
    state.layers.forEach((layer) => {
        layer.start = clamp(layer.start, 0, state.timeline.duration, 0);
        layer.end = clamp(layer.end, layer.start + 0.01, state.timeline.duration, state.timeline.duration);
        if (Number.isFinite(layer.physicsStart)) {
            layer.physicsStart = clamp(layer.physicsStart, layer.start, layer.end, layer.start);
        } else {
            layer.physicsStart = null;
        }
        if (layer.keyframes) {
            layer.keyframes.forEach((kf) => {
                kf.time = clamp(kf.time, 0, state.timeline.duration, kf.time);
            });
            sortKeyframes(layer);
        }
    });
    state.timeline.rangeStart = clamp(state.timeline.rangeStart, 0, state.timeline.duration, 0);
    state.timeline.rangeEnd = clamp(state.timeline.rangeEnd, state.timeline.rangeStart + 0.01, state.timeline.duration, state.timeline.duration);
    setTimelineTime(state.timeline.currentTime);
    refreshLayerSelect();
    applyLayerToInputs(getSelectedLayer());
    rebuildIfNeeded(true);
});

controls.timelineSlider.addEventListener("input", () => {
    state.timeline.playing = false;
    controls.playBtn.textContent = "播放时间轴";
    setTimelineTime(controls.timelineSlider.value, { snap: true });
    rebuildIfNeeded(true);
});
controls.timelineTime.addEventListener("input", () => {
    state.timeline.playing = false;
    controls.playBtn.textContent = "播放时间轴";
    setTimelineTime(controls.timelineTime.value, { snap: true });
    rebuildIfNeeded(true);
});

controls.timelineZoom.addEventListener("input", () => {
    state.timeline.zoom = clamp(controls.timelineZoom.value, 1, 20, 1);
});
controls.timelineSnap.addEventListener("change", () => {
    state.timeline.snapEnabled = controls.timelineSnap.checked;
});
controls.rangeStart.addEventListener("input", () => {
    state.timeline.rangeStart = clamp(controls.rangeStart.value, 0, state.timeline.duration, 0);
    state.timeline.rangeEnd = clamp(state.timeline.rangeEnd, state.timeline.rangeStart + 0.01, state.timeline.duration, state.timeline.duration);
    updateTimelineInputs();
});
controls.rangeEnd.addEventListener("input", () => {
    state.timeline.rangeEnd = clamp(controls.rangeEnd.value, state.timeline.rangeStart + 0.01, state.timeline.duration, state.timeline.duration);
    updateTimelineInputs();
});

controls.playBtn.addEventListener("click", () => {
    state.timeline.playing = !state.timeline.playing;
    state.timeline.lastNow = 0;
    controls.playBtn.textContent = state.timeline.playing ? "暂停时间轴" : "播放时间轴";
});

controls.timelineTrack.addEventListener("pointerdown", (event) => {
    const rect = controls.timelineTrack.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const t = maybeSnapTime(getTimeFromTrackX(x));
    setTimelineTime(t);

    const layer = getSelectedLayer();
    if (layer && layer.keyframes) {
        const rowH = Math.max(22, (controls.timelineTrack.clientHeight - 24) / Math.max(1, state.layers.length));
        const selectedLayerIndex = Math.max(0, state.layers.findIndex((item) => item.id === layer.id));
        const rowY = 18 + selectedLayerIndex * rowH;
        const dy = event.clientY - rect.top - (rowY + rowH * 0.5);
        if (Math.abs(dy) <= 10) {
            const visibleDuration = state.timeline.duration / state.timeline.zoom;
            const viewStart = clamp(
                state.timeline.currentTime - visibleDuration * 0.5,
                0,
                Math.max(0, state.timeline.duration - visibleDuration),
                0
            );
            let picked = -1;
            let pickedDist = 12;
            layer.keyframes.forEach((kf, index) => {
                const kx = ((kf.time - viewStart) / visibleDuration) * controls.timelineTrack.clientWidth;
                const dist = Math.abs(kx - x);
                if (dist < pickedDist) {
                    pickedDist = dist;
                    picked = index;
                }
            });
            if (picked >= 0) {
                state.timeline.selectedKeyframe = { layerId: layer.id, index: picked };
                applyLayerToInputs(layer);
            }
        }
    }
});

controls.toolMode.addEventListener("change", () => {
    state.options.toolMode = controls.toolMode.value;
    updateModeLabel();
});

controls.applyBtn.addEventListener("click", () => {
    applyInputsToSelectedLayer();
    applyGlobalControls();
});
controls.resetBtn.addEventListener("click", resetAll);
controls.recordBtn.addEventListener("click", startRecording);
controls.stopBtn.addEventListener("click", stopRecording);
controls.recordFrameX.addEventListener("input", applyRecordFrameControls);
controls.recordFrameY.addEventListener("input", applyRecordFrameControls);
controls.recordFrameWidth.addEventListener("input", applyRecordFrameControls);
controls.recordFrameHeight.addEventListener("input", applyRecordFrameControls);
controls.outputWidth.addEventListener("input", applyRecordFrameControls);
controls.outputHeight.addEventListener("input", applyRecordFrameControls);
panelToggle.addEventListener("click", () => {
    const collapsed = !layout.classList.contains("is-panel-collapsed");
    setPanelCollapsed(collapsed);
    requestAnimationFrame(() => {
        resizeStage();
        rebuildIfNeeded(true);
    });
});
stagePanelToggle.addEventListener("click", () => {
    const collapsed = !layout.classList.contains("is-panel-collapsed");
    setPanelCollapsed(collapsed);
    requestAnimationFrame(() => {
        resizeStage();
        rebuildIfNeeded(true);
    });
});

window.addEventListener("resize", () => {
    resizeStage();
    rebuildIfNeeded(true);
});

resizeStage();
resetAll();
setPanelCollapsed(false);
Runner.run(runner, engine);
requestAnimationFrame(render);
