document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            const fullName = form.querySelector('#full_name').value;
            const passport = form.querySelector('#passport_data').value;
            const birthDate = form.querySelector('#birth_date').value;

            if (!/^[А-Яа-яЁё\s]+$/.test(fullName)) {
                alert('ФИО должно содержать только кириллицу!');
                e.preventDefault();
            } else if (!/^\d{4}\s\d{6}$/.test(passport)) {
                alert('Паспорт должен быть в формате 1234 567890!');
                e.preventDefault();
            } else if (!birthDate) {
                alert('Укажите дату рождения!');
                e.preventDefault();
            }
        });
    }
});