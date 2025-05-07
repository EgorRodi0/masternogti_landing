import unittest
from app import app

class MasterNogtiAppTest(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_successful_submission(self):
        response = self.client.post('/', data={
            'client_name': 'Анна Иванова',
            'phone': '+79991234567',
            'service': 'Маникюр',
            'appointment_date': '2025-05-01T10:00'  # Изменен формат
        })
        self.assertEqual(response.status_code, 302)  # Redirect to success

    def test_invalid_phone(self):
        response = self.client.post('/', data={
            'client_name': 'Анна Иванова',
            'phone': '123456',
            'service': 'Маникюр',
            'appointment_date': '2025-05-01T10:00'
        })
        self.assertIn('Некорректный формат телефона'.encode('utf-8'), response.data)

    def test_invalid_time(self):
        response = self.client.post('/', data={
            'client_name': 'Анна Иванова',
            'phone': '+79991234567',
            'service': 'Маникюр',
            'appointment_date': '2025-05-01T21:00'
        })
        self.assertIn('Запись возможна только с 10:00 до 20:00'.encode('utf-8'), response.data)

    def test_invalid_datetime_format(self):
        response = self.client.post('/', data={
            'client_name': 'Анна Иванова',
            'phone': '+79991234567',
            'service': 'Маникюр',
            'appointment_date': '2025-05-01 10:00'  # Некорректный формат
        })
        self.assertIn('Некорректный формат даты и времени'.encode('utf-8'), response.data)

if __name__ == '__main__':
    unittest.main()