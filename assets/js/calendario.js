function showSchedule(date) {
    const modal = document.getElementById('schedule-modal');
    const scheduleDate = document.getElementById('schedule-date');
    const scheduleGrid = document.querySelector('.schedule-grid');

    scheduleDate.textContent = `Agenda del ${date}`;

    // Limpiar horarios anteriores
    scheduleGrid.innerHTML = '';

    // Crear horarios de 17:00 a 00:00
    for (let hour = 17; hour <= 24; hour++) {
        const time = hour === 24 ? '00:00' : `${hour}:00`;
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-hour';
        scheduleItem.textContent = time;
        scheduleGrid.appendChild(scheduleItem);
    }

    modal.style.display = 'block';
}

function closeSchedule() {
    const modal = document.getElementById('schedule-modal');
    modal.style.display = 'none';
}
