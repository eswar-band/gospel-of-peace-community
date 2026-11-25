(() => {
 const $=(s,r=document)=>r.querySelector(s), items=Array.isArray(window.GALLERY_ITEMS)?window.GALLERY_ITEMS:[];
 const grid=$("#galleryGrid"), search=$("#gallerySearch"), categories=$("#galleryCategories"), count=$("#galleryCount"), empty=$("#galleryEmpty");
 const dialog=$("#galleryDialog"), dialogImage=$("#galleryDialogImage");
 let category="all";
 const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
 const allCategories=["all",...new Set(items.map(x=>x.category))];
 allCategories.forEach(value=>{const b=make("button","gallery-chip",value==="all"?"All moments":value);b.type="button";b.setAttribute("aria-pressed",String(value===category));b.addEventListener("click",()=>{category=value;render();});categories.append(b);});
 function render(){
  const term=search.value.trim().toLocaleLowerCase();
  const filtered=items.filter(item=>(category==="all"||item.category===category)&&(!term||[item.title,item.category,item.description].join(" ").toLocaleLowerCase().includes(term)));
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
 function open(item){$("#galleryDialogCategory").textContent=item.category;$("#galleryDialogTitle").textContent=item.title;dialogImage.src=item.image;dialogImage.alt=item.alt;$("#galleryDialogCaption").textContent=item.description+" · "+item.date;if(typeof dialog.showModal==="function")dialog.showModal();else window.open(item.image,"_blank","noopener");}
 $("#clearGallery").addEventListener("click",()=>{search.value="";category="all";render();search.focus();});
 $("#closeGalleryDialog").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
 search.addEventListener("input",render);
 const themeToggle=$("#themeToggle"),themeKey="gospel-peace-theme",legacyThemeKey="modern-church-theme",preference=window.matchMedia?.("(prefers-color-scheme: dark)");
 function saved(){try{return localStorage.getItem(themeKey)||localStorage.getItem(legacyThemeKey);}catch{return null;}}
 function apply(theme){const dark=theme==="dark";document.documentElement.dataset.theme=dark?"dark":"light";themeToggle.querySelector(".theme-icon").textContent=dark?"☀":"☾";themeToggle.querySelector(".theme-label").textContent=dark?"Light":"Dark";themeToggle.setAttribute("aria-label","Switch to "+(dark?"light":"dark")+" mode");themeToggle.setAttribute("aria-pressed",String(dark));$('meta[name="theme-color"]').content=dark?"#0c1422":"#f5f3ee";}
 apply(saved()||(preference?.matches?"dark":"light"));
 themeToggle.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem(themeKey,next);}catch{}apply(next);});
 preference?.addEventListener?.("change",e=>{if(!saved())apply(e.matches?"dark":"light");});
 const menu=$("#menuToggle"),nav=$("#mainNav");
 menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"Close navigation":"Open navigation");});
 nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Open navigation");}));
 render();
})();