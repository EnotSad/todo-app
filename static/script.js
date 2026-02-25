let tasks = [];
let currentFilter = 'all';

// Загрузка задач при запуске
document.addEventListener('DOMContentLoaded', loadTasks);

// Функции для работы с API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// Загрузка всех задач
async function loadTasks() {
    tasks = await apiRequest('/tasks');
    renderTasks();
}

// Добавление новой задачи
async function addTask() {
    const input = document.getElementById('newTaskInput');
    const title = input.value.trim();
    
    if (!title) {
        alert('Пожалуйста, введите название задачи');
        return;
    }
    
    const newTask = await apiRequest('/tasks', 'POST', { title });
    tasks.push(newTask);
    renderTasks();
    input.value = '';
}

// Переключение статуса задачи
async function toggleTask(id, completed) {
    const updatedTask = await apiRequest(`/tasks/${id}`, 'PUT', { completed });
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        renderTasks();
    }
}

// Обновление названия задачи
async function updateTaskTitle(id, newTitle) {
    if (!newTitle.trim()) return;
    
    const updatedTask = await apiRequest(`/tasks/${id}`, 'PUT', { title: newTitle });
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        renderTasks();
    }
}

// Удаление задачи
async function deleteTask(id, event) {
    event.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        await apiRequest(`/tasks/${id}`, 'DELETE');
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    }
}

// Фильтрация задач
function filterTasks(filter) {
    currentFilter = filter;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks();
}

// Получение отфильтрованных задач
function getFilteredTasks() {
    switch(currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Отрисовка задач
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Задач пока нет</div>';
    } else {
        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" 
                onclick="editTaskTitle(${task.id}, '${task.title.replace(/'/g, "\\'")}')">
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onclick="event.stopPropagation(); toggleTask(${task.id}, ${!task.completed})">
                <span class="task-title">${escapeHtml(task.title)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id}, event)">×</button>
            </li>
        `).join('');
    }
    
    // Обновляем статистику
    document.getElementById('totalCount').textContent = tasks.length;
    document.getElementById('completedCount').textContent = tasks.filter(t => t.completed).length;
}

// Редактирование названия задачи
function editTaskTitle(id, currentTitle) {
    const newTitle = prompt('Редактировать задачу:', currentTitle);
    if (newTitle !== null) {
        updateTaskTitle(id, newTitle);
    }
}

// Экранирование HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Добавление задачи по Enter
document.getElementById('newTaskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
