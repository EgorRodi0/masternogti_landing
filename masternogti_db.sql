CREATE SCHEMA public;

CREATE TABLE public.appointments (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    phone VARCHAR(12) NOT NULL,
    service VARCHAR(50) NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_phone CHECK (phone ~ '^\+7[0-9]{10}$'),
    CONSTRAINT valid_service CHECK (service IN ('Маникюр', 'Педикюр', 'Комбо'))
);

CREATE OR REPLACE FUNCTION check_appointment_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Проверка, что дата в будущем
    IF NEW.appointment_date < CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Дата записи не может быть в прошлом';
    END IF;
    -- Проверка времени (10:00–20:00)
    IF EXTRACT(HOUR FROM NEW.appointment_date) < 10 OR EXTRACT(HOUR FROM NEW.appointment_date) >= 20 THEN
        RAISE EXCEPTION 'Запись возможна только с 10:00 до 20:00';
    END IF;
    -- Проверка занятости времени
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE appointment_date = NEW.appointment_date
    ) THEN
        RAISE EXCEPTION 'Время % уже занято', NEW.appointment_date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_time_trigger
BEFORE INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION check_appointment_time();

CREATE INDEX idx_appointment_date ON appointments(appointment_date);