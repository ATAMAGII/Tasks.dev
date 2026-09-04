const taskInput = document.querySelector('.search');
const addTaskBtn = document.querySelector('.addtask');
const dateTimePopup = document.querySelector('.datetime-popup');
const confirmBtn = document.querySelector('.confirm-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const tasksContainer = document.querySelector('.tasks');
const prevMonthBtn = document.querySelector('.prev-month');
const nextMonthBtn = document.querySelector('.next-month');
const monthYearSpan = document.querySelector('.month-year');
const calendarDaysDiv = document.getElementById('calendar-days');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const ampmSelect = document.getElementById('ampm');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let pendingTask = '';
let currentDate = new Date();
let selectedDate = null;

function renderCalendar() {
  calendarDaysDiv.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  monthYearSpan.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement('div');
    day.className = 'calendar-day other-month';
    day.textContent = daysInPrevMonth - i;
    calendarDaysDiv.appendChild(day);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = i;
    
    if (selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year) {
      day.classList.add('selected');
    }
    
    day.addEventListener('click', () => {
      selectedDate = new Date(year, month, i);
      renderCalendar();
    });
    
    calendarDaysDiv.appendChild(day);
  }
  
  const totalCells = firstDay + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  
  for (let i = 1; i <= remainingCells; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day other-month';
    day.textContent = i;
    calendarDaysDiv.appendChild(day);
  }
}

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

function renderTasks() {
  tasksContainer.innerHTML = '';
  
  if (tasks.length === 0) {
    tasksContainer.innerHTML = '<p style="color: #999; font-size: 14px; text-align: center;">No tasks yet. Add one to get started!</p>';
    return;
  }

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    
    const dueDate = task.datetime ? new Date(task.datetime).toLocaleString() : '';
    
    taskDiv.innerHTML = `
      <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})">
      <div class="task-content">
        <p class="task-text" style="${task.done ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.text}</p>
        ${dueDate ? `<p class="task-date">📅 ${dueDate}</p>` : ''}
      </div>
      <button onclick="deleteTask(${index})">Delete</button>
    `;
    
    tasksContainer.appendChild(taskDiv);
  });
}

function showDateTimePicker() {
  const text = taskInput.value.trim();
  
  if (!text) {
    alert('Enter a task first!');
    return;
  }
  
  pendingTask = text;
  currentDate = new Date();
  selectedDate = new Date();
  renderCalendar();
  dateTimePopup.style.display = 'block';
}

function confirmTask() {
  if (!selectedDate) {
    alert('Select a date!');
    return;
  }
  
  let hours = parseInt(hoursInput.value) || 0;
  let minutes = parseInt(minutesInput.value) || 0;
  
  if (ampmSelect.value === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampmSelect.value === 'AM' && hours === 12) {
    hours = 0;
  }
  
  selectedDate.setHours(hours, minutes, 0, 0);
  
  tasks.push({ text: pendingTask, datetime: selectedDate.toISOString(), done: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  taskInput.value = '';
  dateTimePopup.style.display = 'none';
  renderTasks();
}

function cancelTask() {
  dateTimePopup.style.display = 'none';
  pendingTask = '';
}

function deleteTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

addTaskBtn.addEventListener('click', showDateTimePicker);
confirmBtn.addEventListener('click', confirmTask);
cancelBtn.addEventListener('click', cancelTask);

hoursInput.addEventListener('change', () => {
  if (hoursInput.value > 23) hoursInput.value = 23;
  if (hoursInput.value < 0) hoursInput.value = 0;
});

minutesInput.addEventListener('change', () => {
  if (minutesInput.value > 59) minutesInput.value = 59;
  if (minutesInput.value < 0) minutesInput.value = 0;
});

renderTasks();