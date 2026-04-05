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
        groundHeight: 620,
        windRadius: 180,
        windStrength: 0.0024,
        autoWindEnabled: false,
        autoWindStrength: 0.0009,
        autoWindFrequency: 0.01,
        cutRadius: 34,
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
        frictionAir: 0.01,
        restitution: 0.1,
        collisionPadding: 0.34,
        handRadius: 54,
        dragStiffness: 0.18,
        dragDamping: 0.12,
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
        connectorWidth: 1.6,
        pinMarkerColor: "rgba(17, 17, 17, 0.7)",
        pinMarkerLineWidth: 1.5,
        pinMarkerPadding: 5
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
const groundHeightInput = document.getElementById("ground-height");
const groundHeightNumberInput = document.getElementById("ground-height-number");
const windRadiusInput = document.getElementById("wind-radius");
const windStrengthInput = document.getElementById("wind-strength");
const autoWindEnabledInput = document.getElementById("auto-wind-enabled");
const autoWindStrengthInput = document.getElementById("auto-wind-strength");
const autoWindFrequencyInput = document.getElementById("auto-wind-frequency");
const cutRadiusInput = document.getElementById("cut-radius");
const collisionEnabledInput = document.getElementById("collision-enabled");
const uprightEnabledInput = document.getElementById("upright-enabled");
const backgroundColorInput = document.getElementById("background-color");
const textColorInput = document.getElementById("text-color");
const key4ModeInput = document.getElementById("key4-mode");
const keyBindTargetInput = document.getElementById("key-bind-target");
const keyModeField = document.getElementById("key-mode-field");
const key4WindSettings = document.getElementById("key4-wind-settings");
const key4CutSettings = document.getElementById("key4-cut-settings");
const key4PhysicsSettings = document.getElementById("key4-physics-settings");
const key4WindRadiusInput = document.getElementById("key4-wind-radius");
const key4WindStrengthInput = document.getElementById("key4-wind-strength");
const key4CutRadiusInput = document.getElementById("key4-cut-radius");
const key4GravityYInput = document.getElementById("key4-gravity-y");
const key4BodyDensityInput = document.getElementById("key4-body-density");
const key4BodyFrictionAirInput = document.getElementById("key4-body-friction-air");
const key4BodyRestitutionInput = document.getElementById("key4-body-restitution");
const key4BodyCollisionPaddingInput = document.getElementById("key4-body-collision-padding");
const key4BodyHandRadiusInput = document.getElementById("key4-body-hand-radius");
const key4BodyDragStiffnessInput = document.getElementById("key4-body-drag-stiffness");
const key4BodyDragDampingInput = document.getElementById("key4-body-drag-damping");
const key4BodyUprightStiffnessInput = document.getElementById("key4-body-upright-stiffness");
const key4BodyUprightAngularDampingInput = document.getElementById("key4-body-upright-angular-damping");
const applyButton = document.getElementById("apply-button");
const resetButton = document.getElementById("reset-button");
const digitShortcuts = document.querySelector(".digit-shortcuts");
const layout = document.querySelector(".layout");
const panelToggle = document.getElementById("panel-toggle");
const stagePanelToggle = document.getElementById("stage-panel-toggle");
const stage = document.querySelector(".stage-wrap");
const modeIndicator = document.getElementById("mode-indicator");
const modeMenu = document.getElementById("mode-menu");
const dragMenu = document.getElementById("drag-menu");
const threadCanvas = document.getElementById("thread-canvas");
const letterLayer = document.getElementById("letter-layer");
const threadCtx = threadCanvas.getContext("2d");
const KEY_CONFIG_STORAGE_KEY = "curtain-physics-digit-key-configs-v1";

const engine = Engine.create({
    gravity: { x: 0, y: 2 }
});
const runner = Runner.create();

const state = {
    dpr: window.devicePixelRatio || 1,
    width: 0,
    height: 0,
    strands: [],
    extraLinks: [],
    letters: [],
    anchors: [],
    handBody: null,
    dragConstraint: null,
    pinConstraints: [],
    groundBody: null,
    pendingLinkSourceBody: null,
    dragMenuTargetBody: null,
    dragMenuAnchor: { x: 0, y: 0 },
    pointer: {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        leftActive: false,
        toolMode: "hand",
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
groundHeightInput.value = String(CONFIG.defaults.groundHeight);
groundHeightNumberInput.value = String(CONFIG.defaults.groundHeight);
windRadiusInput.value = String(CONFIG.defaults.windRadius);
windStrengthInput.value = String(CONFIG.defaults.windStrength);
autoWindEnabledInput.checked = CONFIG.defaults.autoWindEnabled;
autoWindStrengthInput.value = String(CONFIG.defaults.autoWindStrength);
autoWindFrequencyInput.value = String(CONFIG.defaults.autoWindFrequency);
cutRadiusInput.value = String(CONFIG.defaults.cutRadius);
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
    const groundHeightMax = Math.max(4000, Math.floor(state.height * 3));
    groundHeightInput.max = String(groundHeightMax);
    groundHeightNumberInput.max = String(groundHeightMax);
    groundHeightInput.min = "0";
    groundHeightNumberInput.min = "0";
}

function clearWorld() {
    state.extraLinks.forEach((link) => {
        Composite.remove(engine.world, link.constraint, true);
    });
    state.extraLinks = [];
    state.pendingLinkSourceBody = null;

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

    if (state.dragConstraint) {
        Composite.remove(engine.world, state.dragConstraint, true);
        state.dragConstraint = null;
    }

    state.pinConstraints.forEach((constraint) => {
        Composite.remove(engine.world, constraint, true);
    });
    state.pinConstraints = [];

    if (state.groundBody) {
        Composite.remove(engine.world, state.groundBody, true);
        state.groundBody = null;
    }
}

function updateModeIndicator() {
    const labels = {
        hand: "当前模式：拖拽",
        wind: "当前模式：风场",
        cut: "当前模式：切断"
    };
    if (modeIndicator) {
        modeIndicator.textContent = state.pendingLinkSourceBody
            ? "连线模式：请选择第二个字"
            : labels[state.pointer.toolMode];
    }
    stage.classList.toggle("is-cut-mode", state.pointer.toolMode === "cut");
}

function openMenu(menuElement, pointX, pointY) {
    closeMenus();
    menuElement.hidden = false;
    menuElement.style.left = `${Math.min(pointX, Math.max(20, state.width - 180))}px`;
    menuElement.style.top = `${Math.min(pointY, Math.max(20, state.height - 160))}px`;
}

function closeModeMenu() {
    modeMenu.hidden = true;
}

function closeDragMenu() {
    dragMenu.hidden = true;
    state.dragMenuTargetBody = null;
}

function closeMenus() {
    closeModeMenu();
    closeDragMenu();
}

function getDragPinButton() {
    return dragMenu.querySelector("button[data-drag-action='pin'], button[data-drag-action='unpin']");
}

function isBodyPinned(body) {
    return Boolean(body && state.pinConstraints.some((constraint) => constraint.bodyB === body));
}

function getPinConstraintByBody(body) {
    if (!body) {
        return null;
    }
    return state.pinConstraints.find((constraint) => constraint.bodyB === body) || null;
}

function refreshDragMenu(targetBody) {
    const pinButton = getDragPinButton();
    if (!pinButton) {
        return;
    }

    if (isBodyPinned(targetBody)) {
        pinButton.dataset.dragAction = "unpin";
        pinButton.textContent = "解除钉住";
        return;
    }

    pinButton.dataset.dragAction = "pin";
    pinButton.textContent = "钉住";
}

function handleMenuAction(action, fromDragMenu) {
    if (fromDragMenu) {
        const targetBody = (state.dragConstraint && state.dragConstraint.bodyB) || state.dragMenuTargetBody;
        const anchor = state.dragConstraint
            ? { x: state.dragConstraint.pointA.x, y: state.dragConstraint.pointA.y }
            : state.dragMenuAnchor;

        if (action === "pin") {
            pinCurrentDrag(targetBody, anchor);
        }
        if (action === "unpin") {
            unpinCurrentDrag(targetBody);
        }
        if (action === "connect" && targetBody) {
            state.pendingLinkSourceBody = targetBody;
            pinCurrentDrag(targetBody, anchor);
            updateModeIndicator();
        }
        closeMenus();
        return;
    }

    state.pointer.toolMode = action;
    updateModeIndicator();
    closeMenus();
}

function getOpenMenuElement() {
    if (!dragMenu.hidden) {
        return dragMenu;
    }
    if (!modeMenu.hidden) {
        return modeMenu;
    }
    return null;
}

function setPanelCollapsed(collapsed) {
    layout.classList.toggle("is-panel-collapsed", collapsed);
    panelToggle.textContent = collapsed ? "展开" : "收起";
    panelToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    stagePanelToggle.textContent = collapsed ? "展开面板" : "收起面板";
    stagePanelToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
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

function drawPinMarker(body, radius) {
    threadCtx.beginPath();
    threadCtx.strokeStyle = CONFIG.render.pinMarkerColor;
    threadCtx.lineWidth = CONFIG.render.pinMarkerLineWidth;
    threadCtx.arc(body.position.x, body.position.y, radius, 0, Math.PI * 2);
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
            mask: state.options.collisionEnabled ? (0x0002 | 0x0004 | 0x0008) : (0x0004 | 0x0008)
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

function createGround() {
    const groundHeightMax = Math.max(4000, state.height * 3);
    const groundY = Math.max(0, Math.min(groundHeightMax, state.options.groundHeight));
    state.groundBody = Bodies.rectangle(
        state.width / 2,
        groundY + 18,
        state.width + 200,
        36,
        {
            isStatic: true,
            friction: 0.8,
            restitution: 0,
            collisionFilter: {
                category: 0x0008,
                mask: 0x0002
            },
            render: { visible: false }
        }
    );
    Composite.add(engine.world, state.groundBody);
}

function buildCurtain() {
    clearWorld();
    resizeStage();
    createGround();

    const groups = parseText(textInput.value || defaultText);
    const fontSize = clampFontSize(state.options.fontSize);

    let x = state.width - CONFIG.layout.rightPadding;

    groups.forEach((group, groupIndex) => {
        group.forEach((strandText) => {
            const chars = Array.from(strandText);
            const composite = Composite.create();
            const nodes = [];
            const constraints = [];
            const visibleLinks = [];
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
                node.linkConstraint = constraint;
                nodes.push(node);
                constraints.push(constraint);
                visibleLinks.push({
                    constraint,
                    node
                });
                Composite.add(composite, [node.body, constraint]);
                previousBody = node.body;
            });

            Composite.add(engine.world, composite);
            state.strands.push({
                composite,
                nodes,
                constraints,
                visibleLinks,
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

function releaseDragConstraint() {
    if (!state.dragConstraint) {
        return;
    }

    Composite.remove(engine.world, state.dragConstraint, true);
    state.dragConstraint = null;
}

function removeHandBody() {
    if (!state.handBody) {
        return;
    }

    Composite.remove(engine.world, state.handBody, true);
    state.handBody = null;
}

function clearPointerState() {
    state.pointer.leftActive = false;
    stage.classList.remove("is-left-down");
    stage.classList.remove("is-right-down");
    releaseDragConstraint();
    removeHandBody();
}

function getVisibleLinkSegment(strand, visibleIndex) {
    const node = strand.visibleLinks[visibleIndex].node;
    if (visibleIndex === 0) {
        return {
            startX: strand.anchor.x,
            startY: strand.anchor.y,
            endX: node.body.position.x,
            endY: node.body.position.y - strand.fontSize * CONFIG.render.connectorInsetRatio
        };
    }

    const previousNode = strand.visibleLinks[visibleIndex - 1].node;
    return {
        startX: previousNode.body.position.x,
        startY: previousNode.body.position.y + strand.fontSize * CONFIG.render.connectorInsetRatio,
        endX: node.body.position.x,
        endY: node.body.position.y - strand.fontSize * CONFIG.render.connectorInsetRatio
    };
}

function distanceToSegment(pointX, pointY, startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;

    if (dx === 0 && dy === 0) {
        return Math.hypot(pointX - startX, pointY - startY);
    }

    const t = Math.max(0, Math.min(1, ((pointX - startX) * dx + (pointY - startY) * dy) / (dx * dx + dy * dy)));
    const projectionX = startX + t * dx;
    const projectionY = startY + t * dy;
    return Math.hypot(pointX - projectionX, pointY - projectionY);
}

function cutLinks(pointerX, pointerY) {
    const cutThreshold = state.options.cutRadius;

    state.strands.forEach((strand) => {
        strand.visibleLinks.forEach((link, index) => {
            if (!link.constraint) {
                return;
            }

            const segment = getVisibleLinkSegment(strand, index);
            const distance = distanceToSegment(
                pointerX,
                pointerY,
                segment.startX,
                segment.startY,
                segment.endX,
                segment.endY
            );

            if (distance > cutThreshold) {
                return;
            }

            Composite.remove(strand.composite, link.constraint, true);
            link.constraint = null;
            link.node.linkConstraint = null;
        });
    });

    state.extraLinks = state.extraLinks.filter((link) => {
        const distance = distanceToSegment(
            pointerX,
            pointerY,
            link.bodyA.position.x,
            link.bodyA.position.y,
            link.bodyB.position.x,
            link.bodyB.position.y
        );

        if (distance > cutThreshold) {
            return true;
        }

        Composite.remove(engine.world, link.constraint, true);
        return false;
    });
}

function maybeStartDrag(pointerX, pointerY) {
    if (state.pointer.toolMode !== "hand") {
        return;
    }

    const targetNode = findClosestVisibleNode(pointerX, pointerY, CONFIG.body.handRadius * 1.4);

    if (!targetNode) {
        return;
    }

    state.dragConstraint = Constraint.create({
        pointA: { x: pointerX, y: pointerY },
        bodyB: targetNode.body,
        length: 0,
        stiffness: CONFIG.body.dragStiffness,
        damping: CONFIG.body.dragDamping,
        render: { visible: false }
    });
    Composite.add(engine.world, state.dragConstraint);
}

function updateDragAnchor(pointerX, pointerY) {
    if (!state.dragConstraint) {
        return;
    }

    state.dragConstraint.pointA.x = pointerX;
    state.dragConstraint.pointA.y = pointerY;
}

function findClosestVisibleNode(pointerX, pointerY, maxDistance, excludeBody = null) {
    let targetNode = null;
    let closestDistance = maxDistance;

    state.strands.forEach((strand) => {
        strand.nodes.forEach((node) => {
            if (!node.visible) {
                return;
            }
            if (excludeBody && node.body === excludeBody) {
                return;
            }

            const distance = Math.hypot(
                node.body.position.x - pointerX,
                node.body.position.y - pointerY
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                targetNode = node;
            }
        });
    });

    return targetNode;
}

function pinCurrentDrag(sourceBody, sourceAnchor) {
    const body = sourceBody || (state.dragConstraint && state.dragConstraint.bodyB);
    if (!body) {
        return;
    }

    const anchor = sourceAnchor || (
        state.dragConstraint
            ? { x: state.dragConstraint.pointA.x, y: state.dragConstraint.pointA.y }
            : { x: state.pointer.x, y: state.pointer.y }
    );

    releaseDragConstraint();
    const existing = getPinConstraintByBody(body);
    if (existing) {
        Composite.remove(engine.world, existing, true);
        state.pinConstraints = state.pinConstraints.filter((constraint) => constraint !== existing);
    }
    const pinConstraint = Constraint.create({
        pointA: { x: anchor.x, y: anchor.y },
        bodyB: body,
        length: 0,
        stiffness: CONFIG.body.dragStiffness,
        damping: CONFIG.body.dragDamping,
        render: { visible: false }
    });
    Composite.add(engine.world, pinConstraint);
    state.pinConstraints.push(pinConstraint);
    state.pointer.leftActive = false;
    stage.classList.remove("is-left-down");
    removeHandBody();
}

function unpinCurrentDrag(targetBody) {
    if (state.pinConstraints.length === 0) {
        return;
    }

    if (!targetBody) {
        state.pinConstraints.forEach((constraint) => {
            Composite.remove(engine.world, constraint, true);
        });
        state.pinConstraints = [];
        return;
    }

    const targetConstraint = getPinConstraintByBody(targetBody);
    if (!targetConstraint) {
        return;
    }

    Composite.remove(engine.world, targetConstraint, true);
    state.pinConstraints = state.pinConstraints.filter((constraint) => constraint !== targetConstraint);
}

function createExtraLink(bodyA, bodyB) {
    const distance = Math.hypot(
        bodyA.position.x - bodyB.position.x,
        bodyA.position.y - bodyB.position.y
    );
    const constraint = Constraint.create({
        bodyA,
        bodyB,
        length: distance,
        stiffness: 0.38,
        damping: 0.08,
        render: { visible: false }
    });
    Composite.add(engine.world, constraint);
    state.extraLinks.push({ constraint, bodyA, bodyB });
}

function render() {
    threadCtx.clearRect(0, 0, state.width, state.height);

    if (state.groundBody) {
        const groundY = state.groundBody.position.y - 18;
        drawConnector(0, groundY, state.width, groundY);
    }

    state.strands.forEach((strand) => {
        if (strand.visibleLinks.length === 0) {
            return;
        }

        strand.visibleLinks.forEach((link, index) => {
            if (!link.constraint) {
                return;
            }

            const segment = getVisibleLinkSegment(strand, index);
            drawConnector(segment.startX, segment.startY, segment.endX, segment.endY);
        });

        strand.visibleLinks.forEach((link) => {
            const node = link.node;
            node.element.style.transform = `translate(${node.body.position.x}px, ${node.body.position.y}px) translate(-50%, -50%) rotate(${node.body.angle}rad)`;
        });
    });

    state.extraLinks.forEach((link) => {
        drawConnector(
            link.bodyA.position.x,
            link.bodyA.position.y,
            link.bodyB.position.x,
            link.bodyB.position.y
        );
    });

    state.pinConstraints.forEach((constraint) => {
        if (!constraint.bodyB) {
            return;
        }
        const pinBody = constraint.bodyB;
        const pinRadius = pinBody.circleRadius
            ? pinBody.circleRadius + CONFIG.render.pinMarkerPadding
            : state.options.fontSize * 0.5 + CONFIG.render.pinMarkerPadding;
        drawPinMarker(pinBody, pinRadius);
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

function isEditableTarget(target) {
    return target instanceof Element
        && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function clampValue(value, min, max, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(min, Math.min(max, parsed));
}

function toFiniteNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function readKey4BodyConfigFromInputs() {
    return {
        gravityY: toFiniteNumber(key4GravityYInput.value, engine.gravity.y),
        density: toFiniteNumber(key4BodyDensityInput.value, CONFIG.body.density),
        frictionAir: toFiniteNumber(key4BodyFrictionAirInput.value, CONFIG.body.frictionAir),
        restitution: toFiniteNumber(key4BodyRestitutionInput.value, CONFIG.body.restitution),
        collisionPadding: toFiniteNumber(key4BodyCollisionPaddingInput.value, CONFIG.body.collisionPadding),
        handRadius: toFiniteNumber(key4BodyHandRadiusInput.value, CONFIG.body.handRadius),
        dragStiffness: toFiniteNumber(key4BodyDragStiffnessInput.value, CONFIG.body.dragStiffness),
        dragDamping: toFiniteNumber(key4BodyDragDampingInput.value, CONFIG.body.dragDamping),
        uprightStiffness: toFiniteNumber(key4BodyUprightStiffnessInput.value, CONFIG.body.uprightStiffness),
        uprightAngularDamping: toFiniteNumber(key4BodyUprightAngularDampingInput.value, CONFIG.body.uprightAngularDamping)
    };
}

function writeKey4BodyConfigToInputs(bodyConfig) {
    key4GravityYInput.value = String(bodyConfig.gravityY);
    key4BodyDensityInput.value = String(bodyConfig.density);
    key4BodyFrictionAirInput.value = String(bodyConfig.frictionAir);
    key4BodyRestitutionInput.value = String(bodyConfig.restitution);
    key4BodyCollisionPaddingInput.value = String(bodyConfig.collisionPadding);
    key4BodyHandRadiusInput.value = String(bodyConfig.handRadius);
    key4BodyDragStiffnessInput.value = String(bodyConfig.dragStiffness);
    key4BodyDragDampingInput.value = String(bodyConfig.dragDamping);
    key4BodyUprightStiffnessInput.value = String(bodyConfig.uprightStiffness);
    key4BodyUprightAngularDampingInput.value = String(bodyConfig.uprightAngularDamping);
}

function getDefaultDigitConfig() {
    return {
        mode: "hand",
        windRadius: CONFIG.defaults.windRadius,
        windStrength: CONFIG.defaults.windStrength,
        cutRadius: CONFIG.defaults.cutRadius,
        body: {
            gravityY: engine.gravity.y,
            density: CONFIG.body.density,
            frictionAir: CONFIG.body.frictionAir,
            restitution: CONFIG.body.restitution,
            collisionPadding: CONFIG.body.collisionPadding,
            handRadius: CONFIG.body.handRadius,
            dragStiffness: CONFIG.body.dragStiffness,
            dragDamping: CONFIG.body.dragDamping,
            uprightStiffness: CONFIG.body.uprightStiffness,
            uprightAngularDamping: CONFIG.body.uprightAngularDamping
        }
    };
}

function sanitizeDigitConfig(rawConfig) {
    const defaults = getDefaultDigitConfig();
    const config = rawConfig && typeof rawConfig === "object" ? rawConfig : {};
    const mode = config.mode === "wind" || config.mode === "cut" || config.mode === "physics"
        ? config.mode
        : "hand";
    return {
        mode,
        windRadius: clampValue(config.windRadius, 70, 520, defaults.windRadius),
        windStrength: clampValue(config.windStrength, 0.0002, 0.05, defaults.windStrength),
        cutRadius: clampValue(config.cutRadius, 8, 120, defaults.cutRadius),
        body: {
            gravityY: toFiniteNumber(config?.body?.gravityY, defaults.body.gravityY),
            density: toFiniteNumber(config?.body?.density, defaults.body.density),
            frictionAir: toFiniteNumber(config?.body?.frictionAir, defaults.body.frictionAir),
            restitution: toFiniteNumber(config?.body?.restitution, defaults.body.restitution),
            collisionPadding: toFiniteNumber(config?.body?.collisionPadding, defaults.body.collisionPadding),
            handRadius: toFiniteNumber(config?.body?.handRadius, defaults.body.handRadius),
            dragStiffness: toFiniteNumber(config?.body?.dragStiffness, defaults.body.dragStiffness),
            dragDamping: toFiniteNumber(config?.body?.dragDamping, defaults.body.dragDamping),
            uprightStiffness: toFiniteNumber(config?.body?.uprightStiffness, defaults.body.uprightStiffness),
            uprightAngularDamping: toFiniteNumber(config?.body?.uprightAngularDamping, defaults.body.uprightAngularDamping)
        }
    };
}

function readAllDigitConfigs() {
    try {
        const raw = localStorage.getItem(KEY_CONFIG_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function writeAllDigitConfigs(configs) {
    localStorage.setItem(KEY_CONFIG_STORAGE_KEY, JSON.stringify(configs));
}

function readDigitConfig(digit) {
    const allConfigs = readAllDigitConfigs();
    return sanitizeDigitConfig(allConfigs[digit]);
}

function writeDigitConfig(digit, config) {
    const allConfigs = readAllDigitConfigs();
    allConfigs[digit] = sanitizeDigitConfig(config);
    writeAllDigitConfigs(allConfigs);
}

function setKey4ModeFields(mode) {
    key4WindSettings.hidden = mode !== "wind";
    key4CutSettings.hidden = mode !== "cut";
    key4PhysicsSettings.hidden = mode !== "physics";
}

function refreshDigitTargetUi() {
    const isFixedDefault = keyBindTargetInput.value === "1";
    if (keyModeField) {
        keyModeField.hidden = isFixedDefault;
    }
    if (isFixedDefault) {
        key4WindSettings.hidden = true;
        key4CutSettings.hidden = true;
        key4PhysicsSettings.hidden = true;
        return;
    }
    setKey4ModeFields(key4ModeInput.value);
}

function loadKey4ConfigToControls() {
    const config = readDigitConfig(keyBindTargetInput.value);
    key4ModeInput.value = config.mode;
    key4WindRadiusInput.value = String(config.windRadius);
    key4WindStrengthInput.value = String(config.windStrength);
    key4CutRadiusInput.value = String(config.cutRadius);
    writeKey4BodyConfigToInputs(config.body);
    refreshDigitTargetUi();
}

function saveKey4ConfigFromControls() {
    const config = {
        mode: key4ModeInput.value === "wind" || key4ModeInput.value === "cut" || key4ModeInput.value === "physics"
            ? key4ModeInput.value
            : "hand",
        windRadius: clampValue(key4WindRadiusInput.value, 70, 520, CONFIG.defaults.windRadius),
        windStrength: clampValue(key4WindStrengthInput.value, 0.0002, 0.05, CONFIG.defaults.windStrength),
        cutRadius: clampValue(key4CutRadiusInput.value, 8, 120, CONFIG.defaults.cutRadius),
        body: readKey4BodyConfigFromInputs()
    };

    key4WindRadiusInput.value = String(config.windRadius);
    key4WindStrengthInput.value = String(config.windStrength);
    key4CutRadiusInput.value = String(config.cutRadius);
    writeKey4BodyConfigToInputs(config.body);
    writeDigitConfig(keyBindTargetInput.value, config);
}

function applyKey4ConfigAction(digit) {
    if (digit === "1") {
        windRadiusInput.value = String(CONFIG.defaults.windRadius);
        windStrengthInput.value = String(CONFIG.defaults.windStrength);
        cutRadiusInput.value = String(CONFIG.defaults.cutRadius);
        state.options.windRadius = CONFIG.defaults.windRadius;
        state.options.windStrength = CONFIG.defaults.windStrength;
        state.options.cutRadius = CONFIG.defaults.cutRadius;

        CONFIG.body.density = 0.0025;
        CONFIG.body.frictionAir = 0.01;
        CONFIG.body.restitution = 0.1;
        CONFIG.body.collisionPadding = 0.34;
        CONFIG.body.handRadius = 54;
        CONFIG.body.dragStiffness = 0.18;
        CONFIG.body.dragDamping = 0.12;
        CONFIG.body.uprightStiffness = 0.08;
        CONFIG.body.uprightAngularDamping = 0.84;
        engine.gravity.y = 2;
        writeKey4BodyConfigToInputs({
            gravityY: engine.gravity.y,
            density: CONFIG.body.density,
            frictionAir: CONFIG.body.frictionAir,
            restitution: CONFIG.body.restitution,
            collisionPadding: CONFIG.body.collisionPadding,
            handRadius: CONFIG.body.handRadius,
            dragStiffness: CONFIG.body.dragStiffness,
            dragDamping: CONFIG.body.dragDamping,
            uprightStiffness: CONFIG.body.uprightStiffness,
            uprightAngularDamping: CONFIG.body.uprightAngularDamping
        });

        state.strands.forEach((strand) => {
            strand.nodes.forEach((node) => {
                if (!node.body) {
                    return;
                }
                Body.setDensity(node.body, CONFIG.body.density);
                node.body.frictionAir = CONFIG.body.frictionAir;
                node.body.restitution = CONFIG.body.restitution;
                const targetRadius = strand.fontSize * CONFIG.body.collisionPadding;
                if (node.radius && targetRadius > 0) {
                    const scale = targetRadius / node.radius;
                    if (scale > 0) {
                        Body.scale(node.body, scale, scale);
                        node.radius = targetRadius;
                    }
                }
            });
        });

        if (state.dragConstraint) {
            state.dragConstraint.stiffness = CONFIG.body.dragStiffness;
            state.dragConstraint.damping = CONFIG.body.dragDamping;
        }
        state.pinConstraints.forEach((constraint) => {
            constraint.stiffness = CONFIG.body.dragStiffness;
            constraint.damping = CONFIG.body.dragDamping;
        });
        removeHandBody();
        updateModeIndicator();
        closeMenus();
        return;
    }

    const config = readDigitConfig(digit);

    if (config.mode === "hand" || config.mode === "wind" || config.mode === "cut") {
        state.pointer.toolMode = config.mode;
    }

    if (config.mode === "wind") {
        windRadiusInput.value = String(config.windRadius);
        windStrengthInput.value = String(config.windStrength);
        state.options.windRadius = clampValue(config.windRadius, 70, 520, CONFIG.defaults.windRadius);
        state.options.windStrength = clampValue(config.windStrength, 0.0002, 0.05, CONFIG.defaults.windStrength);
    } else if (config.mode === "cut") {
        cutRadiusInput.value = String(config.cutRadius);
        state.options.cutRadius = clampValue(config.cutRadius, 8, 120, CONFIG.defaults.cutRadius);
    } else if (config.mode === "physics") {
        const bodyConfig = config.body;
        CONFIG.body.density = bodyConfig.density;
        CONFIG.body.frictionAir = bodyConfig.frictionAir;
        CONFIG.body.restitution = bodyConfig.restitution;
        CONFIG.body.collisionPadding = bodyConfig.collisionPadding;
        CONFIG.body.handRadius = bodyConfig.handRadius;
        CONFIG.body.dragStiffness = bodyConfig.dragStiffness;
        CONFIG.body.dragDamping = bodyConfig.dragDamping;
        CONFIG.body.uprightStiffness = bodyConfig.uprightStiffness;
        CONFIG.body.uprightAngularDamping = bodyConfig.uprightAngularDamping;
        engine.gravity.y = bodyConfig.gravityY;

        state.strands.forEach((strand) => {
            strand.nodes.forEach((node) => {
                if (!node.body) {
                    return;
                }
                Body.setDensity(node.body, CONFIG.body.density);
                node.body.frictionAir = CONFIG.body.frictionAir;
                node.body.restitution = CONFIG.body.restitution;
                const targetRadius = strand.fontSize * CONFIG.body.collisionPadding;
                if (node.radius && targetRadius > 0) {
                    const scale = targetRadius / node.radius;
                    if (scale > 0) {
                        Body.scale(node.body, scale, scale);
                        node.radius = targetRadius;
                    }
                }
            });
        });

        if (state.dragConstraint) {
            state.dragConstraint.stiffness = CONFIG.body.dragStiffness;
            state.dragConstraint.damping = CONFIG.body.dragDamping;
        }
        state.pinConstraints.forEach((constraint) => {
            constraint.stiffness = CONFIG.body.dragStiffness;
            constraint.damping = CONFIG.body.dragDamping;
        });
        removeHandBody();
    }

    updateLetterStyles();
    updateModeIndicator();
    closeMenus();
}

function applyControls() {
    state.options.textMode = textModeInput.value === "text" ? "text" : "poetry";
    state.options.maxCharsPerStrand = clampMaxChars(Number(maxCharsPerStrandInput.value));
    state.options.fontSize = clampFontSize(Number(fontSizeInput.value));
    state.options.charGap = Number(charGapInput.value);
    state.options.columnGap = Number(columnGapInput.value);
    state.options.groupGap = Number(groupGapInput.value);
    state.options.groundHeight = Math.max(
        0,
        Math.min(
            Number(groundHeightInput.max) || Number(groundHeightNumberInput.max) || 4000,
            Number(groundHeightNumberInput.value)
        )
    );
    state.options.windRadius = Number(windRadiusInput.value);
    state.options.windStrength = Number(windStrengthInput.value);
    state.options.autoWindEnabled = autoWindEnabledInput.checked;
    state.options.autoWindStrength = Number(autoWindStrengthInput.value);
    state.options.autoWindFrequency = Number(autoWindFrequencyInput.value);
    state.options.cutRadius = Number(cutRadiusInput.value);
    state.options.collisionEnabled = collisionEnabledInput.checked;
    state.options.uprightEnabled = uprightEnabledInput.checked;
    state.options.backgroundColor = backgroundColorInput.value;
    state.options.textColor = textColorInput.value;
    maxCharsPerStrandInput.value = String(state.options.maxCharsPerStrand);
    fontSizeInput.value = String(state.options.fontSize);
    groundHeightInput.value = String(state.options.groundHeight);
    groundHeightNumberInput.value = String(state.options.groundHeight);
    autoWindStrengthInput.value = String(state.options.autoWindStrength);
    autoWindFrequencyInput.value = String(state.options.autoWindFrequency);
    cutRadiusInput.value = String(state.options.cutRadius);
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
    groundHeightInput.value = String(CONFIG.defaults.groundHeight);
    groundHeightNumberInput.value = String(CONFIG.defaults.groundHeight);
    windRadiusInput.value = String(CONFIG.defaults.windRadius);
    windStrengthInput.value = String(CONFIG.defaults.windStrength);
    autoWindEnabledInput.checked = CONFIG.defaults.autoWindEnabled;
    autoWindStrengthInput.value = String(CONFIG.defaults.autoWindStrength);
    autoWindFrequencyInput.value = String(CONFIG.defaults.autoWindFrequency);
    cutRadiusInput.value = String(CONFIG.defaults.cutRadius);
    collisionEnabledInput.checked = CONFIG.defaults.collisionEnabled;
    uprightEnabledInput.checked = CONFIG.defaults.uprightEnabled;
    backgroundColorInput.value = CONFIG.defaults.backgroundColor;
    textColorInput.value = CONFIG.defaults.textColor;
    applyControls();
}

let applyScheduled = false;

function scheduleApplyControls() {
    if (applyScheduled) {
        return;
    }

    applyScheduled = true;
    requestAnimationFrame(() => {
        applyScheduled = false;
        applyControls();
    });
}

stage.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const point = getStagePoint(event);
    state.pointer.x = point.x;
    state.pointer.y = point.y;
    if (state.pointer.leftActive && state.pointer.toolMode === "hand" && state.dragConstraint) {
        state.dragMenuTargetBody = state.dragConstraint.bodyB;
        state.dragMenuAnchor.x = state.dragConstraint.pointA.x;
        state.dragMenuAnchor.y = state.dragConstraint.pointA.y;
        refreshDragMenu(state.dragMenuTargetBody);
        openMenu(dragMenu, point.x, point.y);
        return;
    }
    state.dragMenuTargetBody = null;
    openMenu(modeMenu, point.x, point.y);
});

stage.addEventListener("pointerdown", (event) => {
    const openedMenu = getOpenMenuElement();
    if (openedMenu) {
        const targetElement = event.target instanceof Element ? event.target : null;
        if (targetElement && openedMenu.contains(targetElement)) {
            return;
        }

        closeMenus();
    }

    const point = getStagePoint(event);

    if (!point.inside) {
        return;
    }

    state.pointer.x = point.x;
    state.pointer.y = point.y;
    state.pointer.prevX = point.x;
    state.pointer.prevY = point.y;
    state.pointer.inside = true;
    closeMenus();

    if (event.button === 0) {
        if (state.pendingLinkSourceBody) {
            const targetNode = findClosestVisibleNode(
                point.x,
                point.y,
                CONFIG.body.handRadius * 1.6,
                state.pendingLinkSourceBody
            );
            if (targetNode) {
                createExtraLink(state.pendingLinkSourceBody, targetNode.body);
                state.pendingLinkSourceBody = null;
                updateModeIndicator();
                return;
            }
        }

        state.pointer.leftActive = true;
        stage.classList.add("is-left-down");

        if (state.pointer.toolMode === "hand") {
            maybeStartDrag(point.x, point.y);
        }

        if (state.pointer.toolMode === "cut") {
            cutLinks(point.x, point.y);
        }
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
        clearPointerState();
        state.pointer.prevX = point.x;
        state.pointer.prevY = point.y;
        return;
    }

    if (state.pointer.leftActive && state.pointer.toolMode === "hand") {
        updateDragAnchor(point.x, point.y);
    }

    if (state.pointer.leftActive && state.pointer.toolMode === "wind") {
        applyWind(point.x, point.y, deltaX, deltaY);
    }

    if (state.pointer.leftActive && state.pointer.toolMode === "cut") {
        cutLinks(point.x, point.y);
    }

    state.pointer.prevX = point.x;
    state.pointer.prevY = point.y;
});

stage.addEventListener("pointerleave", () => {
    state.pointer.inside = false;
    clearPointerState();
    closeMenus();
});

window.addEventListener("pointerup", () => {
    clearPointerState();
});

window.addEventListener("pointerdown", (event) => {
    const openedMenu = getOpenMenuElement();
    if (!openedMenu) {
        return;
    }

    const targetElement = event.target instanceof Element ? event.target : null;
    if (targetElement && stage.contains(targetElement)) {
        return;
    }

    closeMenus();
}, true);

window.addEventListener("keydown", (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
    }

    const key = event.key;
    const editable = isEditableTarget(event.target);
    if (editable) {
        return;
    }

    if (key === "1" || key === "2" || key === "3" || key === "4" || key === "5" || key === "6" || key === "7" || key === "8" || key === "9") {
        applyKey4ConfigAction(key);
        event.preventDefault();
    }
});

if (digitShortcuts) {
    digitShortcuts.addEventListener("click", (event) => {
        const target = event.target.closest("button[data-digit]");
        if (!target) {
            return;
        }

        const key = target.dataset.digit;
        if (key === "1" || key === "2" || key === "3" || key === "4" || key === "5" || key === "6" || key === "7" || key === "8" || key === "9") {
            applyKey4ConfigAction(key);
        }
    });
}

modeMenu.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
        return;
    }
    const target = event.target.closest("button[data-mode]");
    if (!target) {
        return;
    }
    handleMenuAction(target.dataset.mode, false);
    event.preventDefault();
    event.stopPropagation();
});

modeMenu.addEventListener("contextmenu", (event) => {
    const target = event.target.closest("button[data-mode]");
    if (!target) {
        return;
    }
    handleMenuAction(target.dataset.mode, false);
    event.preventDefault();
    event.stopPropagation();
});

dragMenu.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
        return;
    }
    const target = event.target.closest("button[data-drag-action]");
    if (!target) {
        return;
    }
    handleMenuAction(target.dataset.dragAction, true);
    event.preventDefault();
    event.stopPropagation();
});

dragMenu.addEventListener("contextmenu", (event) => {
    const target = event.target.closest("button[data-drag-action]");
    if (!target) {
        return;
    }
    handleMenuAction(target.dataset.dragAction, true);
    event.preventDefault();
    event.stopPropagation();
});

window.closeModeMenu = closeModeMenu;
window.closeDragMenu = closeDragMenu;

panelToggle.addEventListener("click", () => {
    const collapsed = !layout.classList.contains("is-panel-collapsed");
    setPanelCollapsed(collapsed);
    requestAnimationFrame(buildCurtain);
});

stagePanelToggle.addEventListener("click", () => {
    const collapsed = !layout.classList.contains("is-panel-collapsed");
    setPanelCollapsed(collapsed);
    requestAnimationFrame(buildCurtain);
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
key4ModeInput.addEventListener("change", () => {
    refreshDigitTargetUi();
    saveKey4ConfigFromControls();
});
keyBindTargetInput.addEventListener("change", loadKey4ConfigToControls);
[
    key4WindRadiusInput,
    key4WindStrengthInput,
    key4CutRadiusInput,
    key4GravityYInput,
    key4BodyDensityInput,
    key4BodyFrictionAirInput,
    key4BodyRestitutionInput,
    key4BodyCollisionPaddingInput,
    key4BodyHandRadiusInput,
    key4BodyDragStiffnessInput,
    key4BodyDragDampingInput,
    key4BodyUprightStiffnessInput,
    key4BodyUprightAngularDampingInput
].forEach((control) => {
    control.addEventListener("input", saveKey4ConfigFromControls);
    control.addEventListener("change", saveKey4ConfigFromControls);
});
groundHeightInput.addEventListener("input", () => {
    groundHeightNumberInput.value = groundHeightInput.value;
    scheduleApplyControls();
});
groundHeightNumberInput.addEventListener("input", () => {
    groundHeightInput.value = groundHeightNumberInput.value;
    scheduleApplyControls();
});
[
    textModeInput,
    maxCharsPerStrandInput,
    fontSizeInput,
    charGapInput,
    columnGapInput,
    groupGapInput,
    windRadiusInput,
    windStrengthInput,
    autoWindStrengthInput,
    autoWindFrequencyInput,
    cutRadiusInput,
    backgroundColorInput,
    textColorInput
].forEach((control) => {
    control.addEventListener("input", scheduleApplyControls);
});
[
    textModeInput,
    maxCharsPerStrandInput,
    groundHeightInput,
    groundHeightNumberInput,
    autoWindEnabledInput,
    collisionEnabledInput,
    uprightEnabledInput,
    backgroundColorInput,
    textColorInput
].forEach((control) => {
    control.addEventListener("change", scheduleApplyControls);
});
window.addEventListener("resize", buildCurtain);

Runner.run(runner, engine);

(function loop() {
    applyUpright();
    updateAutoWind();
    render();
    requestAnimationFrame(loop);
}());

updateModeIndicator();
setPanelCollapsed(false);
loadKey4ConfigToControls();
applyControls();
