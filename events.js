(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const events = Array.isArray(window.CHURCH_EVENTS) ? window.CHURCH_EVENTS : [];
  const list = $("#eventsList"), calendar = $("#eventsCalendar"), empty = $("#eventsEmpty");
  const search = $("#eventSearch"), category = $("#eventCategory"), status = $("#eventStatus");
  const dialog = $("#eventDialog");
  const today = new Date(); today.setHours(0,0,0,0);
  const todayKey = [today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");
  let view = "list";
  let calendarDate = new Date(today.getFullYear(),today.getMonth(),1);
  const parseDate = value => new Date(value + "T12:00:00");
  const dateParts = value => ({date:parseDate(value),day:parseDate(value).getDate(),month:new Intl.DateTimeFormat("en",{month:"short"}).format(parseDate(value)).toUpperCase(),full:new Intl.DateTimeFormat("en",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(parseDate(value))});
  const esc = value => String(value ?? "");
  const make = (tag, className, text) => { const el=document.createElement(tag); if(className) el.className=className; if(text!==undefined) el.textContent=text; return el; };
  const filteredEvents = () => {
    const term=search.value.trim().toLocaleLowerCase();
    return events.filter(event => {
      const searchable=[event.title,event.category,event.venue,event.location,event.description].join(" ").toLocaleLowerCase();
      const matchesTerm=!term || searchable.includes(term);
      const matchesCategory=category.value==="all" || event.category===category.value;
      const isPast=event.date<todayKey;
      const matchesStatus=status.value==="all" || (status.value==="past" ? isPast : !isPast);
      return matchesTerm && matchesCategory && matchesStatus;
    }).sort((a,b)=>a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  };
  function openEvent(event) {
    const parts=dateParts(event.date);
    $("#eventDialogCategory").textContent=event.category;
    $("#eventDialogTitle").textContent=event.title;
    $("#eventDialogDate").textContent=parts.full;
    $("#eventDialogTime").textContent=event.startTime + (event.endTime ? " – " + event.endTime : "");
    $("#eventDialogVenue").textContent=event.venue;
    $("#eventDialogDescription").textContent=event.description;
    $("#eventDialogNote").textContent=event.note || "Please contact the church team for more information.";
    if(typeof dialog.showModal==="function") dialog.showModal();
  }
  function makeCard(event) {
    const parts=dateParts(event.date), card=make("article","event-card");
    card.setAttribute("role","button"); card.setAttribute("tabindex","0");
    card.setAttribute("aria-label","View event details: "+event.title+", "+parts.full);
    const activate=()=>openEvent(event);
    card.addEventListener("click",activate);
    card.addEventListener("keydown",e=>{if(e.key==="Enter" || e.key===" "){e.preventDefault();activate();}});
    const date=make("div","event-date-tile"); date.append(make("strong","",String(parts.day).padStart(2,"0")),make("span","",parts.month));
    const content=make("div","event-card-content"), top=make("div","event-card-top");
    top.append(make("span","event-category",event.category),make("span","event-status",event.date<todayKey?"Past event":"Upcoming"));
    content.append(top,make("h3","",event.title),make("p","",event.description));
    const meta=make("div","event-card-meta"); meta.append(make("span","","◷ "+event.startTime),make("span","","⌖ "+event.venue));
    content.append(meta,make("span","event-card-action","View event details ↗"));
    card.append(date,content); return card;
  }
  function renderList(items) {
    list.replaceChildren(); items.forEach(event=>list.append(makeCard(event)));
    list.hidden = view !== "list" || items.length === 0;
    calendar.hidden = view !== "calendar" || items.length === 0;
    list.setAttribute("aria-hidden", String(list.hidden));
    calendar.setAttribute("aria-hidden", String(calendar.hidden));
    empty.hidden=items.length!==0;
    $("#eventsCount").textContent=items.length+" "+(items.length===1?"event":"events")+" found";
    $("#eventsRangeLabel").textContent=status.value==="past"?"Past events":status.value==="all"?"All events":"Upcoming events";
    list.setAttribute("aria-busy","false");
  }
  function renderCalendar(items) {
    const year=calendarDate.getFullYear(), month=calendarDate.getMonth();
    $("#calendarMonthLabel").textContent=new Intl.DateTimeFormat("en",{month:"long",year:"numeric"}).format(calendarDate);
    const firstDay=new Date(year,month,1).getDay(), days=new Date(year,month+1,0).getDate();
    const prevDays=new Date(year,month,0).getDate(), cells=Math.ceil((firstDay+days)/7)*7;
    const byDate=new Map();
    items.forEach(event=>{if(!byDate.has(event.date))byDate.set(event.date,[]);byDate.get(event.date).push(event);});
    const grid=$("#calendarGrid"); grid.replaceChildren();
    for(let index=0;index<cells;index++){
      const dayNumber=index-firstDay+1;
      const dateObj=dayNumber<1?new Date(year,month-1,prevDays+dayNumber):dayNumber>days?new Date(year,month+1,dayNumber-days):new Date(year,month,dayNumber);
      const key=[dateObj.getFullYear(),String(dateObj.getMonth()+1).padStart(2,"0"),String(dateObj.getDate()).padStart(2,"0")].join("-");
      const outside=dateObj.getMonth()!==month, cell=make("div","calendar-day"+(outside?" outside":"")+(key===todayKey?" today":""));
      const number=make("span","calendar-day-number",String(dateObj.getDate())); cell.append(number);
      const dayEvents=byDate.get(key)||[];
      dayEvents.slice(0,2).forEach(event=>{
        const chip=make("button","calendar-event-chip",event.title);
        chip.type="button"; chip.title=event.title; chip.setAttribute("aria-label","View "+event.title);
        chip.addEventListener("click",e=>{e.stopPropagation();openEvent(event);}); cell.append(chip);
      });
      if(dayEvents.length>2) cell.append(make("span","calendar-more","+"+(dayEvents.length-2)+" more"));
      grid.append(cell);
    }
  }
  function render() {
    const items=filteredEvents(); renderList(items);
    if(view==="calendar") renderCalendar(items);
  }
  function setView(next) {
    view=next;
    $("#listViewButton").classList.toggle("active",view==="list");
    $("#calendarViewButton").classList.toggle("active",view==="calendar");
    $("#listViewButton").setAttribute("aria-pressed",String(view==="list"));
    $("#calendarViewButton").setAttribute("aria-pressed",String(view==="calendar"));
    render();
  }
  [...new Set(events.map(event=>event.category))].sort().forEach(value=>category.add(new Option(value,value)));
  [search].forEach(control=>control.addEventListener("input",render));
  [category,status].forEach(control=>control.addEventListener("change",render));
  $("#listViewButton").addEventListener("click",()=>setView("list"));
  $("#calendarViewButton").addEventListener("click",()=>setView("calendar"));
  $("#previousMonth").addEventListener("click",()=>{calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()-1,1);render();});
  $("#nextMonth").addEventListener("click",()=>{calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+1,1);render();});
  function clearFilters(){search.value="";category.value="all";status.value="upcoming";render();}
  $("#clearEventFilters").addEventListener("click",clearFilters);
  $("#clearEmptyEvents").addEventListener("click",clearFilters);
  $("#closeEventDialog").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});

  const themeToggle=$("#themeToggle"), themeKey="gospel-peace-theme", themePreference=window.matchMedia?.("(prefers-color-scheme: dark)");
  function savedTheme(){try{return localStorage.getItem(themeKey)||localStorage.getItem("modern-church-theme");}catch{return null;}}
  function applyTheme(theme){
    const dark=theme==="dark";document.documentElement.dataset.theme=dark?"dark":"light";
    themeToggle.querySelector(".theme-icon").textContent=dark?"☀":"☾";
    themeToggle.querySelector(".theme-label").textContent=dark?"Light":"Dark";
    themeToggle.setAttribute("aria-label","Switch to "+(dark?"light":"dark")+" mode");
    themeToggle.setAttribute("aria-pressed",String(dark));
    $('meta[name="theme-color"]').content=dark?"#0c1422":"#f5f3ee";
  }
  applyTheme(savedTheme()||(themePreference?.matches?"dark":"light"));
  themeToggle.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem(themeKey,next);}catch{}applyTheme(next);});
  themePreference?.addEventListener?.("change",event=>{if(!savedTheme())applyTheme(event.matches?"dark":"light");});
  const menuToggle=$("#menuToggle"), nav=$("#mainNav");
  menuToggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));menuToggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");});
  nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{nav.classList.remove("open");menuToggle.setAttribute("aria-expanded","false");menuToggle.setAttribute("aria-label","Open navigation");}));
  render();
})();
