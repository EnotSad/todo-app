from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Используем SQLite вместо PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Модель задачи
class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'completed': self.completed
        }

# Создание таблиц
with app.app_context():
    db.create_all()
    print("✅ База данных SQLite создана/подключена")

# Маршруты
@app.route('/')
def index():
    return render_template('index.html')

# Получить все задачи
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# Создать новую задачу
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    new_task = Task(title=data['title'], completed=False)
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

# Обновить задачу
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    if 'title' in data:
        task.title = data['title']
    if 'completed' in data:
        task.completed = data['completed']
    
    db.session.commit()
    return jsonify(task.to_dict())

# Удалить задачу
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200

if __name__ == '__main__':
    print("🚀 Запуск Todo приложения с SQLite...")
    print("📁 База данных будет сохранена в файле: todo.db")
    app.run(debug=True, host='0.0.0.0', port=5000)
