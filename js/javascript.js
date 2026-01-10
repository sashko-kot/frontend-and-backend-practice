// Theme is managed in `js/a11.js` (keeps a11y and announceToScreenReader centralized).

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

    // Theme handled by `js/a11.js`. Do not duplicate theme logic here to avoid conflicts.

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

// Специфичный для страницы контактов JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 1. Управление FAQ
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const answerId = this.getAttribute('aria-controls');
            const answer = document.getElementById(answerId);
            const icon = this.querySelector('.faq-icon');
            
            // Переключаем состояние
            this.setAttribute('aria-expanded', !isExpanded);
            answer.hidden = isExpanded;
            
            // Меняем иконку
            if (isExpanded) {
                icon.textContent = '➕';
                announceToScreenReader('Ответ скрыт', 'polite');
            } else {
                icon.textContent = '➖';
                announceToScreenReader('Ответ открыт', 'polite');
            }
        });
        
        // Добавляем поддержку клавиатуры
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // 2. Кнопки "Развернуть/Свернуть все"
    const expandAllBtn = document.getElementById('expand-all-faq');
    const collapseAllBtn = document.getElementById('collapse-all-faq');
    
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function() {
            faqToggles.forEach(toggle => {
                if (toggle.getAttribute('aria-expanded') === 'false') {
                    toggle.click();
                }
            });
            announceToScreenReader('Все ответы развернуты', 'polite');
        });
    }
    
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', function() {
            faqToggles.forEach(toggle => {
                if (toggle.getAttribute('aria-expanded') === 'true') {
                    toggle.click();
                }
            });
            announceToScreenReader('Все ответы свернуты', 'polite');
        });
    }
    
    // 3. Счетчик символов в текстовом поле
    const messageTextarea = document.getElementById('contactMessage');
    const charCounter = document.getElementById('message-counter');
    
    if (messageTextarea && charCounter) {
        const maxLength = parseInt(messageTextarea.getAttribute('maxlength')) || 1000;
        
        function updateCharCounter() {
            const currentLength = messageTextarea.value.length;
            const remaining = maxLength - currentLength;
            
            charCounter.textContent = `Осталось символов: ${remaining}`;
            charCounter.setAttribute('aria-label', `Осталось ${remaining} символов из ${maxLength}`);
            
            // Меняем цвет при приближении к лимиту
            if (remaining < 100) {
                charCounter.style.color = 'var(--warning-color)';
            } else if (remaining < 50) {
                charCounter.style.color = 'var(--error-color)';
            } else {
                charCounter.style.color = '';
            }
        }
        
        messageTextarea.addEventListener('input', updateCharCounter);
        updateCharCounter(); // Инициализация
    }
    
    // 4. Простая CAPTCHA
    const captchaQuestion = document.getElementById('captcha-question');
    const refreshCaptchaBtn = document.getElementById('refresh-captcha');
    let captchaAnswer = 0;
    
    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        let question = '';
        let answer = 0;
        
        switch(operator) {
            case '+':
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
                break;
            case '-':
                question = `${num1} - ${num2}`;
                answer = num1 - num2;
                break;
            case '*':
                question = `${num1} × ${num2}`;
                answer = num1 * num2;
                break;
        }
        
        captchaQuestion.textContent = question;
        captchaAnswer = answer;
        
        // Для скринридеров
        const captchaInput = document.getElementById('captcha');
        captchaInput.setAttribute('aria-label', `Введите результат: ${question}`);
        
        return answer;
    }
    
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', function() {
            generateCaptcha();
            announceToScreenReader('Новый проверочный вопрос сгенерирован', 'polite');
        });
        
        // Инициализация CAPTCHA
        generateCaptcha();
    }
    
    // 5. Валидация CAPTCHA
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const captchaInput = document.getElementById('captcha');
            const userAnswer = parseInt(captchaInput.value);
            const captchaError = document.getElementById('captcha-error');
            
            if (userAnswer !== captchaAnswer) {
                e.preventDefault();
                captchaInput.setAttribute('aria-invalid', 'true');
                captchaError.textContent = 'Неверный ответ. Попробуйте еще раз.';
                captchaError.style.display = 'block';
                
                announceToScreenReader('Ошибка проверки безопасности. Неверный ответ', 'assertive');
                
                // Сфокусироваться на поле CAPTCHA
                captchaInput.focus();
                
                // Сгенерировать новую CAPTCHA
                generateCaptcha();
            } else {
                captchaInput.removeAttribute('aria-invalid');
                captchaError.style.display = 'none';
            }
        });
    }
    
    // 6. Сохранение черновика
    const saveDraftBtn = document.getElementById('save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };
            
            localStorage.setItem('contactFormDraft', JSON.stringify(formData));
            
            // Показать уведомление
            const statusDiv = document.getElementById('form-status');
            statusDiv.textContent = 'Черновик сохранен. Вы можете продолжить позже.';
            statusDiv.style.display = 'block';
            
            announceToScreenReader('Черновик формы сохранен', 'polite');
            
            // Скрыть уведомление через 5 секунд
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        });
        
        // Восстановление черновика при загрузке
        const savedDraft = localStorage.getItem('contactFormDraft');
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (confirm('У вас есть сохраненный черновик. Восстановить его?')) {
                    document.getElementById('contactName').value = draft.name || '';
                    document.getElementById('contactEmail').value = draft.email || '';
                    document.getElementById('contactSubject').value = draft.subject || '';
                    document.getElementById('contactMessage').value = draft.message || '';
                    
                    announceToScreenReader('Черновик восстановлен', 'polite');
                }
            } catch (e) {
                console.error('Error parsing saved draft:', e);
            }
        }
    }
    
    // 7. Инструменты доступности
    const increaseTextBtn = document.getElementById('increase-text');
    const decreaseTextBtn = document.getElementById('decrease-text');
    const highContrastBtn = document.getElementById('high-contrast-mode');
    const readAloudBtn = document.getElementById('read-aloud');
    
    let currentFontSize = 100;
    
    if (increaseTextBtn) {
        increaseTextBtn.addEventListener('click', function() {
            if (currentFontSize < 200) {
                currentFontSize += 10;
                document.documentElement.style.fontSize = `${currentFontSize}%`;
                announceToScreenReader(`Размер текста увеличен до ${currentFontSize}%`, 'polite');
            } else {
                announceToScreenReader('Максимальный размер текста достигнут', 'polite');
            }
        });
    }
    
    if (decreaseTextBtn) {
        decreaseTextBtn.addEventListener('click', function() {
            if (currentFontSize > 80) {
                currentFontSize -= 10;
                document.documentElement.style.fontSize = `${currentFontSize}%`;
                announceToScreenReader(`Размер текста уменьшен до ${currentFontSize}%`, 'polite');
            } else {
                announceToScreenReader('Минимальный размер текста достигнут', 'polite');
            }
        });
    }
    
    if (highContrastBtn) {
        let highContrastEnabled = false;
        
        highContrastBtn.addEventListener('click', function() {
            highContrastEnabled = !highContrastEnabled;
            document.body.classList.toggle('high-contrast', highContrastEnabled);
            
            const status = highContrastEnabled ? 'включена' : 'выключена';
            this.textContent = highContrastEnabled ? '🎨 Обычная контрастность' : '🎨 Высокая контрастность';
            this.setAttribute('aria-label', highContrastEnabled ? 
                'Отключить режим высокой контрастности' : 
                'Включить режим высокой контрастности');
            
            announceToScreenReader(`Высокая контрастность ${status}`, 'polite');
        });
    }
    
    if (readAloudBtn) {
        let isReading = false;
        let speechInstance = null;
        
        readAloudBtn.addEventListener('click', function() {
            if ('speechSynthesis' in window) {
                if (!isReading) {
                    // Начать чтение
                    const mainContent = document.querySelector('main').textContent;
                    const utterance = new SpeechSynthesisUtterance(mainContent);
                    utterance.lang = 'ru-RU';
                    utterance.rate = 1;
                    utterance.pitch = 1;
                    utterance.volume = 1;
                    
                    speechSynthesis.speak(utterance);
                    speechInstance = utterance;
                    
                    this.textContent = '🔇 Остановить чтение';
                    this.setAttribute('aria-label', 'Остановить чтение вслух');
                    isReading = true;
                    
                    announceToScreenReader('Чтение текста начато', 'polite');
                    
                    // Обработчик завершения
                    utterance.onend = function() {
                        isReading = false;
                        readAloudBtn.textContent = '🔊 Читать вслух';
                        readAloudBtn.setAttribute('aria-label', 'Читать текст вслух');
                        announceToScreenReader('Чтение текста завершено', 'polite');
                    };
                } else {
                    // Остановить чтение
                    speechSynthesis.cancel();
                    isReading = false;
                    this.textContent = '🔊 Читать вслух';
                    this.setAttribute('aria-label', 'Читать текст вслух');
                    announceToScreenReader('Чтение текста остановлено', 'polite');
                }
            } else {
                alert('Ваш браузер не поддерживает чтение текста вслух.');
            }
        });
    }
    
    // Управление фильтрами проектов (доступная клавиатурная поддержка)
    const projectFilterLabels = document.querySelectorAll('.projects__filter');
    const projectCards = document.querySelectorAll('.project-card');

    if (projectFilterLabels.length > 0 && projectCards.length > 0) {
        function applyProjectFilters() {
            const activeFilters = Array.from(projectFilterLabels).filter(l => l.getAttribute('aria-pressed') === 'true').map(l => l.dataset.filter);

            // If 'all' is active or no filters selected, show all
            if (activeFilters.length === 0 || activeFilters.includes('all')) {
                projectCards.forEach(card => card.hidden = false);
                return;
            }

            projectCards.forEach(card => {
                const tags = (card.dataset.tags || '').split(/\s+/);
                const matches = tags.some(t => activeFilters.includes(t));
                card.hidden = !matches;
            });
        }

        projectFilterLabels.forEach(label => {
            // Initialize state from associated input if present
            const inputId = label.getAttribute('for');
            const input = inputId ? document.getElementById(inputId) : null;
            if (input) {
                const pressed = input.checked;
                label.setAttribute('aria-pressed', pressed ? 'true' : 'false');
                label.classList.toggle('projects__filter--active', pressed);
            }

            label.addEventListener('click', function() {
                // Toggle aria-pressed and synced input
                const isPressed = this.getAttribute('aria-pressed') === 'true';
                const newState = !isPressed;
                this.setAttribute('aria-pressed', newState ? 'true' : 'false');
                this.classList.toggle('projects__filter--active', newState);
                if (input) input.checked = newState;

                // If 'all' selected, clear others
                if (this.dataset.filter === 'all' && newState) {
                    projectFilterLabels.forEach(l => {
                        if (l !== this) {
                            l.setAttribute('aria-pressed', 'false');
                            l.classList.remove('projects__filter--active');
                            const otherInputId = l.getAttribute('for');
                            if (otherInputId) {
                                const otherInput = document.getElementById(otherInputId);
                                if (otherInput) otherInput.checked = false;
                            }
                        }
                    });
                } else if (this.dataset.filter !== 'all' && newState) {
                    // If any other selected, unselect 'all'
                    projectFilterLabels.forEach(l => {
                        if (l.dataset.filter === 'all') {
                            l.setAttribute('aria-pressed', 'false');
                            l.classList.remove('projects__filter--active');
                            const allInputId = l.getAttribute('for');
                            if (allInputId) {
                                const allInput = document.getElementById(allInputId);
                                if (allInput) allInput.checked = false;
                            }
                        }
                    });
                }

                applyProjectFilters();
            });

            label.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Apply initial filter state
        applyProjectFilters();
    }
    
    // 8. Управление модальным окном настроек
    const a11ySettingsBtn = document.querySelector('.footer__a11y-btn');
    const a11yModal = document.getElementById('a11y-settings');
    const modalCloseBtns = document.querySelectorAll('.modal__close');
    
    if (a11ySettingsBtn && a11yModal) {
        a11ySettingsBtn.addEventListener('click', function() {
            a11yModal.hidden = false;
            a11yModal.setAttribute('aria-hidden', 'false');
            
            // Фокусируемся на первом элементе модального окна
            const firstFocusable = a11yModal.querySelector('button, input, select, textarea');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Обновляем состояние кнопки
            this.setAttribute('aria-expanded', 'true');
            announceToScreenReader('Открыты настройки доступности', 'polite');
            
            // Ловим фокус внутри модалки
            trapFocus(a11yModal);
        });
        
        // Закрытие модального окна
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                a11yModal.hidden = true;
                a11yModal.setAttribute('aria-hidden', 'true');
                a11ySettingsBtn.setAttribute('aria-expanded', 'false');
                a11ySettingsBtn.focus();
                announceToScreenReader('Настройки доступности закрыты', 'polite');
            });
        });
        
        // Закрытие по Escape
        a11yModal.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.hidden = true;
                this.setAttribute('aria-hidden', 'true');
                a11ySettingsBtn.setAttribute('aria-expanded', 'false');
                a11ySettingsBtn.focus();
            }
        });
        
        // Закрытие по клику вне модального окна
        a11yModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.hidden = true;
                this.setAttribute('aria-hidden', 'true');
                a11ySettingsBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    else if (a11ySettingsBtn && !a11yModal) {
        // If modal isn't present on this page, navigate to the contacts page where settings live.
        a11ySettingsBtn.addEventListener('click', function() {
            // Use a root-relative path so it works from pages/ and root.
            window.location.href = '/pages/contacts.html#a11y-settings';
        });
    }
    
    // 9. Применение настроек доступности
    const applySettingsBtn = document.getElementById('apply-a11y-settings');
    const resetSettingsBtn = document.getElementById('reset-a11y-settings');
    
    if (applySettingsBtn) {
        applySettingsBtn.addEventListener('click', function() {
            // Получаем значения из формы
            const fontSize = document.getElementById('font-size-setting').value;
            const lineHeight = document.getElementById('line-height-setting').value;
            const letterSpacing = document.getElementById('letter-spacing-setting').value;
            const highContrast = document.getElementById('high-contrast-setting').checked;
            const invertColors = document.getElementById('invert-colors-setting').checked;
            const grayscale = document.getElementById('grayscale-setting').checked;
            const reduceMotion = document.getElementById('reduce-motion-setting').checked;
            const disableAnimations = document.getElementById('disable-animations-setting').checked;
            const highlightFocus = document.getElementById('highlight-focus-setting').checked;
            const outlineLinks = document.getElementById('outline-links-setting').checked;
            const focusThickness = document.getElementById('focus-thickness-setting').value;
            
            // Применяем настройки
            document.documentElement.style.setProperty('--font-size-multiplier', `${fontSize / 100}`);
            document.documentElement.style.setProperty('--line-height', lineHeight);
            document.documentElement.style.setProperty('--letter-spacing', `${letterSpacing}px`);
            document.documentElement.style.setProperty('--focus-thickness', `${focusThickness}px`);
            
            // Применяем классы
            document.body.classList.toggle('high-contrast', highContrast);
            document.body.classList.toggle('invert-colors', invertColors);
            document.body.classList.toggle('grayscale', grayscale);
            document.body.classList.toggle('reduce-motion', reduceMotion);
            document.body.classList.toggle('no-animations', disableAnimations);
            document.body.classList.toggle('highlight-focus', highlightFocus);
                        document.body.classList.toggle('outline-links', outlineLinks);
            
            // Сохраняем настройки
            const settings = {
                fontSize,
                lineHeight,
                letterSpacing,
                highContrast,
                invertColors,
                grayscale,
                reduceMotion,
                disableAnimations,
                highlightFocus,
                outlineLinks,
                focusThickness,
                applied: true
            };
            
            localStorage.setItem('a11ySettings', JSON.stringify(settings));
            
            // Закрываем модальное окно
            a11yModal.hidden = true;
            a11yModal.setAttribute('aria-hidden', 'true');
            a11ySettingsBtn.setAttribute('aria-expanded', 'false');
            
            announceToScreenReader('Настройки доступности применены', 'polite');
        });
    }
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', function() {
            // Сбрасываем все настройки к значениям по умолчанию
            document.documentElement.style.removeProperty('--font-size-multiplier');
            document.documentElement.style.removeProperty('--line-height');
            document.documentElement.style.removeProperty('--letter-spacing');
            document.documentElement.style.removeProperty('--focus-thickness');
            
            // Удаляем все классы настроек
            document.body.classList.remove('high-contrast', 'invert-colors', 'grayscale', 
                                          'reduce-motion', 'no-animations', 'highlight-focus', 
                                          'outline-links');
            
            // Сбрасываем значения полей формы
            document.getElementById('font-size-setting').value = 100;
            document.getElementById('line-height-setting').value = 1.6;
            document.getElementById('letter-spacing-setting').value = 0;
            document.getElementById('focus-thickness-setting').value = 3;
            
            document.getElementById('high-contrast-setting').checked = false;
            document.getElementById('invert-colors-setting').checked = false;
            document.getElementById('grayscale-setting').checked = false;
            document.getElementById('reduce-motion-setting').checked = false;
            document.getElementById('disable-animations-setting').checked = false;
            document.getElementById('highlight-focus-setting').checked = true;
            document.getElementById('outline-links-setting').checked = true;
            
            // Удаляем сохраненные настройки
            localStorage.removeItem('a11ySettings');
            
            announceToScreenReader('Настройки доступности сброшены к стандартным', 'polite');
        });
    }
    
    // 10. Восстановление сохраненных настроек при загрузке
    function loadSavedSettings() {
        const savedSettings = localStorage.getItem('a11ySettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                if (settings.applied) {
                    // Применяем числовые настройки
                    if (settings.fontSize) {
                        document.documentElement.style.setProperty('--font-size-multiplier', `${settings.fontSize / 100}`);
                        const el = document.getElementById('font-size-setting');
                        if (el) el.value = settings.fontSize;
                        const out = document.getElementById('font-size-value');
                        if (out) out.textContent = `${settings.fontSize}%`;
                    }

                    if (settings.lineHeight) {
                        document.documentElement.style.setProperty('--line-height', settings.lineHeight);
                        const el = document.getElementById('line-height-setting');
                        if (el) el.value = settings.lineHeight;
                        const out = document.getElementById('line-height-value');
                        if (out) out.textContent = settings.lineHeight;
                    }

                    if (settings.letterSpacing) {
                        document.documentElement.style.setProperty('--letter-spacing', `${settings.letterSpacing}px`);
                        const el = document.getElementById('letter-spacing-setting');
                        if (el) el.value = settings.letterSpacing;
                        const out = document.getElementById('letter-spacing-value');
                        if (out) out.textContent = `${settings.letterSpacing}px`;
                    }

                    if (settings.focusThickness) {
                        document.documentElement.style.setProperty('--focus-thickness', `${settings.focusThickness}px`);
                        const el = document.getElementById('focus-thickness-setting');
                        if (el) el.value = settings.focusThickness;
                        const out = document.getElementById('focus-thickness-value');
                        if (out) out.textContent = `${settings.focusThickness}px`;
                    }
                    
                    // Применяем булевы настройки
                    document.body.classList.toggle('high-contrast', settings.highContrast);
                    document.body.classList.toggle('invert-colors', settings.invertColors);
                    document.body.classList.toggle('grayscale', settings.grayscale);
                    document.body.classList.toggle('reduce-motion', settings.reduceMotion);
                    document.body.classList.toggle('no-animations', settings.disableAnimations);
                    document.body.classList.toggle('highlight-focus', settings.highlightFocus);
                    document.body.classList.toggle('outline-links', settings.outlineLinks);
                    
                    // Устанавливаем значения чекбоксов (только если элементы есть на странице)
                    const hc = document.getElementById('high-contrast-setting'); if (hc) hc.checked = !!settings.highContrast;
                    const inv = document.getElementById('invert-colors-setting'); if (inv) inv.checked = !!settings.invertColors;
                    const gray = document.getElementById('grayscale-setting'); if (gray) gray.checked = !!settings.grayscale;
                    const reduce = document.getElementById('reduce-motion-setting'); if (reduce) reduce.checked = !!settings.reduceMotion;
                    const disable = document.getElementById('disable-animations-setting'); if (disable) disable.checked = !!settings.disableAnimations;
                    const highlight = document.getElementById('highlight-focus-setting'); if (highlight) highlight.checked = !!settings.highlightFocus;
                    const outline = document.getElementById('outline-links-setting'); if (outline) outline.checked = !!settings.outlineLinks;
                    
                    announceToScreenReader('Сохраненные настройки доступности восстановлены', 'polite');
                }
            } catch (e) {
                console.error('Error loading saved settings:', e);
            }
        }
    }
    
    // Загружаем настройки при загрузке страницы
    loadSavedSettings();

    // Если пользователь пришёл по якорю к настройкам доступности, откроем модал (если он на этой странице)
    if (window.location.hash === '#a11y-settings' && typeof a11yModal !== 'undefined' && a11yModal) {
        a11yModal.hidden = false;
        a11yModal.setAttribute('aria-hidden', 'false');
        const firstFocusable = a11yModal.querySelector('button, input, select, textarea');
        if (firstFocusable) firstFocusable.focus();
        if (typeof announceToScreenReader === 'function') announceToScreenReader('Открыты настройки доступности', 'polite');
        if (typeof trapFocus === 'function') trapFocus(a11yModal);
    }
    
    // 11. Управление уведомлением о куки
    const cookieNotice = document.getElementById('cookie-notice');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const rejectCookiesBtn = document.getElementById('reject-cookies');
    const cookieSettingsBtn = document.getElementById('cookie-settings');
    
    // Проверяем, было ли принято решение по куки
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (cookieNotice && !cookiesAccepted) {
        // Показываем уведомление через 2 секунды после загрузки
        setTimeout(() => {
            cookieNotice.style.display = 'block';
            cookieNotice.setAttribute('aria-hidden', 'false');
            announceToScreenReader('Уведомление об использовании cookies. Используем cookies для сохранения ваших настроек доступности.', 'polite');
        }, 2000);
        
        // Принять все куки
        if (acceptCookiesBtn) {
            acceptCookiesBtn.addEventListener('click', function() {
                localStorage.setItem('cookiesAccepted', 'true');
                localStorage.setItem('cookiesFunctional', 'true');
                localStorage.setItem('cookiesAnalytics', 'true');
                localStorage.setItem('cookiesMarketing', 'true');
                
                cookieNotice.style.display = 'none';
                cookieNotice.setAttribute('aria-hidden', 'true');
                announceToScreenReader('Cookies приняты', 'polite');
            });
        }
        
        // Отклонить куки
        if (rejectCookiesBtn) {
            rejectCookiesBtn.addEventListener('click', function() {
                localStorage.setItem('cookiesAccepted', 'false');
                localStorage.setItem('cookiesFunctional', 'false');
                localStorage.setItem('cookiesAnalytics', 'false');
                localStorage.setItem('cookiesMarketing', 'false');
                
                // Удаляем сохраненные настройки (так как они хранятся в куки/LocalStorage)
                localStorage.removeItem('a11ySettings');
                localStorage.removeItem('contactFormDraft');
                
                cookieNotice.style.display = 'none';
                cookieNotice.setAttribute('aria-hidden', 'true');
                announceToScreenReader('Cookies отклонены. Некоторые функции могут быть недоступны.', 'polite');
            });
        }
        
        // Настройки куки
        if (cookieSettingsBtn) {
            cookieSettingsBtn.addEventListener('click', function() {
                // Здесь можно открыть более детальные настройки куки
                alert('Настройки cookies будут доступны в будущих версиях сайта.');
            });
        }
    } else if (cookieNotice) {
        // Если решение уже принято, скрываем уведомление
        cookieNotice.style.display = 'none';
        cookieNotice.setAttribute('aria-hidden', 'true');
    }
    
    // 12. Обновление текущего статуса доступности
    function updateStatusIndicator() {
        const statusIndicator = document.querySelector('.status-indicator');
        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay(); // 0 - воскресенье, 1 - понедельник...
        
        let status = 'offline';
        let statusText = 'Сейчас недоступна';
        let statusLabel = 'Недоступна для связи';
        
        if (currentDay >= 1 && currentDay <= 5) { // Пн-Пт
            if (currentHour >= 10 && currentHour < 18) {
                status = 'online';
                statusText = 'Сейчас доступна';
                statusLabel = 'Доступна для связи';
            } else {
                status = 'offline';
                statusText = 'Сейчас недоступна (рабочие часы: 10:00-18:00)';
                statusLabel = 'Недоступна для связи';
            }
        } else if (currentDay === 6) { // Суббота
            if (currentHour >= 12 && currentHour < 16) {
                status = 'limited';
                statusText = 'Доступна ограниченно';
                statusLabel = 'Ограниченная доступность';
            } else {
                status = 'offline';
                statusText = 'Сейчас недоступна (суббота: 12:00-16:00)';
                statusLabel = 'Недоступна для связи';
            }
        } else { // Воскресенье
            status = 'offline';
            statusText = 'Выходной';
            statusLabel = 'Недоступна для связи';
        }
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${status}`;
            statusIndicator.textContent = statusText;
            statusIndicator.setAttribute('aria-label', statusLabel);
        }
    }
    
    // Обновляем статус при загрузке
    updateStatusIndicator();
    
    // Обновляем статус каждую минуту
    setInterval(updateStatusIndicator, 60000);
    
    // 13. Анимация отправки формы
const contactFormElement = document.getElementById('contactForm'); // Переименовали переменную
if (contactFormElement) {
    contactFormElement.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Показываем индикатор загрузки
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Отправка...';
        submitBtn.setAttribute('aria-label', 'Сообщение отправляется, пожалуйста, подождите');
        
        // Симуляция отправки (в реальном проекте здесь был бы AJAX запрос)
        setTimeout(() => {
            // Восстанавливаем кнопку
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.setAttribute('aria-label', 'Отправить сообщение');
            
            // Показываем сообщение об успехе
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.setAttribute('role', 'alert');
            successMessage.setAttribute('aria-live', 'assertive');
            successMessage.innerHTML = `
                <h4>✅ Сообщение отправлено!</h4>
                <p>Спасибо за ваше сообщение. Я отвечу вам в ближайшее время.</p>
                <button class="button button--small close-message" aria-label="Закрыть уведомление">
                    Закрыть
                </button>
            `;
            
            this.parentNode.insertBefore(successMessage, this.nextSibling);
            
            // Скролл к сообщению
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Очищаем форму
            this.reset();
            
            // Удаляем черновик
            localStorage.removeItem('contactFormDraft');
            
            // Обновляем CAPTCHA
            if (refreshCaptchaBtn) {
                refreshCaptchaBtn.click();
            }
            
            // Обработчик закрытия сообщения
            const closeBtn = successMessage.querySelector('.close-message');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    successMessage.remove();
                    announceToScreenReader('Уведомление об отправке закрыто', 'polite');
                });
            }
            
            // Автоматическое закрытие через 10 секунд
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 10000);
            
            announceToScreenReader('Сообщение успешно отправлено. Спасибо за обращение!', 'assertive');
        }, 2000);
        
        e.preventDefault(); // Убрать в реальном проекте
    });
}

// 14. Валидация форм в реальном времени
// Helper: validate a single field and show accessible error messages
function validateField(field) {
    if (!field) return true;
    const errorElement = document.getElementById(`${field.id}-error`);
    let valid = true;

    if (!field.checkValidity()) {
        valid = false;
        field.setAttribute('aria-invalid', 'true');

        let message = 'Неверное значение.';
        if (field.validity.valueMissing) {
            message = 'Это поле обязательно для заполнения';
        } else if (field.type === 'email' && field.validity.typeMismatch) {
            message = 'Введите корректный email';
        } else if (field.validity.tooShort) {
            const min = field.getAttribute('minlength') || '';
            message = `Слишком коротко${min ? `, минимум ${min} символов` : ''}`;
        } else if (field.validity.tooLong) {
            const max = field.getAttribute('maxlength') || '';
            message = `Слишком длинно${max ? `, максимум ${max} символов` : ''}`;
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        if (typeof announceToScreenReader === 'function') {
            announceToScreenReader(message, 'assertive');
        }
    } else {
        field.removeAttribute('aria-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    return valid;
}

const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select');
formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        validateField(this);
    });
    
    input.addEventListener('input', function() {
        // Скрываем ошибку при вводе
        const errorElement = document.getElementById(`${this.id}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
            this.removeAttribute('aria-invalid');
        }
    });
});

// 15. Управление фокусом для лучшей навигации
document.addEventListener('keydown', function(e) {
    // Ctrl + Alt + S - перейти к форме
    if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault();
        const contactFormEl = document.getElementById('contactForm'); // Переименовали
        if (contactFormEl) {
            contactFormEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const firstInput = contactFormEl.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
            announceToScreenReader('Переход к форме обратной связи', 'polite');
        }
    }
    
    // Ctrl + Alt + C - перейти к контактам
    if (e.ctrlKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        const contactInfo = document.getElementById('contact-info-title');
        if (contactInfo) {
            contactInfo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            contactInfo.focus();
            announceToScreenReader('Переход к контактной информации', 'polite');
        }
    }
    
    // Ctrl + Alt + F - перейти к FAQ
    if (e.ctrlKey && e.altKey && e.key === 'f') {
        e.preventDefault();
        const faqSection = document.getElementById('faq-title');
        if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            faqSection.focus();
            announceToScreenReader('Переход к часто задаваемым вопросам', 'polite');
        }
    }
    
    // Ctrl + Alt + A - перейти к заявлению о доступности
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        const a11yStatement = document.getElementById('a11y-statement-title');
        if (a11yStatement) {
            a11yStatement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            a11yStatement.focus();
            announceToScreenReader('Переход к заявлению о доступности', 'polite');
        }
    }
});
});