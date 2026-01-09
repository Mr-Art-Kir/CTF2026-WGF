// Функция отправки команды на сервер и обработки ответа
export async function sendCommand(command) {
    try {
        const response = await fetch('/api/execute/', {          // ← твой реальный endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCsrfToken(),               // если включена CSRF защита
                // 'Authorization': 'Bearer ' + token,           // если используешь JWT/Token
            },
            body: JSON.stringify({
                command: command.trim()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Самые частые варианты структуры ответа от Django API
        let output = '';

        // Вариант 1: { "output": "текст результата" }
        if (data.output !== undefined) {
            output = data.output;
        }
        // Вариант 2: { "result": "...", "error": null }
        else if (data.result) {
            output = data.result;
        }
        // Вариант 3: { "success": true, "message": "..." }
        else if (data.message) {
            output = data.message;
        }
        // Вариант 4: просто строка
        else if (typeof data === 'string') {
            output = data;
        }
        // Вариант 5: есть поле error
        else if (data.error) {
            output = `Ошибка: ${data.error}`;
        }
        // Самый безопасный дефолт
        else {
            output = JSON.stringify(data, null, 2); // покажем всё что пришло
        }

        addOutput(output);

    } catch (error) {
        addOutput(`Ошибка соединения: ${error.message}`);
    }
}