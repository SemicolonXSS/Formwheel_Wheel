(() => {
  const HOME = "https://semicolonxss.github.io/Formwheel/";
  function bindLogo(){
    document.querySelectorAll(".logo,.brand,.brand-logo,.logo-text,[data-logo]").forEach(el=>{
      if (el.dataset.formwheelBound) return;
      if (el.closest("a")) return;
      el.dataset.formwheelBound="1";
      el.style.cursor="pointer";
      el.addEventListener("click",()=>{ window.location.href=HOME; });
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bindLogo);
  else bindLogo();
})();
