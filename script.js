// ===== СТРАНИЦА ТЕХРАБОТ =====
function showMaintenancePage() {
    // Эта страница показывается всегда после успешного ввода ключа
    // вместо основного приложения
    
    // Обновляем прогресс бар каждые 10 секунд
    function updateProgress() {
        const progressPercent = document.getElementById('progress-percent');
        const progressFill = document.getElementById('progress-fill');
        
        // Случайный прогресс от 40% до 75% для имитации работ
        const currentProgress = Math.floor(Math.random() * 35) + 40;
        
        if (progressPercent) {
            progressPercent.textContent = `${currentProgress}%`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${currentProgress}%`;
        }
    }
    
    // Таймер обратного отсчета
    function updateCountdown() {
        const countdownElement = document.getElementById('countdown-timer');
        if (!countdownElement) return;
        
        // Устанавливаем время на завтра
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(18, 0, 0, 0); // 18:00 завтра
        
        function tick() {
            const now = new Date();
            const diff = tomorrow - now;
            
            if (diff <= 0) {
                countdownElement.textContent = 'Скоро...';
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            countdownElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            setTimeout(tick, 1000);
        }
        
        tick();
    }
    
    // Обработчик кнопки "Проверить статус"
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
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
    
    // Запускаем обновления
    updateProgress();
    updateCountdown();
    
    // Обновляем прогресс каждые 10 секунд
    setInterval(updateProgress, 10000);
}
