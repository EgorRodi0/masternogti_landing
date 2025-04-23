document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            const name = form.querySelector('#client_name').value;
            const phone = form.querySelector('#phone').value;
            const date = form.querySelector('#appointment_date').value;

            if (!/^[А-Яа-яЁё\s]+$/.test(name)) {
                alert('Имя должно содержать только кириллицу!');
                e.preventDefault();
            } else if (!/^\+7[0-9]{10}$/.test(phone)) {
                alert('Телефон должен быть в формате +79991234567!');
                e.preventDefault();
            } else if (!date) {
                alert('Укажите дату и время!');
                e.preventDefault();
            }
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});