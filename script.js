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
    const todayButton = document.getElementById("todayButton");

    let currentDate = dayjs();
    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    let currentView = "month";
    const icon = darkModeButton.querySelector("i");

    // Dark Mode Toggle
    window.darkMode = () => {
        document.body.classList.toggle("dark-mode");
        icon.classList.toggle("bi-brightness-high-fill");
        icon.classList.toggle("bi-moon-stars-fill");
    };

    darkModeButton.addEventListener("click", darkMode);

    // Today's Date Button
    todayButton.addEventListener("click", () => {
        currentDate = dayjs();
        renderCalendar(currentDate);
    });

    // Save Tasks
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Hamburger Menu Toggle
    hamburgerButton.addEventListener("click", () => {
        viewDropdown.style.display = viewDropdown.style.display === "block" ? "none" : "block";
    });

    // Change View
    window.changeView = (view) => {
        currentView = view;
        renderCalendar(currentDate);
        viewDropdown.style.display = "none";
    };

    // Render Calendar
    function renderCalendar(date) {
        calendarGrid.innerHTML = "";
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
            const dayHeader = document.createElement("div");
            dayHeader.className = "day-name";
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        if (currentView === "month") {
            renderMonthView(date);
        } else if (currentView === "week") {
            renderWeekView(date);
        } else if (currentView === "day") {
            renderDayView(date);
        }

        monthYear.textContent = date.format("MMMM YYYY");
    }

    // Render Month View
    function renderMonthView(date) {
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

        calendarGrid.innerHTML = "";

        const dayHeader = document.createElement("div");
        dayHeader.className = "day-name";
        dayHeader.textContent = date.format("dddd, MMMM D, YYYY");
        calendarGrid.appendChild(dayHeader);

        const dayContainer = document.createElement("div");
        dayContainer.className = "date active";
        dayContainer.dataset.date = formattedDate;
        dayContainer.innerHTML = `
            <div>${date.date()}</div>
            <div class="tasks" id="${formattedDate}-tasks"></div>
            <button class="add-task-btn" onclick="openModal('${formattedDate}')">Add Task</button>
        `;
        calendarGrid.appendChild(dayContainer);

        renderTasks(formattedDate);
    }

    // Add Date to Calendar
    function addDate(day, classes, formattedDate) {
        const dateElement = document.createElement("div");
        dateElement.className = `date ${classes}`;
        dateElement.dataset.date = formattedDate;
        dateElement.innerHTML = `
            <div>${day}</div>
            <div class="tasks" id="${formattedDate}-tasks"></div>
            ${formattedDate ? `<button class="add-task-btn" onclick="openModal('${formattedDate}')">Add Task</button>` : ""}
        `;
        calendarGrid.appendChild(dateElement);
    }

    // Render Tasks
    function renderTasks(date) {
        const taskContainer = document.getElementById(`${date}-tasks`);
        if (!taskContainer) return;

        taskContainer.innerHTML = "";

        if (!tasks[date]) return;

        const sortedTasks = tasks[date].slice().sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.urgency === "urgent" && b.urgency !== "urgent") return -1;
            if (b.urgency === "urgent" && a.urgency !== "urgent") return 1;
            return 0;
        });

        sortedTasks.forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.className = `task-item ${task.completed ? "completed" : task.urgency}`;
            taskItem.dataset.date = date;
            taskItem.dataset.index = index;
            taskItem.innerHTML = `
                <span class="task-text">${task.text}</span>
                <button onclick="deleteTask('${date}', ${index})" class="delete-task">&times;</button>
            `;
            taskItem.querySelector(".task-text").addEventListener("click", () => toggleComplete(date, index));
            taskContainer.appendChild(taskItem);
        });
    }

    // Toggle Complete Task
    window.toggleComplete = (date, index) => {
        tasks[date][index].completed = !tasks[date][index].completed;
        saveTasks();
        renderTasks(date);
    };

    // Delete Task
    window.deleteTask = (date, index) => {
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

    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

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

    function renderWeekView(date) {
        const startOfWeek = date.startOf("week");
        const endOfWeek = date.endOf("week");
    
        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.add(i, "day");
            const formattedDate = day.format("YYYY-MM-DD");
    
            // Determine if the day belongs to the current month
            const isCurrentMonth = day.month() === date.month();
            const dayClass = isCurrentMonth
                ? day.isSame(dayjs(), "day") 
                    ? "current-day active" 
                    : "active"
                : "inactive"; 
    
            addDate(day.date(), dayClass, formattedDate);
            if (isCurrentMonth) renderTasks(formattedDate);
        }
    }
    
    // Add Date to Calendar
    function addDate(day, classes, formattedDate) {
        const dateElement = document.createElement("div");
        dateElement.className = `date ${classes}`;
        dateElement.dataset.date = formattedDate;
        dateElement.innerHTML = `
            <div>${day}</div>
            <div class="tasks" id="${formattedDate}-tasks"></div>
            ${formattedDate ? `<button class="add-task-btn" onclick="openModal('${formattedDate}')">+ Task</button>` : ""}
        `;
        calendarGrid.appendChild(dateElement);
    }
    
    prevMonthButton.addEventListener("click", () => {
        if (currentView === "week") {
            currentDate = currentDate.subtract(1, "week");
        } else if (currentView === "day") {
            currentDate = currentDate.subtract(1, "day");
        } else {
            currentDate = currentDate.subtract(1, "month");
        }
        renderCalendar(currentDate);
    });

    nextMonthButton.addEventListener("click", () => {
        if (currentView === "week") {
            currentDate = currentDate.add(1, "week");
        } else if (currentView === "day") {
            currentDate = currentDate.add(1, "day");
        } else {
            currentDate = currentDate.add(1, "month");
        }
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);
});
