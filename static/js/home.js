document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('text-canvas');
    const timeDisplay = document.getElementById('system-time');

    setInterval(() => {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString();
    }, 1000);

    window.pushText = function(text, type = 'info') {
        const line = document.createElement('div');
        line.className = 'text-line';
        
        let prefix = '> ';
        if (type === 'error') {
            line.style.color = '#ff3333';
            line.style.textShadow = '0 0 8px #ff3333';
            prefix = '[!] ';
        }

        canvas.appendChild(line);
        
        let i = 0;
        const speed = 30; 

        function typeChar() {
            if (i < text.length) {
                line.textContent = prefix + text.substring(0, i + 1);
                i++;
                setTimeout(typeChar, speed);
                canvas.scrollTop = canvas.scrollHeight;
            }
        }
        
        typeChar();
    };

    pushText("Initializing core display module...");
    setTimeout(() => pushText("Loading CRT shaders... SUCCESS"), 1000);
    setTimeout(() => pushText("Syncing with input stream... READY"), 1800);
});