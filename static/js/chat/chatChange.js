document.addEventListener('DOMContentLoaded', () => {
    const chatItems = document.querySelectorAll('.index-chat-item');
    
    const activeTitle = document.getElementById('active-title');
    const activeInfo = document.getElementById('active-info');
    const activeAvatar = document.getElementById('active-avatar');
    const chatWindow = document.getElementById('chat-window');

    const chatHistory = {
        'favorites': [
            { type: 'received', text: 'Это ваше личное пространство.' },
            { type: 'sent', text: 'Купить сервер для проекта' }
        ],
        'common': [
            { type: 'received', text: 'Артём: Привет всем! План на сегодня готов?' },
            { type: 'sent', text: 'Да, сейчас вышлю' }
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