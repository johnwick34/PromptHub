/* ===== components ===== */
const fmt=n=>n>=1000?(n/1000).toFixed(1).replace(".0","")+"k":String(n);
const Badge=p=>p.badge?`<span class="badge ${p.badge==="NEW"?"new":p.badge[0]==="E"?"pick":""}">${esc(p.badge)}</span>`:"";
const Stat=p=>(+p.copies>0)?`<span class="stat" title="Times copied">📋 ${fmt(+p.copies)}</span>`:"";
const ModelPill=p=>p.model&&p.model!=="Any"?`<span class="mdl">${esc(p.model)}</span>`:"";
const altText=p=>`${p.title} - AI image prompt${p.model&&p.model!=="Any"?" for "+p.model:""}`;
const PromptCard=p=>`<article class="card" data-id="${p.id}">
  <button class="thumb" data-open="${p.id}" aria-label="Open ${esc(p.title)}">${Badge(p)}<img src="${esc(img(p))}" alt="${esc(altText(p))}" loading="lazy" decoding="async"></button>
  <button class="fav${isFav(p.id)?" on":""}" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="Save prompt">${isFav(p.id)?"♥":"♡"}</button>
  <div class="body"><h3><a href="${pUrl(p)}" data-open="${p.id}">${esc(p.title)}</a></h3><div class="meta"><span class="tag">${esc(p.category)}</span>${ModelPill(p)}${Stat(p)}</div><button class="copy" data-copy="${p.id}">Copy Prompt</button></div></article>`;
const PromptGrid=(el,list)=>{el.innerHTML=list.map(PromptCard).join("")};
const CategoryFilter=()=>["All",...CATS].map(c=>`<button class="chip${c===state.cat?" on":""}" data-cat="${c}" aria-pressed="${c===state.cat}">${c}</button>`).join("");

function shareBar(p){
  const u=location.origin+pUrl(p),t=`${p.title} - free AI image prompt`,e=encodeURIComponent,m=location.origin+"/api/img?id="+p.id;
  const L=[["X",`https://twitter.com/intent/tweet?text=${e(t)}&url=${e(u)}`],["WhatsApp",`https://wa.me/?text=${e(t+" "+u)}`],["Facebook",`https://www.facebook.com/sharer/sharer.php?u=${e(u)}`],["Pinterest",`https://pinterest.com/pin/create/button/?url=${e(u)}&media=${e(m)}&description=${e(t)}`],["Telegram",`https://t.me/share/url?url=${e(u)}&text=${e(t)}`]];
  return `<div class="mut small2">Share this prompt</div><div class="share">${L.map(([n,h])=>`<a class="chip" href="${h}" target="_blank" rel="noopener noreferrer">${n}</a>`).join("")}<button class="chip" data-copylink="${p.id}" type="button">🔗 Copy link</button><button class="chip s" data-card="${p.id}" type="button">🖼 Save share card</button></div>`;
}
let _title=document.title;
function openModal(){$("#modal").classList.add("open");document.body.style.overflow="hidden";const c=$("#closeM");if(c)c.focus()}
function PromptModal(p){
  $("#sheet").className="sheet";
  $("#sheet").innerHTML=`<img src="${esc(img(p))}" alt="${esc(altText(p))}">
  <div class="info"><button class="icon-btn close" id="closeM" aria-label="Close">✕</button>
  <div class="meta"><span class="tag">${esc(p.category)}</span>${ModelPill(p)}${Stat(p)}</div><h3 id="mTitle">${esc(p.title)}</h3>
  ${p.author?`<div class="mut small2">Prompt by ${esc(p.author)}</div>`:""}
  <div class="ptext">${esc(p.prompt)}</div>
  <div class="tags">${(p.tags||[]).map(t=>`<span>#${esc(t)}</span>`).join("")}</div>
  <button class="copy" data-copy="${p.id}" style="padding:13px">📋 Copy Prompt</button>
  <div class="mut small2">Or open a tool (the prompt is copied for you)</div>
  <div class="share">${Object.keys(OPEN_IN).map(n=>`<button class="chip" data-openin="${n}" data-id="${p.id}" type="button">${n} ↗</button>`).join("")}<button class="chip${isFav(p.id)?" on":""}" data-fav="${p.id}" type="button">${isFav(p.id)?"♥ Saved":"♡ Save"}</button></div>
  ${shareBar(p)}${related(p)}</div>`;
  document.title=`${p.title} - Free AI Image Prompt | PromptHub`;
  openModal();
}
function openPrompt(p,push=true){
  if(!p)return;PromptModal(p);bump(p.id,"views");
  if(push)try{history.pushState({p:p.id},"",pUrl(p))}catch(e){}
}
function closeModal(noPush){
  $("#modal").classList.remove("open");document.body.style.overflow="";document.title=_title;
  if(!noPush&&/^\/p\//.test(location.pathname))try{history.pushState(null,"","/")}catch(e){}
}
const Socials=()=>SOCIALS.map(([n,u,d])=>`<a href="${(CONFIG.socials||{})[n]||u}" target="_blank" rel="noopener noreferrer" aria-label="${n}" title="${n}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></a>`).join("");

/* ===== state + render ===== */
const state={q:"",cat:"All",model:"All",saved:false,sort:""};
const SYN={dark:["night","noir","rain"],night:["neon","dark"],girl:["woman","portrait"],boy:["man","portrait"],cute:["toy","anime","soft"],futuristic:["cyberpunk","neon","chrome"],scifi:["cyberpunk","chrome"],old:["vintage","retro","film"],retro:["vintage","film"],nature:["forest","mountain","landscape"],city:["street","alley","neon"],logo:["product","minimal"],clothes:["fashion","runway"],magic:["fantasy","dragon","elf"],building:["architecture","concrete"],car:["vintage","diner"],japan:["kyoto","anime","samurai"],epic:["dragon","landscape","cinematic"],minimal:["studio","product","soft"],face:["portrait"]};
const VIBES={"Moody & dark":"dark night rain neon","Clean & minimal":"minimal studio soft product","Bold & colorful":"neon red vibrant fashion","Nostalgic":"vintage retro film","Epic & magical":"epic fantasy dragon magic","Cute & playful":"cute toy anime"};
function lev(a,b){const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]}
/* scored search: title > category > tags > prompt text, with synonyms and typo tolerance */
function search(list,toks,or){
  const out=[];
  for(const p of list){
    const t=p.title.toLowerCase(),c=p.category.toLowerCase(),g=(p.tags||[]).join(" "),b=p.prompt.toLowerCase(),all=t+" "+c+" "+g+" "+b,words=all.split(/[^a-z0-9]+/);
    let sc=0,hit=0;
    for(const k of toks){
      let s=t.includes(k)?5:c.includes(k)?4:g.includes(k)?3:b.includes(k)?1:0;
      if(!s)for(const y of SYN[k]||[])if(all.includes(y)){s=.6;break}
      if(!s&&k.length>3&&words.some(w=>Math.abs(w.length-k.length)<2&&lev(w,k)<=(k.length>6?2:1)))s=1.2;
      if(s){hit++;sc+=s}
    }
    if(hit&&(or||hit===toks.length))out.push([sc+(p.badge==="TRENDING"?.3:0),p]);
  }
  return out.sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
}
function filtered(){
  const toks=state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let l=state.cat==="All"?PROMPTS:PROMPTS.filter(p=>p.category===state.cat);
  if(state.model!=="All")l=l.filter(p=>p.model===state.model);
  if(state.saved){const f=getFavs();l=l.filter(p=>f.includes(p.id))}
  if(toks.length)l=search(l,toks,state.or);
  if(state.sort==="new")l=[...l].sort((a,b)=>b.id-a.id);
  else if(state.sort==="trend")l=[...l].sort((a,b)=>(b.badge==="TRENDING")-(a.badge==="TRENDING"));
  else if(state.sort==="pop")l=[...l].sort((a,b)=>(+b.copies||0)-(+a.copies||0));
  return l;
}
function render(){
  const list=filtered();
  PromptGrid($("#grid"),list);
  $("#empty").classList.toggle("hide",list.length>0);
  $("#empty").innerHTML=state.saved&&!getFavs().length?`<h3>Nothing saved yet</h3><p>Tap the ♡ on any prompt to keep it here.</p>`:`<h3>No prompts found</h3><p>Try another keyword or explore a category.</p>`;
  $("#count").textContent=`${list.length} prompt${list.length===1?"":"s"}${state.q?` for “${state.q}”`:""}`;
  $("#categories").innerHTML=CategoryFilter();
  const sb2=$("#savedBtn");sb2.classList.toggle("on",state.saved);sb2.setAttribute("aria-pressed",state.saved);sb2.textContent=(state.saved?"♥ ":"♡ ")+"Saved"+(getFavs().length?` (${getFavs().length})`:"");
}
async function copyText(t){
  try{await navigator.clipboard.writeText(t)}
  catch(e){const a=document.createElement("textarea");a.value=t;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();try{document.execCommand("copy")}catch(_){}a.remove()}
}
async function saveCard(p){
  try{
    toast("Making your share card…");
    const c=await makeCard(p),blob=await new Promise(r=>c.toBlob(r,"image/png")),name=slug(p.title)+".png",file=new File([blob],name,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text:p.title+" - free prompt on PromptHub"});return}catch(e){if(e.name==="AbortError")return}}
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();toast("Share card saved");
  }catch(e){toast("Couldn't make the card for this image")}
}
const setFavUI=(id,on)=>document.querySelectorAll(`[data-fav="${id}"]`).forEach(b=>{b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);b.textContent=b.classList.contains("fav")?(on?"♥":"♡"):(on?"♥ Saved":"♡ Save")});

document.addEventListener("click",async e=>{
  const cp=e.target.closest("[data-copy]");
  if(cp){const p=PROMPTS.find(x=>x.id==cp.dataset.copy);await copyText(p.prompt);bump(p.id,"copies");
    const old=cp.dataset.label||cp.textContent;cp.dataset.label=old;cp.textContent="✓ Copied!";cp.classList.add("done");
    clearTimeout(cp._t);cp._t=setTimeout(()=>{cp.textContent=old;cp.classList.remove("done")},2000);return}
  const fv=e.target.closest("[data-fav]");
  if(fv){const id=fv.dataset.fav,on=toggleFav(id);setFavUI(id,on);toast(on?"Saved to your list":"Removed");if(state.saved)render();else $("#savedBtn").textContent="♡ Saved"+(getFavs().length?` (${getFavs().length})`:"");return}
  const oi=e.target.closest("[data-openin]");
  if(oi){const p=PROMPTS.find(x=>x.id==oi.dataset.id);copyText(p.prompt);bump(p.id,"copies");window.open(OPEN_IN[oi.dataset.openin](p.prompt),"_blank","noopener");toast("Prompt copied. Paste it there.");return}
  const cl=e.target.closest("[data-copylink]");
  if(cl){const p=PROMPTS.find(x=>x.id==cl.dataset.copylink);await copyText(location.origin+pUrl(p));toast("Link copied");return}
  const cd=e.target.closest("[data-card]");
  if(cd){saveCard(PROMPTS.find(x=>x.id==cd.dataset.card));return}
  if(e.target.closest("[data-submit]")){SubmitModal();return}
  const op=e.target.closest("[data-open]");
  if(op){e.preventDefault();openPrompt(PROMPTS.find(x=>x.id==op.dataset.open));return}
  const ct=e.target.closest("[data-cat]");
  if(ct){state.cat=ct.dataset.cat;render();if(ct.closest("#heroChips"))$("#explore").scrollIntoView();return}
  if(e.target.id==="modal"||e.target.closest("#closeM"))closeModal();
  if(e.target.closest("#links a"))toggleMenu(false);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
addEventListener("popstate",()=>{const m=location.pathname.match(/^\/p\/(\d+)/);if(m){const p=PROMPTS.find(x=>x.id==m[1]);if(p){PromptModal(p);return}}closeModal(true)});
$("#q").addEventListener("input",e=>{state.q=e.target.value;render()});
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter")$("#explore").scrollIntoView()});
$("#go").onclick=()=>$("#explore").scrollIntoView();
$("#searchBtn").onclick=()=>{$("#home").scrollIntoView();setTimeout(()=>$("#q").focus(),350)};
function toggleMenu(o){const l=$("#links");const open=o===undefined?!l.classList.contains("open"):o;l.classList.toggle("open",open);$("#burger").setAttribute("aria-expanded",open)}
$("#burger").onclick=()=>toggleMenu();

const related=p=>{const r=PROMPTS.filter(x=>x.id!==p.id).map(x=>[(x.category===p.category?2:0)+(x.tags||[]).filter(t=>(p.tags||[]).includes(t)).length,x]).filter(a=>a[0]).sort((a,b)=>b[0]-a[0]).slice(0,3);return r.length?`<div class="mut" style="margin-top:6px">More like this</div><div class="rel">${r.map(([,x])=>`<button data-open="${x.id}" aria-label="Open ${esc(x.title)}"><img src="${esc(img(x))}" alt="${esc(x.title)}"></button>`).join("")}</div>`:""};

/* prompt of the day: same pick all day for everyone, changes at midnight UTC */
function renderPotd(){
  const L=[...PROMPTS].sort((a,b)=>a.id-b.id);if(!L.length){$("#today").classList.add("hide");return}
  const p=L[Math.floor(Date.now()/864e5)%L.length];
  $("#potd").innerHTML=`<div class="potd"><button class="thumb" data-open="${p.id}" aria-label="Open ${esc(p.title)}"><img src="${esc(img(p))}" alt="${esc(altText(p))}" loading="lazy" decoding="async"></button>
  <div><span class="pill">⭐ Prompt of the day</span><h3>${esc(p.title)}</h3><p class="mut clamp" style="margin:0 0 14px">${esc(p.prompt)}</p>
  <div class="row2"><button class="copy" data-copy="${p.id}" style="padding:12px 22px;margin:0">Copy Prompt</button><button class="btn alt" data-open="${p.id}" type="button">View details</button></div></div></div>`;
}
function renderAll(){
  $("#collage").innerHTML=PROMPTS.slice(0,6).map(p=>`<img src="${esc(img(p))}" alt="">`).join("");
  PromptGrid($("#trendGrid"),PROMPTS.filter(p=>p.badge==="TRENDING"||p.trending).sort((a,b)=>(+b.copies||0)-(+a.copies||0)).slice(0,4));
  renderPotd();render();
}
function applyConfig(){const c=CONFIG;document.querySelectorAll("[data-mail]").forEach(a=>a.href="mailto:"+(c.email||"hello@example.com")+"?subject=Web%20development%20project");const w=(c.whatsapp||"").replace(/\D/g,"");document.querySelectorAll("[data-wa]").forEach(a=>{a.classList.toggle("hide",!w);if(w)a.href="https://wa.me/"+w})}

/* ===== search suggestions ===== */
const getRecent=()=>{try{return JSON.parse(localStorage.getItem("ph_recent")||"[]")}catch(e){return[]}};
const saveRecent=q=>{q=(q||"").trim();if(!q)return;try{localStorage.setItem("ph_recent",JSON.stringify([q,...getRecent().filter(x=>x!==q)].slice(0,5)))}catch(e){}};
const vocab=()=>[...new Set([...CATS.map(c=>c.toLowerCase()),...PROMPTS.flatMap(p=>p.tags||[])])];
const topTags=()=>{const m={};PROMPTS.forEach(p=>(p.tags||[]).forEach(t=>m[t]=(m[t]||0)+1));return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0])};
const hideSug=()=>$("#sug").classList.add("hide");
function showSug(){
  const v=$("#q").value.trim().toLowerCase(),it=(i,t,k,val)=>`<button type="button" role="option" data-kind="${k}" data-sug="${esc(val)}">${i} ${esc(t)}</button>`;
  let h="";
  if(!v){const r=getRecent();
    if(r.length)h+=`<div class="sh">Recent searches</div>`+r.map(x=>it("🕘",x,"q",x)).join("");
    h+=`<div class="sh">Try a popular tag</div><div class="sw2">`+topTags().map(t=>`<button type="button" class="chip" data-kind="q" data-sug="${esc(t)}">#${esc(t)}</button>`).join("")+`</div>`;
  }else{
    const toks=v.split(/\s+/),last=toks[toks.length-1],base=toks.slice(0,-1).join(" "),pre=base?base+" ":"";
    search(PROMPTS,toks,false).slice(0,4).forEach(p=>h+=it("🖼",p.title,"p",p.id));
    vocab().filter(w=>w!==last&&(w.startsWith(last)||(last.length>3&&lev(w,last)<=1))).slice(0,4).forEach(w=>h+=it("🔎",pre+w,"q",pre+w));
    if(!h){const c=vocab().map(w=>[lev(w,last),w]).sort((a,b)=>a[0]-b[0])[0];if(c&&c[0]<=2)h+=it("✨",`Did you mean “${c[1]}”?`,"q",pre+c[1])}
    if(!h)h=`<div class="sh">No matches yet. Try a vibe below, or hit Surprise me.</div>`;
  }
  $("#sug").innerHTML=h;$("#sug").classList.remove("hide");
}
$("#q").addEventListener("focus",showSug);
$("#q").addEventListener("input",()=>{state.or=false;showSug()});
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter"){saveRecent(state.q);hideSug()}});
$("#go").addEventListener("click",()=>{saveRecent(state.q);hideSug()});
$("#sort").onchange=e=>{state.sort=e.target.value;render()};
$("#modelSel").onchange=e=>{state.model=e.target.value;render()};
$("#savedBtn").onclick=()=>{state.saved=!state.saved;render()};
document.addEventListener("click",e=>{
  if(!e.target.closest(".sw"))hideSug();
  const s=e.target.closest("[data-sug]");
  if(s){const k=s.dataset.kind,v=s.dataset.sug;hideSug();
    if(k==="p")openPrompt(PROMPTS.find(x=>x.id==v));
    else{$("#q").value=v;state.q=v;state.or=false;state.cat="All";saveRecent(v);render();$("#explore").scrollIntoView()}}
  const vb=e.target.closest("[data-vibe]");
  if(vb){const k=vb.dataset.vibe;$("#q").value=k;state.q=VIBES[k];state.or=true;state.cat="All";render();$("#explore").scrollIntoView()}
  if(e.target.closest("#surprise")&&PROMPTS.length)openPrompt(PROMPTS[Math.floor(Math.random()*PROMPTS.length)]);
});

/* ===== Prompt Booster (runs in the browser, free) ===== */
const B_STYLE={"Cinematic":"cinematic still, dramatic lighting, shallow depth of field, anamorphic lens, film grain, rich color grading","Photoreal":"ultra realistic photograph, natural skin texture, 85mm lens, crisp focus, high detail","Anime":"anime style illustration, vibrant colors, clean line art, painterly background, studio-quality key art","3D render":"3D render, glossy materials, soft studio lighting, subsurface scattering, octane render","Product shot":"commercial product photography, clean reflective surface, crisp edges, minimal composition","Fantasy art":"epic fantasy illustration, intricate detail, matte painting style, dramatic atmosphere","Cyberpunk":"cyberpunk, neon signs, holographic details, wet streets, futuristic megacity","Vintage film":"vintage 35mm photograph, faded Kodachrome colors, film grain, light leaks, nostalgic mood"};
const B_LIGHT={"Golden hour":"warm golden hour backlight, long shadows","Neon night":"neon reflections, volumetric light, deep night","Soft studio":"soft diffused studio light, gentle catchlights","Moody & dark":"low-key lighting, deep shadows, rim light","Bright & airy":"bright airy natural light, pastel tones"};
const B_MODEL={"Any tool":"","ChatGPT / Gemini":", aspect ratio 4:5","Midjourney":" --ar 4:5 --v 7 --style raw","Flux":", sharp focus, 4:5 portrait"};
function boost(){
  const idea=$("#bIdea").value.trim().replace(/[.\s]+$/,"");
  if(!idea){toast("Type an idea first");$("#bIdea").focus();return}
  const t=`${idea}, ${B_STYLE[$("#bStyle").value]}, ${B_LIGHT[$("#bLight").value]}, highly detailed, sharp focus, professional composition${B_MODEL[$("#bModel").value]}`;
  $("#bText").textContent=t;$("#bOut").classList.remove("hide");
}

/* ===== Submit a prompt (community) ===== */
function SubmitModal(){
  $("#sheet").className="sheet adm";
  $("#sheet").innerHTML=`<div class="panel" style="border:0;position:relative"><button class="icon-btn close" id="closeM" aria-label="Close">✕</button>
  <h2 id="mTitle">Submit your prompt</h2><p class="mut" style="margin:0;padding-right:40px">Share a prompt you love. Good ones get featured with your name.</p>
  <label for="sTitle">Title</label><input id="sTitle" maxlength="100" placeholder="Neon Alley Runner">
  <label for="sCat">Category</label><select id="sCat">${CATS.map(c=>`<option>${c}</option>`).join("")}</select>
  <label for="sModel">Made with</label><select id="sModel">${MODELS.map(m=>`<option>${m}</option>`).join("")}</select>
  <label for="sTags">Tags (comma separated)</label><input id="sTags" maxlength="120" placeholder="neon, city, night">
  <label for="sPrompt">Full prompt</label><textarea id="sPrompt" rows="5" maxlength="1800" placeholder="Paste the complete prompt"></textarea>
  <label for="sFile">Image it made</label><input id="sFile" type="file" accept="image/*"><img id="sPrev" class="hide" alt="Image preview">
  <label for="sName">Your name or @handle (optional)</label><input id="sName" maxlength="50">
  <input id="sHp" class="hide" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="btn" id="sGo" type="button">Send for review</button><p class="mut" id="sMsg" role="status" style="margin:0"></p></div>`;
  openModal();
  let pic="";const m=(t,bad)=>{const e=$("#sMsg");e.textContent=t;e.style.color=bad?"#ff6b6b":"var(--mut)"};
  $("#sFile").onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{pic=await shrinkImage(f,640,.7);$("#sPrev").src=pic;$("#sPrev").classList.remove("hide")}catch(_){m("Could not read that image. Try a JPG or PNG.",true)}};
  $("#sGo").onclick=async()=>{
    if($("#sHp").value)return closeModal();
    const title=$("#sTitle").value.trim(),prompt=$("#sPrompt").value.trim();
    if(!title||prompt.length<20)return m("Add a title and the full prompt (at least 20 characters).",true);
    if(!pic)return m("Add the image the prompt created.",true);
    if(!SUPABASE_READY)return m("Submissions are not connected yet.",true);
    let n=0;try{n=+localStorage.getItem("ph_subs_"+new Date().toDateString())||0}catch(e){}
    if(n>=3)return m("You've sent 3 prompts today. Thank you! Come back tomorrow.",true);
    $("#sGo").disabled=true;m("Sending…");
    const row={title,category:$("#sCat").value,model:$("#sModel").value,tags:$("#sTags").value.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean).slice(0,8),prompt,image:pic,author:$("#sName").value.trim()};
    const{error}=await sb.from("submissions").insert(row);
    $("#sGo").disabled=false;
    if(error)return m("Couldn't send it. Please try again later.",true);
    try{localStorage.setItem("ph_subs_"+new Date().toDateString(),n+1)}catch(e){}
    closeModal(true);toast("Thanks! We'll review it soon.");
  };
}

/* ===== Newsletter ===== */
$("#nf").addEventListener("submit",async e=>{
  e.preventDefault();const m=t=>$("#nMsg").textContent=t;
  if($("#nHp").value)return;
  const email=$("#nEmail").value.trim().toLowerCase();
  if(!SUPABASE_READY)return m("Signup isn't connected yet.");
  m("Subscribing…");
  const{error}=await sb.from("subscribers").insert({email});
  if(!error||error.code==="23505"){m(error?"You're already on the list. 🎉":"You're in! Watch your inbox. 🎉");$("#nEmail").value=""}
  else m("Couldn't subscribe right now. Please try again later.");
});

/* ===== init ===== (waits for READY: the live fetch from Supabase, falling back to data.js's seed content) */
READY.then(()=>{
  $("#heroChips").innerHTML=CATS.map(c=>`<button class="chip" data-cat="${c}">${c}</button>`).join("");
  $("#socials").innerHTML=Socials();$("#fsocials").innerHTML=Socials();
  $("#vibes").innerHTML=Object.keys(VIBES).map(k=>`<button class="chip" data-vibe="${esc(k)}">${esc(k)}</button>`).join("")+`<button class="chip s" id="surprise">🎲 Surprise me</button>`;
  $("#modelSel").innerHTML=`<option value="All">All AI tools</option>`+MODELS.slice(1).map(m=>`<option>${m}</option>`).join("");
  $("#bStyle").innerHTML=Object.keys(B_STYLE).map(k=>`<option>${k}</option>`).join("");
  $("#bLight").innerHTML=Object.keys(B_LIGHT).map(k=>`<option>${k}</option>`).join("");
  $("#bModel").innerHTML=Object.keys(B_MODEL).map(k=>`<option>${k}</option>`).join("");
  $("#bGo").onclick=boost;$("#bIdea").addEventListener("keydown",e=>{if(e.key==="Enter")boost()});
  $("#bCopy").onclick=async()=>{await copyText($("#bText").textContent);toast("Prompt copied")};
  $("#bChat").onclick=()=>{const t=$("#bText").textContent;copyText(t);window.open(OPEN_IN.ChatGPT(t),"_blank","noopener")};
  $("#catLinks").innerHTML=CATS.map(c=>`<a href="/c/${slug(c)}">${c} prompts</a>`).join("");
  applyConfig();renderAll();
  document.addEventListener("keydown",e=>{if(e.key==="Escape")hideSug()});
  /* deep links served by api/page.js: /p/12-title opens that prompt, /c/anime filters a category */
  const B=window.__BOOT;
  if(B&&B.type==="p"){const p=PROMPTS.find(x=>x.id==B.id);if(p)openPrompt(p,false)}
  else if(B&&B.type==="c"){const c=CATS.find(x=>x.toLowerCase()===String(B.cat).toLowerCase());if(c){state.cat=c;render();setTimeout(()=>$("#explore").scrollIntoView(),60)}}
});
