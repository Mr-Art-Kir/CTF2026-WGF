document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.index-tab');
    const contents = document.querySelectorAll('.index-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab') + '-tab';
            
            tabs.forEach(t => t.classList.remove('index-active'));
            contents.forEach(c => c.classList.remove('index-active'));

            tab.classList.add('index-active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('index-active');
            }
        });
    });
});