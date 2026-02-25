-- Создание базы данных
CREATE DATABASE todo_db;

-- Подключение к созданной базе данных
\c todo_db;

-- Создание таблицы задач
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

-- Добавление тестовых данных (опционально)
INSERT INTO tasks (title, completed) VALUES 
    ('Изучить Flask', false),
    ('Настроить PostgreSQL', false),
    ('Создать Todo приложение', true);
