var d = document;

var menu = d.getElementById("menu");
var nav = d.getElementById("nav");
var exit = d.getElementById("exit");

menu.addEventListener("click", (e) => {
    nav.classList.toggle("hide-mobile");
    menu.classList.toggle("hidden");
    e.preventDefault();
});

exit.addEventListener("click", (e) => {
    nav.classList.toggle("hide-mobile");
    menu.classList.toggle("hidden");
    e.preventDefault();
});