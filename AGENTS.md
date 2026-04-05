# Repository Guidelines

## Project Structure & Module Organization
This repository is a static personal website hosted from the root.
- Entry pages: `index.html`, `404.html`, `CNAME`
- Feature modules: `home/`, `chat/`, `curtain-physics/`, `character-physcis/`, `lain/`, `article/`
- Shared assets: `font/` and per-module `image/` or `images/` folders
- JavaScript logic is colocated with each feature (for example `chat/message/*.js`, `curtain-physics/app.js`).

Keep new features self-contained in a dedicated folder with local `html/css/js/assets` to avoid cross-module coupling.

## Build, Test, and Development Commands
No package manager or build pipeline is configured. Use a local static server for development:
- `python3 -m http.server 8000` — run the site locally from repo root
- `python3 -m http.server 8000 --directory "."` — explicit root serving
- `rg "pattern"` — fast content search across pages/scripts

Open `http://localhost:8000` and verify routes such as `/home/home.html` and `/chat/chat.html`.

## Coding Style & Naming Conventions
- Use 4-space indentation in HTML/CSS/JS to match current files.
- Prefer double quotes in JavaScript and HTML attributes when editing existing code.
- Keep comments concise; comment language should follow the file’s existing language (many files use Chinese comments).
- File and folder names use lowercase with hyphen-separated words (for example `curtain-physics`).
- Preserve existing directory names exactly, including legacy names like `character-physcis/`.

## Testing Guidelines
There is currently no automated test framework.
- Perform manual regression checks for every changed page in desktop and mobile viewport.
- Validate browser console has no new errors.
- For interactive modules (`chat`, `curtain-physics`, `character-physcis`), test core interactions end-to-end after changes.

If you add test tooling, keep it lightweight and document run commands in this file.

## Commit & Pull Request Guidelines
Recent commits are short, action-oriented messages (often Chinese), e.g., `添加了功能`, `更改了显示样式`.
- Recommended commit style: `<类型>: <模块> <变更>` (example: `feat: chat 优化消息渲染`)
- Keep each commit focused on one module or one concern.
- PRs should include: change summary, affected paths, manual test steps, and screenshots/GIFs for UI changes.
- Link related issues/tasks when available.
