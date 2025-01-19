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

    // Dark Mode Toggle
    darkModeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Save Tasks
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Load Tasks
    function loadTasks() {
        tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    }

    // Hamburger Button Dropdown Toggle
    hamburgerButton.addEventListener("click", () => {
        viewDropdown.style.display = viewDropdown.style.display === "block" ? "none" : "block";
    });

    // Change View Function
    window.changeView = (view) => {
        currentView = view;
        renderCalendar(currentDate);
        viewDropdown.style.display = "none";
    };

    // Render Calendar
    function renderCalendar(date) {
        calendarGrid.innerHTML = "";
        const startOfMonth = date.startOf("month");
        const daysInMonth = date.daysInMonth();
        const startDayOfWeek = startOfMonth.day();

        if (currentView === "month") {
            renderMonthView(date, startOfMonth, daysInMonth, startDayOfWeek);
        } else if (currentView === "week") {
            renderWeekView(date);
        } else if (currentView === "day") {
            renderDayView(date);
        }

        monthYear.textContent = date.format("MMMM YYYY");
    }

    // Render Month View
    function renderMonthView(date, startOfMonth, daysInMonth, startDayOfWeek) {
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
    }

    // Render Week View
    function renderWeekView(date) {
        const startOfWeek = date.startOf("week");
        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.add(i, "day");
            const formattedDate = day.format("YYYY-MM-DD");
            addDate(day.date(), day.isSame(dayjs(), "day") ? "current-day active" : "active", formattedDate);
            renderTasks(formattedDate);
        }
    }

    // Render Day View
    function renderDayView(date) {
        const formattedDate = date.format("YYYY-MM-DD");
        addDate(date.date(), date.isSame(dayjs(), "day") ? "current-day active" : "active", formattedDate);
        renderTasks(formattedDate);
    }

    // Add Date to Calendar
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

    // Render Tasks
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
            taskItem.querySelector(".task-text").addEventListener("click", () => {
                toggleComplete(date, index);
            });
            taskContainer.appendChild(taskItem);
        });
    }

    // Toggle Complete Task
    window.toggleComplete = (date, index) => {
        if (!tasks[date]) return;
        tasks[date][index].completed = !tasks[date][index].completed;
        saveTasks();
        renderTasks(date);
    };

    // Delete Task
    window.deleteTask = (date, index) => {
        if (!tasks[date]) return;
        tasks[date].splice(index, 1);
        if (tasks[date].length === 0) delete tasks[date];
        saveTasks();
        renderTasks(date);
    };

    // Modal Functions
    window.openModal = (date) => {
        selectedDateInput.value = date;
        modal.style.display = "block";
    };

    window.closeModal = () => {
        modal.style.display = "none";
    };

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const date = selectedDateInput.value;
        const taskText = document.getElementById("taskInput").value.trim();
        const urgency = document.querySelector('input[name="urgency"]:checked');

        if (!taskText || !urgency) return;

        if (!tasks[date]) tasks[date] = [];
        tasks[date].push({ text: taskText, urgency: urgency.value, completed: false });
        saveTasks();
        renderTasks(date);
        closeModal();
    });

    prevMonthButton.addEventListener("click", () => {
        currentDate = currentDate.subtract(1, "month");
        renderCalendar(currentDate);
    });

    nextMonthButton.addEventListener("click", () => {
        currentDate = currentDate.add(1, "month");
        renderCalendar(currentDate);
    });

    loadTasks();
    renderCalendar(currentDate);
});