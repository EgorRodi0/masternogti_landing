# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, flash, redirect, url_for
import psycopg2
import logging
import re
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure encoding for Windows
if os.name == 'nt':
    os.system('chcp 65001 > nul')
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'voenkomat-secret-key')
app.config['JSON_AS_ASCII'] = False

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('voenkomat_app.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

def get_db_connection():
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME', 'voenkomat1'),
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

def validate_passport(passport):
    """Validate passport format (1234 567890)."""
    return bool(re.match(r'^\d{4}\s\d{6}$', passport))

def validate_birth_date(birth_date):
    """Validate birth date format (YYYY-MM-DD)."""
    return bool(re.match(r'^\d{4}-\d{2}-\d{2}$', birth_date))

def sanitize_input(data):
    """Sanitize input data."""
    if not data:
        return None
    return str(data).strip()

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        full_name = sanitize_input(request.form.get("full_name"))
        birth_date = sanitize_input(request.form.get("birth_date"))
        passport_data = sanitize_input(request.form.get("passport_data"))
        address = sanitize_input(request.form.get("address"))

        if not all([full_name, birth_date, passport_data, address]):
            flash("Все поля обязательны!", "danger")
        elif not re.match(r'^[А-Яа-яЁё\s]+$', full_name):
            flash("ФИО должно содержать только кириллицу!", "danger")
        elif not validate_passport(passport_data):
            flash("Некорректный формат паспорта (1234 567890)!", "danger")
        elif not validate_birth_date(birth_date):
            flash("Некорректная дата рождения (ГГГГ-ММ-ДД)!", "danger")
        else:
            conn = get_db_connection()
            if conn:
                try:
                    with conn.cursor() as cur:
                        cur.execute(
                            """INSERT INTO conscript (full_name, birth_date, address, passport_data, article_id)
                               VALUES (%s, %s, %s, %s, %s) RETURNING id;""",
                            (full_name, birth_date, address, passport_data, None)
                        )
                        conscript_id = cur.fetchone()[0]
                        conn.commit()
                        logging.info(f"New conscript added, ID: {conscript_id}")
                        return redirect(url_for('success'))
                except psycopg2.Error as e:
                    conn.rollback()
                    logging.error(f"Database error: {e}")
                    if "Возраст призывника" in str(e):
                        flash("Возраст должен быть от 18 до 27 лет!", "danger")
                    elif "duplicate key" in str(e):
                        flash("Паспортные данные уже зарегистрированы!", "danger")
                    else:
                        flash("Ошибка при сохранении данных!", "danger")
                finally:
                    conn.close()
            else:
                flash("Ошибка подключения к базе данных!", "danger")

    return render_template("index.html")

@app.route("/success")
def success():
    return render_template("success.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_DEBUG', 'False') == 'True')