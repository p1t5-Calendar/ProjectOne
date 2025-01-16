document.addEventListener ("DOMContentLoaded", () =>  {
    const calendarGrid = document.querySelector(".calendar-grid");
    const monthYear = document.getElementById("monthYear");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");
    const modal = document.getElementById("taskModal");
    const taskForm = document.getElementById("taskForm");
    const selectedDateInput = document.getElementById("selectedDate");
    const closeButton = document.querySelector(".close-button");

let currentDate = dayjs();
const tasks = JSON.parse(localStorage.getItem("Tasks")) || {};

function rednerCalendar(date) {
    calendarGrid.innerHTML = "";

    const startOfMonth = date.startOf("month");
    const endOfMonth = date.endOf("month");
    const daysInMonth = date.daysInMonth();
    const startDayOfWeek = startOfMonth.day();

}

console.log(dayjs());

const days = document.querySelectorAll('.day-name');
for(const day of days) {day.style.color="red"};

// dayjs().startOf('month').add(1, 'day').set('year', 2018); format('YYYY-MM-DD');
// dayjs('2018-08-08'); // parse
// dayjs().format('{YYYY} MM-DDTHH:mm:ss SSS [Z] A');// Display
// dayjs().set('month', 3).month(); // get & set
// dayjs().add(1, 'year'); // manipulate
// dayjs().isBefore(dayjs()); // query
// dayjs.extend(isLeapYear); // use plugin


console.log(days);
})