const output = document.getElementById("terminal-output");
const form = document.getElementById("terminal-form");
const input = document.getElementById("terminal-input");

const commandHistory = [];
let historyIndex = 0;

function appendLine(text, className = "") {
  const line = document.createElement("div");
  line.className = `line ${className}`.trim();
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
  return line;
}

function typeLine(text, className = "", speed = 16) {
  const line = appendLine("", className);
  let index = 0;
  const timer = setInterval(() => {
    if (index >= text.length) {
      clearInterval(timer);
      return;
    }
    line.textContent += text[index];
    index += 1;
    output.scrollTop = output.scrollHeight;
  }, speed);
}

function runCommand(raw) {
  const value = raw.trim();
  if (!value) {
    return;
  }

  commandHistory.push(value);
  historyIndex = commandHistory.length;

  appendLine(`str3num@site:~$ ${value}`, "input-echo");

  const [name, ...args] = value.split(/\s+/);
  const cmd = name.toLowerCase();

  if (cmd === "help") {
    typeLine("可用命令: help, about, chat, home, clear, date, echo <text>, open <url>", "line-dim");
    typeLine("SSH 命令: ssh <user@host> [-p port], webssh <user@host> [-p port]", "line-dim");
    return;
  }

  if (cmd === "about") {
    typeLine("这是一个参照 /chat 的终端模式页面。", "line-dim");
    return;
  }

  if (cmd === "chat") {
    typeLine("跳转到 /chat ...", "line-ok");
    setTimeout(() => {
      window.location.href = "../chat/chat.html";
    }, 300);
    return;
  }

  if (cmd === "home") {
    typeLine("跳转到主页 ...", "line-ok");
    setTimeout(() => {
      window.location.href = "../home/home.html";
    }, 300);
    return;
  }

  if (cmd === "clear") {
    output.innerHTML = "";
    return;
  }

  if (cmd === "date") {
    typeLine(new Date().toLocaleString("zh-CN"), "line-dim");
    return;
  }

  if (cmd === "echo") {
    typeLine(args.join(" "), "line-dim");
    return;
  }

  if (cmd === "open") {
    const url = args[0];
    if (!url) {
      typeLine("用法: open <url>", "line-dim");
      return;
    }

    try {
      const target = url.startsWith("http") ? url : `https://${url}`;
      window.open(target, "_blank", "noopener,noreferrer");
      typeLine(`已打开: ${target}`, "line-ok");
    } catch (error) {
      typeLine("URL 无效", "line-dim");
    }
    return;
  }

  if (cmd === "ssh") {
    const target = args[0];
    if (!target) {
      typeLine("用法: ssh <user@host> [-p port]", "line-dim");
      return;
    }

    let port = "22";
    const portFlagIndex = args.indexOf("-p");
    if (portFlagIndex !== -1 && args[portFlagIndex + 1]) {
      port = args[portFlagIndex + 1];
    }

    const sshUrl = `ssh://${target}:${port}`;
    typeLine(`尝试唤起本机 SSH 客户端: ${sshUrl}`, "line-ok");
    window.location.href = sshUrl;
    return;
  }

  if (cmd === "webssh") {
    const target = args[0];
    if (!target) {
      typeLine("用法: webssh <user@host> [-p port]", "line-dim");
      return;
    }

    let port = "22";
    const portFlagIndex = args.indexOf("-p");
    if (portFlagIndex !== -1 && args[portFlagIndex + 1]) {
      port = args[portFlagIndex + 1];
    }

    const [username, host] = target.includes("@") ? target.split("@") : ["", target];
    const gateway = "https://your-webssh.example.com";
    const url = `${gateway}/?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&username=${encodeURIComponent(username)}`;
    typeLine(`打开 WebSSH 网关: ${url}`, "line-ok");
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  typeLine(`command not found: ${cmd}`, "line-dim");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value;
  input.value = "";
  runCommand(value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex -= 1;
      input.value = commandHistory[historyIndex];
    }
    event.preventDefault();
  }

  if (event.key === "ArrowDown") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex += 1;
      input.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      input.value = "";
    }
    event.preventDefault();
  }
});

appendLine("Booting str3num terminal...", "line-dim");
setTimeout(() => typeLine("输入 help 查看可用命令。", "line-ok"), 250);
input.focus();
