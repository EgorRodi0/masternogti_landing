# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, flash, redirect, url_for
import psycopg2
import logging
import re
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure encoding for Windows
if os.name == 'nt':
    os.system('chcp 65001 > nul')
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'masternogti-secret-key')
app.config['JSON_AS_ASCII'] = False

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('masternogti_app.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

def get_db_connection():
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME', 'masternogti_db'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '1234'),
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432')
        )
        logging.info("Database connected successfully")
        return conn
    except Exception as e:
        logging.error(f"Database connection error: {e}")
        return None

def validate_phone(phone):
    """Validate phone format (+7XXXXXXXXXX)."""
    return bool(re.match(r'^\+7[0-9]{10}$', phone))

def validate_datetime(datetime_str):
    """Validate datetime format (YYYY-MM-DDTHH:MM)."""
    return bool(re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$', datetime_str))

def sanitize_input(data):
    """Sanitize input data."""
    if not data:
        return None
    return str(data).strip()

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/submit", methods=["POST"])
def submit_form():
    client_name = sanitize_input(request.form.get("client_name"))
    phone = sanitize_input(request.form.get("phone"))
    service = sanitize_input(request.form.get("service"))
    appointment_date = sanitize_input(request.form.get("appointment_date"))

    if not all([client_name, phone, service, appointment_date]):
        flash("Все поля обязательны!", "danger")
        return redirect(url_for('index') + '#form')
    elif not re.match(r'^[А-Яа-яЁё\s]+$', client_name):
        flash("Имя должно содержать только кириллицу!", "danger")
        return redirect(url_for('index') + '#form')
    elif not validate_phone(phone):
        flash("Некорректный формат телефона (+7XXXXXXXXXX)!", "danger")
        return redirect(url_for('index') + '#form')
    elif not validate_datetime(appointment_date):
        flash("Некорректный формат даты и времени (ГГГГ-ММ-ДД ЧЧ:ММ, например, 2025-05-01 10:00)!", "danger")
        return redirect(url_for('index') + '#form')
    elif service not in ['manicure', 'pedicure', 'combo']:
        flash("Выберите корректную услугу!", "danger")
        return redirect(url_for('index') + '#form')
    else:
        # Преобразуем формат даты из YYYY-MM-DDTHH:MM в YYYY-MM-DD HH:MM:SS для PostgreSQL
        try:
            formatted_date = datetime.strptime(appointment_date, '%Y-%m-%dT%H:%M').strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            flash("Ошибка в формате даты и времени!", "danger")
            return redirect(url_for('index') + '#form')

        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """INSERT INTO appointments (client_name, phone, service, appointment_date)
                           VALUES (%s, %s, %s, %s) RETURNING id;""",
                        (client_name, phone, service, formatted_date)
                    )
                    appointment_id = cur.fetchone()[0]
                    conn.commit()
                    logging.info(f"New appointment added, ID: {appointment_id}")
                    return redirect(url_for('success'))
            except psycopg2.Error as e:
                conn.rollback()
                logging.error(f"Database error: {e}")
                if "прошлом" in str(e):
                    flash("Дата записи не может быть в прошлом!", "danger")
                elif "Время" in str(e):
                    flash("Выбранное время уже занято!", "danger")
                elif "10:00 до 20:00" in str(e):
                    flash("Запись возможна только с 10:00 до 20:00!", "danger")
                else:
                    flash("Ошибка при записи!", "danger")
                return redirect(url_for('index') + '#form')
            finally:
                conn.close()
        else:
            flash("Ошибка подключения к базе данных!", "danger")
            return redirect(url_for('index') + '#form')

@app.route("/success")
def success():
    return render_template("success.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_DEBUG', 'False') == 'True')