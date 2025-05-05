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
            const name = form.querySelector('#client_name').value;
            const phone = form.querySelector('#phone').value;
            const date = form.querySelector('#appointment_date').value;
            let errors = [];

            if (!/^[А-Яа-яЁё\s]+$/.test(name)) {
                errors.push('Имя должно содержать только кириллицу!');
            }
            if (!/^\+7[0-9]{10}$/.test(phone)) {
                errors.push('Телефон должен быть в формате +79991234567!');
            }
            if (!date) {
                errors.push('Укажите дату и время!');
            } else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) {
                errors.push('Некорректный формат даты и времени (ГГГГ-ММ-ДД ЧЧ:ММ)!');
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

    // Прозрачность хедера и смена логотипа при скролле
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
        console.error('Navbar не найден');
        return;
    }
    navbar.classList.remove('scrolled');

    // Получаем пути к логотипам из атрибутов data-*
    const logoPaths = document.querySelector('#logo-paths');
    const logo = document.querySelector('#logo');

    // Проверка наличия элементов
    if (!logoPaths || !logo) {
        console.error('Не найдены элементы:', { logoPaths, logo });
        return;
    }

    const defaultLogo = logoPaths.getAttribute('data-default-logo');
    const altLogo = logoPaths.getAttribute('data-alt-logo');

    // Проверка путей
    if (!defaultLogo || !altLogo) {
        console.error('Пути к логотипам не найдены:', { defaultLogo, altLogo });
        return;
    }

    console.log('Пути к логотипам:', { defaultLogo, altLogo });

    // Функция для смены логотипа с предотвращением кэширования
    const setLogo = (logoElement, src) => {
        const timestamp = new Date().getTime();
        logoElement.src = `${src}?t=${timestamp}`;
    };

    window.addEventListener('scroll', () => {
        // Прозрачность хедера и смена логотипа
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            setLogo(logo, altLogo); // Меняем логотип на альтернативный
        } else {
            navbar.classList.remove('scrolled');
            setLogo(logo, defaultLogo); // Возвращаем основной логотип
        }
    });
});