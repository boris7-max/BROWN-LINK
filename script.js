// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Запускаем прелоадер сайта
    startSiteLoader();
});

// ===== ПРЕЛОАДЕР САЙТА =====
function startSiteLoader() {
    const loader = document.getElementById('site-loader');
    const progressBar = document.getElementById('site-progress');
    const timer = document.getElementById('site-loader-timer');
    const mainContent = document.getElementById('main-content');
    
    let progress = 0;
    const steps = 4; // Количество шагов в анимации
    const totalTime = 3500; // 3.5 секунды
    const stepTime = totalTime / steps;
    
    // Функция обновления шагов
    function updateSteps(currentStep) {
        const stepElements = document.querySelectorAll('.step');
        stepElements.forEach((step, index) => {
            const icon = step.querySelector('i');
            if (index < currentStep) {
                step.classList.add('active');
                icon.className = 'fas fa-check';
            } else if (index === currentStep) {
                step.classList.add('active');
                icon.className = 'fas fa-spinner fa-spin';
            } else {
                step.classList.remove('active');
                icon.className = 'fas fa-spinner';
            }
        });
    }
    
    // Инициализация первого шага
    updateSteps(0);
    
    // Анимация загрузки
    const interval = setInterval(() => {
        progress += 100 / (totalTime / 100);
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        timer.textContent = `${Math.min(Math.round(progress), 100)}%`;
        
        // Обновляем шаги
        const currentStep = Math.floor(progress / (100 / steps));
        updateSteps(currentStep);
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Задержка перед скрытием прелоадера
            setTimeout(() => {
                // Анимация исчезновения прелоадера
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loader.style.display = 'none';
                    mainContent.style.display = 'block';
                    
                    // Инициализируем основной функционал
                    initMainApp();
                }, 500);
            }, 300);
        }
    }, 100);
}

// ===== ИНИЦИАЛИЗАЦИЯ ОСНОВНОГО ПРИЛОЖЕНИЯ =====
function initMainApp() {
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
    document.getElementById('close-alert-btn').addEventListener('click', closeAlert);
    
    // Показываем приветственное уведомление
    setTimeout(() => {
        showToast('Готово к работе');
    }, 500);
}

// ===== ПЕРЕМЕННЫЕ =====
let history = JSON.parse(localStorage.getItem('multitool_history') || '[]');

// ===== STANDOFF =====
function handleStandoff() {
    const text = document.getElementById('standoff-text').value.trim();
    const displayText = text || 'Запуск Standoff 2 с инжектом';
    
    // Добавляем в историю
    addToHistory(displayText, 'standoff');
    
    // Показываем алерт успешного инжекта
    showInjectAlert();
    
    // Очищаем поле ввода
    document.getElementById('standoff-text').value = '';
}

function showInjectAlert() {
    const alert = document.getElementById('inject-alert');
    const timeElement = document.getElementById('inject-time');
    
    // Устанавливаем текущее время
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Показываем алерт
    alert.classList.remove('hidden');
    
    // Блокируем прокрутку
    document.body.style.overflow = 'hidden';
}

function closeAlert() {
    const alert = document.getElementById('inject-alert');
    alert.classList.add('hidden');
    
    // Восстанавливаем прокрутку
    document.body.style.overflow = 'auto';
    
    // Показываем уведомление
    showToast('Инжект завершен');
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

// ===== MD5 =====
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

