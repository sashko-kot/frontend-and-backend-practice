// scripts/a11y.js
document.addEventListener('DOMContentLoaded', function() {
    // 1. Обработчик пропуска навигации
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 100);
            }
        });
    }

    // 2. Управление фокусом в модальных окнах
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }

    // Экспорт функции trapFocus в глобальную область, чтобы другие скрипты могли её вызывать
    if (typeof window !== 'undefined') {
        window.trapFocus = trapFocus;
    }

    // 3. Динамическое обновление ARIA-live регионов
    function announceToScreenReader(message, priority = 'polite') {
        const liveRegion = document.getElementById('a11y-live-region');
        if (!liveRegion) {
            const region = document.createElement('div');
            region.id = 'a11y-live-region';
            region.setAttribute('aria-live', priority);
            region.setAttribute('aria-atomic', 'true');
            region.className = 'sr-only';
            document.body.appendChild(region);
        }
        
        const region = document.getElementById('a11y-live-region');
        region.setAttribute('aria-live', priority);
        region.textContent = message;
        
        // Очищаем через 5 секунд
        setTimeout(() => {
            region.textContent = '';
        }, 5000);
    }

    // Экспорт announceToScreenReader в глобальную область, чтобы другие модули могли использовать его
    if (typeof window !== 'undefined') {
        window.announceToScreenReader = announceToScreenReader;
    }

    // 4. Валидация форм с доступностью
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.setAttribute('novalidate', 'true'); // Отключаем стандартную валидацию
        
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            // Проверяем обязательные поля
            requiredFields.forEach(field => {
                const errorSpan = document.getElementById(`${field.id}-error`);
                
                if (!field.value.trim()) {
                    isValid = false;
                    field.setAttribute('aria-invalid', 'true');
                    
                    if (errorSpan) {
                        errorSpan.textContent = 'Это поле обязательно для заполнения';
                        errorSpan.style.display = 'block';
                    } else {
                        const error = document.createElement('span');
                        error.id = `${field.id}-error`;
                        error.className = 'error-message';
                        error.textContent = 'Это поле обязательно для заполнения';
                        field.parentNode.appendChild(error);
                    }
                    
                    announceToScreenReader('Ошибка: поле обязательно для заполнения', 'assertive');
                } else {
                    field.removeAttribute('aria-invalid');
                    if (errorSpan) {
                        errorSpan.style.display = 'none';
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                // Фокус на первое поле с ошибкой
                const firstError = form.querySelector('[aria-invalid="true"]');
                if (firstError) {
                    firstError.focus();
                }
            }
        });
        
        // Очистка ошибок при вводе
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function() {
                const errorSpan = document.getElementById(`${this.id}-error`);
                if (errorSpan) {
                    errorSpan.style.display = 'none';
                }
                this.removeAttribute('aria-invalid');
            });
        });
    });

    // 5. Обработка Escape для модальных окон
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
            if (modal && modal.style.display !== 'none') {
                const closeButton = modal.querySelector('[aria-label*="закрыть"], [aria-label*="close"]');
                if (closeButton) {
                    closeButton.click();
                }
            }
        }
    });

    // 6. Улучшение доступности таблиц
    const tables = document.querySelectorAll('table:not([role])');
    tables.forEach(table => {
        if (!table.querySelector('th[scope]')) {
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                header.setAttribute('scope', 'col');
            });
            
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const firstCell = row.querySelector('th');
                if (firstCell) {
                    firstCell.setAttribute('scope', 'row');
                }
            });
        }
    });

    // 7. Динамическое обновление aria-current
    function updateAriaCurrent() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('nav a');
        
        links.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath || 
                (currentPath.endsWith('/') && linkPath === 'index.html') ||
                (linkPath === '/' && currentPath.endsWith('index.html'))) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
    
    updateAriaCurrent();

    // 8. Обработка кнопок с ролью button
    document.querySelectorAll('[role="button"]').forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // 9. Ленивая загрузка с доступностью
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        img.addEventListener('load', function() {
            this.setAttribute('data-loaded', 'true');
        });
        
        img.addEventListener('error', function() {
            this.setAttribute('alt', this.getAttribute('alt') + ' (изображение не загружено)');
            announceToScreenReader('Ошибка загрузки изображения', 'polite');
        });
    });

    // 10. Переключение темы с доступностью
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = document.body.classList.contains('theme-dark');
            document.body.classList.toggle('theme-dark');
            document.body.classList.toggle('theme-light');
            
            const newTheme = isDark ? 'светлая' : 'тёмная';
            this.textContent = `${isDark ? '🌙' : '☀️'} ${isDark ? 'Тёмная' : 'Светлая'} тема`;
            this.setAttribute('aria-label', `Переключить на ${newTheme} тему`);
            
            announceToScreenReader(`Тема изменена на ${newTheme}`, 'polite');
            
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });
        
        // Восстановление темы
        const savedTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (savedTheme === 'light') {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
            themeToggle.textContent = '🌙 Тёмная тема';
            themeToggle.setAttribute('aria-label', 'Переключить на тёмную тему');
        }
    }

    // 11. Проверка контраста
    function checkContrast() {
        const lowContrastElements = [];
        document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button').forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = style.backgroundColor;
            
            // Проверка контраста (упрощенная)
            if (color === bgColor || 
                (color.includes('rgb(255,255,255)') && bgColor.includes('rgb(255,255,255)'))) {
                lowContrastElements.push(el);
            }
        });
        
        if (lowContrastElements.length > 0 && !localStorage.getItem('contrast-warning-shown')) {
            announceToScreenReader('Внимание: обнаружены элементы с низкой контрастностью', 'polite');
            localStorage.setItem('contrast-warning-shown', 'true');
        }
    }
    
    setTimeout(checkContrast, 1000);

    // 12. Улучшение навигации с клавиатурой
    document.addEventListener('keydown', function(e) {
        // Ctrl + Alt + H - переход к заголовку
        if (e.ctrlKey && e.altKey && e.key === 'h') {
            e.preventDefault();
            const firstHeading = document.querySelector('h1, h2, h3, h4, h5, h6');
            if (firstHeading) {
                firstHeading.focus();
                announceToScreenReader('Переход к заголовку', 'polite');
            }
        }
        
        // Ctrl + Alt + M - переход к основному контенту
        if (e.ctrlKey && e.altKey && e.key === 'm') {
            e.preventDefault();
            const main = document.querySelector('main');
            if (main) {
                main.focus();
                announceToScreenReader('Переход к основному содержанию', 'polite');
            }
        }
        
        // Ctrl + Alt + F - переход к форме
        if (e.ctrlKey && e.altKey && e.key === 'f') {
            e.preventDefault();
            const form = document.querySelector('form');
            if (form) {
                form.focus();
                announceToScreenReader('Переход к форме', 'polite');
            }
        }
    });
});