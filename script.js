// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Навигация
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            
            // Снимаем активный класс со всех кнопок
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс на текущую кнопку
            this.classList.add('active');
            
            // Скрываем все страницы
            pages.forEach(page => page.classList.remove('active'));
            // Показываем выбранную страницу
            document.getElementById(pageId).classList.add('active');
            
            // Если открыли историю - обновляем
            if (pageId === 'history-page') {
                loadHistory();
            }
        });
    });
    
    // Загружаем историю
    loadHistory();
    
    // Назначаем обработчики
    document.getElementById('standoff-btn').addEventListener('click', handleStandoff);
    document.getElementById('generate-link-btn').addEventListener('click', generateLink);
    document.getElementById('copy-link-btn').addEventListener('click', copyLink);
    document.getElementById('generate-md5-btn').addEventListener('click', generateMD5);
    document.getElementById('copy-md5-btn').addEventListener('click', copyMD5);
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    document.getElementById('refresh-history-btn').addEventListener('click', loadHistory);
});

// ===== ПЕРЕМЕННЫЕ =====
let history = JSON.parse(localStorage.getItem('multitool_history') || '[]');

// ===== STANDOFF =====
function handleStandoff() {
    const text = document.getElementById('standoff-text').value.trim();
    const displayText = text || 'Запуск Standoff 2';
    
    // Добавляем в историю
    addToHistory(displayText, 'standoff');
    
    // Пытаемся открыть игру
    const deepLink = 'standoff2://';
    const storeLink = 'https://play.google.com/store/apps/details?id=com.axlebolt.standoff2';
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(storeLink, '_blank');
    }, 1000);
    
    showToast('Пытаемся открыть Standoff 2...');
    document.getElementById('standoff-text').value = '';
}

// ===== ССЫЛКИ =====
function generateLink() {
    const platform = document.getElementById('platform-select').value;
    let link = '';
    
    // Генерация случайной строки
    function randomString(length, chars) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    switch(platform) {
        case 'youtube':
            link = `https://youtube.com/watch?v=${randomString(11, chars + '-_')}`;
            break;
        case 'telegram':
            link = `https://t.me/${randomString(8, 'abcdefghijklmnopqrstuvwxyz0123456789_')}`;
            break;
        case 'instagram':
            link = `https://instagram.com/p/${randomString(11, chars + '-_')}/`;
            break;
        case 'tiktok':
            link = `https://tiktok.com/@user/video/${Math.floor(Math.random() * 10000000000000000000)}`;
            break;
    }
    
    document.getElementById('generated-link').textContent = link;
    document.getElementById('link-result').classList.remove('hidden');
    
    // Добавляем в историю
    addToHistory(link, 'link', platform);
}

function copyLink() {
    const link = document.getElementById('generated-link').textContent;
    copyToClipboard(link);
    showToast('Ссылка скопирована!');
}

// ===== MD5 (БЕЗ НУЛЕЙ) =====
function generateMD5() {
    const text = document.getElementById('md5-text').value;
    let hash = '';
    
    if (!text.trim()) {
        // Генерация случайного MD5 без нулей
        const chars = '123456789abcdef'; // исключаем 0
        // Первые символы - только буквы
        hash += 'abcd'[Math.floor(Math.random() * 4)];
        hash += 'ef'[Math.floor(Math.random() * 2)];
        
        // Остальные - буквы и цифры (кроме 0)
        for (let i = 0; i < 26; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
    } else {
        // Простой хэш для текста
        function simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash);
        }
        
        // Создаем уникальный хэш
        let hash1 = simpleHash(text + Date.now());
        let hash2 = simpleHash(text + 'salt');
        
        // Комбинируем и убираем нули
        let combined = (hash1 * hash2).toString(16);
        combined = combined.replace(/0/g, '');
        
        // Добавляем буквы если нужно
        while (combined.length < 32) {
            combined = 'abcdef'[Math.floor(Math.random() * 6)] + combined;
        }
        
        hash = combined.substring(0, 32);
    }
    
    document.getElementById('generated-md5').textContent = hash;
    document.getElementById('md5-result').classList.remove('hidden');
    
    // Добавляем в историю
    const displayText = text ? `${text.substring(0, 15)}${text.length > 15 ? '...' : ''}` : 'случайный хэш';
    addToHistory(hash, 'md5', displayText);
    
    document.getElementById('md5-text').value = '';
}

function copyMD5() {
    const hash = document.getElementById('generated-md5').textContent;
    copyToClipboard(hash);
    showToast('MD5 хэш скопирован!');
}

// ===== ИСТОРИЯ =====
function addToHistory(text, type, extra = '') {
    const item = {
        id: Date.now(),
        text: text,
        type: type,
        extra: extra,
        timestamp: new Date().toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    history.unshift(item);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('multitool_history', JSON.stringify(history));
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    history = JSON.parse(localStorage.getItem('multitool_history') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">История пуста</p>';
        return;
    }
    
    let html = '';
    history.forEach(item => {
        let icon = '📝';
        let color = '#8b5cf6';
        
        switch(item.type) {
            case 'standoff': 
                icon = '🎮'; 
                color = '#f97316'; 
                break;
            case 'link': 
                icon = '🔗'; 
                color = '#8b5cf6'; 
                break;
            case 'md5': 
                icon = '🔐'; 
                color = '#10b981'; 
                break;
        }
        
        html += `
            <div class="history-item">
                <div style="flex:1">
                    <div class="history-text">${icon} ${item.text}</div>
                    <div class="history-meta">${item.timestamp} ${item.extra ? '• ' + item.extra : ''}</div>
                </div>
                <div class="history-actions">
                    <button class="history-btn copy-btn" data-text="${item.text}">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="history-btn delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
    
    // Обработчики для копирования
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            copyToClipboard(text);
            showToast('Скопировано!');
        });
    });
    
    // Обработчики для удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            history = history.filter(item => item.id !== id);
            localStorage.setItem('multitool_history', JSON.stringify(history));
            loadHistory();
            showToast('Запись удалена');
        });
    });
}

function clearHistory() {
    if (confirm('Очистить всю историю?')) {
        history = [];
        localStorage.setItem('multitool_history', '[]');
        loadHistory();
        showToast('История очищена');
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Текст скопирован');
    }).catch(err => {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}