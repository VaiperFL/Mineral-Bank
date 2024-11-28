document.addEventListener("DOMContentLoaded", function () {
    const categoryItems = document.querySelectorAll(".category-item");
    const menuSections = document.querySelectorAll(".menu-items");

    categoryItems.forEach(item => {
        item.addEventListener("click", function () {
            const category = item.getAttribute("data-category");

            // Oculta todas las secciones y remueve la clase 'active' de cada una
            menuSections.forEach(section => {
                section.style.display = "none";
                section.classList.remove("active");
            });

            // Muestra la sección seleccionada
            const selectedSection = document.getElementById(category);
            if (selectedSection) {
                selectedSection.style.display = "flex"; // Muestra en formato de rejilla para mantener el estilo
                selectedSection.classList.add("active");
            }

          
            categoryItems.forEach(cat => cat.classList.remove("active"));
            item.classList.add("active");
        });
    });
});
