/* ===== components ===== */
const Badge=p=>p.badge?`<span class="badge ${p.badge==="NEW"?"new":p.badge[0]==="E"?"pick":""}">${esc(p.badge)}</span>`:"";
const PromptCard=p=>`<article class="card" data-id="${p.id}">
  <button class="thumb" data-open="${p.id}" aria-label="Open ${esc(p.title)}">${Badge(p)}<img src="${img(p)}" alt="AI reference image: ${esc(p.title)}" loading="lazy"></button>
  <div class="body"><h3>${esc(p.title)}</h3><span class="tag">${esc(p.category)}</span><button class="copy" data-copy="${p.id}">Copy Prompt</button></div></article>`;
const PromptGrid=(el,list)=>{el.innerHTML=list.map(PromptCard).join("")};
const CategoryFilter=()=>["All",...CATS].map(c=>`<button class="chip${c===state.cat?" on":""}" data-cat="${c}" aria-pressed="${c===state.cat}">${c}</button>`).join("");
function PromptModal(p){
  $("#sheet").innerHTML=`<img src="${img(p)}" alt="AI reference image: ${esc(p.title)}">
  <div class="info"><button class="icon-btn close" id="closeM" aria-label="Close">✕</button>
  <span class="tag">${esc(p.category)}</span><h3 id="mTitle">${esc(p.title)}</h3>
  <div class="ptext">${esc(p.prompt)}</div>
  <div class="tags">${p.tags.map(t=>`<span>#${esc(t)}</span>`).join("")}</div>
  <button class="copy" data-copy="${p.id}" style="padding:13px">📋 Copy Prompt</button>${related(p)}</div>`;
  $("#modal").classList.add("open");document.body.style.overflow="hidden";$("#closeM").focus();
}
const closeModal=()=>{$("#modal").classList.remove("open");document.body.style.overflow=""};
const Socials=()=>SOCIALS.map(([n,u,d])=>`<a href="${(CONFIG.socials||{})[n]||u}" target="_blank" rel="noopener noreferrer" aria-label="${n}" title="${n}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></a>`).join("");

/* ===== state + render ===== */
const state={q:"",cat:"All"};
const SYN={dark:["night","noir","rain"],night:["neon","dark"],girl:["woman","portrait"],boy:["man","portrait"],cute:["toy","anime","soft"],futuristic:["cyberpunk","neon","chrome"],scifi:["cyberpunk","chrome"],old:["vintage","retro","film"],retro:["vintage","film"],nature:["forest","mountain","landscape"],city:["street","alley","neon"],logo:["product","minimal"],clothes:["fashion","runway"],magic:["fantasy","dragon","elf"],building:["architecture","concrete"],car:["vintage","diner"],japan:["kyoto","anime","samurai"],epic:["dragon","landscape","cinematic"],minimal:["studio","product","soft"],face:["portrait"]};
const VIBES={"Moody & dark":"dark night rain neon","Clean & minimal":"minimal studio soft product","Bold & colorful":"neon red vibrant fashion","Nostalgic":"vintage retro film","Epic & magical":"epic fantasy dragon magic","Cute & playful":"cute toy anime"};
function lev(a,b){const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]}
/* scored search: title > category > tags > prompt text, with synonyms and typo tolerance */
function search(list,toks,or){
  const out=[];
  for(const p of list){
    const t=p.title.toLowerCase(),c=p.category.toLowerCase(),g=p.tags.join(" "),b=p.prompt.toLowerCase(),all=t+" "+c+" "+g+" "+b,words=all.split(/[^a-z0-9]+/);
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
  if(toks.length)l=search(l,toks,state.or);
  if(state.sort==="new")l=[...l].sort((a,b)=>b.id-a.id);
  else if(state.sort==="trend")l=[...l].sort((a,b)=>(b.badge==="TRENDING")-(a.badge==="TRENDING"));
  return l;
}
function render(){
  const list=filtered();
  PromptGrid($("#grid"),list);
  $("#empty").classList.toggle("hide",list.length>0);
  $("#count").textContent=`${list.length} prompt${list.length===1?"":"s"}${state.q?` for “${state.q}”`:""}`;
  $("#categories").innerHTML=CategoryFilter();
}
async function copyText(t){
  try{await navigator.clipboard.writeText(t)}
  catch(e){const a=document.createElement("textarea");a.value=t;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();try{document.execCommand("copy")}catch(_){}a.remove()}
}
document.addEventListener("click",async e=>{
  const cp=e.target.closest("[data-copy]");
  if(cp){const p=PROMPTS.find(x=>x.id==cp.dataset.copy);await copyText(p.prompt);
    const old=cp.dataset.label||cp.textContent;cp.dataset.label=old;cp.textContent="✓ Copied!";cp.classList.add("done");
    clearTimeout(cp._t);cp._t=setTimeout(()=>{cp.textContent=old;cp.classList.remove("done")},2000);return}
  const op=e.target.closest("[data-open]");
  if(op){PromptModal(PROMPTS.find(x=>x.id==op.dataset.open));return}
  const ct=e.target.closest("[data-cat]");
  if(ct){state.cat=ct.dataset.cat;render();if(ct.closest("#heroChips"))$("#explore").scrollIntoView();return}
  if(e.target.id==="modal"||e.target.closest("#closeM"))closeModal();
  if(e.target.closest("#links a"))toggleMenu(false);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
$("#q").addEventListener("input",e=>{state.q=e.target.value;render()});
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter")$("#explore").scrollIntoView()});
$("#go").onclick=()=>$("#explore").scrollIntoView();
$("#searchBtn").onclick=()=>{$("#home").scrollIntoView();setTimeout(()=>$("#q").focus(),350)};
function toggleMenu(o){const l=$("#links");const open=o===undefined?!l.classList.contains("open"):o;l.classList.toggle("open",open);$("#burger").setAttribute("aria-expanded",open)}
$("#burger").onclick=()=>toggleMenu();

const related=p=>{const r=PROMPTS.filter(x=>x.id!==p.id).map(x=>[(x.category===p.category?2:0)+x.tags.filter(t=>p.tags.includes(t)).length,x]).filter(a=>a[0]).sort((a,b)=>b[0]-a[0]).slice(0,3);return r.length?`<div class="mut" style="margin-top:6px">More like this</div><div class="rel">${r.map(([,x])=>`<button data-open="${x.id}" aria-label="Open ${esc(x.title)}"><img src="${img(x)}" alt="${esc(x.title)}"></button>`).join("")}</div>`:""};
function renderAll(){
  $("#collage").innerHTML=PROMPTS.slice(0,6).map(p=>`<img src="${img(p)}" alt="">`).join("");
  PromptGrid($("#trendGrid"),PROMPTS.filter(p=>p.badge==="TRENDING"||p.trending).slice(0,4));
  render();
}
function applyConfig(){const c=CONFIG;document.querySelectorAll("[data-mail]").forEach(a=>a.href="mailto:"+(c.email||"hello@example.com")+"?subject=Web%20development%20project");const w=(c.whatsapp||"").replace(/\D/g,"");document.querySelectorAll("[data-wa]").forEach(a=>{a.classList.toggle("hide",!w);if(w)a.href="https://wa.me/"+w})}

/* ===== search suggestions ===== */
const getRecent=()=>{try{return JSON.parse(localStorage.getItem("ph_recent")||"[]")}catch(e){return[]}};
const saveRecent=q=>{q=(q||"").trim();if(!q)return;try{localStorage.setItem("ph_recent",JSON.stringify([q,...getRecent().filter(x=>x!==q)].slice(0,5)))}catch(e){}};
const vocab=()=>[...new Set([...CATS.map(c=>c.toLowerCase()),...PROMPTS.flatMap(p=>p.tags)])];
const topTags=()=>{const m={};PROMPTS.forEach(p=>p.tags.forEach(t=>m[t]=(m[t]||0)+1));return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0])};
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
document.addEventListener("click",e=>{
  if(!e.target.closest(".sw"))hideSug();
  const s=e.target.closest("[data-sug]");
  if(s){const k=s.dataset.kind,v=s.dataset.sug;hideSug();
    if(k==="p")PromptModal(PROMPTS.find(x=>x.id==v));
    else{$("#q").value=v;state.q=v;state.or=false;state.cat="All";saveRecent(v);render();$("#explore").scrollIntoView()}}
  const vb=e.target.closest("[data-vibe]");
  if(vb){const k=vb.dataset.vibe;$("#q").value=k;state.q=VIBES[k];state.or=true;state.cat="All";render();$("#explore").scrollIntoView()}
  if(e.target.closest("#surprise")&&PROMPTS.length)PromptModal(PROMPTS[Math.floor(Math.random()*PROMPTS.length)]);
});

/* ===== init ===== (waits for READY: the live fetch from Supabase, falling back to data.js's seed content) */
READY.then(()=>{
  $("#heroChips").innerHTML=CATS.map(c=>`<button class="chip" data-cat="${c}">${c}</button>`).join("");
  $("#socials").innerHTML=Socials();$("#fsocials").innerHTML=Socials();
  $("#vibes").innerHTML=Object.keys(VIBES).map(k=>`<button class="chip" data-vibe="${esc(k)}">${esc(k)}</button>`).join("")+`<button class="chip s" id="surprise">🎲 Surprise me</button>`;
  applyConfig();renderAll();
  document.addEventListener("keydown",e=>{if(e.key==="Escape")hideSug()});
});
