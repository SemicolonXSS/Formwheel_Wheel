document.addEventListener("DOMContentLoaded", () => {
  const home = "https://semicolonxss.github.io/FormWheel/";
  const selectors = [
    ".logo", ".brand", ".logo-text", ".brand-logo",
    "[data-logo]", "header .logo", "nav .logo"
  ];
  document.querySelectorAll(selectors.join(",")).forEach(el => {
    if (el.closest("a")) return;
    el.style.cursor = "pointer";
    el.addEventListener("click", () => location.href = home);
  });
});
