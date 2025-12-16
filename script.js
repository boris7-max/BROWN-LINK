// ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ =====
let maintenanceProgress = 45;

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    // Запускаем все функции
    startCountdown();
    startProgressAnimation();
    setupEventListeners();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        showToast('Сервис на техническом обслуживании');
    }, 1000);
});

// ===== ТАЙМЕР ОБРАТНОГО ОТСЧЕТА =====
function startCountdown() {
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    // Устанавливаем время на завтра 18:00
    const targetTime = new Date();
    targetTime.setDate(targetTime.getDate() + 1);
    targetTime.setHours(18, 0, 0, 0);
    
    function updateTimer() {
        const now = new Date();
        const diff = targetTime - now;
        
        if (diff <= 0) {
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            showToast('Работы завершены! Скоро появится обновление.');
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        setTimeout(updateTimer, 1000);
    }
    
    updateTimer();
}

// ===== АНИМАЦИЯ ПРОГРЕССА =====
function startProgressAnimation() {
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const steps = document.querySelectorAll('.step');
    
    function updateProgress() {
        // Случайное увеличение прогресса (1-5%)
        const increment = Math.floor(Math.random() * 5) + 1;
        maintenanceProgress = Math.min(maintenanceProgress + increment, 95);
        
        // Обновляем прогресс бар
        if (progressFill) {
            progressFill.style.width = `${maintenanceProgress}%`;
        }
        
        if (progressPercent) {
            progressPercent.textContent = `${maintenanceProgress}%`;
        }
        
        // Обновляем шаги
        updateSteps(steps, maintenanceProgress);
        
        // Следующее обновление через случайный интервал (5-15 секунд)
        const nextUpdate = Math.floor(Math.random() * 10000) + 5000;
        setTimeout(updateProgress, nextUpdate);
    }
    
    // Запускаем первое обновление через 3 секунды
    setTimeout(updateProgress, 3000);
}

// ===== ОБНОВЛЕНИЕ ШАГОВ =====
function updateSteps(steps, progress) {
    steps.forEach((step, index) => {
        if (progress >= 25 * (index + 1)) {
            step.classList.add('active');
        }
    });
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ =====
function setupEventListeners() {
    // Кнопка "Проверить статус"
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const originalHtml = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
            this.disabled = true;
            
            setTimeout(() => {
                showToast('Статус: Работы продолжаются. Прогресс: ' + maintenanceProgress + '%');
                this.innerHTML = originalHtml;
                this.disabled = false;
            }, 1500);
        });
    }
    
    // Кнопка "Связаться с поддержкой"
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            showToast('Контакты: @kazay_new (разработчик), @brown_tme (поддержка)');
            
            // Открываем Telegram (если доступно)
            setTimeout(() => {
                window.open('https://t.me/kazay_new', '_blank');
            }, 500);
        });
    }
}

// ===== ПОКАЗАТЬ УВЕДОМЛЕНИЕ =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }
}
