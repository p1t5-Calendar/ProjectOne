// WHAT WE ARE DOING HERE: ESTABILISHING CAL FUNCTIONALITY FOR APP

document.addEventListener("DOMContentLoaded", () => {
    const calendarGrid = document.querySelector(".calendar-grid");
    const monthYear = document.getElementById("monthYear");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");
    const modal = document.getElementById("taskModal");
    const taskForm = document.getElementById("taskForm");
    const selectedDateInput = document.getElementById("selectedDate");

    let currentDate = dayjs();
    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function loadTasks() {
        tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    }

    function renderCalendar(date) {
        calendarGrid.innerHTML = "";
        const startOfMonth = date.startOf("month");
        const daysInMonth = date.daysInMonth();
        const startDayOfWeek = startOfMonth.day();

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

    window.toggleComplete = (date, index) => {
        if (!tasks[date]) return;
        tasks[date][index].completed = !tasks[date][index].completed;
        saveTasks();
        renderTasks(date);
    };

    window.deleteTask = (date, index) => {
        if (!tasks[date]) return;
        tasks[date].splice(index, 1);
        if (tasks[date].length === 0) {
            delete tasks[date];
        }
        saveTasks();
        renderTasks(date);
    };

    window.openModal = (date) => {
        selectedDateInput.value = date;
        modal.style.display = "block";
        modal.setAttribute("aria-hidden", "false");
        modal.querySelector("#taskInput").focus();
    };

    window.closeModal = () => {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    };

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const date = selectedDateInput.value;
        const taskText = document.getElementById("taskInput").value.trim();
        const urgency = document.querySelector('input[name="urgency"]:checked');

        if (!taskText) {
            alert("Task cannot be empty!");
            return;
        }

        if (!urgency) {
            alert("Please select a task urgency!");
            return;
        }

        if (!tasks[date]) tasks[date] = [];
        tasks[date].push({ text: taskText, urgency: urgency.value, completed: false });
        saveTasks();
        renderTasks(date);
        closeModal();
        e.target.reset();
    });

    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };

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