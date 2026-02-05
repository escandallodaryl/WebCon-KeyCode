// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyD0Z0EWvidFrMqQDeEBspGpyXRPv4Q0zyM",
    authDomain: "webcon-808c4.firebaseapp.com",
    databaseURL: "https://webcon-808c4-default-rtdb.firebaseio.com/",
    projectId: "webcon-808c4",
    storageBucket: "webcon-808c4.appspot.com",
    messagingSenderId: "701202929556",
    appId: "1:701202929556:web:9c25d0a6ab006edce5e181"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- DOM ELEMENTS ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const currentCodeVal = document.getElementById('current-code-val');
const lastUpdatedVal = document.getElementById('last-updated-val');
const nextUpdateVal = document.getElementById('next-update-val');
const timeLeftDisplay = document.getElementById('time-left-val');

// Modal Elements
const loginModal = document.getElementById('login-modal');
const adminPassInput = document.getElementById('admin-pass-input');
const togglePassword = document.getElementById('toggle-password');
const confirmLogin = document.getElementById('confirm-login');
const cancelLogin = document.getElementById('cancel-login');
const loginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('admin-logout-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

let countdownInterval;

// --- ADMIN AUTH LOGIC ---
const ADMIN_PASSWORD = "111"; 

function checkAuth() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    document.getElementById('admin-controls').style.display = isAdmin ? 'block' : 'none';
    loginBtn.style.display = isAdmin ? 'none' : 'inline-block';
    logoutBtn.style.display = isAdmin ? 'inline-block' : 'none';
    clearAllBtn.style.display = isAdmin ? 'inline-block' : 'none';
    
    db.ref('keycodes').once('value', (snapshot) => {
        const data = snapshot.val();
        const tasks = data ? Object.values(data).reverse() : [];
        renderUI(tasks);
    });
}

// Modal Listeners
loginBtn.addEventListener('click', () => { loginModal.style.display = 'flex'; adminPassInput.value = ''; });
cancelLogin.addEventListener('click', () => { loginModal.style.display = 'none'; });
togglePassword.addEventListener('click', () => {
    const type = adminPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
    adminPassInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});

confirmLogin.addEventListener('click', () => {
    if (adminPassInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdmin', 'true');
        loginModal.style.display = 'none';
        checkAuth();
    } else { alert("Incorrect password!"); }
});

logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('isAdmin'); checkAuth(); });

// --- CORE LOGIC ---

// 1. Numeric Restriction & Max 12 Digits
taskInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
    if (val.length > 12) val = val.substring(0, 12); // Max 12
    e.target.value = val;
});

// 2. Real-time Listener
db.ref('keycodes').on('value', (snapshot) => {
    const data = snapshot.val();
    const tasks = data ? Object.values(data).reverse() : [];
    renderUI(tasks);
});

// 3. Add New Code with Validation (Min 8 Digits)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = taskInput.value.trim();

    if (val.length < 8) {
        alert("Error: KeyCode must be at least 8 digits.");
        taskInput.style.borderColor = "red";
        return;
    }

    taskInput.style.borderColor = "#ddd";
    const now = new Date();
    const newTask = {
        id: Date.now(),
        code: val,
        date: now.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fullTimestamp: now.getTime()
    };
    db.ref('keycodes/' + newTask.id).set(newTask);
    taskInput.value = '';
});

// 4. Render UI
function renderUI(tasks = []) {
    taskList.innerHTML = '';
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // Toggle Action Column Header
    const actionHeader = document.querySelector('#history-table th:nth-child(4)');
    if (actionHeader) actionHeader.style.display = isAdmin ? 'table-cell' : 'none';

    if (tasks.length > 0) {
        const latest = tasks[0];
        currentCodeVal.innerText = latest.code;
        lastUpdatedVal.innerText = `${latest.date} ${latest.time}`;

        const nextTimeDate = new Date(latest.fullTimestamp + 4 * 60 * 60 * 1000);
        nextUpdateVal.innerText = nextTimeDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Countdown Timer
        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const expiration = latest.fullTimestamp + (4 * 60 * 60 * 1000);
            const dist = expiration - now;
            if (dist < 0) {
                timeLeftDisplay.innerText = "EXPIRED";
                timeLeftDisplay.style.color = "red";
            } else {
                const h = Math.floor(dist / 3600000);
                const m = Math.floor((dist % 3600000) / 60000);
                const s = Math.floor((dist % 60000) / 1000);
                timeLeftDisplay.innerText = `${h}h ${m}m ${s}s`;
                timeLeftDisplay.style.color = "inherit";
            }
        }, 1000);

        // Populate Table
        tasks.forEach((task) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${task.code}</strong></td>
                <td>${task.time}</td>
                <td><small>${task.date}</small></td>
                ${isAdmin ? `<td><button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button></td>` : ''}
            `;
            taskList.appendChild(row);
        });
    } else {
        currentCodeVal.innerText = "--------";
        lastUpdatedVal.innerText = "-";
        nextUpdateVal.innerText = "-";
        timeLeftDisplay.innerText = "0h 00m 00s";
    }
}

// 5. Delete Functions
window.deleteTask = (id) => { if(confirm("Delete this record?")) db.ref('keycodes/' + id).remove(); };
clearAllBtn.addEventListener('click', () => { if(confirm("Clear ALL records?")) db.ref('keycodes').remove(); });

document.addEventListener('DOMContentLoaded', checkAuth);