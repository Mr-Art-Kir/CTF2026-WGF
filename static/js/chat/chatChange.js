document.addEventListener('DOMContentLoaded', () => {
    const chatItems = document.querySelectorAll('.index-chat-item');
    
    const activeTitle = document.getElementById('active-title');
    const activeInfo = document.getElementById('active-info');
    const activeAvatar = document.getElementById('active-avatar');
    const chatWindow = document.getElementById('chat-window');
    const data_key= document.getElementById('my-data-id')
    let key = 0;
    if (data_key) {
        key  = JSON.parse(data_key.textContent);        
    }
    
    const chatHistory = {
        'favorites': [
            { type: 'sent', text: 'Планы на день' },
            { type: 'sent', text: 'Купить сервер для проекта' },
            { type: 'sent', text: 'Создать репозиторий в git' },
            { type: 'sent', text: 'Сформировать команду' },
        ],
        'common': [
            { type: 'received', text: 'Артём: Всем привет! Вижу, все в сборе. Давайте пройдёмся по деталям нашего веб-проекта.' },
            { type: 'sent', text: 'Привет! Да, репозиторий в Git уже развёрнут, структуру папок настроил согласно плану.' },
            { type: 'received', text: 'Дизайнер: Доступы получил. Что по технической части? Где будем хоститься?' },
            { type: 'sent', text: 'По серверу: я уже подобрал конфигурацию с Docker и PostgreSQL. Сегодня оплачу, и начнём деплой.' },
            { type: 'received', text: 'Разработчик: Ок. А какая основная логика системы? JWT уже внедрили?' },
            { type: 'sent', text: 'Да, авторизация на JWT готова. Сейчас объясню суть: проект — это площадка для безопасного обмена данными.' },
            { type: 'sent', text: 'В планах на день как раз стояло формирование финального состава команды — теперь мы можем распределить задачи по фронтенду.' }
        ],
        'ctf': [
            { type:'received', text: `Ключ: ${key} ` },
            { type:'sent', text: 'Спасибо!' }
        ]
    };

    chatItems.forEach(item => {
        item.addEventListener('click', () => {
            chatItems.forEach(el => el.classList.remove('index-active'));
            item.classList.add('index-active');

            const chatId = item.getAttribute('data-chat-id');
            const title = item.querySelector('.index-chat-title').textContent;
            const info = item.getAttribute('data-info');
            const avatarHtml = item.querySelector('.index-chat-avatar').innerHTML;

            activeTitle.textContent = title;
            activeInfo.textContent = info;
            activeAvatar.innerHTML = avatarHtml;

            renderMessages(chatId);
        });
    });

    function renderMessages(chatId) {
        if (!chatWindow) return;
        
        chatWindow.innerHTML = ''; 
        const messages = chatHistory[chatId] || [];

        messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `index-message index-${msg.type}`;
            msgDiv.textContent = msg.text;
            chatWindow.appendChild(msgDiv);
        });

        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    renderMessages('common');
});