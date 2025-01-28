document.addEventListener("DOMContentLoaded", () => {
    const calendarGrid = document.querySelector(".calendar-grid");
    const monthYear = document.getElementById("monthYear");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");
    const modal = document.getElementById("taskModal");
    const modalContent = document.getElementById("modalContent");
    const modalHeader = document.getElementById("modalHeader");
    const resizeHandle = document.getElementById("resizeHandle");
    const taskForm = document.getElementById("taskForm");
    const selectedDateInput = document.getElementById("selectedDate");
    const darkModeButton = document.getElementById("darkb");
    const hamburgerButton = document.getElementById("hamburgerButton");
    const viewDropdown = document.getElementById("viewDropdown");
    const todayButton = document.getElementById("todayButton");

    let currentDate = dayjs();
    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    let currentView = "month";
    let icon = darkModeButton.querySelector("i")
    let isDragging = false;
    let isResizing = false;
    let dragOffset = { x: 0, y: 0 };
    let startSize = { width: 0, height: 0 };
    let startPosition = { x: 0, y: 0 };
    let lastTap = 0;


    // Dark Mode Toggle  
    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        icon.classList.toggle("bi-brightness-high-fill", !document.body.classList.contains("dark-mode"));
        icon.classList.toggle("bi-moon-stars-fill", document.body.classList.contains("dark-mode"));
    }
    darkModeButton.addEventListener("click", toggleDarkMode);

    
    // Today's Date Button
    todayButton.addEventListener("click", () => {
        currentDate = dayjs();
        renderCalendar(currentDate);
    });

    // Save Tasks
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    // Helper Function: Format Dates
    function getFormattedDate(date) {
        return date.format("YYYY-MM-DD");
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
        calendarGrid.classList.remove("month-view", "week-view", "day-view");
        calendarGrid.classList.add(`${currentView}-view`);
    
        calendarGrid.innerHTML = "";
    
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
            const dayHeader = document.createElement("div");
            dayHeader.className = "day-name";
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        const screenWidth = window.innerWidth;
        if (screenWidth < 768 && currentView === "month") {
            changeView("week"); 
            return;
        }

        if (currentView === "month") {
            renderMonthView(date);
        } else if (currentView === "week") {
            renderWeekView(date);
        } else if (currentView === "day") {
            renderDayView(date);
        }
    

        monthYear.textContent = date.format("MMMM YYYY");
        focusOnToday();
}
    // Function that brings you to today's date automatically on the screen
    function focusOnToday() {
        const todayElement = document.querySelector(".date.current-day");
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
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
            const formattedDate = getFormattedDate(date.date(day));
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
            const formattedDate = getFormattedDate(day);
            addDate(day.date(), day.isSame(dayjs(), "day") ? "current-day active" : "active", formattedDate);
            renderTasks(formattedDate);
        }
    }

    // Render Day View
    function renderDayView(date) {
        const formattedDate = getFormattedDate(date);

        calendarGrid.innerHTML = "";

        const dayHeader = document.createElement("div");
        dayHeader.className = "day-name";
        dayHeader.textContent = date.format("dddd, MMMM D, YYYY");
        calendarGrid.appendChild(dayHeader);

        const dayContainer = document.createElement("div");
        dayContainer.className = `date ${date.isSame(dayjs(), "day") ? "current-day active" : "active"}`;
        dayContainer.dataset.date = formattedDate;
        dayContainer.innerHTML = `
            <div>${date.date()}</div>
            <div class="tasks" id="${formattedDate}-tasks"></div>
            <button class="add-task-btn" onclick="openModal('${formattedDate}')">+ Task</button>
        `;
        calendarGrid.appendChild(dayContainer);

        renderTasks(formattedDate);
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
    
        // Limit # of tasks on mobile
        const maxTasks = window.innerWidth < 768 ? 2 : 5; 
        sortedTasks.slice(0, maxTasks).forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.className = `task-item ${task.completed ? "completed" : task.urgency}`;
            taskItem.dataset.date = date;
            taskItem.dataset.index = index;
            taskItem.innerHTML = `
                <span class="task-text">${task.text}</span>
                <button onclick="deleteTask('${date}', ${index})" class="delete-task">
                <i class="bi bi-x-circle-fill"></i>
                </button>
            `;
            taskItem.querySelector(".task-text").addEventListener("click", () => toggleComplete(date, index));
            taskContainer.appendChild(taskItem);
        });
    
        if (sortedTasks.length > maxTasks) {
            const viewAllButton = document.createElement("button");
            viewAllButton.className = "view-all-tasks";
            viewAllButton.innerHTML = "&#9660;"; 
            viewAllButton.style.color = "grey";
            viewAllButton.addEventListener("click", () => {
                taskContainer.innerHTML = "";
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
    
                // Replace arrow with "Collapse" option
                const collapseButton = document.createElement("button");
                collapseButton.className = "view-all-tasks";
                collapseButton.innerHTML = "&#9650;"; 
                collapseButton.style.color = "grey";
                collapseButton.addEventListener("click", () => {
                    renderTasks(date); 
                });
                taskContainer.appendChild(collapseButton);
            });
            taskContainer.appendChild(viewAllButton);
        }
    }   
    // Toggle Complete Task
    window.toggleComplete = (date, index) => {
        tasks[date][index].completed = !tasks[date][index].completed;
        saveTasks();
        renderTasks(date);
    };

    // Delete Task
    window.deleteTask = (date, index) => {
        if (!tasks[date] || !tasks[date][index]) {
            console.warn(`Task not found at index ${index} for date "${date}".`);
            return;
        }
        tasks[date].splice(index, 1);
        if (tasks[date].length === 0) delete tasks[date];
        saveTasks();
        renderTasks(date);
    };

    function openModal(date, event) {
        if (event) event.stopPropagation(); 
        selectedDateInput.value = date;
    
        // Display the modal
        modal.style.display = "block";
    
        // Dynamically position the modal in the center of the viewport
        const modalRect = modalContent.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        const topPosition = Math.max((viewportHeight - modalRect.height) / 2, 20);
        const leftPosition = Math.max((viewportWidth - modalRect.width) / 2, 20);
    
        modalContent.style.top = `${topPosition}px`;
        modalContent.style.left = `${leftPosition}px`;
        modalContent.style.position = "absolute";
    }
    // Modal Functions
    window.openModal = (date, event) => {
        if (event) event.stopPropagation(); 
        selectedDateInput.value = date;
        modal.style.display = "block";
    };

    window.closeModal = () => {
        modal.style.display = "none";
    };

    window.addEventListener("resize", () => {
        if (modal.style.display === "block") {
            const modalRect = modalContent.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
    
            const topPosition = Math.max((viewportHeight - modalRect.height) / 2, 20);
            const leftPosition = Math.max((viewportWidth - modalRect.width) / 2, 20);
    
            modalContent.style.top = `${topPosition}px`;
            modalContent.style.left = `${leftPosition}px`;
        }
    });

// Dragging and Resizing the Modal
modalHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragOffset.x = e.clientX - modalContent.offsetLeft;
    dragOffset.y = e.clientY - modalContent.offsetTop;
    modalContent.style.transition = "none"; 
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        modalContent.style.left = `${e.clientX - dragOffset.x}px`;
        modalContent.style.top = `${e.clientY - dragOffset.y}px`;
        modalContent.style.position = "absolute"; 
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false; 
});

// Resizing the Modal for Desktop
resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    startSize.width = modalContent.offsetWidth;
    startSize.height = modalContent.offsetHeight;
    startPosition.x = e.clientX;
    startPosition.y = e.clientY;
});

document.addEventListener("mousemove", (e) => {
    if (isResizing) {
        const newWidth = startSize.width + (e.clientX - startPosition.x);
        const newHeight = startSize.height + (e.clientY - startPosition.y);
        modalContent.style.width = `${newWidth}px`;
        modalContent.style.height = `${newHeight}px`;
    }
});

document.addEventListener("mouseup", () => {
    isResizing = false; 
});

// Dragging the Entire Modal (Desktop)
modalContent.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragOffset.x = e.clientX - modalContent.offsetLeft;
    dragOffset.y = e.clientY - modalContent.offsetTop;
    modalContent.style.transition = "none"; 
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        modalContent.style.left = `${e.clientX - dragOffset.x}px`;
        modalContent.style.top = `${e.clientY - dragOffset.y}px`;
        modalContent.style.position = "absolute"; 
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false; 
});

// Dragging the Entire Modal (Touch Devices)
modalContent.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) { 
        isDragging = true;
        dragOffset.x = e.touches[0].clientX - modalContent.offsetLeft;
        dragOffset.y = e.touches[0].clientY - modalContent.offsetTop;
        modalContent.style.transition = "none"; 
    }
});

modalContent.addEventListener("touchmove", (e) => {
    if (isDragging && e.touches.length === 1) {
        modalContent.style.left = `${e.touches[0].clientX - dragOffset.x}px`;
        modalContent.style.top = `${e.touches[0].clientY - dragOffset.y}px`;
        modalContent.style.position = "absolute";
    }
});

modalContent.addEventListener("touchend", () => {
    isDragging = false; 
});

// Resizing the Modal for Touch Devices
resizeHandle.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) { 
        isResizing = true;
        initialDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        startSize.width = modalContent.offsetWidth;
        startSize.height = modalContent.offsetHeight;
    }
});

resizeHandle.addEventListener("touchmove", (e) => {
    if (isResizing && e.touches.length === 2) {
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = currentDistance / initialDistance;

        modalContent.style.width = `${startSize.width * scale}px`;
        modalContent.style.height = `${startSize.height * scale}px`;
    }
});

resizeHandle.addEventListener("touchend", () => {
    isResizing = false; // End resizing
});

// Add event listener to the entire calendar grid
calendarGrid.addEventListener("click", (event) => {
    const targetCell = event.target.closest(".date"); // Get the tapped date cell
    if (!targetCell) return;

    // Hide all other Add Task buttons
    const allAddTaskButtons = document.querySelectorAll(".add-task-btn");
    allAddTaskButtons.forEach((button) => (button.style.opacity = "0"));

    // Show the Add Task button for the tapped cell
    const addTaskButton = targetCell.querySelector(".add-task-btn");
    if (addTaskButton) {
        addTaskButton.style.opacity = "1";
        addTaskButton.style.zIndex = "10"; // Ensure the button is on top
    }
});



// Pinch-to-resize fallback for multitouch interactions
modal.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) { // Detect multitouch for resizing
        initialDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
});

modal.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2) { // Multitouch gesture
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = currentDistance / initialDistance;
        modalContent.style.width = `${modalContent.offsetWidth * scale}px`;
        modalContent.style.height = `${modalContent.offsetHeight * scale}px`;
        initialDistance = currentDistance;
    }
});

modal.addEventListener("touchend", () => {
    isResizing = false; // End resizing
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    } else if (modal.contains(e.target)) {
        e.stopPropagation();
    }
});

modalContent.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click propagation
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
    
    calendarGrid.addEventListener("touchstart", (e) => {
        const target = e.target.closest(".date");
        if (!target) return;
    
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastTap;
    
        if (timeDiff < 300 && timeDiff > 0) { // Double-tap
            const date = target.dataset.date;
            if (date) {
                openModal(date, e);
            }
        } else { // Single-tap
            setTimeout(() => {
                // Handle single-tap actions (e.g., select date)
            }, 300);
        }
    
        lastTap = currentTime;
    });
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
    
        function changeDate(direction) {
            const unit = currentView === "week" ? "week" : currentView === "day" ? "day" : "month";
            currentDate = direction === "prev" ? currentDate.subtract(1, unit) : currentDate.add(1, unit);
            renderCalendar(currentDate);
        }
        prevMonthButton.addEventListener("click", () => changeDate("prev"));
        nextMonthButton.addEventListener("click", () => changeDate("next"));

    renderCalendar(currentDate);
});
