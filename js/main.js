var d = document;

var menu = d.getElementById("menu");
var nav = d.getElementById("nav");
var exit = d.getElementById("exit");

menu.addEventListener("click", (e) => {
    nav.classList.toggle("hide-mobile");
    e.preventDefault();
});

exit.addEventListener("click", (e) => {
    nav.classList.toggle("hide-mobile");
    e.preventDefault();
});