// WHAT WE ARE DOING HERE: ESTABILISHING CAL FUNCTIONALITY FOR APP

document.addEventListener("DOMContentLoaded", () => {
    const calendarGrid = document.querySelector(".calendar-grid");
    const monthYear = document.getElementById("monthYear");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");
    const modal = document.getElementById("taskModal");
    const taskForm = document.getElementById("taskForm");
    const selectedDateInput = document.getElementById("selectedDate");
    const darkModeButton = document.getElementById("darkb");
    const hamburgerButton = document.getElementById("hamburgerButton");
    const viewDropdown = document.getElementById("viewDropdown");

    let currentDate = dayjs();
    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    let currentView = "month";

    darkModeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function loadTasks() {
        tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    }

    hamburgerButton.addEventListener("click", () => {
        viewDropdown.style.display = viewDropdown.style.display === "block" ? "none" : "block";
    });

    // Change View Function
    window.changeView = (view) => {
        currentView = view;
        renderCalendar(currentDate);
        viewDropdown.style.display = "none"; // Hide dropdown after selection
    };

// Render Calendar
function renderCalendar(date) {
    calendarGrid.innerHTML = "";
    const startOfMonth = date.startOf("month");
    const daysInMonth = date.daysInMonth();
    const startDayOfWeek = startOfMonth.day();

    if (currentView === "month") {
        // Render Month View
        const prevMonthDays = startOfMonth.subtract(1, "month").daysInMonth();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            addDate(prevMonthDays - i, "inactive", null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const formattedDate = date.date(day).format("YYYY-MM-DD");
            addDate(day, date.date(day).isSame(dayjs(), "day") ? "current-day active" : "active", formattedDate);
            renderTasks(formattedDate);
        }
        const totalCells = startDayOfWeek + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remainingCells; i++) {
            addDate(i, "inactive", null);
        }
    } else if (currentView === "week") {
        // Render Week View
        const startOfWeek = date.startOf("week");
        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.add(i, "day");
            const formattedDate = day.format("YYYY-MM-DD");
            addDate(day.date(), day.isSame(dayjs(), "day") ? "current-day active" : "active", formattedDate);
            renderTasks(formattedDate);
        }
    } else if (currentView === "day") {
        // Render Day View
        const formattedDate = date.format("YYYY-MM-DD");
        addDate(date.date(), date.isSame(dayjs(), "day") ? "current-day active" : "active", formattedDate);
        renderTasks(formattedDate);
    }

    monthYear.textContent = date.format("MMMM YYYY");
}

function addDate(day, classes, formattedDate) {
    const dateElement = document.createElement("div");
    dateElement.className = `date ${classes}`;
    dateElement.innerHTML = `
        <div>${day}</div>
        <div class="tasks" id="${formattedDate}-tasks"></div>
        ${formattedDate ? `<button class="btn btn-success btn-sm mt-2" onclick="openModal('${formattedDate}')">Add Task</button>` : ""}
    `;
    calendarGrid.appendChild(dateElement);
}

function renderTasks(date) {
    const taskContainer = document.getElementById(`${date}-tasks`);
    if (!taskContainer) return;

    taskContainer.innerHTML = "";
    if (!tasks[date]) return;

    tasks[date].forEach((task, index) => {
        const taskItem = document.createElement("div");
        taskItem.className = `task-item ${task.completed ? "completed" : task.urgency}`;
        taskItem.innerHTML = `
            <span class="task-text" data-date="${date}" data-index="${index}" style="cursor: pointer;">${task.text}</span>
            <button onclick="deleteTask('${date}', ${index})" class="delete-task">&times;</button>
        `;
        taskItem.querySelector(".task-text").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleComplete(date, index);
        });
        taskContainer.appendChild(taskItem);
    });
}

loadTasks();
renderCalendar(currentDate);
});

    loadTasks();
    renderCalendar(currentDate);









// function darkMode() {
//     let element = document.body;
//     let darkbtn = document.getElementById("darkb");
//     darkbtn.addEventListener("click", event => {
//         element.classlist.toggle("dark-mode")});
//     }
// document.addEventListener("DOMContentLoaded", darkMode);


// console.log(body);
// function lightMode() {
//     let body = document.body;
//     let lightbtn = document.querySelector(".light-mode");
//     lightbtn.addEventListener("onclick", event => {
//         body.classList("")});
// }