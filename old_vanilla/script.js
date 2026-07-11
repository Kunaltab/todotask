const API_URL = "http://127.0.0.1:8000";
let currentDay = "All";
let allTasks = [];
let currentTheme = "";
let currentBgDay = "";
let productivityChart;
let timerInterval;
let timeLeft = 25 * 60;

// Elements
const authScreen = document.getElementById("authScreen");
const mainApp = document.getElementById("mainApp");
const loader = document.getElementById("loader");

// Initialization
window.onload = () => {
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
            checkAuth();
        }, 500);
    }, 1500);

    startClock();
    checkTimeAndTheme();
    setInterval(checkTimeAndTheme, 60000);
    fetchWeather();

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    currentDay = days[new Date().getDay()];
    selectDay(currentDay);
    
    // Set random quote
    const quotes = [
        "Small steps every day create big achievements.",
        "Your future is created by what you do today.",
        "Focus on progress, not perfection.",
        "Dream big, start small, act now."
    ];
    document.getElementById("motivationalQuote").innerText = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
};

// Auth
function checkAuth() {
    const token = localStorage.getItem("ghibli_token");
    if (token) {
        authScreen.classList.add("hidden");
        mainApp.classList.remove("hidden");
        document.body.classList.remove("login-bg");
        checkTimeAndTheme();
        fetchProfile();
        fetchTasks();
    } else {
        authScreen.classList.remove("hidden");
        mainApp.classList.add("hidden");
        document.body.classList.remove("morning", "afternoon", "night");
        document.body.classList.add("login-bg");
    }
}

document.getElementById("loginBtn").addEventListener("click", async () => {
    const user = document.getElementById("authUsername").value;
    const pass = document.getElementById("authPassword").value;
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username: user, password: pass})
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("ghibli_token", data.access_token);
            checkAuth();
        } else {
            document.getElementById("authError").innerText = data.detail || "Login failed";
            document.getElementById("authError").classList.remove("hidden");
        }
    } catch(e) {
        document.getElementById("authError").innerText = "Network Error: Is the backend server running?";
        document.getElementById("authError").classList.remove("hidden");
    }
});

document.getElementById("registerBtn").addEventListener("click", async () => {
    const user = document.getElementById("authUsername").value;
    const pass = document.getElementById("authPassword").value;
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username: user, password: pass})
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById("authError").innerText = "Registered! Now login.";
            document.getElementById("authError").style.color = "#4ade80";
            document.getElementById("authError").classList.remove("hidden");
        } else {
            document.getElementById("authError").innerText = data.detail || "Registration failed";
            document.getElementById("authError").classList.remove("hidden");
        }
    } catch(e) {
        document.getElementById("authError").innerText = "Network Error: Is the backend server running?";
        document.getElementById("authError").style.color = "#fca5a5";
        document.getElementById("authError").classList.remove("hidden");
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("ghibli_token");
    checkAuth();
});

// Profile
async function fetchProfile() {
    const res = await fetch(`${API_URL}/me`, { headers: { "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` }});
    if (res.ok) {
        const data = await res.json();
        document.getElementById("profileName").innerText = data.username;
        const bc = document.getElementById("badgesContainer");
        bc.innerHTML = "";
        data.badges.forEach(b => {
            const span = document.createElement("span");
            span.className = "badge";
            span.innerText = b;
            bc.appendChild(span);
        });
    }
}

// Background & Theme
function checkTimeAndTheme() {
    if (!localStorage.getItem("ghibli_token")) return; // Don't run on login screen

    const hour = new Date().getHours();
    let newTheme = "";
    if (hour >= 5 && hour < 12) newTheme = "morning";
    else if (hour >= 12 && hour < 18) newTheme = "afternoon";
    else newTheme = "night";

    if (currentTheme !== newTheme) {
        document.body.classList.remove("morning", "afternoon", "night");
        document.body.classList.add(newTheme);
        currentTheme = newTheme;
        generateParticles(newTheme);
    }
}

function generateParticles(theme) {
    const pc = document.getElementById("particles");
    pc.innerHTML = "";
    let count = theme === "morning" ? 5 : theme === "afternoon" ? 20 : 30;
    let cls = theme === "morning" ? "cloud-particle" : theme === "afternoon" ? "leaf" : "firefly";
    for(let i=0; i<count; i++) {
        const p = document.createElement("div");
        p.className = `particle ${cls}`;
        if(theme === "morning") {
            p.style.width = `${Math.random()*200+100}px`; p.style.height = `${Math.random()*50+20}px`;
            p.style.top = `${Math.random()*40}%`; p.style.animationDuration = `${Math.random()*20+20}s`;
        } else if (theme === "afternoon") {
            p.style.width = "15px"; p.style.height = "15px"; p.style.left = `${Math.random()*100}%`;
            p.style.animationDuration = `${Math.random()*5+8}s`;
        } else {
            p.style.width = "4px"; p.style.height = "4px"; p.style.left = `${Math.random()*100}%`; p.style.top = `${Math.random()*100}%`;
            p.style.animationDuration = `${Math.random()*3+2}s`;
        }
        pc.appendChild(p);
    }
}

// Clock & Weather
function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById("digitalClock").innerText = now.toLocaleTimeString('en-US', { hour12: true });
        document.getElementById("currentDate").innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }, 1000);
}
async function fetchWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true"); // Default Tokyo
        const data = await res.json();
        document.getElementById("weatherTemp").innerText = `${data.current_weather.temperature}°C`;
        document.getElementById("weatherDesc").innerText = "Tokyo, Japan";
    } catch(e) {}
}

// Pomodoro
document.getElementById("startTimerBtn").addEventListener("click", () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(timeLeft > 0) {
            timeLeft--;
            let m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            let s = (timeLeft % 60).toString().padStart(2, '0');
            document.getElementById("pomodoroDisplay").innerText = `${m}:${s}`;
        } else {
            clearInterval(timerInterval);
            alert("Pomodoro Complete! Take a break.");
        }
    }, 1000);
});
document.getElementById("resetTimerBtn").addEventListener("click", () => {
    clearInterval(timerInterval);
    timeLeft = 25 * 60;
    document.getElementById("pomodoroDisplay").innerText = "25:00";
});

// Tasks CRUD
async function fetchTasks() {
    const res = await fetch(`${API_URL}/tasks`, { headers: { "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` }});
    if (res.ok) {
        allTasks = await res.json();
        applyFiltersAndDisplay();
    }
}

document.getElementById("addBtn").addEventListener("click", async () => {
    const title = document.getElementById("taskInput").value.trim();
    if (!title) return alert("Enter task title");
    
    const task = {
        title,
        description: document.getElementById("taskDesc").value.trim(),
        priority: document.getElementById("taskPriority").value,
        category: document.getElementById("taskCategory").value,
        due_date: document.getElementById("taskDueDate").value,
        day: currentDay === "All" ? "" : currentDay
    };
    await fetch(`${API_URL}/tasks`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` },
        body: JSON.stringify(task)
    });
    fetchTasks();
    fetchProfile();
});

document.querySelectorAll(".day").forEach(btn => {
    btn.addEventListener("click", () => selectDay(btn.dataset.day));
});

function selectDay(day) {
    currentDay = day;
    document.querySelectorAll(".day").forEach(b => {
        b.classList.remove("active-day");
        if(b.dataset.day === day) b.classList.add("active-day");
    });
    applyFiltersAndDisplay();
}

function applyFiltersAndDisplay() {
    let filtered = allTasks;
    if (currentDay !== "All") filtered = filtered.filter(t => t.day === currentDay);
    
    const type = document.getElementById("filterType").value;
    if (type === "Completed") filtered = filtered.filter(t => t.completed);
    else if (type === "Pending") filtered = filtered.filter(t => !t.completed);
    else if (type === "High Priority") filtered = filtered.filter(t => t.priority === "High");
    else if (type === "Today") {
        const todayStr = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(t => t.created_at && t.created_at.startsWith(todayStr));
    }

    const search = document.getElementById("searchInput").value.toLowerCase();
    if (search) filtered = filtered.filter(t => t.title.toLowerCase().includes(search));

    const sort = document.getElementById("sortTasks").value;
    if (sort === "Newest") filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sort === "Oldest") filtered.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sort === "Priority") {
        const pMap = {"High":3, "Medium":2, "Low":1};
        filtered.sort((a,b) => pMap[b.priority] - pMap[a.priority]);
    }

    renderTasks(filtered);
}

document.getElementById("filterType").addEventListener("change", applyFiltersAndDisplay);
document.getElementById("sortTasks").addEventListener("change", applyFiltersAndDisplay);
document.getElementById("searchInput").addEventListener("input", applyFiltersAndDisplay);

function renderTasks(tasksToRender) {
    const tc = document.getElementById("taskContainer");
    tc.innerHTML = "";
    tasksToRender.forEach(task => {
        const d = document.createElement("div"); d.className = "task";
        d.innerHTML = `
        <div class="task-left">
            <input type="checkbox" ${task.completed ? "checked":""} onclick="completeTask('${task.id}', ${task.completed}, this)">
            <div class="task-info">
                <span class="task-title ${task.completed ? "done":""}">${task.title}</span>
                ${task.description ? `<span class="task-desc ${task.completed ? "done":""}">${task.description}</span>` : ''}
                <div class="task-meta">
                    <span class="badge-pill priority-${task.priority}">${task.priority}</span>
                    <span class="badge-pill category-badge">${task.category}</span>
                    ${task.due_date ? `<span><i class="fa-regular fa-clock"></i> ${task.due_date}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="actions">
            <button onclick="openEditModal('${task.id}')"><i class="fa-solid fa-pen edit"></i></button>
            <button onclick="deleteTask('${task.id}')"><i class="fa-solid fa-trash delete"></i></button>
        </div>`;
        tc.appendChild(d);
    });

    document.getElementById("total").innerText = allTasks.length;
    
    const compCount = allTasks.filter(t=>t.completed).length;
    const pendCount = allTasks.length - compCount;
    document.getElementById("completed").innerText = compCount;
    document.getElementById("pending").innerText = pendCount;
    updateChart(compCount, pendCount);
}

window.completeTask = async (id, status, el) => {
    // Animation logic
    if(!status) {
        const taskEl = el.closest(".task");
        if(taskEl) {
            taskEl.classList.add("task-complete-anim");
            setTimeout(() => taskEl.classList.remove("task-complete-anim"), 500);
        }
    }

    await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` },
        body: JSON.stringify({ completed: !status })
    });
    fetchTasks(); fetchProfile();
};

window.deleteTask = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` }});
    fetchTasks();
};

window.openEditModal = (id) => {
    const task = allTasks.find(t => t.id === id);
    if(task) {
        document.getElementById("editTaskId").value = task.id;
        document.getElementById("editTaskTitle").value = task.title;
        document.getElementById("editTaskDesc").value = task.description || "";
        document.getElementById("editTaskPriority").value = task.priority || "Low";
        document.getElementById("editTaskCategory").value = task.category || "General";
        document.getElementById("editTaskDueDate").value = task.due_date || "";
        document.getElementById("editModal").classList.remove("hidden");
    }
};

document.getElementById("cancelEditBtn").addEventListener("click", () => document.getElementById("editModal").classList.add("hidden"));
document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const id = document.getElementById("editTaskId").value;
    await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` },
        body: JSON.stringify({
            title: document.getElementById("editTaskTitle").value,
            description: document.getElementById("editTaskDesc").value,
            priority: document.getElementById("editTaskPriority").value,
            category: document.getElementById("editTaskCategory").value,
            due_date: document.getElementById("editTaskDueDate").value
        })
    });
    document.getElementById("editModal").classList.add("hidden");
    fetchTasks();
});

// AI Task Planner
document.getElementById("aiPlanBtn").addEventListener("click", async () => {
    const idea = document.getElementById("aiIdeaInput").value.trim();
    if(!idea) return;
    document.getElementById("aiPlanBtn").innerText = "Planning...";
    
    const res = await fetch(`${API_URL}/ai-planner`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` },
        body: JSON.stringify({ idea })
    });
    if(res.ok) {
        const data = await res.json();
        for(let t of data.tasks) {
            await fetch(`${API_URL}/tasks`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("ghibli_token")}` },
                body: JSON.stringify({ title: t.title, priority: t.priority, category: t.category, day: currentDay === "All" ? "" : currentDay })
            });
        }
        document.getElementById("aiIdeaInput").value = "";
        fetchTasks();
    }
    document.getElementById("aiPlanBtn").innerText = "Generate Plan";
});

// Chart setup
function initChart() {
    const ctx = document.getElementById('productivityChart').getContext('2d');
    productivityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#4ade80', '#fca5a5'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: 'white' } }
            }
        }
    });
}

function updateChart(completed, pending) {
    if (productivityChart) {
        productivityChart.data.datasets[0].data = [completed, pending];
        productivityChart.update();
    }
}