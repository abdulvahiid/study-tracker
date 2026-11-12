const form = document.getElementById("taskForm");

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Done").length;
    const pending = total - completed;
    const progress = total ? Math.round(completed / total * 100) : 0;

    document.getElementById("total").textContent = total;
    document.getElementById("completed").textContent = completed;
    document.getElementById("pending").textContent = pending;
    document.getElementById("progress").textContent = progress + "%";
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const task = {
        id: Date.now(),
        category: document.getElementById("category").value,
        subject: document.getElementById("subject").value.trim(),
        topic: document.getElementById("topic").value.trim(),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        planned: Number(document.getElementById("planned").value),
        actual: 0,
        technique: document.getElementById("technique").value,
        status: "Pending"
    };

    if (!task.subject || !task.topic || !task.date ||
        !Number.isFinite(task.planned) || task.planned < 1) {
        alert("Please enter valid task details.");
        return;
    }

    tasks.push(task);
    saveTasks();
    form.reset();
    renderTasks();
});

function markDone(id) {
    const actual = prompt("Enter actual study time in minutes:");

    if (actual === null) return;

    const minutes = Number(actual);

    if (!Number.isInteger(minutes) || minutes < 0) {
        alert("Please enter a valid number of minutes.");
        return;
    }

    const task = tasks.find(t => t.id === id);
    task.status = "Done";
    task.actual = minutes;

    saveTasks();
    renderTasks();
}

function markPending(id) {
    const task = tasks.find(t => t.id === id);
    task.status = "Pending";
    saveTasks();
    renderTasks();
}

function moveTomorrow(id) {
    const task = tasks.find(t => t.id === id);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");

    task.date = `${year}-${month}-${day}`;
    task.status = "Pending";

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function createTaskCard(task) {
    const card = document.createElement("article");
    card.className = "task";

    const heading = document.createElement("h3");
    heading.textContent = `${task.subject} — ${task.topic}`;

    const details = [
        `Category: ${task.category}`,
        `Date: ${task.date}`,
        `Time: ${task.time || "Not set"}`,
        `Planned: ${task.planned} minutes`,
        `Actual: ${task.actual} minutes`,
        `Technique: ${task.technique}`
    ];

    card.appendChild(heading);

    details.forEach(detail => {
        const p = document.createElement("p");
        p.textContent = detail;
        card.appendChild(p);
    });

    const status = document.createElement("span");
    status.className = "status" +
        (task.status === "Done" ? " completed" : "");
    status.textContent = task.status;
    card.appendChild(status);

    const actions = document.createElement("div");
    actions.className = "actions";

    if (task.status === "Pending") {
        addButton(actions, "Mark Done", "done", () => markDone(task.id));
        addButton(actions, "Tomorrow", "pending", () => moveTomorrow(task.id));
    } else {
        addButton(actions, "Mark Pending", "pending", () => markPending(task.id));
    }

    addButton(actions, "Delete", "delete", () => deleteTask(task.id));

    card.appendChild(actions);
    return card;
}

function addButton(parent, label, className, action) {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", action);
    parent.appendChild(button);
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    const pendingList = document.getElementById("pendingList");

    taskList.replaceChildren();
    pendingList.replaceChildren();

    if (tasks.length === 0) {
        showEmpty(taskList);
    } else {
        tasks.forEach(task => {
            taskList.appendChild(createTaskCard(task));
        });
    }

    const pendingTasks = tasks.filter(t => t.status === "Pending");

    if (pendingTasks.length === 0) {
        showEmpty(pendingList);
    } else {
        pendingTasks.forEach(task => {
            pendingList.appendChild(createTaskCard(task));
        });
    }

    updateDashboard();
}

function showEmpty(container) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No tasks here yet.";
    container.appendChild(p);
}

renderTasks();