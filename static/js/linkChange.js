const tabs = document.querySelectorAll('.index-tab');
const contents = document.querySelectorAll('.index-tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('index-active'));
        contents.forEach(c => c.classList.remove('index-active'));
        
        tab.classList.add('index-active');
        const targetId = tab.getAttribute('data-tab') + '-tab';
        document.getElementById(targetId).classList.add('index-active');
    });
});