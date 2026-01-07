const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.body.setAttribute('data-theme', savedTheme);
} else {
  document.body.setAttribute('data-theme', 'light');
}

const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// scripts/javascript.js

document.addEventListener('DOMContentLoaded', function() {
    // Ленивая загрузка изображений
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback для старых браузеров
        lazyImages.forEach(img => {
            img.classList.add('loaded');
        });
    }

    // Адаптивная таблица - добавляем data-label атрибуты
    function setupResponsiveTables() {
        const tables = document.querySelectorAll('.adaptive-table');
        
        tables.forEach(table => {
            const headers = Array.from(table.querySelectorAll('th'));
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    if (headers[index]) {
                        cell.setAttribute('data-label', headers[index].textContent);
                    }
                });
            });
        });
    }

    setupResponsiveTables();

    // Адаптивные изображения с поддержкой WebP
    function checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
            webP.onload = webP.onerror = function() {
                resolve(webP.height === 2);
            };
        });
    }

    // Переключение темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('theme-light');
            this.textContent = document.body.classList.contains('theme-light') 
                ? 'Тёмная тема' 
                : 'Светлая тема';
            
            // Сохраняем выбор пользователя
            localStorage.setItem('theme', 
                document.body.classList.contains('theme-light') ? 'light' : 'dark'
            );
        });

        // Восстанавливаем тему
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('theme-light');
            themeToggle.textContent = 'Тёмная тема';
        }
    }

    // Адаптивные формы - добавляем валидацию
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                // Показываем ошибки
                const invalidFields = form.querySelectorAll(':invalid');
                invalidFields.forEach(field => {
                    field.classList.add('form-error');
                    field.addEventListener('input', function() {
                        if (this.checkValidity()) {
                            this.classList.remove('form-error');
                        }
                    }, { once: true });
                });
                
                // Скролл к первой ошибке
                if (invalidFields.length > 0) {
                    invalidFields[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });
    });

    // Адаптивное масштабирование для мобильных
    function handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        // Отключаем некоторые эффекты на мобильных
        document.body.classList.toggle('is-mobile', isMobile);
        
        // Адаптируем размеры изображений
        const images = document.querySelectorAll('.scalable-element');
        images.forEach(img => {
            if (isMobile) {
                img.style.transform = 'none';
            }
        });
    }

    // Дебаунс для обработки ресайза
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });

    handleResize(); // Инициализация

    // Поддержка Retina дисплеев
    const pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio >= 2) {
        document.body.classList.add('retina-display');
    }

    // Оптимизация для медленных соединений
    if (navigator.connection) {
        const connection = navigator.connection;
        if (connection.saveData === true || connection.effectiveType.includes('2g')) {
            document.body.classList.add('save-data');
            
            // Отключаем фоновые изображения
            const bgImages = document.querySelectorAll('.bg-image');
            bgImages.forEach(el => {
                el.style.backgroundImage = 'none';
            });
            
            // Отключаем ленивую загрузку
            const lazyLoadImages = document.querySelectorAll('img[loading="lazy"]');
            lazyLoadImages.forEach(img => {
                img.loading = 'eager';
            });
        }
    }
});