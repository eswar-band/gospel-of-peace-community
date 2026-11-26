(() => {
 const $=(s,r=document)=>r.querySelector(s), items=Array.isArray(window.CHURCH_BOOKS)?window.CHURCH_BOOKS:[];
 const grid=$("#booksGrid"),search=$("#bookSearch"),category=$("#bookCategory"),access=$("#bookAccess"),sort=$("#bookSort"),count=$("#booksCount"),empty=$("#booksEmpty");
 const dialog=$("#bookDialog"),readLink=$("#bookReadLink"),downloadLink=$("#bookDownloadLink"),unavailable=$("#bookUnavailable"),memberLink=$("#bookMemberLink");
 const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;};
 [...new Set(items.map(x=>x.category))].sort().forEach(value=>{const option=make("option","",value);option.value=value;category.append(option);});
 async function open(item){
  $("#bookDialogCategory").textContent=item.category+" · "+((item.access||"free")==="paid"?"PAID":"FREE");
  $("#bookDialogTitle").textContent=item.title;
  $("#bookDialogAuthor").textContent="By "+item.author;
  $("#bookDialogDescription").textContent=item.description;
  $("#bookDialogMeta").textContent=item.type+" · "+item.year;
  $("#bookDialogCover").textContent="✧";
  readLink.hidden=true;downloadLink.hidden=true;unavailable.hidden=false;memberLink.hidden=item.access!=="paid";
  unavailable.textContent=item.access==="paid"?"Paid membership required. Secure membership verification is not connected yet.":"Free to read — the authorized PDF has not been added yet.";
  let pdfUrl=null;
  if(item.access!=="paid"&&typeof item.pdfUrl==="string"&&/^https:\/\//i.test(item.pdfUrl))pdfUrl=item.pdfUrl;
  // The auth adapter must verify an active paid membership server-side and return a short-lived protected URL.
  // Never put a public/static paid PDF URL in the catalogue.
  if(item.access==="paid"&&typeof window.GOPC_AUTH?.getProtectedBookUrl==="function"){
   try{const protectedUrl=await window.GOPC_AUTH.getProtectedBookUrl(item.id);if(typeof protectedUrl==="string"&&/^https:\/\//i.test(protectedUrl))pdfUrl=protectedUrl;}catch(error){console.warn("Paid book access could not be verified.",error);}
  }
  if(pdfUrl){readLink.href=pdfUrl;downloadLink.href=pdfUrl;downloadLink.download=(item.id||"publication")+".pdf";readLink.hidden=false;downloadLink.hidden=false;unavailable.hidden=true;}
  if(typeof dialog.showModal==="function")dialog.showModal();
 }
 function render(){
  const term=search.value.trim().toLocaleLowerCase();
  let filtered=items.filter(item=>(category.value==="all"||item.category===category.value)&&(access.value==="all"||(item.access||"free")===access.value)&&(!term||[item.title,item.author,item.category,item.type,item.description].join(" ").toLocaleLowerCase().includes(term)));
  filtered.sort((a,b)=>sort.value==="newest"?b.year-a.year||a.title.localeCompare(b.title):sort.value==="oldest"?a.year-b.year||a.title.localeCompare(b.title):a.title.localeCompare(b.title));
  grid.replaceChildren();
  filtered.forEach(item=>{
   const card=make("article","book-card"),cover=make("div","book-cover");\n   card.tabIndex=0;card.setAttribute("role","button");card.setAttribute("aria-label","View details for "+item.title);card.addEventListener("click",()=>open(item));card.addEventListener("keydown",event=>{if(event.target!==card)return;if(event.key==="Enter"||event.key===" "){event.preventDefault();open(item);}});
   cover.append(make("span","cover-mark","✧"),make("span","cover-title",item.title),make("span","cover-kind",item.type));
   const copy=make("div","book-card-copy");
   copy.append(make("small","",item.category),make("h3","",item.title),make("p","book-author","By "+item.author),make("p","",item.description));
   const actions=make("div","book-card-actions"),details=make("button","","View details ↗"),year=make("span","",String(item.year)),badge=make("span","book-access-badge "+((item.access||"free")==="paid"?"is-paid":"is-free"),(item.access||"free")==="paid"?"PAID":"FREE");
   details.type="button";details.addEventListener("click",()=>open(item));actions.append(details,badge,year);copy.append(actions);card.append(cover,copy);grid.append(card);
  });
  count.textContent=filtered.length+" "+(filtered.length===1?"publication":"publications");
  empty.hidden=filtered.length!==0;grid.hidden=filtered.length===0;
 }
 function clearBookFilters(){
  search.value="";
  category.value="all";
  access.value="all";
  sort.value="title";
  render();
  search.focus();
}
$("#clearBooks").addEventListener("click",clearBookFilters);
 $("#clearEmptyBooks")?.addEventListener("click",clearBookFilters);
 $("#closeBookDialog").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
 search.addEventListener("input",render);category.addEventListener("change",render);access.addEventListener("change",render);sort.addEventListener("change",render);
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
 const requestedBook=new URLSearchParams(window.location.search).get("book");
 if(requestedBook){const selected=items.find(item=>item.id===requestedBook);if(selected)open(selected);}
})();