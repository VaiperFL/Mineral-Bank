// Mostrar el cuadro de meses al hacer clic en el botón
document.getElementById('changeButton').addEventListener('click', function () {
    const monthsContainer = document.getElementById('monthsContainer');
    monthsContainer.style.display = monthsContainer.style.display === 'none' ? 'block' : 'none';
});

// Cambiar el mes al seleccionar uno en el cuadro de meses
document.querySelectorAll('.month-option').forEach(month => {
    month.addEventListener('click', function() {
        currentMonth = parseInt(month.getAttribute('data-month'));
        loadDaysSegundo(currentMonth);
        document.getElementById('monthsContainer').style.display = 'none'; // Ocultar el cuadro de meses después de seleccionar
    });
});
// Cerrar el cuadro de meses cuando se haga clic en cualquier parte de la pantalla
document.addEventListener('click', function (event) {
    const monthsContainer = document.getElementById('monthsContainer');
    const changeButton = document.getElementById('changeButton');

    // Verificar si el clic ocurrió fuera del cuadro de meses y del botón
    if (!monthsContainer.contains(event.target) && event.target !== changeButton) {
        monthsContainer.style.display = 'none';
    }
});

// Función para habilitar el arrastre de los meses
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// Función para permitir soltar los meses
function allowDrop(ev) {
    ev.preventDefault(); // Evita el comportamiento por defecto (no permitir el drop)
}

// Función para manejar el soltar y mover los elementos
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    var targetElement = ev.target;

    // Asegurarse de que estamos soltando sobre un mes
    if (targetElement.classList.contains("month-option")) {
        var parent = targetElement.parentNode;
        parent.insertBefore(draggedElement, targetElement);
    }
}

// Cargar los días del mes seleccionado
function loadDays(month, year) {
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = ''; // Limpiar el calendario

    const numDays = daysInMonth[month];
    const firstDay = new Date(year, month - 1, 1).getDay(); // Día de la semana en que empieza el mes

    let row = document.createElement('tr'); // Fila de los días
    // Rellenar los días vacíos antes del primer día
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('td');
        emptyCell.classList.add('empty'); // Añadir la clase empty para los días vacíos
        row.appendChild(emptyCell);
    }

    // Crear celdas para los días del mes
    for (let i = 1; i <= numDays; i++) {
        const cell = document.createElement('td');
        cell.textContent = i;
        row.appendChild(cell);

        // Si se llega al sábado (índice 6), se inicia una nueva fila
        if ((i + firstDay) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
    }

    // Añadir la fila si tiene días restantes
    if (row.children.length > 0) {
        // Asegurarse de llenar los días vacíos si el mes no termina en sábado
        const remainingCells = 7 - row.children.length; // Número de celdas vacías necesarias para completar la fila
        for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('td');
            emptyCell.classList.add('empty'); // Añadir la clase empty para los días vacíos
            row.appendChild(emptyCell);
        }

        calendarBody.appendChild(row); // Añadir la fila con los días restantes
    }
}
// Mostrar u ocultar el menú de salas al hacer clic en "Seleccione"
document.getElementById('toggleButton').addEventListener('click', function() {
    const dropdownContainer = document.getElementById('dropdownContainer');
    // Alternar la visibilidad entre mostrar y ocultar
    dropdownContainer.style.display = (dropdownContainer.style.display === 'none' || dropdownContainer.style.display === '') ? 'block' : 'none';
});

// Cerrar el cuadro de salas cuando se haga clic fuera de él
document.addEventListener('click', function(event) {
    const dropdownContainer = document.getElementById('dropdownContainer');
    const toggleButton = document.getElementById('toggleButton');

    // Verificar si el clic ocurrió fuera del cuadro de salas o del botón
    if (!dropdownContainer.contains(event.target) && event.target !== toggleButton) {
        dropdownContainer.style.display = 'none'; // Ocultar el menú
    }
});
document.getElementById('toggleDiaHoraButton').addEventListener('click', function() {
    const dropdownContainer = document.getElementById('dropdownDiaHoraContainer');
    dropdownContainer.style.display = (dropdownContainer.style.display === 'none' || dropdownContainer.style.display === '') ? 'block' : 'none';
});

document.getElementById('toggleButtonEventoReunion').addEventListener('click', function() { 
    const dropdownContainer = document.getElementById('dropdownContainerEventoReunion');
    dropdownContainer.style.display = (dropdownContainer.style.display === 'none' || dropdownContainer.style.display === '') ? 'block' : 'none';
});
document.getElementById('reserveButton').addEventListener('click', function() {
    const sala = document.getElementById('selectSala').value;
    const dia = document.getElementById('selectDia').value;
    const motivo = document.getElementById('selectMotivo').value;

    if (sala && dia && motivo) {
        alert(`Reserva exitosa!\nSala: ${sala}\nDía: ${dia}\nMotivo: ${motivo}`);
    } else {
        alert('Por favor, completa todos los campos.');
    }
});

window.addEventListener('resize', function() {
    const zoom = window.devicePixelRatio; // Detecta el nivel de zoom
    const padding = 20 / zoom; // Ajusta el padding según el zoom
    document.querySelector('.mi-elemento').style.padding = `${padding}px`;
  });










