document.addEventListener('DOMContentLoaded', () => {
    // Добавление класса .scrolled для хедера при скролле
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Предотвращение скролла при клике на collapse-ссылки
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // Управление кастомным выпадающим списком
    const timeToggle = document.getElementById('time-toggle');
    const timeMenu = document.getElementById('time-menu');
    if (timeToggle && timeMenu) {
        timeToggle.addEventListener('click', () => {
            timeMenu.classList.toggle('show');
        });

        // Закрытие меню при клике вне
        document.addEventListener('click', (e) => {
            if (!timeToggle.contains(e.target) && !timeMenu.contains(e.target)) {
                timeMenu.classList.remove('show');
            }
        });

        // Обновление текста в toggle при выборе чекбоксов
        const checkboxes = timeMenu.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedTimes = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                timeToggle.textContent = selectedTimes.length > 0 
                    ? selectedTimes.join(', ') 
                    : 'Выберите время';
            });
        });
    }

    // Валидация формы с кастомными сообщениями
    const form = document.querySelector('form');
    if (form) {
        const errorContainer = document.createElement('div');
        errorContainer.classList.add('error-messages');
        errorContainer.style.color = 'red';
        errorContainer.style.marginBottom = '15px';
        errorContainer.style.display = 'none';
        form.insertBefore(errorContainer, form.firstChild);

        form.addEventListener('submit', (e) => {
            const name = form.querySelector('#name').value;
            const phone = form.querySelector('#phone').value;
            const service = form.querySelector('#service').value;
            const date = form.querySelector('#appointment_date').value;
            const timeCheckboxes = form.querySelectorAll('input[name="appointment_time[]"]:checked');
            const time = Array.from(timeCheckboxes).map(cb => cb.value);
            const consent = form.querySelector('#consent').checked;
            let errors = [];

            if (!name || !/^[А-Яа-яЁё\s]+$/.test(name)) {
                errors.push('Имя должно содержать только кириллицу!');
                form.querySelector('#name').classList.add('is-invalid');
            } else {
                form.querySelector('#name').classList.remove('is-invalid');
            }
            if (!phone || !/^\+7[0-9]{10}$/.test(phone)) {
                errors.push('Телефон должен быть в формате +79991234567!');
                form.querySelector('#phone').classList.add('is-invalid');
            } else {
                form.querySelector('#phone').classList.remove('is-invalid');
            }
            if (!service || !['manicure', 'pedicure', 'combo'].includes(service)) {
                errors.push('Выберите корректную услугу!');
                form.querySelector('#service').classList.add('is-invalid');
            } else {
                form.querySelector('#service').classList.remove('is-invalid');
            }
            if (!date) {
                errors.push('Выберите дату!');
                form.querySelector('#appointment_date').classList.add('is-invalid');
            } else {
                const selectedDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    errors.push('Дата записи не может быть в прошлом!');
                    form.querySelector('#appointment_date').classList.add('is-invalid');
                } else {
                    form.querySelector('#appointment_date').classList.remove('is-invalid');
                }
            }
            if (time.length === 0) {
                errors.push('Выберите хотя бы один временной интервал!');
                form.querySelector('.custom-dropdown').classList.add('is-invalid');
            } else {
                form.querySelector('.custom-dropdown').classList.remove('is-invalid');
            }
            if (!consent) {
                errors.push('Необходимо согласиться на обработку персональных данных!');
                form.querySelector('#consent').classList.add('is-invalid');
            } else {
                form.querySelector('#consent').classList.remove('is-invalid');
            }

            if (errors.length > 0) {
                e.preventDefault();
                errorContainer.innerHTML = errors.join('<br>');
                errorContainer.style.display = 'block';
            } else {
                errorContainer.style.display = 'none';
            }
        });

        form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                errorContainer.style.display = 'none';
                input.classList.remove('is-invalid');
            });
        });
    }

    // Плавный скролл для ссылок с учетом высоты хедера
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Анимация появления элементов при скролле
    const animateElements = document.querySelectorAll('.animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const animation = entry.target.getAttribute('data-animation');
                entry.target.style.animationName = animation;
                entry.target.style.animationDuration = '1s';
                const delay = entry.target.getAttribute('data-delay') || '0s';
                entry.target.style.animationDelay = delay;
            }
        });
    }, { threshold: 0.2 });

    animateElements.forEach(element => observer.observe(element));

    // Инициализация Fancybox
    Fancybox.bind('[data-fancybox="gallery"]', {
        loop: true,
        buttons: [
            "zoom",
            "slideShow",
            "fullScreen",
            "thumbs",
            "close"
        ],
        animationEffect: "zoom",
        transitionEffect: "slide"
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                document.querySelector('.navbar-toggler').click();
            }
        });
    });

    // Закрытие меню при клике на кнопку закрытия
    const closeMenu = document.querySelector('.close-menu');
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            document.querySelector('.navbar-toggler').click();
        });
    } else {
        console.error('Кнопка закрытия меню (.close-menu) не найдена');
    }
});