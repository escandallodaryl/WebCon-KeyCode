const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const currentCodeVal = document.getElementById('current-code-val');
const lastUpdatedVal = document.getElementById('last-updated-val');
const nextUpdateVal = document.getElementById('next-update-val');

document.addEventListener('DOMContentLoaded', getTasks);

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const tasks = JSON.parse(localStorage.getItem('keycodes')) || [];
    const now = new Date();
    
    // Formatting
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newTask = {
        id: Date.now(),
        code: taskInput.value,
        date: dateStr,
        time: timeStr,
        fullTimestamp: now.getTime()
    };

    // unshift adds to the beginning so index [0] is always the newest
    tasks.unshift(newTask); 
    localStorage.setItem('keycodes', JSON.stringify(tasks));
    
    taskInput.value = '';
    getTasks();
});

function getTasks() {
    const tasks = JSON.parse(localStorage.getItem('keycodes')) || [];
    taskList.innerHTML = '';

    if (tasks.length > 0) {
        // 1. Update the Card with the NEWEST entry
        const latest = tasks[0];
        currentCodeVal.innerText = latest.code;
        lastUpdatedVal.innerText = `${latest.date} ${latest.time}`;
        
        const nextTime = new Date(latest.fullTimestamp + 4 * 60 * 60 * 1000);
        nextUpdateVal.innerText = nextTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // 2. Build the History Table
        tasks.forEach((task) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${task.code}</strong></td>
                <td>${task.time}</td>
                <td><small>${task.date}</small></td>
                <td><button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button></td>
            `;
            taskList.appendChild(row);
        });
    } else {
        // Default state if empty
        currentCodeVal.innerText = "--------";
        lastUpdatedVal.innerText = "-";
        nextUpdateVal.innerText = "-";
    }
}

function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem('keycodes'));
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('keycodes', JSON.stringify(tasks));
    getTasks();
}

const adminControls = document.getElementById('admin-controls');
const loginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('admin-logout-btn');

// --- AUTH LOGIC ---
const ADMIN_PASSWORD = "admin123"; // You can change this

function checkAuth() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        adminControls.style.display = 'block';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        // Show the Action column in the table if admin
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'table-cell');
    } else {
        adminControls.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}

loginBtn.addEventListener('click', () => {
    const pass = prompt("Enter Admin Password:");
    if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdmin', 'true');
        checkAuth();
    } else {
        alert("Incorrect password!");
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdmin');
    checkAuth();
});

// Call checkAuth when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    getTasks();
});

// --- UPDATED TABLE RENDERING ---
function getTasks() {
    const tasks = JSON.parse(localStorage.getItem('keycodes')) || [];
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (tasks.length > 0) {
        const latest = tasks[0];
        document.getElementById('current-code-val').innerText = latest.code;
        document.getElementById('last-updated-val').innerText = `${latest.date} ${latest.time}`;

        tasks.forEach((task) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${task.code}</strong></td>
                <td>${task.time}</td>
                <td><small>${task.date}</small></td>
                <td class="admin-only" style="display: ${isAdmin ? 'table-cell' : 'none'}">
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </td>
            `;
            taskList.appendChild(row);
        });
    }
    // ... rest of your existing getTasks logic
}

const clearAllBtn = document.getElementById('clear-all-btn');

// --- UPDATE checkAuth to handle the new button ---
function checkAuth() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        adminControls.style.display = 'block';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        clearAllBtn.style.display = 'inline-block'; // Show clear button to admin
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'table-cell');
    } else {
        adminControls.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        clearAllBtn.style.display = 'none'; // Hide clear button from users
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}

// --- CLEAR ALL RECORDS LOGIC ---
clearAllBtn.addEventListener('click', () => {
    const confirmClear = confirm("Are you sure you want to delete ALL history? This cannot be undone.");
    
    if (confirmClear) {
        // Clear the specific key from local storage
        localStorage.removeItem('keycodes');
        
        // Reset the UI
        getTasks(); 
        alert("All records have been cleared.");
    }
});

// Update your getTasks slightly to handle the empty state for the big display
function getTasks() {
    const tasks = JSON.parse(localStorage.getItem('keycodes')) || [];
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (tasks.length > 0) {
        const latest = tasks[0];
        currentCodeVal.innerText = latest.code;
        lastUpdatedVal.innerText = `${latest.date} ${latest.time}`;
        
        // Render rows
        tasks.forEach((task) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${task.code}</strong></td>
                <td>${task.time}</td>
                <td><small>${task.date}</small></td>
                <td class="admin-only" style="display: ${isAdmin ? 'table-cell' : 'none'}">
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </td>
            `;
            taskList.appendChild(row);
        });
    } else {
        // Explicitly clear the card display when no records exist
        currentCodeVal.innerText = "--------";
        lastUpdatedVal.innerText = "-";
        nextUpdateVal.innerText = "-";
    }
}

// Add these variables to your existing script.js
let countdownInterval;

function updateCountdown() {
    const tasks = JSON.parse(localStorage.getItem('keycodes')) || [];
    const timeLeftDisplay = document.getElementById('time-left-val');
    
    if (tasks.length === 0) {
        timeLeftDisplay.innerText = "0h 00m 00s";
        return;
    }

    const latest = tasks[0];
    const now = new Date().getTime();
    const expirationTime = latest.fullTimestamp + (4 * 60 * 60 * 1000); // 4 hours in ms
    const distance = expirationTime - now;

    if (distance < 0) {
        timeLeftDisplay.innerText = "EXPIRED";
        timeLeftDisplay.style.color = "var(--danger-red)";
        return;
    } else {
        timeLeftDisplay.style.color = "inherit";
    }

    // Calculations for hours, minutes and seconds
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timeLeftDisplay.innerText = `${hours}h ${minutes}m ${seconds}s`;
}

// Update the getTasks function to start/reset the timer
function getTasks() {
    const tasks = JSON.parse(localStorage.getItem('keycodes')) || [];
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (tasks.length > 0) {
        const latest = tasks[0];
        document.getElementById('current-code-val').innerText = latest.code;
        document.getElementById('last-updated-val').innerText = `${latest.date} ${latest.time}`;
        
        // Calculate Next Update (Exactly 4 hours after the last one)
        const nextTimeDate = new Date(latest.fullTimestamp + 4 * 60 * 60 * 1000);
        document.getElementById('next-update-val').innerText = nextTimeDate.toLocaleString('en-US', { 
            month: 'long', day: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });

        // Start real-time countdown
        clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();

        // Render Table Rows
        tasks.forEach((task) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${task.code}</strong></td>
                <td>${task.time}</td>
                <td><small>${task.date}</small></td>
                <td class="admin-only" style="display: ${isAdmin ? 'table-cell' : 'none'}">
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </td>
            `;
            taskList.appendChild(row);
        });
    } else {
        // Reset if empty
        document.getElementById('current-code-val').innerText = "--------";
        document.getElementById('last-updated-val').innerText = "-";
        document.getElementById('next-update-val').innerText = "-";
        document.getElementById('time-left-val').innerText = "4h 00m 00s";
        clearInterval(countdownInterval);
    }
}