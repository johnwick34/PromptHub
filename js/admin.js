/* PromptHub admin: signs in with Supabase Auth, reads/writes prompts straight to the database.
   Every save here is live on the public site immediately - no download, no redeploy. */
let adminStarted=false;
async function startAdmin(){
if(adminStarted)return;
if(!SUPABASE_READY){
  $("#app").innerHTML=`<div class="panel"><h2>Supabase isn't connected yet</h2><p class="mut">Fill in js/supabase-config.js with your project's URL and anon key, then reload this page. See the README for setup steps.</p></div>`;
  return;
}
adminStarted=true;
await READY; // make sure the live PROMPTS/CONFIG have loaded before we start editing
let editing=null,pendingImg="",V2=false,SUBS=[];
const msg=(t,bad)=>{const s=$("#st");s.textContent=t;s.style.color=bad?"#ff6b6b":"var(--mut)"};
const nextId=()=>Math.max(0,...PROMPTS.map(x=>x.id))+1;

/* has supabase-upgrade.sql been run? (adds model/author/copies/views columns, submissions, subscribers, image storage) */
try{const{error}=await sb.from("prompts").select("model,author,copies,views").limit(1);V2=!error}catch(e){}
$("#v2Hint").classList.toggle("hide",V2);

/* upload a (already shrunk) data-URL to Supabase Storage; falls back to keeping it inside the database */
async function storeImage(dataUrl){
  try{
    const blob=await(await fetch(dataUrl)).blob(),path=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
    const{error}=await sb.storage.from("prompt-images").upload(path,blob,{contentType:"image/jpeg",cacheControl:"31536000"});
    if(error)throw error;
    return sb.storage.from("prompt-images").getPublicUrl(path).data.publicUrl;
  }catch(e){console.warn("Storage upload failed, keeping image in the database",e);return dataUrl}
}

(async()=>{try{const{count}=await sb.from("prompts").select("id",{count:"exact",head:true});$("#seedHint").classList.toggle("hide",!!count)}catch(e){}})();

$("#aCat").innerHTML=CATS.map(c=>`<option>${c}</option>`).join("");
$("#aModel").innerHTML=MODELS.map(m=>`<option>${m}</option>`).join("");
$("#aFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{pendingImg=await shrinkImage(f);$("#aPrev").src=pendingImg;$("#aPrev").classList.remove("hide")}catch(_){msg("Could not read that image. Try a JPG or PNG.",true)}};
function resetForm(){editing=null;pendingImg="";["aTitle","aTags","aPrompt","aFile","aPath","aAuthor"].forEach(i=>$("#"+i).value="");$("#aBadge").value="";$("#aModel").value="Any";$("#aPrev").classList.add("hide");$("#formTitle").textContent="Add a prompt";$("#save").textContent="Add prompt";$("#cancel").classList.add("hide")}
$("#cancel").onclick=resetForm;

$("#save").onclick=async()=>{
  const title=$("#aTitle").value.trim(),prompt=$("#aPrompt").value.trim();
  if(!title||!prompt)return msg("Add a title and the full prompt.",true);
  const old=editing!=null?PROMPTS.find(p=>p.id===editing):null;
  $("#save").disabled=true;
  try{
    let image=$("#aPath").value.trim()||(old?old.image:"");
    if(pendingImg){msg("Uploading image…");image=await storeImage(pendingImg)}
    const p={id:old?old.id:nextId(),title,image,category:$("#aCat").value,tags:$("#aTags").value.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean),badge:$("#aBadge").value,prompt};
    if(V2){p.model=$("#aModel").value;p.author=$("#aAuthor").value.trim()}
    const{error}=await sb.from("prompts").upsert(p);
    if(error)throw error;
    if(old)PROMPTS[PROMPTS.indexOf(old)]=Object.assign({},old,p);else PROMPTS.unshift(Object.assign({copies:0,views:0},p));
    resetForm();draw();msg(old?"Saved. Live on the site now.":"Added. Live on the site now.");
  }catch(e){msg("Couldn't save: "+(e.message||e),true)}
  $("#save").disabled=false;
};

function draw(){
  const f=($("#listFilter").value||"").toLowerCase();
  const L=PROMPTS.filter(p=>!f||(p.title+" "+p.category+" "+(p.tags||[]).join(" ")).toLowerCase().includes(f));
  $("#cnt").textContent=PROMPTS.length;
  $("#list").innerHTML=L.map(p=>`<div class="arow"><img src="${esc(img(p))}" alt=""><span>${esc(p.title)}</span><span class="mut">${esc(p.category)}${V2&&p.copies?` · 📋${p.copies}`:""}</span><button type="button" data-act="edit" data-id="${p.id}">Edit</button><button type="button" data-act="trend" data-id="${p.id}" title="Toggle the TRENDING badge" aria-pressed="${p.badge==="TRENDING"}">${p.badge==="TRENDING"?"🔥 On":"🔥"}</button><button type="button" data-act="kit" data-id="${p.id}" title="Captions to post this on social media">📣</button><button type="button" data-act="del" data-id="${p.id}">Delete</button></div>`).join("")||`<p class="mut">No prompts match. Add your first one, or click Seed database above.</p>`;
  stats();
}
$("#listFilter").oninput=draw;

/* ---- dashboard ---- */
let subCount="–";
function stats(){
  const sum=k=>PROMPTS.reduce((a,p)=>a+(+p[k]||0),0);
  $("#stP").textContent=PROMPTS.length;$("#stC").textContent=V2?sum("copies"):"–";$("#stV").textContent=V2?sum("views"):"–";
  $("#stS").textContent=subCount;$("#stQ").textContent=SUBS.length;
  const top=[...PROMPTS].filter(p=>+p.copies>0).sort((a,b)=>b.copies-a.copies).slice(0,5);
  $("#topList").innerHTML=top.length?top.map(p=>`<div class="arow"><img src="${esc(img(p))}" alt=""><span>${esc(p.title)}</span><span class="mut">📋 ${p.copies} · 👁 ${p.views||0}</span></div>`).join(""):`<p class="mut">${V2?"Copies will show up here as visitors use your prompts.":"Run supabase-upgrade.sql to start counting copies."}</p>`;
}
(async()=>{try{const{count,error}=await sb.from("subscribers").select("id",{count:"exact",head:true});if(!error){subCount=count||0;stats()}}catch(e){}})();
$("#loadSubs").onclick=async()=>{
  const{data,error}=await sb.from("subscribers").select("email,created_at").order("created_at",{ascending:false});
  if(error)return msg("Couldn't load subscribers. Run supabase-upgrade.sql first.",true);
  subCount=data.length;stats();
  $("#subsOut").classList.remove("hide");
  $("#subsOut").innerHTML=`<p class="mut" style="margin:0 0 8px">${data.length} subscriber${data.length===1?"":"s"}.</p><div class="row2"><button class="btn alt sm" id="csv" type="button">Download CSV</button><button class="btn alt sm" id="cpEm" type="button">Copy all emails</button></div>`;
  $("#csv").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["email,subscribed_at\n"+data.map(r=>`${r.email},${r.created_at}`).join("\n")],{type:"text/csv"}));a.download="prompthub-subscribers.csv";document.body.appendChild(a);a.click();a.remove()};
  $("#cpEm").onclick=async()=>{await navigator.clipboard.writeText(data.map(r=>r.email).join(", "));msg("Emails copied.")};
};

/* ---- visitor submissions queue ---- */
async function loadSubs(){
  try{const{data,error}=await sb.from("submissions").select("*").order("id");if(error)throw error;SUBS=data||[]}catch(e){SUBS=[]}
  $("#subsPanel").classList.toggle("hide",!SUBS.length);$("#subCnt").textContent=SUBS.length;
  $("#subList").innerHTML=SUBS.map(s=>`<div class="sub-row"><img src="${esc(s.image||"")}" alt=""><div><b>${esc(s.title)}</b><div class="mut">${esc(s.category)} · ${esc(s.model||"Any")}${s.author?" · by "+esc(s.author):""}</div><div class="mut clamp">${esc(s.prompt)}</div></div><div class="row2"><button type="button" data-sa="ok" data-id="${s.id}">Approve</button><button type="button" data-sa="no" data-id="${s.id}">Reject</button></div></div>`).join("");
  stats();
}
$("#subList").onclick=async e=>{
  const b=e.target.closest("[data-sa]");if(!b)return;const s=SUBS.find(x=>x.id==b.dataset.id);if(!s)return;
  b.disabled=true;
  try{
    if(b.dataset.sa==="ok"){
      msg("Publishing…");
      const image=(s.image||"").startsWith("data:")?await storeImage(s.image):s.image;
      const p={id:nextId(),title:s.title,image,category:s.category,tags:s.tags||[],badge:"NEW",prompt:s.prompt,model:s.model||"",author:s.author||""};
      let{error}=await sb.from("prompts").upsert(p);if(error)throw error;
      PROMPTS.unshift(Object.assign({copies:0,views:0},p));
      msg("Approved. Live on the site now.");
    }
    const{error}=await sb.from("submissions").delete().eq("id",s.id);if(error)throw error;
    SUBS=SUBS.filter(x=>x.id!==s.id);await loadSubs();draw();if(b.dataset.sa==="no")msg("Rejected and removed.");
  }catch(err){msg("Couldn't do that: "+(err.message||err),true);b.disabled=false}
};

/* ---- list actions ---- */
$("#list").onclick=async e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const id=+b.dataset.id,p=PROMPTS.find(x=>x.id===id);if(!p)return;
  if(b.dataset.act==="del"){
    if(!confirm("Delete \u201c"+p.title+"\u201d? This removes it from the live site immediately."))return;
    try{const{error}=await sb.from("prompts").delete().eq("id",id);if(error)throw error;PROMPTS=PROMPTS.filter(x=>x.id!==id);draw();msg("Deleted.")}catch(e){msg("Couldn't delete: "+(e.message||e),true)}
    return;
  }
  if(b.dataset.act==="trend"){
    const badge=p.badge==="TRENDING"?"":"TRENDING";
    try{const{error}=await sb.from("prompts").update({badge}).eq("id",id);if(error)throw error;p.badge=badge;draw();msg(badge?"Marked as trending.":"Trending badge removed.")}catch(e){msg("Couldn't update: "+(e.message||e),true)}
    return;
  }
  if(b.dataset.act==="kit"){showKit(p);return}
  editing=id;pendingImg="";$("#aTitle").value=p.title;$("#aCat").value=p.category;$("#aBadge").value=p.badge||"";$("#aModel").value=p.model||"Any";$("#aAuthor").value=p.author||"";$("#aTags").value=(p.tags||[]).join(", ");$("#aPrompt").value=p.prompt;$("#aPath").value=p.image&&!p.image.startsWith("data:")?p.image:"";
  $("#formTitle").textContent="Edit prompt";$("#save").textContent="Save changes";$("#cancel").classList.remove("hide");window.scrollTo({top:0,behavior:"smooth"});
};

/* ---- post kit: captions + share card for any prompt ---- */
let kitPrompt=null;
function showKit(p){
  kitPrompt=p;
  const u=location.origin+pUrl(p),tags=(p.tags||[]).map(t=>"#"+t.replace(/\s+/g,"")),cat="#"+p.category.replace(/\s+/g,""),mdl=p.model&&p.model!=="Any"?p.model:"any AI image tool";
  const K=[
    ["Pinterest title",`${p.title} - Free AI Image Prompt`],
    ["Pinterest description",`Copy this free ${p.category} prompt for ${mdl}. ${u}\n${[cat,...tags,"#AIart","#promptideas","#aiimagegenerator"].join(" ")}`],
    ["X / Twitter post",`🎨 ${p.title}\n\nFull prompt, free to copy 👇\n${u}\n\n${["#AIart",cat,"#prompts"].join(" ")}`],
    ["Reel / TikTok / Shorts caption",`I typed ONE prompt into ${mdl} and got this 🤯\nGet the exact prompt free (link in bio)\n\n${[cat,...tags,"#AIart","#aiprompts","#chatgpt","#midjourney"].join(" ")}`],
    ["Reddit title",`[Prompt] ${p.title} - full prompt in the comments`],
    ["Reddit first comment",`Prompt:\n\n${p.prompt}\n\nMore free prompts like this: ${u}`]
  ];
  $("#kitTitle").textContent=p.title;
  $("#kitBody").innerHTML=K.map(([n],i)=>`<div class="kit-row"><div class="mut"><span>${n}</span><button type="button" data-kc="${i}">Copy</button></div><textarea rows="${i===5?5:3}" id="kt${i}" readonly></textarea></div>`).join("");
  K.forEach(([,t],i)=>$("#kt"+i).value=t);
  $("#kitPanel").classList.remove("hide");$("#kitPanel").scrollIntoView({behavior:"smooth"});
}
$("#kitBody").onclick=async e=>{const b=e.target.closest("[data-kc]");if(!b)return;await navigator.clipboard.writeText($("#kt"+b.dataset.kc).value);b.textContent="Copied";setTimeout(()=>b.textContent="Copy",1500)};
$("#kitClose").onclick=()=>$("#kitPanel").classList.add("hide");
$("#kitCard").onclick=async()=>{
  if(!kitPrompt)return;
  try{const c=await makeCard(kitPrompt);const a=document.createElement("a");a.href=c.toDataURL("image/png");a.download=slug(kitPrompt.title)+".png";document.body.appendChild(a);a.click();a.remove();msg("Share card downloaded.")}catch(e){msg("Couldn't build the card for this image.",true)}
};

/* contact + social links -> config table, row id='site' */
$("#cMail").value=CONFIG.email||"";$("#cWa").value=CONFIG.whatsapp||"";
CONFIG.socials=CONFIG.socials||{};
async function saveConfig(){try{const{error}=await sb.from("config").upsert({id:"site",email:CONFIG.email||"",whatsapp:CONFIG.whatsapp||"",socials:CONFIG.socials||{}});if(error)throw error;msg("Saved. Live on the site now.")}catch(e){msg("Couldn't save: "+(e.message||e),true)}}
$("#cMail").oninput=e=>{CONFIG.email=e.target.value.trim();saveConfig()};
$("#cWa").oninput=e=>{CONFIG.whatsapp=e.target.value.trim();saveConfig()};
const socialHTML=()=>SOCIALS.map(([n,u])=>`<div><label for="s-${n}">${n} URL</label><input id="s-${n}" data-soc="${n}" value="${esc(CONFIG.socials[n]||u)}"></div>`).join("");
$("#socialInputs").innerHTML=socialHTML();
$("#socialInputs").oninput=e=>{const n=e.target.dataset.soc;if(n){CONFIG.socials[n]=e.target.value.trim();saveConfig()}};
const syncConfigUI=()=>{$("#cMail").value=CONFIG.email||"";$("#cWa").value=CONFIG.whatsapp||"";$("#socialInputs").innerHTML=socialHTML()};

/* seed: push the starter content from data.js into an empty Supabase project */
$("#seed").onclick=async()=>{
  if(!confirm("Load the starter prompts and config from data.js into the database? Safe to run on an empty project; on a project that already has content, this won't delete anything but may overwrite prompts with the same id."))return;
  try{
    let{error}=await sb.from("prompts").upsert(SEED_PROMPTS);
    if(error)throw error;
    ({error}=await sb.from("config").upsert({id:"site",email:SEED_CONFIG.email||"",whatsapp:SEED_CONFIG.whatsapp||"",socials:SEED_CONFIG.socials||{}}));
    if(error)throw error;
    await loadLiveData();draw();syncConfigUI();
    $("#seedHint").classList.add("hide");
    msg("Seeded. Your live site now shows the starter content.");
  }catch(e){msg("Couldn't seed the database: "+(e.message||e),true)}
};

/* refresh: re-pull live data (e.g. if edited from another device) */
$("#refresh").onclick=async()=>{await loadLiveData();await loadSubs();resetForm();draw();syncConfigUI();msg("Refreshed from the database.")};

/* export fallback data.js (optional - a static mirror of the live content, for your repo/offline fallback) */
$("#dl").onclick=()=>{
  const slim=PROMPTS.map(({id,title,image,category,tags,badge,prompt})=>({id,title,image,category,tags,badge,prompt}));
  const js=`/* PromptHub SEED/FALLBACK data, exported from Supabase by admin.html on ${new Date().toISOString().slice(0,10)}. Optional: replace js/data.js with this to update your offline fallback/seed. */\nvar SEED_CONFIG=${JSON.stringify(CONFIG,null,2)};\n\nvar SEED_PROMPTS=${JSON.stringify(slim,null,2)};\n`;
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([js],{type:"text/javascript"}));a.download="data.js";document.body.appendChild(a);a.click();a.remove();
  msg("Downloaded a snapshot of your live content as data.js.");
};

/* backup / restore: a private safety copy of everything in the database */
$("#backup").onclick=()=>{
  const payload={exported:new Date().toISOString(),prompts:PROMPTS,config:CONFIG};
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));a.download=`prompthub-backup-${Date.now()}.json`;document.body.appendChild(a);a.click();a.remove();
  msg("Backup downloaded. Restore backup loads it back into the database on any device.");
};
$("#restoreBtn").onclick=()=>$("#restoreFile").click();
$("#restoreFile").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const parsed=JSON.parse(await f.text());
    if(!parsed||!Array.isArray(parsed.prompts)||!parsed.config)throw new Error("bad shape");
    if(!confirm("Replace everything in the database with this backup? This overwrites your current live content."))return;
    let{error}=await sb.from("prompts").upsert(V2?parsed.prompts:parsed.prompts.map(({id,title,image,category,tags,badge,prompt})=>({id,title,image,category,tags,badge,prompt})));
    if(error)throw error;
    ({error}=await sb.from("config").upsert({id:"site",email:parsed.config.email||"",whatsapp:parsed.config.whatsapp||"",socials:parsed.config.socials||{}}));
    if(error)throw error;
    await loadLiveData();resetForm();draw();syncConfigUI();
    msg("Backup restored. Live on the site now.");
  }catch(err){msg("That file doesn't look like a PromptHub backup, or the database rejected it: "+(err.message||err),true)}
  e.target.value="";
};

$("#lock").onclick=()=>{sb.auth.signOut()};
draw();loadSubs();
}

/* ===== sign-in gate (Supabase Auth - Email/Password) ===== */
(function gate(){
  const g=s=>document.querySelector(s);
  const gm=t=>{g("#gMsg").textContent=t};
  if(!SUPABASE_READY){
    gm("Supabase isn't connected yet - fill in js/supabase-config.js (see the README), then reload this page.");
    return;
  }
  sb.auth.onAuthStateChange((event,session)=>{
    if(session&&session.user){g("#gate").classList.add("hide");g("#app").classList.remove("hide");startAdmin()}
    else{g("#gate").classList.remove("hide");g("#app").classList.add("hide")}
  });
  const go=async()=>{
    const email=(g("#gEmail").value||"").trim();
    const password=g("#gPassword").value||"";
    if(!email||!password)return gm("Enter both your email and password.");
    gm("Signing in…");
    try{
      const{error}=await sb.auth.signInWithPassword({email,password});
      if(error)throw error;
    }catch(e){
      gm(e.message&&e.message.toLowerCase().includes("invalid")?"Wrong email or password.":"Could not sign in: "+(e.message||e));
    }
  };
  g("#gGo").onclick=go;
  g("#gEmail").addEventListener("keydown",e=>{if(e.key==="Enter")g("#gPassword").focus()});
  g("#gPassword").addEventListener("keydown",e=>{if(e.key==="Enter")go()});
})();
