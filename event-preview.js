(() => {
  const dialog=document.getElementById("eventDialog");
  if(!dialog || !Array.isArray(window.CHURCH_EVENTS)) return;
  const events=window.CHURCH_EVENTS;
  const byTitle=new Map(events.map(event=>[event.title.toLocaleLowerCase(),event]));
  const parts=value=>{
    const date=new Date(value+"T12:00:00");
    return new Intl.DateTimeFormat("en",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(date);
  };
  function openEvent(event){
    document.getElementById("eventDialogCategory").textContent=event.category;
    document.getElementById("eventDialogTitle").textContent=event.title;
    document.getElementById("eventDialogDate").textContent=parts(event.date);
    document.getElementById("eventDialogTime").textContent=event.startTime+(event.endTime?" – "+event.endTime:"");
    document.getElementById("eventDialogVenue").textContent=event.venue;
    document.getElementById("eventDialogDescription").textContent=event.description;
    document.getElementById("eventDialogNote").textContent=event.note||"Please contact the church team for more information.";
    if(typeof dialog.showModal==="function") dialog.showModal();
  }
  document.querySelectorAll("[data-event-title]").forEach(card=>{
    const event=byTitle.get(card.dataset.eventTitle.toLocaleLowerCase());
    if(!event) return;
    const activate=()=>openEvent(event);
    card.addEventListener("click",e=>{if(e.target.closest("a,button")) return;activate();});
    card.addEventListener("keydown",e=>{
      if(e.target.closest("a,button")) return;
      if(e.key==="Enter"||e.key===" "){e.preventDefault();activate();}
    });
  });
  document.getElementById("closeEventDialog")?.addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
})();
