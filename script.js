// ===== КЛЮЧЕВАЯ СИСТЕМА =====
const VALID_KEYS = [
    "BRAIN-N7P9R1T3V5X7Z9B1D3F5H7"
];

// ===== ПЕРЕМЕННЫЕ =====
let attempts = 3;
let isAuthenticated = false;
let currentUserKey = '';
let history = JSON.parse(localStorage.getItem('multitool_history') || '[]');
let licenseExpireDate = '';

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем сохраненную сессию
    checkSavedSession();
    
    // Назначаем обработчики для ключевой системы
    document.getElementById('submit-key-btn').addEventListener('click', checkKey);
    document.getElementById('show-key-btn').addEventListener('click', toggleKeyVisibility);
    document.getElementById('key-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkKey();
        }
    });
    
    // Обработчик кнопки "Проверить статус" на странице техработ
    if (document.getElementById('refresh-btn')) {
        document.getElementById('refresh-btn').addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Обновление через 12-24 часа';
                showToast('Система все еще в разработке. Пожалуйста, ожидайте.');
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-sync-alt"></i> Проверить статус';
                    this.disabled = false;
                }, 2000);
            }, 1500);
        });
    }
    
    // Запускаем таймер обратного отсчета
    startMaintenanceCountdown();
    
    // Обработчик выхода
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
});

// ===== ПРОВЕРКА СОХРАНЕННОЙ СЕССИИ =====
function checkSavedSession() {
    const savedKey = localStorage.getItem('multitool_key');
    const savedExpire = localStorage.getItem('multitool_expire');
    
    if (savedKey && savedExpire) {
        // Проверяем не истекла ли лицензия
        const now = new Date();
        const expireDate = new Date(savedExpire);
        
        if (now < expireDate && VALID_KEYS.includes(savedKey)) {
            // Сессия активна
            currentUserKey = savedKey;
            licenseExpireDate = savedExpire;
            isAuthenticated = true;
            
            // Прячем ключевую систему и показываем страницу техработ
            document.getElementById('key-system').style.display = 'none';
            showMaintenancePage();
        } else {
            // Сессия истекла
            localStorage.removeItem('multitool_key');
            localStorage.removeItem('multitool_expire');
            updateAttemptsUI();
        }
    } else {
        // Нет сохраненной сессии
        updateAttemptsUI();
    }
}

// ===== ПРОВЕРКА КЛЮЧА (ИСПРАВЛЕННАЯ) =====
function checkKey() {
    const keyInput = document.getElementById('key-input');
    const key = keyInput.value.trim().toUpperCase();
    
    // Удаляем старое сообщение, если есть
    removeExistingMessage();
    
    if (!key) {
        showMessage('Введите ключ!', 'warning');
        return;
    }
    
    if (VALID_KEYS.includes(key)) {
        // Ключ верный
        currentUserKey = key;
        isAuthenticated = true;
        
        // Генерируем дату истечения (30 дней от текущей даты)
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7);
        licenseExpireDate = expireDate.toISOString();
        
        // Сохраняем в localStorage
        localStorage.setItem('multitool_key', key);
        localStorage.setItem('multitool_expire', licenseExpireDate);
        
        // Показываем сообщение об успехе
        showMessage('Ключ принят! Переход на страницу техработ...', 'success');
        
        // Сбрасываем попытки
        attempts = 3;
        updateAttemptsUI();
        
        // Через 1.5 секунды скрываем ключевую систему и показываем страницу техработ
        setTimeout(() => {
            document.getElementById('key-system').style.display = 'none';
            showMaintenancePage();
        }, 1500);
        
    } else {
        // Неверный ключ
        attempts--;
        updateAttemptsUI();
        
        if (attempts > 0) {
            showMessage(`Неверный ключ! Осталось попыток: ${attempts}`, 'warning');
            keyInput.value = '';
            keyInput.focus();
            
            // Анимация встряски
            keyInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                keyInput.style.animation = '';
            }, 500);
        } else {
            // Попытки закончились
            showMessage('Доступ заблокирован на 5 минут! Свяжитесь с администратором.', 'warning');
            document.getElementById('submit-key-btn').disabled = true;
            document.getElementById('key-input').disabled = true;
            
            // Блокировка на 5 минут
            setTimeout(() => {
                attempts = 3;
                document.getElementById('submit-key-btn').disabled = false;
                document.getElementById('key-input').disabled = false;
                removeExistingMessage();
                updateAttemptsUI();
                showMessage('Доступ восстановлен. Попробуйте снова.', 'success');
            }, 5 * 60 * 1000); // 5 минут
        }
    }
}

// ===== ПОКАЗАТЬ/СКРЫТЬ КЛЮЧ =====
function toggleKeyVisibility() {
    const keyInput = document.getElementById('key-input');
    const eyeBtn = document.getElementById('show-key-btn');
    const eyeIcon = eyeBtn.querySelector('i');
    
    if (keyInput.type === 'password') {
        keyInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        keyInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// ===== ОБНОВЛЕНИЕ UI ПОПЫТОК =====
function updateAttemptsUI() {
    const counter = document.querySelector('#attempts-counter span');
    const progress = document.getElementById('attempts-progress');
    
    if (counter) {
        counter.textContent = attempts;
    }
    
    if (progress) {
        progress.style.width = `${(attempts / 3) * 100}%`;
        
        // Меняем цвет в зависимости от количества попыток
        if (attempts === 3) {
            progress.style.background = 'linear-gradient(90deg, #10b981, #8b5cf6)';
        } else if (attempts === 2) {
            progress.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
        } else {
            progress.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
        }
    }
}

// ===== ПОКАЗАТЬ СООБЩЕНИЕ =====
function showMessage(text, type) {
    // Удаляем старое сообщение
    removeExistingMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `key-${type}`;
    
    const icon = type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${text}</span>
    `;
    
    // Вставляем после key-attempts
    const keyAttempts = document.querySelector('.key-attempts');
    if (keyAttempts) {
        keyAttempts.parentNode.insertBefore(messageDiv, keyAttempts.nextSibling);
    }
}

// ===== УДАЛИТЬ СУЩЕСТВУЮЩЕЕ СООБЩЕНИЕ =====
function removeExistingMessage() {
    const existingWarning = document.querySelector('.key-warning');
    const existingSuccess = document.querySelector('.key-success');
    
    if (existingWarning) {
        existingWarning.remove();
    }
    if (existingSuccess) {
        existingSuccess.remove();
    }
}

// ===== СТРАНИЦА ТЕХРАБОТ =====
function showMaintenancePage() {
    // Показываем страницу техработ (она уже видна)
    document.getElementById('site-loader').style.display = 'flex';
    
    // Запускаем обновление прогресса
    updateMaintenanceProgress();
    
    // Запускаем таймер обратного отсчета
    startMaintenanceCountdown();
    
    // Показываем уведомление
    setTimeout(() => {
        showToast('Проект на техническом обслуживании');
    }, 1000);
}

// ===== ОБНОВЛЕНИЕ ПРОГРЕССА ТЕХРАБОТ =====
function updateMaintenanceProgress() {
    const progressBar = document.getElementById('site-progress');
    const progressTimer = document.getElementById('site-loader-timer');
    
    if (!progressBar || !progressTimer) return;
    
    // Устанавливаем начальный прогресс 45%
    let progress = 45;
    
    // Функция для плавного обновления прогресса
    function updateProgress() {
        // Случайное увеличение на 1-3%
        const increment = Math.floor(Math.random() * 3) + 1;
        progress = Math.min(progress + increment, 85); // Максимум 85%
        
        progressBar.style.width = `${progress}%`;
        progressTimer.textContent = `${progress}%`;
        
        // Обновляем шаги в зависимости от прогресса
        updateMaintenanceSteps(progress);
        
        // Случайный интервал для следующего обновления (10-30 секунд)
        const nextUpdate = Math.floor(Math.random() * 20000) + 10000;
        setTimeout(updateProgress, nextUpdate);
    }
    
    // Запускаем первое обновление через 5 секунд
    setTimeout(updateProgress, 5000);
}

// ===== ОБНОВЛЕНИЕ ШАГОВ ТЕХРАБОТ =====
function updateMaintenanceSteps(progress) {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const icon = step.querySelector('i');
        
        if (progress < 30) {
            // Только первый шаг активен
            if (index === 0) {
                step.classList.add('active');
                icon.className = 'fas fa-hammer';
            } else {
                step.classList.remove('active');
                icon.className = icon.className.replace('fa-spin', '');
            }
        } else if (progress < 60) {
            // Первые два шага активны
            if (index <= 1) {
                step.classList.add('active');
                if (index === 1) {
                    icon.className = 'fas fa-code fa-spin';
                } else {
                    icon.className = icon.className.replace('fa-spin', '');
                }
            } else {
                step.classList.remove('active');
                icon.className = icon.className.replace('fa-spin', '');
            }
        } else if (progress < 85) {
            // Первые три шага активны
            if (index <= 2) {
                step.classList.add('active');
                if (index === 2) {
                    icon.className = 'fas fa-vial fa-spin';
                } else {
                    icon.className = icon.className.replace('fa-spin', '');
                }
            } else {
                step.classList.remove('active');
                icon.className = icon.className.replace('fa-spin', '');
            }
        } else {
            // Все шаги активны
            step.classList.add('active');
            if (index === 3) {
                icon.className = 'fas fa-rocket fa-spin';
            } else {
                icon.className = icon.className.replace('fa-spin', '');
            }
        }
    });
}

// ===== ТАЙМЕР ОБРАТНОГО ОТСЧЕТА =====
function startMaintenanceCountdown() {
    const countdownElement = document.getElementById('countdown-timer');
    if (!countdownElement) return;
    
    // Устанавливаем время на завтра 18:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    
    function updateTimer() {
        const now = new Date();
        const diff = tomorrow - now;
        
        if (diff <= 0) {
            countdownElement.textContent = '00:00:00';
            countdownElement.style.color = '#10b981';
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Меняем цвет в зависимости от времени
        if (hours < 1) {
            countdownElement.style.color = '#ef4444'; // Красный при <1 часа
        } else if (hours < 6) {
            countdownElement.style.color = '#f97316'; // Оранжевый при <6 часов
        } else {
            countdownElement.style.color = '#ffbb00'; // Желтый при >6 часов
        }
        
        countdownElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeout(updateTimer, 1000);
    }
    
    updateTimer();
}

// ===== ВЫХОД ИЗ СИСТЕМЫ =====
function logout() {
    if (confirm('Вы уверены, что хотите выйти? Все данные сессии будут удалены.')) {
        // Очищаем localStorage
        localStorage.removeItem('multitool_key');
        localStorage.removeItem('multitool_expire');
        
        // Сбрасываем переменные
        isAuthenticated = false;
        currentUserKey = '';
        attempts = 3;
        
        // Показываем ключевую систему
        document.getElementById('key-system').style.display = 'flex';
        document.getElementById('site-loader').style.display = 'none';
        document.getElementById('main-content').style.display = 'none';
        
        // Сбрасываем поля
        const keyInput = document.getElementById('key-input');
        if (keyInput) {
            keyInput.value = '';
            keyInput.type = 'password';
        }
        
        const showKeyBtn = document.getElementById('show-key-btn');
        if (showKeyBtn) {
            showKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
        
        const submitBtn = document.getElementById('submit-key-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        
        if (keyInput) {
            keyInput.disabled = false;
        }
        
        // Обновляем UI
        updateAttemptsUI();
        removeExistingMessage();
        
        showToast('Вы вышли из системы');
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Текст скопирован');
    }).catch(err => {
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
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// ===== ОСТАЛЬНЫЕ ФУНКЦИИ (оставлены для будущего использования) =====
function initMainApp() {
    // Эта функция не вызывается пока проект на техработах
    console.log('Основное приложение временно отключено');
}

// Остальные функции (handleStandoff, generateLink, и т.д.) остаются в файле,
// но они не будут вызываться пока проект на техработах
