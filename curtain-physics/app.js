const {
    Engine,
    World,
    Bodies,
    Body,
    Constraint,
    Runner,
    Composite
} = Matter;

const defaultText = `
声声慢·寻寻觅觅
寻寻觅觅，冷冷清清，凄凄惨惨戚戚。
乍暖还寒时候，最难将息。
三杯两盏淡酒，怎敌他、晚来风急？
雁过也，正伤心，却是旧时相识。
满地黄花堆积。憔悴损，如今有谁堪摘？
守着窗儿，独自怎生得黑？
梧桐更兼细雨，到黄昏、点点滴滴。
这次第，怎一个愁字了得！`;

const CONFIG = {
    defaults: {
        textMode: "poetry",
        maxCharsPerStrand: 100,
        fontSize: 30,
        charGap: 42,
        columnGap: 54,
        groupGap: 84,
        windRadius: 180,
        windStrength: 0.0024,
        autoWindEnabled: false,
        autoWindStrength: 0.0009,
        autoWindFrequency: 0.01,
        collisionEnabled: true,
        uprightEnabled: false,
        backgroundColor: "#ffffff",
        textColor: "#111111"
    },
    layout: {
        topPadding: 90,
        rightPadding: 82,
        bottomPadding: 72,
        anchorLift: 78,
        hiddenNodes: 2,
        minFontSize: 18,
        maxFontSize: 56,
        fontSizeDivisor: 22
    },
    body: {
        density: 0.0025,
        frictionAir: 0.05,
        restitution: 0.1,
        collisionPadding: 0.34,
        handRadius: 54,
        uprightStiffness: 0.08,
        uprightAngularDamping: 0.84
    },
    constraint: {
        stiffness: 0.94,
        damping: 0.06
    },
    render: {
        connectorInsetRatio: 0.3,
        connectorShadowColor: "rgba(17, 17, 17, 0.08)",
        connectorColor: "rgba(255, 255, 255, 0.96)",
        connectorShadowWidth: 4,
        connectorWidth: 1.6
    }
};

const textInput = document.getElementById("text-input");
const fileInput = document.getElementById("file-input");
const textModeInput = document.getElementById("text-mode");
const maxCharsPerStrandInput = document.getElementById("max-chars-per-strand");
const fontSizeInput = document.getElementById("font-size");
const charGapInput = document.getElementById("char-gap");
const columnGapInput = document.getElementById("column-gap");
const groupGapInput = document.getElementById("group-gap");
const windRadiusInput = document.getElementById("wind-radius");
const windStrengthInput = document.getElementById("wind-strength");
const autoWindEnabledInput = document.getElementById("auto-wind-enabled");
const autoWindStrengthInput = document.getElementById("auto-wind-strength");
const autoWindFrequencyInput = document.getElementById("auto-wind-frequency");
const collisionEnabledInput = document.getElementById("collision-enabled");
const uprightEnabledInput = document.getElementById("upright-enabled");
const backgroundColorInput = document.getElementById("background-color");
const textColorInput = document.getElementById("text-color");
const applyButton = document.getElementById("apply-button");
const resetButton = document.getElementById("reset-button");
const stage = document.querySelector(".stage-wrap");
const threadCanvas = document.getElementById("thread-canvas");
const letterLayer = document.getElementById("letter-layer");
const threadCtx = threadCanvas.getContext("2d");

const engine = Engine.create({
    gravity: { x: 0, y: 0.92 }
});
const runner = Runner.create();

const state = {
    dpr: window.devicePixelRatio || 1,
    width: 0,
    height: 0,
    strands: [],
    letters: [],
    anchors: [],
    handBody: null,
    pointer: {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        mode: null,
        inside: false
    },
    options: { ...CONFIG.defaults },
    autoWind: {
        active: false,
        phase: 0,
        amplitude: 0,
        directionX: 1,
        centerY: 0,
        band: 220
    }
};

textInput.value = defaultText;
textModeInput.value = CONFIG.defaults.textMode;
maxCharsPerStrandInput.value = String(CONFIG.defaults.maxCharsPerStrand);
fontSizeInput.value = String(CONFIG.defaults.fontSize);
charGapInput.value = String(CONFIG.defaults.charGap);
columnGapInput.value = String(CONFIG.defaults.columnGap);
groupGapInput.value = String(CONFIG.defaults.groupGap);
windRadiusInput.value = String(CONFIG.defaults.windRadius);
windStrengthInput.value = String(CONFIG.defaults.windStrength);
autoWindEnabledInput.checked = CONFIG.defaults.autoWindEnabled;
autoWindStrengthInput.value = String(CONFIG.defaults.autoWindStrength);
autoWindFrequencyInput.value = String(CONFIG.defaults.autoWindFrequency);
collisionEnabledInput.checked = CONFIG.defaults.collisionEnabled;
uprightEnabledInput.checked = CONFIG.defaults.uprightEnabled;
backgroundColorInput.value = CONFIG.defaults.backgroundColor;
textColorInput.value = CONFIG.defaults.textColor;

function clampMaxChars(value) {
    return Math.max(2, Math.min(100, value));
}

function clampFontSize(value) {
    return Math.max(CONFIG.layout.minFontSize, Math.min(CONFIG.layout.maxFontSize, value));
}

function splitLine(line) {
    const matches = line.match(/[^，。！？；、,.!?;]+[，。！？；、,.!?;]?/g);
    if (!matches) {
        return [];
    }
    return matches.map((item) => item.trim()).filter(Boolean);
}

function chunkText(text, maxCharsPerStrand) {
    const chars = Array.from(text.trim());
    const chunks = [];

    for (let index = 0; index < chars.length; index += maxCharsPerStrand) {
        chunks.push(chars.slice(index, index + maxCharsPerStrand).join(""));
    }

    return chunks.filter(Boolean);
}

function parseText(rawText) {
    return rawText
        .trim()
        .split(/\n\s*\n/)
        .map((group) => group.split("\n").map((line) => line.trim()).filter(Boolean))
        .filter((group) => group.length > 0)
        .map((group) => {
            const strands = [];

            group.forEach((line) => {
                if (state.options.textMode === "poetry") {
                    splitLine(line).forEach((segment) => {
                        strands.push(segment);
                    });
                    return;
                }

                chunkText(line, state.options.maxCharsPerStrand).forEach((chunk) => {
                    strands.push(chunk);
                });
            });

            return strands;
        });
}

function resizeStage() {
    const rect = stage.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.dpr = window.devicePixelRatio || 1;
    threadCanvas.width = Math.floor(rect.width * state.dpr);
    threadCanvas.height = Math.floor(rect.height * state.dpr);
    threadCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function clearWorld() {
    state.strands.forEach((strand) => {
        Composite.remove(engine.world, strand.composite, true);
    });
    state.strands = [];
    state.letters = [];
    state.anchors = [];
    letterLayer.innerHTML = "";

    if (state.handBody) {
        Composite.remove(engine.world, state.handBody, true);
        state.handBody = null;
    }
}

function drawConnector(startX, startY, endX, endY) {
    threadCtx.beginPath();
    threadCtx.strokeStyle = CONFIG.render.connectorShadowColor;
    threadCtx.lineWidth = CONFIG.render.connectorShadowWidth;
    threadCtx.moveTo(startX, startY);
    threadCtx.lineTo(endX, endY);
    threadCtx.stroke();

    threadCtx.beginPath();
    threadCtx.strokeStyle = CONFIG.render.connectorColor;
    threadCtx.lineWidth = CONFIG.render.connectorWidth;
    threadCtx.moveTo(startX, startY);
    threadCtx.lineTo(endX, endY);
    threadCtx.stroke();
}

function createLetterBody(x, y, fontSize, visible, char) {
    const radius = fontSize * CONFIG.body.collisionPadding;
    const body = Bodies.circle(x, y, radius, {
        density: CONFIG.body.density,
        frictionAir: CONFIG.body.frictionAir,
        restitution: CONFIG.body.restitution,
        collisionFilter: {
            category: 0x0002,
            mask: state.options.collisionEnabled ? (0x0002 | 0x0004) : 0x0004
        },
        render: { visible: false }
    });

    return {
        body,
        visible,
        char,
        radius,
        element: null
    };
}

function buildCurtain() {
    clearWorld();
    resizeStage();

    const groups = parseText(textInput.value || defaultText);
    const fontSize = clampFontSize(state.options.fontSize);

    let x = state.width - CONFIG.layout.rightPadding;

    groups.forEach((group, groupIndex) => {
        group.forEach((strandText) => {
            const chars = Array.from(strandText);
            const composite = Composite.create();
            const nodes = [];
            const constraints = [];
            const anchor = {
                x,
                y: CONFIG.layout.topPadding - CONFIG.layout.anchorLift
            };

            let previousBody = Bodies.circle(anchor.x, anchor.y, 2, {
                isStatic: true,
                collisionFilter: { mask: 0 },
                render: { visible: false }
            });

            Composite.add(composite, previousBody);

            for (let hiddenIndex = 0; hiddenIndex < CONFIG.layout.hiddenNodes; hiddenIndex += 1) {
                const hiddenY = CONFIG.layout.topPadding - (CONFIG.layout.hiddenNodes - hiddenIndex) * state.options.charGap;
                const hiddenNode = createLetterBody(x, hiddenY, fontSize, false, "");
                const hiddenConstraint = Constraint.create({
                    bodyA: previousBody,
                    bodyB: hiddenNode.body,
                    length: state.options.charGap,
                    stiffness: CONFIG.constraint.stiffness,
                    damping: CONFIG.constraint.damping,
                    render: { visible: false }
                });

                nodes.push(hiddenNode);
                constraints.push(hiddenConstraint);
                Composite.add(composite, [hiddenNode.body, hiddenConstraint]);
                previousBody = hiddenNode.body;
            }

            chars.forEach((char, index) => {
                const bodyY = CONFIG.layout.topPadding + index * state.options.charGap;
                const node = createLetterBody(x, bodyY, fontSize, true, char);
                const constraint = Constraint.create({
                    bodyA: previousBody,
                    bodyB: node.body,
                    length: state.options.charGap,
                    stiffness: CONFIG.constraint.stiffness,
                    damping: CONFIG.constraint.damping,
                    render: { visible: false }
                });
                const letter = document.createElement("div");
                letter.className = "letter";
                letter.textContent = char;
                letter.style.fontSize = `${fontSize}px`;
                letter.style.color = state.options.textColor;
                letterLayer.appendChild(letter);

                node.element = letter;
                nodes.push(node);
                constraints.push(constraint);
                Composite.add(composite, [node.body, constraint]);
                previousBody = node.body;
            });

            Composite.add(engine.world, composite);
            state.strands.push({
                composite,
                nodes,
                constraints,
                anchor,
                fontSize
            });

            x -= state.options.columnGap;
        });

        if (groupIndex < groups.length - 1) {
            x -= state.options.groupGap;
        }
    });
}

function updateLetterStyles() {
    stage.style.background = state.options.backgroundColor;
    threadCanvas.style.background = state.options.backgroundColor;

    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            if (node.element) {
                node.element.style.color = state.options.textColor;
            }
        });
    });
}

function applyWind(pointerX, pointerY, deltaX, deltaY) {
    const speed = Math.hypot(deltaX, deltaY);
    const direction = {
        x: deltaX / (speed || 1),
        y: deltaY / (speed || 1)
    };

    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            if (!node.visible) {
                return;
            }

            const dx = pointerX - node.body.position.x;
            const dy = pointerY - node.body.position.y;
            const distance = Math.hypot(dx, dy);

            if (distance > state.options.windRadius) {
                return;
            }

            const falloff = 1 - distance / state.options.windRadius;
            Body.applyForce(node.body, node.body.position, {
                x: direction.x * state.options.windStrength * falloff,
                y: direction.y * state.options.windStrength * falloff * 0.7
            });
        });
    });
}

function updateAutoWind() {
    if (!state.options.autoWindEnabled) {
        state.autoWind.active = false;
        return;
    }

    if (!state.autoWind.active && Math.random() < state.options.autoWindFrequency) {
        state.autoWind.active = true;
        state.autoWind.phase = 0;
        state.autoWind.amplitude = state.options.autoWindStrength * (0.7 + Math.random() * 0.9);
        state.autoWind.directionX = Math.random() > 0.5 ? 1 : -1;
        state.autoWind.centerY = CONFIG.layout.topPadding + Math.random() * Math.max(120, state.height - CONFIG.layout.topPadding - 120);
        state.autoWind.band = 120 + Math.random() * 220;
    }

    if (!state.autoWind.active) {
        return;
    }

    state.autoWind.phase += 0.08;
    const pulse = Math.sin(state.autoWind.phase) * 0.5 + 0.5;

    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            if (!node.visible) {
                return;
            }

            const distanceY = Math.abs(node.body.position.y - state.autoWind.centerY);
            if (distanceY > state.autoWind.band) {
                return;
            }

            const falloff = 1 - distanceY / state.autoWind.band;
            Body.applyForce(node.body, node.body.position, {
                x: state.autoWind.directionX * state.autoWind.amplitude * pulse * falloff,
                y: 0
            });
        });
    });

    if (state.autoWind.phase >= Math.PI) {
        state.autoWind.active = false;
    }
}

function ensureHandBody() {
    if (state.handBody) {
        return;
    }

    state.handBody = Bodies.circle(state.pointer.x, state.pointer.y, CONFIG.body.handRadius, {
        isStatic: true,
        collisionFilter: {
            category: 0x0004,
            mask: 0x0002
        },
        render: { visible: false }
    });
    Composite.add(engine.world, state.handBody);
}

function removeHandBody() {
    if (!state.handBody) {
        return;
    }

    Composite.remove(engine.world, state.handBody, true);
    state.handBody = null;
}

function render() {
    threadCtx.clearRect(0, 0, state.width, state.height);

    state.strands.forEach((strand) => {
        const visibleNodes = strand.nodes.filter((node) => node.visible);
        const firstVisible = visibleNodes[0];

        if (!firstVisible) {
            return;
        }

        drawConnector(
            strand.anchor.x,
            strand.anchor.y,
            firstVisible.body.position.x,
            firstVisible.body.position.y - strand.fontSize * CONFIG.render.connectorInsetRatio
        );

        for (let index = 0; index < visibleNodes.length - 1; index += 1) {
            const current = visibleNodes[index];
            const next = visibleNodes[index + 1];
            drawConnector(
                current.body.position.x,
                current.body.position.y + strand.fontSize * CONFIG.render.connectorInsetRatio,
                next.body.position.x,
                next.body.position.y - strand.fontSize * CONFIG.render.connectorInsetRatio
            );
        }

        visibleNodes.forEach((node) => {
            node.element.style.transform = `translate(${node.body.position.x}px, ${node.body.position.y}px) translate(-50%, -50%) rotate(${node.body.angle}rad)`;
        });
    });
}

function applyUpright() {
    if (!state.options.uprightEnabled) {
        return;
    }

    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            if (!node.visible) {
                return;
            }

            Body.setAngularVelocity(
                node.body,
                node.body.angularVelocity * CONFIG.body.uprightAngularDamping
            );
            Body.setAngle(
                node.body,
                node.body.angle * (1 - CONFIG.body.uprightStiffness)
            );
        });
    });
}

function getStagePoint(event) {
    const rect = stage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    return { x, y, inside };
}

function setPointerMode(mode) {
    state.pointer.mode = mode;
    stage.classList.toggle("is-left-down", mode === "left");
    stage.classList.toggle("is-right-down", mode === "right");
}

function clearPointerMode() {
    setPointerMode(null);
    removeHandBody();
}

function applyControls() {
    state.options.textMode = textModeInput.value === "text" ? "text" : "poetry";
    state.options.maxCharsPerStrand = clampMaxChars(Number(maxCharsPerStrandInput.value));
    state.options.fontSize = clampFontSize(Number(fontSizeInput.value));
    state.options.charGap = Number(charGapInput.value);
    state.options.columnGap = Number(columnGapInput.value);
    state.options.groupGap = Number(groupGapInput.value);
    state.options.windRadius = Number(windRadiusInput.value);
    state.options.windStrength = Number(windStrengthInput.value);
    state.options.autoWindEnabled = autoWindEnabledInput.checked;
    state.options.autoWindStrength = Number(autoWindStrengthInput.value);
    state.options.autoWindFrequency = Number(autoWindFrequencyInput.value);
    state.options.collisionEnabled = collisionEnabledInput.checked;
    state.options.uprightEnabled = uprightEnabledInput.checked;
    state.options.backgroundColor = backgroundColorInput.value;
    state.options.textColor = textColorInput.value;
    maxCharsPerStrandInput.value = String(state.options.maxCharsPerStrand);
    fontSizeInput.value = String(state.options.fontSize);
    autoWindStrengthInput.value = String(state.options.autoWindStrength);
    autoWindFrequencyInput.value = String(state.options.autoWindFrequency);
    updateLetterStyles();
    buildCurtain();
}

function resetControls() {
    textInput.value = defaultText;
    textModeInput.value = CONFIG.defaults.textMode;
    maxCharsPerStrandInput.value = String(CONFIG.defaults.maxCharsPerStrand);
    fontSizeInput.value = String(CONFIG.defaults.fontSize);
    charGapInput.value = String(CONFIG.defaults.charGap);
    columnGapInput.value = String(CONFIG.defaults.columnGap);
    groupGapInput.value = String(CONFIG.defaults.groupGap);
    windRadiusInput.value = String(CONFIG.defaults.windRadius);
    windStrengthInput.value = String(CONFIG.defaults.windStrength);
    autoWindEnabledInput.checked = CONFIG.defaults.autoWindEnabled;
    autoWindStrengthInput.value = String(CONFIG.defaults.autoWindStrength);
    autoWindFrequencyInput.value = String(CONFIG.defaults.autoWindFrequency);
    collisionEnabledInput.checked = CONFIG.defaults.collisionEnabled;
    uprightEnabledInput.checked = CONFIG.defaults.uprightEnabled;
    backgroundColorInput.value = CONFIG.defaults.backgroundColor;
    textColorInput.value = CONFIG.defaults.textColor;
    applyControls();
}

stage.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

stage.addEventListener("pointerdown", (event) => {
    const point = getStagePoint(event);

    if (!point.inside) {
        return;
    }

    state.pointer.x = point.x;
    state.pointer.y = point.y;
    state.pointer.prevX = point.x;
    state.pointer.prevY = point.y;
    state.pointer.inside = true;

    if (event.button === 0) {
        ensureHandBody();
        Body.setPosition(state.handBody, point);
        setPointerMode("left");
    }

    if (event.button === 2) {
        setPointerMode("right");
    }
});

stage.addEventListener("pointermove", (event) => {
    const point = getStagePoint(event);
    const deltaX = point.x - state.pointer.prevX;
    const deltaY = point.y - state.pointer.prevY;

    state.pointer.x = point.x;
    state.pointer.y = point.y;
    state.pointer.inside = point.inside;

    if (!point.inside) {
        clearPointerMode();
        state.pointer.prevX = point.x;
        state.pointer.prevY = point.y;
        return;
    }

    if (state.pointer.mode === "left") {
        ensureHandBody();
        Body.setPosition(state.handBody, point);
    }

    if (state.pointer.mode === "right") {
        applyWind(point.x, point.y, deltaX, deltaY);
    }

    state.pointer.prevX = point.x;
    state.pointer.prevY = point.y;
});

stage.addEventListener("pointerleave", () => {
    state.pointer.inside = false;
    clearPointerMode();
});

window.addEventListener("pointerup", () => {
    clearPointerMode();
});

fileInput.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) {
        return;
    }

    textInput.value = await file.text();
    applyControls();
});

applyButton.addEventListener("click", applyControls);
resetButton.addEventListener("click", resetControls);
backgroundColorInput.addEventListener("input", applyControls);
textColorInput.addEventListener("input", applyControls);
window.addEventListener("resize", buildCurtain);

Runner.run(runner, engine);

(function loop() {
    applyUpright();
    updateAutoWind();
    render();
    requestAnimationFrame(loop);
}());

applyControls();
