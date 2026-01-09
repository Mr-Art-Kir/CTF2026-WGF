const terminal = document.getElementById('terminal');
let currentLine = null;
let commandHistory = [];
let historyIndex = -1;

const API_URL = '/api/terminal/';

function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

function finalizePreviousLine() {
    if (!currentLine) return;
    const input = currentLine.querySelector('.input-field');
    const visible = currentLine.querySelector('.visible-text');
    if (input && visible) {
        visible.textContent = input.value || '';
        input.remove();
    }
    currentLine.classList.remove('active');
}

function createInputLine(promptText = "user@host:~$ ") {
    finalizePreviousLine();

    const line = document.createElement('div');
    line.className = 'line active';

    line.innerHTML = `
        <span class="prompt">${promptText}</span>
        <div class="input-area">
            <div class="visible-text"></div>
            <input type="text" class="input-field" autocomplete="off" />
        </div>
    `;

    terminal.appendChild(line);
    currentLine = line;

    const input = line.querySelector('.input-field');
    const visible = line.querySelector('.visible-text');

    const sync = () => {
        visible.textContent = input.value || '';
        terminal.scrollTop = terminal.scrollHeight;
    };

    input.addEventListener('input', sync);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const partial = input.value.trim();
            if (partial) {
                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                    },
                    body: JSON.stringify({ command: `complete ${partial}` })
                })
                .then(r => r.json())
                .then(data => {
                    if (data.matches && data.matches.length > 0) {
                        input.value = data.matches[0];
                        sync();
                    }
                })
                .catch(() => {});
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
                sync();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > -1) {
                historyIndex--;
                input.value = historyIndex >= 0 ? commandHistory[historyIndex] : '';
                sync();
            }
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const command = input.value.trim();

            if (command) {
                if (!commandHistory.length || commandHistory[0] !== command) {
                    commandHistory.unshift(command);
                }
                historyIndex = -1;

                // const cmdLine = document.createElement('div');
                // cmdLine.className = 'line output';
                // cmdLine.innerHTML = `<span class="prompt">${currentLine.querySelector('.prompt').textContent}</span>${command}`;
                // terminal.appendChild(cmdLine);

                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                    },
                    body: JSON.stringify({ command })
                })
                .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
                .then(data => {
                    addOutput(data.output || 'Нет вывода', !!data.error);
                    // Обновляем prompt с новым путём
                    const newPrompt = data.prompt || "user@host:~$ ";
                    createInputLine(newPrompt);
                })
                .catch(err => {
                    addOutput(`Ошибка: ${err}`, true);
                    createInputLine();
                });
            } else {
                createInputLine(currentLine.querySelector('.prompt').textContent);
            }

            // input.value = '';
            sync();
        }

        if (e.ctrlKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            terminal.innerHTML = '';
            commandHistory = [];
            historyIndex = -1;
            createInputLine();
        }
    });

    input.focus();
    sync();
}

function addOutput(text, isError = false) {
    if (!text) return;

    const lines = text.split('\n');
    lines.forEach(line => {
        const el = document.createElement('div');
        el.className = 'line output';

        let cleaned = line;
        if (line.includes('\x1b[1;34m')) el.style.color = '#4da6ff'; // синий
        if (line.includes('\x1b[1;32m')) el.style.color = '#00ff00'; // зелёный
        if (line.includes('\x1b[1;36m')) el.style.color = '#00ffff'; // циан
        if (line.includes('\x1b[31m'))   el.style.color = '#ff5555'; // красный

        cleaned = cleaned.replace(/\x1b\[[0-9;]*m/g, '');

        if (isError) el.style.color = '#ff4444';

        el.textContent = cleaned;
        terminal.appendChild(el);
    });

    terminal.scrollTop = terminal.scrollHeight;
}

function initTerminal() {
    const welcome = document.createElement('div');
    welcome.className = 'line output';
    welcome.innerHTML = `
Добро пожаловать в терминал
Доступные команды: ls, pwd, whoami, echo, help, cd, cat, tree
---------------------------------------------------
    `;
    terminal.appendChild(welcome);

    createInputLine("user@host:~$ ");

    terminal.addEventListener('click', () => {
        const input = currentLine?.querySelector('.input-field');
        input?.focus();
    });
}

initTerminal();