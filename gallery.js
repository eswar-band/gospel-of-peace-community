(() => {
 const $=(s,r=document)=>r.querySelector(s), items=Array.isArray(window.GALLERY_ITEMS)?window.GALLERY_ITEMS:[];
 const grid=$("#galleryGrid"),search=$("#gallerySearch"),categories=$("#galleryCategories"),count=$("#galleryCount"),empty=$("#galleryEmpty"),yearSelect=$("#galleryYear"),monthSelect=$("#galleryMonth");
 const dialog=$("#galleryDialog"),dialogImage=$("#galleryDialogImage");
 let category="all";
 const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
 const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
 const datedItems=items.map(item=>({...item,parsedDate:/^\d{4}-\d{2}-\d{2}$/.test(item.date||"")?new Date(item.date+"T00:00:00"):null}));
 [...new Set(datedItems.filter(x=>x.parsedDate&&!Number.isNaN(x.parsedDate.getTime())).map(x=>String(x.parsedDate.getFullYear())))].sort((a,b)=>b-a).forEach(year=>{const option=make("option","",year);option.value=year;yearSelect.append(option);});
 [...new Set(datedItems.filter(x=>x.parsedDate&&!Number.isNaN(x.parsedDate.getTime())).map(x=>x.parsedDate.getMonth()+1))].sort((a,b)=>a-b).forEach(month=>{const option=make("option","",monthNames[month-1]);option.value=String(month).padStart(2,"0");monthSelect.append(option);});
 const allCategories=["all",...new Set(items.map(x=>x.category))];
 allCategories.forEach(value=>{const b=make("button","gallery-chip",value==="all"?"All moments":value);b.type="button";b.setAttribute("aria-pressed",String(value===category));b.addEventListener("click",()=>{category=value;render();});categories.append(b);});
 function render(){
  const term=search.value.trim().toLocaleLowerCase();
  const filtered=datedItems.filter(item=>(category==="all"||item.category===category)&&(yearSelect.value==="all"||(item.parsedDate&&String(item.parsedDate.getFullYear())===yearSelect.value))&&(monthSelect.value==="all"||(item.parsedDate&&String(item.parsedDate.getMonth()+1).padStart(2,"0")===monthSelect.value))&&(!term||[item.title,item.category,item.description].join(" ").toLocaleLowerCase().includes(term)));
  grid.replaceChildren();
  filtered.forEach(item=>{
   const card=make("button","gallery-card");card.type="button";card.setAttribute("aria-label","View photo: "+item.title);
   const img=make("img");img.src=item.image;img.alt=item.alt;img.loading="lazy";img.decoding="async";img.addEventListener("error",()=>{img.remove();card.style.background="linear-gradient(135deg,#6b879d,#1b304b)";},{once:true});
   const copy=make("span","gallery-card-copy");copy.append(make("small","",item.category),make("strong","",item.title),make("span","",item.description));card.append(img,copy);card.addEventListener("click",()=>open(item));grid.append(card);
  });
  count.textContent=filtered.length+" "+(filtered.length===1?"moment":"moments");
  empty.hidden=filtered.length!==0;grid.hidden=filtered.length===0;
  categories.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String((b.textContent==="All moments"?"all":b.textContent)===category)));
 }
 function open(item){$("#galleryDialogCategory").textContent=item.category;$("#galleryDialogTitle").textContent=item.title;dialogImage.src=item.image;dialogImage.alt=item.alt;const displayDate=item.parsedDate&&!Number.isNaN(item.parsedDate.getTime())?item.parsedDate.toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"}):item.date;$("#galleryDialogCaption").textContent=item.description+" · "+displayDate;if(typeof dialog.showModal==="function")dialog.showModal();else window.open(item.image,"_blank","noopener");}
 function clearFilters(){search.value="";category="all";yearSelect.value="all";monthSelect.value="all";render();search.focus();}
 $("#clearGallery").addEventListener("click",clearFilters);
 $("#clearGalleryEmpty").addEventListener("click",clearFilters);
 $("#closeGalleryDialog").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
 search.addEventListener("input",render);yearSelect.addEventListener("change",render);monthSelect.addEventListener("change",render);
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