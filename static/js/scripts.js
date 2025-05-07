document.addEventListener('DOMContentLoaded', () => {
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
            const consent = form.querySelector('#consent').checked;
            let errors = [];

            if (!name || !/^[А-Яа-яЁё\s]+$/.test(name)) {
                errors.push('Имя должно содержать только кириллицу!');
            }
            if (!phone || !/^\+7[0-9]{10}$/.test(phone)) {
                errors.push('Телефон должен быть в формате +79991234567!');
            }
            if (!service || !['manicure', 'pedicure', 'combo'].includes(service)) {
                errors.push('Выберите корректную услугу!');
            }
            if (!date || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) {
                errors.push('Некорректный формат даты и времени (ГГГГ-ММ-ДД ЧЧ:ММ)!');
            } else {
                const selectedDate = new Date(date);
                const hours = selectedDate.getHours();
                if (hours < 10 || hours >= 20) {
                    errors.push('Запись возможна только с 10:00 до 20:00!');
                }
                if (selectedDate < new Date()) {
                    errors.push('Дата записи не может быть в прошлом!');
                }
            }
            if (!consent) {
                errors.push('Необходимо согласиться на обработку персональных данных!');
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

    // Прозрачность хедера и смена логотипа при скролле
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
        console.error('Navbar не найден');
        return;
    }
    navbar.classList.remove('scrolled');

    const logoPaths = document.querySelector('#logo-paths');
    const logo = document.querySelector('#logo');

    if (!logoPaths || !logo) {
        console.error('Не найдены элементы:', { logoPaths, logo });
        return;
    }

    const defaultLogo = logoPaths.getAttribute('data-default-logo');
    const altLogo = logoPaths.getAttribute('data-alt-logo');

    if (!defaultLogo || !altLogo) {
        console.error('Пути к логотипам не найдены:', { defaultLogo, altLogo });
        return;
    }

    const setLogo = (logoElement, src) => {
        const timestamp = new Date().getTime();
        logoElement.style.opacity = 0;
        setTimeout(() => {
            logoElement.src = `${src}?t=${timestamp}`;
            logoElement.style.opacity = 1;
        }, 300);
    };

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            setLogo(logo, altLogo);
        } else {
            navbar.classList.remove('scrolled');
            setLogo(logo, defaultLogo);
        }
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