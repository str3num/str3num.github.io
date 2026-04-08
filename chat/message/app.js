const STORAGE_KEY = {
  apiKey: "deepseek_api_key",
  model: "deepseek_model",
  sessions: "deepseek_sessions",
  activeSessionId: "deepseek_active_session_id",
  customPersonas: "deepseek_custom_personas"
};

const ADD_PERSONA_ID = "__add_persona__";

const BASE_PERSONAS = [
  {
    id: "advisor",
    name: "建议顾问",
    prompt: "你是一个务实的建议顾问。回答要先给结论，再给3条可执行建议，最后给风险提示。"
  },
  {
    id: "coach",
    name: "学习教练",
    prompt: "你是学习教练。回答要分步骤，先讲原理再给练习建议，语言简洁。"
  },
  {
    id: "friend",
    name: "理性朋友",
    prompt: "你是一个理性且有边界感的朋友。保持礼貌，避免夸张承诺，给出可行建议。"
  }
];

const elements = {
  apiKeyInput: document.getElementById("api-key-input"),
  modelSelect: document.getElementById("model-select"),
  verifyApiBtn: document.getElementById("verify-api-btn"),
  verifyStatus: document.getElementById("verify-status"),
  personaSelect: document.getElementById("persona-select"),
  confirmPersonaBtn: document.getElementById("confirm-persona-btn"),
  personaDetailInput: document.getElementById("persona-detail-input"),
  sessionSelect: document.getElementById("session-select"),
  newSessionBtn: document.getElementById("new-session-btn"),
  restoreSessionBtn: document.getElementById("restore-session-btn"),
  deleteSessionBtn: document.getElementById("delete-session-btn"),
  chatDisplay: document.getElementById("chat-display"),
  messageInput: document.getElementById("message-input"),
  submitBtn: document.getElementById("submit-btn")
};

const verifyState = {
  ok: false,
  apiKey: "",
  model: ""
};

let customPersonas = loadCustomPersonas();
let sessions = loadSessions();
let activeSessionId = loadActiveSessionId();

init();

function init() {
  elements.apiKeyInput.value = localStorage.getItem(STORAGE_KEY.apiKey) || "";

  const savedModel = localStorage.getItem(STORAGE_KEY.model);
  if (savedModel) {
    elements.modelSelect.value = savedModel;
  } else {
    localStorage.setItem(STORAGE_KEY.model, elements.modelSelect.value);
  }

  if (sessions.length === 0) {
    const created = createSession("新对话");
    activeSessionId = created.id;
  }

  if (!sessions.find((s) => s.id === activeSessionId)) {
    activeSessionId = sessions[0].id;
  }

  bindEvents();
  setVerifyStatus("未检查", "idle");
  persist();
  renderSessionOptions();
  renderCurrentSession();
}

function bindEvents() {
  elements.apiKeyInput.addEventListener("input", () => {
    localStorage.setItem(STORAGE_KEY.apiKey, elements.apiKeyInput.value.trim());
    invalidateVerification();
  });

  elements.modelSelect.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEY.model, elements.modelSelect.value);
    invalidateVerification();
  });

  elements.verifyApiBtn.addEventListener("click", verifyApiAndModel);

  elements.personaSelect.addEventListener("change", () => {
    const session = getActiveSession();
    if (session.personaLocked) {
      renderPersonaArea(session);
      appendSystemMessage("该对话已锁定人设，无法更改。", true);
      return;
    }

    const selectedId = elements.personaSelect.value;
    if (selectedId === ADD_PERSONA_ID) {
      const persona = addCustomPersona();
      session.personaId = persona.id;
      session.personaName = persona.name;
      session.systemPrompt = persona.prompt;
      session.updatedAt = Date.now();
      persist();
      renderPersonaArea(session);
      appendSystemMessage(`已新增人设：${persona.name}`, false);
      return;
    }

    const selectedPersona = getPersonaById(selectedId);
    session.personaId = selectedPersona.id;
    session.personaName = selectedPersona.name;
    session.systemPrompt = selectedPersona.prompt;
    session.updatedAt = Date.now();
    persist();
    renderPersonaArea(session);
  });

  elements.personaDetailInput.addEventListener("input", () => {
    const session = getActiveSession();
    if (session.personaLocked) {
      return;
    }

    const text = elements.personaDetailInput.value;
    session.systemPrompt = text;
    session.updatedAt = Date.now();

    if (isCustomPersonaId(session.personaId)) {
      const updated = upsertCustomPersonaPrompt(session.personaId, text);
      session.personaName = updated.name;
    }

    persist();
  });

  elements.confirmPersonaBtn.addEventListener("click", () => {
    const session = getActiveSession();
    if (session.personaLocked) {
      appendSystemMessage("该对话已锁定人设，无法更改。", true);
      return;
    }

    const promptText = elements.personaDetailInput.value.trim();
    if (!promptText) {
      appendSystemMessage("人设详情不能为空。", true);
      return;
    }

    const selectedPersona = getPersonaById(session.personaId);
    session.personaId = selectedPersona.id;
    session.personaName = selectedPersona.name;
    session.systemPrompt = promptText;
    session.personaLocked = true;
    session.updatedAt = Date.now();

    if (isCustomPersonaId(session.personaId)) {
      upsertCustomPersonaPrompt(session.personaId, promptText);
    }

    persist();
    renderSessionOptions();
    renderPersonaArea(session);
    appendSystemMessage(`人设已确定：${session.personaName}`, false);
  });

  elements.sessionSelect.addEventListener("change", () => {
    activeSessionId = elements.sessionSelect.value;
    persist();
    renderCurrentSession();
  });

  elements.newSessionBtn.addEventListener("click", () => {
    const created = createSession(`对话 ${sessions.length + 1}`);
    activeSessionId = created.id;
    persist();
    renderSessionOptions();
    renderCurrentSession();
  });

  elements.restoreSessionBtn.addEventListener("click", () => {
    activeSessionId = elements.sessionSelect.value;
    persist();
    renderCurrentSession();
  });

  elements.deleteSessionBtn.addEventListener("click", () => {
    if (sessions.length === 1) {
      appendSystemMessage("至少保留一个对话。", true);
      return;
    }

    const current = getActiveSession();
    sessions = sessions.filter((session) => session.id !== current.id);
    activeSessionId = sessions[0].id;
    persist();
    renderSessionOptions();
    renderCurrentSession();
  });

  elements.submitBtn.addEventListener("click", handleSend);
  elements.messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  });
}

async function verifyApiAndModel() {
  const apiKey = elements.apiKeyInput.value.trim();
  const model = elements.modelSelect.value;

  if (!apiKey) {
    setVerifyStatus("缺少 API", "fail");
    appendSystemMessage("请先输入 DeepSeek API Key。", true);
    return;
  }

  setVerifyStatus("检查中...", "idle");
  elements.verifyApiBtn.disabled = true;

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status} ${errText}`);
    }

    verifyState.ok = true;
    verifyState.apiKey = apiKey;
    verifyState.model = model;
    setVerifyStatus("检查通过", "ok");
    appendSystemMessage("API 与模型检查通过，可以开始对话。", false);
  } catch (error) {
    verifyState.ok = false;
    verifyState.apiKey = "";
    verifyState.model = "";
    setVerifyStatus("检查失败", "fail");
    appendSystemMessage(`检查失败：${error.message}`, true);
  } finally {
    elements.verifyApiBtn.disabled = false;
  }
}

function handleSend() {
  const content = elements.messageInput.value.trim();
  if (!content) {
    return;
  }

  const session = getActiveSession();
  if (!session.personaLocked) {
    appendSystemMessage("请先在第二行点击“开始对话”锁定人设后再对话。", true);
    return;
  }

  if (!isVerified()) {
    appendSystemMessage("请先在第一行点击“检查”，检查通过后再对话。", true);
    return;
  }

  session.messages.push({ role: "user", content });
  session.updatedAt = Date.now();
  if (session.messages.filter((m) => m.role === "user").length === 1) {
    session.title = truncateTitle(content);
  }

  elements.messageInput.value = "";
  persist();
  renderSessionOptions();
  renderMessages(session.messages);

  requestAssistantReply(session, verifyState.apiKey).catch((error) => {
    appendSystemMessage(`请求失败：${error.message}`, true);
  });
}

async function requestAssistantReply(session, apiKey) {
  const waitNode = appendSystemMessage("思考中...", false);
  const model = elements.modelSelect.value;

  const requestMessages = [
    { role: "system", content: session.systemPrompt },
    ...session.messages.map((m) => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: requestMessages,
      stream: false
    })
  });

  waitNode.remove();

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status} ${errText}`);
  }

  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error("响应内容为空");
  }

  session.messages.push({ role: "assistant", content: answer });
  session.updatedAt = Date.now();
  persist();
  renderSessionOptions();
  renderMessages(session.messages);
}

function renderCurrentSession() {
  const session = getActiveSession();
  renderPersonaArea(session);
  elements.sessionSelect.value = session.id;
  renderMessages(session.messages);
}

function renderPersonaArea(session) {
  renderPersonaOptions(session.personaId);
  elements.personaDetailInput.value = session.systemPrompt || "";

  const locked = session.personaLocked;
  elements.personaSelect.disabled = locked;
  elements.confirmPersonaBtn.disabled = locked;
  elements.personaDetailInput.readOnly = locked || !isCustomPersonaId(session.personaId);
}

function renderPersonaOptions(selectedId) {
  elements.personaSelect.innerHTML = "";

  getAllPersonas().forEach((persona) => {
    const option = document.createElement("option");
    option.value = persona.id;
    option.textContent = persona.name;
    elements.personaSelect.appendChild(option);
  });

  const addOption = document.createElement("option");
  addOption.value = ADD_PERSONA_ID;
  addOption.textContent = "增加人设";
  elements.personaSelect.appendChild(addOption);

  elements.personaSelect.value = selectedId;
}

function renderSessionOptions() {
  elements.sessionSelect.innerHTML = "";
  sessions
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((session) => {
      const option = document.createElement("option");
      option.value = session.id;
      option.textContent = session.title;
      elements.sessionSelect.appendChild(option);
    });

  elements.sessionSelect.value = activeSessionId;
}

function renderMessages(messages) {
  elements.chatDisplay.innerHTML = "";
  messages.forEach((message) => {
    const wrapper = document.createElement("div");
    wrapper.className = `message message-${message.role}`;

    const role = document.createElement("div");
    role.className = "message-role";
    role.textContent = message.role === "assistant" ? "AI" : "你";

    const content = document.createElement("div");
    content.textContent = message.content;

    wrapper.appendChild(role);
    wrapper.appendChild(content);
    elements.chatDisplay.appendChild(wrapper);
  });

  elements.chatDisplay.scrollTop = elements.chatDisplay.scrollHeight;
}

function appendSystemMessage(text, isError) {
  const node = document.createElement("div");
  node.className = "message message-system";
  node.textContent = isError ? `错误：${text}` : text;
  elements.chatDisplay.appendChild(node);
  elements.chatDisplay.scrollTop = elements.chatDisplay.scrollHeight;
  return node;
}

function setVerifyStatus(text, type) {
  elements.verifyStatus.textContent = text;
  elements.verifyStatus.classList.remove("verify-status-ok", "verify-status-fail");
  if (type === "ok") {
    elements.verifyStatus.classList.add("verify-status-ok");
  }
  if (type === "fail") {
    elements.verifyStatus.classList.add("verify-status-fail");
  }
}

function invalidateVerification() {
  verifyState.ok = false;
  verifyState.apiKey = "";
  verifyState.model = "";
  setVerifyStatus("未检查", "idle");
}

function isVerified() {
  return (
    verifyState.ok &&
    verifyState.apiKey === elements.apiKeyInput.value.trim() &&
    verifyState.model === elements.modelSelect.value
  );
}

function createSession(title) {
  const now = Date.now();
  const defaultPersona = getPersonaById("advisor");
  const session = {
    id: `sess_${now}_${Math.random().toString(16).slice(2, 8)}`,
    title,
    personaId: defaultPersona.id,
    personaName: defaultPersona.name,
    systemPrompt: defaultPersona.prompt,
    personaLocked: false,
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        role: "assistant",
        content: "请先完成 API 检查，再在第二行点击“开始对话”锁定人设，然后开始聊天。"
      }
    ]
  };

  sessions.unshift(session);
  return session;
}

function loadSessions() {
  const raw = localStorage.getItem(STORAGE_KEY.sessions);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const persona = getPersonaById(item.personaId || "advisor");
        const prompt = typeof item.systemPrompt === "string" && item.systemPrompt.trim()
          ? item.systemPrompt
          : persona.prompt;

        return {
          id: item.id || `sess_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
          title: typeof item.title === "string" && item.title ? item.title : "未命名对话",
          personaId: persona.id,
          personaName: persona.name,
          systemPrompt: prompt,
          personaLocked: Boolean(item.personaLocked),
          createdAt: Number(item.createdAt) || Date.now(),
          updatedAt: Number(item.updatedAt) || Date.now(),
          messages: Array.isArray(item.messages)
            ? item.messages
                .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
                .map((m) => ({ role: m.role, content: m.content }))
            : []
        };
      });
  } catch (error) {
    return [];
  }
}

function loadActiveSessionId() {
  return localStorage.getItem(STORAGE_KEY.activeSessionId) || "";
}

function loadCustomPersonas() {
  const raw = localStorage.getItem(STORAGE_KEY.customPersonas);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : `custom_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
        name: typeof item.name === "string" && item.name ? item.name : "自定义人设",
        prompt: typeof item.prompt === "string" ? item.prompt : ""
      }));
  } catch (error) {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY.sessions, JSON.stringify(sessions));
  localStorage.setItem(STORAGE_KEY.activeSessionId, activeSessionId);
  localStorage.setItem(STORAGE_KEY.customPersonas, JSON.stringify(customPersonas));
}

function getActiveSession() {
  const session = sessions.find((item) => item.id === activeSessionId);
  if (!session) {
    throw new Error("未找到当前对话");
  }

  return session;
}

function getAllPersonas() {
  return [...BASE_PERSONAS, ...customPersonas];
}

function getPersonaById(id) {
  return getAllPersonas().find((persona) => persona.id === id) || BASE_PERSONAS[0];
}

function isCustomPersonaId(id) {
  return customPersonas.some((persona) => persona.id === id);
}

function addCustomPersona() {
  const newName = getNextCustomPersonaName();
  const persona = {
    id: `custom_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    name: newName,
    prompt: ""
  };

  customPersonas.push(persona);
  persist();
  return persona;
}

function upsertCustomPersonaPrompt(personaId, prompt) {
  let persona = customPersonas.find((item) => item.id === personaId);
  if (!persona) {
    persona = {
      id: personaId,
      name: getNextCustomPersonaName(),
      prompt
    };
    customPersonas.push(persona);
  } else {
    persona.prompt = prompt;
  }

  persist();
  return persona;
}

function getNextCustomPersonaName() {
  const maxNo = customPersonas.reduce((max, persona) => {
    const match = /^自定义人设(\d+)$/.exec(persona.name);
    if (!match) {
      return max;
    }

    const currentNo = Number(match[1]);
    return Number.isFinite(currentNo) ? Math.max(max, currentNo) : max;
  }, 0);

  return `自定义人设${maxNo + 1}`;
}

function truncateTitle(text) {
  return text.length > 20 ? `${text.slice(0, 20)}...` : text;
}
