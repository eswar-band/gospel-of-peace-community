(() => {
 const $=(s,r=document)=>r.querySelector(s), items=Array.isArray(window.CHURCH_BOOKS)?window.CHURCH_BOOKS:[];
 const grid=$("#booksGrid"),search=$("#bookSearch"),category=$("#bookCategory"),sort=$("#bookSort"),count=$("#booksCount"),empty=$("#booksEmpty");
 const dialog=$("#bookDialog"),readLink=$("#bookReadLink"),downloadLink=$("#bookDownloadLink"),unavailable=$("#bookUnavailable");
 const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;};
 [...new Set(items.map(x=>x.category))].sort().forEach(value=>{const option=make("option","",value);option.value=value;category.append(option);});
 function open(item){
  $("#bookDialogCategory").textContent=item.category;
  $("#bookDialogTitle").textContent=item.title;
  $("#bookDialogAuthor").textContent="By "+item.author;
  $("#bookDialogDescription").textContent=item.description;
  $("#bookDialogMeta").textContent=item.type+" · "+item.year;
  $("#bookDialogCover").textContent="✧";
  const hasPdf=typeof item.pdfUrl==="string"&&/^https:\/\//i.test(item.pdfUrl);
  readLink.hidden=!hasPdf;downloadLink.hidden=!hasPdf;unavailable.hidden=hasPdf;
  if(hasPdf){readLink.href=item.pdfUrl;downloadLink.href=item.pdfUrl;downloadLink.download=(item.id||"publication")+".pdf";}
  if(typeof dialog.showModal==="function")dialog.showModal();
 }
 function render(){
  const term=search.value.trim().toLocaleLowerCase();
  let filtered=items.filter(item=>(category.value==="all"||item.category===category.value)&&(!term||[item.title,item.author,item.category,item.type,item.description].join(" ").toLocaleLowerCase().includes(term)));
  filtered.sort((a,b)=>sort.value==="newest"?b.year-a.year||a.title.localeCompare(b.title):sort.value==="oldest"?a.year-b.year||a.title.localeCompare(b.title):a.title.localeCompare(b.title));
  grid.replaceChildren();
  filtered.forEach(item=>{
   const card=make("article","book-card"),cover=make("div","book-cover");
   cover.append(make("span","cover-mark","✧"),make("span","cover-title",item.title),make("span","cover-kind",item.type));
   const copy=make("div","book-card-copy");
   copy.append(make("small","",item.category),make("h3","",item.title),make("p","book-author","By "+item.author),make("p","",item.description));
   const actions=make("div","book-card-actions"),details=make("button","","View details ↗"),year=make("span","",String(item.year));
   details.type="button";details.addEventListener("click",()=>open(item));actions.append(details,year);copy.append(actions);card.append(cover,copy);grid.append(card);
  });
  count.textContent=filtered.length+" "+(filtered.length===1?"publication":"publications");
  empty.hidden=filtered.length!==0;grid.hidden=filtered.length===0;
 }
 $("#clearBooks").addEventListener("click",()=>{search.value="";category.value="all";sort.value="title";render();search.focus();});
 $("#closeBookDialog").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
 search.addEventListener("input",render);category.addEventListener("change",render);sort.addEventListener("change",render);
 const themeToggle=$("#themeToggle"),themeKey="gospel-peace-theme",legacyThemeKey="modern-church-theme",preference=window.matchMedia?.("(prefers-color-scheme: dark)");
 function saved(){try{return localStorage.getItem(themeKey)||localStorage.getItem(legacyThemeKey);}catch{return null;}}
 function apply(theme){const dark=theme==="dark";document.documentElement.dataset.theme=dark?"dark":"light";themeToggle.querySelector(".theme-icon").textContent=dark?"☀":"☾";themeToggle.querySelector(".theme-label").textContent=dark?"Light":"Dark";themeToggle.setAttribute("aria-label","Switch to "+(dark?"light":"dark")+" mode");themeToggle.setAttribute("aria-pressed",String(dark));$('meta[name="theme-color"]').content=dark?"#0c1422":"#f5f3ee";}
 apply(saved()||(preference?.matches?"dark":"light"));
 themeToggle.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem(themeKey,next);}catch{}apply(next);});
 preference?.addEventListener?.("change",e=>{if(!saved())apply(e.matches?"dark":"light");});
 const menu=$("#menuToggle"),nav=$("#mainNav");
 menu.addEventListener("click",()=>{const isOpen=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(isOpen));menu.setAttribute("aria-label",isOpen?"Close navigation":"Open navigation");});
 nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Open navigation");}));
 render();
})();