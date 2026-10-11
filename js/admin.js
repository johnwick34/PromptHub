/* PromptHub admin: signs in with Supabase Auth, reads/writes prompts straight to the database.
   Every save here is live on the public site immediately — no download, no redeploy. */
async function startAdmin(){
if(!SUPABASE_READY){
  $("#app").innerHTML=`<div class="panel"><h2>Supabase isn't connected yet</h2><p class="mut">Fill in js/supabase-config.js with your project's URL and anon key, then reload this page. See the README for setup steps.</p></div>`;
  return;
}
await READY; // make sure the live PROMPTS/CONFIG have loaded before we start editing
let editing=null,pendingImg="";
const msg=(t,bad)=>{const s=$("#st");s.textContent=t;s.style.color=bad?"#ff6b6b":"var(--mut)"};
const shrink=f=>new Promise((ok,no)=>{const r=new FileReader();r.onerror=no;r.onload=()=>{const i=new Image();i.onerror=no;i.onload=()=>{const s=Math.min(1,720/i.width),c=document.createElement("canvas");c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext("2d").drawImage(i,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",.74))};i.src=r.result};r.readAsDataURL(f)});

(async()=>{try{const{count}=await sb.from("prompts").select("id",{count:"exact",head:true});$("#seedHint").classList.toggle("hide",!!count)}catch(e){}})();

$("#aCat").innerHTML=CATS.map(c=>`<option>${c}</option>`).join("");
$("#aFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{pendingImg=await shrink(f);$("#aPrev").src=pendingImg;$("#aPrev").classList.remove("hide")}catch(_){msg("Could not read that image. Try a JPG or PNG.",true)}};
function resetForm(){editing=null;pendingImg="";["aTitle","aTags","aPrompt","aFile","aPath"].forEach(i=>$("#"+i).value="");$("#aBadge").value="";$("#aPrev").classList.add("hide");$("#formTitle").textContent="Add a prompt";$("#save").textContent="Add prompt";$("#cancel").classList.add("hide")}
$("#cancel").onclick=resetForm;

$("#save").onclick=async()=>{
  const title=$("#aTitle").value.trim(),prompt=$("#aPrompt").value.trim();
  if(!title||!prompt)return msg("Add a title and the full prompt.",true);
  const old=editing!=null?PROMPTS.find(p=>p.id===editing):null;
  const image=pendingImg||$("#aPath").value.trim()||(old?old.image:"");
  const p={id:old?old.id:Math.max(0,...PROMPTS.map(x=>x.id))+1,title,image,category:$("#aCat").value,tags:$("#aTags").value.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean),badge:$("#aBadge").value,prompt};
  try{
    const{error}=await sb.from("prompts").upsert(p);
    if(error)throw error;
    if(old)PROMPTS[PROMPTS.indexOf(old)]=p;else PROMPTS.unshift(p);
    resetForm();draw();msg(old?"Saved — live on the site now.":"Added — live on the site now.");
  }catch(e){msg("Couldn't save: "+(e.message||e),true)}
};
function draw(){
  $("#cnt").textContent=PROMPTS.length;
  $("#list").innerHTML=PROMPTS.map(p=>`<div class="arow"><img src="${esc(img(p))}" alt=""><span>${esc(p.title)}</span><span class="mut">${esc(p.category)}</span><button type="button" data-act="edit" data-id="${p.id}">Edit</button><button type="button" data-act="del" data-id="${p.id}">Delete</button></div>`).join("")||`<p class="mut">No prompts yet. Add your first one, or click Seed database above.</p>`;
}
$("#list").onclick=async e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const id=+b.dataset.id,p=PROMPTS.find(x=>x.id===id);if(!p)return;
  if(b.dataset.act==="del"){
    if(!confirm("Delete \u201c"+p.title+"\u201d? This removes it from the live site immediately."))return;
    try{const{error}=await sb.from("prompts").delete().eq("id",id);if(error)throw error;PROMPTS=PROMPTS.filter(x=>x.id!==id);draw();msg("Deleted.")}catch(e){msg("Couldn't delete: "+(e.message||e),true)}
    return;
  }
  editing=id;pendingImg="";$("#aTitle").value=p.title;$("#aCat").value=p.category;$("#aBadge").value=p.badge||"";$("#aTags").value=(p.tags||[]).join(", ");$("#aPrompt").value=p.prompt;$("#aPath").value=p.image&&!p.image.startsWith("data:")?p.image:"";
  $("#formTitle").textContent="Edit prompt";$("#save").textContent="Save changes";$("#cancel").classList.remove("hide");window.scrollTo({top:0,behavior:"smooth"});
};

/* contact + social links -> config table, row id='site' */
$("#cMail").value=CONFIG.email||"";$("#cWa").value=CONFIG.whatsapp||"";
CONFIG.socials=CONFIG.socials||{};
async function saveConfig(){try{const{error}=await sb.from("config").upsert({id:"site",email:CONFIG.email||"",whatsapp:CONFIG.whatsapp||"",socials:CONFIG.socials||{}});if(error)throw error;msg("Saved — live on the site now.")}catch(e){msg("Couldn't save: "+(e.message||e),true)}}
$("#cMail").oninput=e=>{CONFIG.email=e.target.value.trim();saveConfig()};
$("#cWa").oninput=e=>{CONFIG.whatsapp=e.target.value.trim();saveConfig()};
$("#socialInputs").innerHTML=SOCIALS.map(([n,u])=>`<div><label for="s-${n}">${n} URL</label><input id="s-${n}" data-soc="${n}" value="${esc(CONFIG.socials[n]||u)}"></div>`).join("");
$("#socialInputs").oninput=e=>{const n=e.target.dataset.soc;if(n){CONFIG.socials[n]=e.target.value.trim();saveConfig()}};

/* seed: push the starter content from data.js into an empty Supabase project */
$("#seed").onclick=async()=>{
  if(!confirm("Load the starter prompts and config from data.js into the database? Safe to run on an empty project; on a project that already has content, this won't delete anything but may overwrite prompts with the same id."))return;
  try{
    let{error}=await sb.from("prompts").upsert(SEED_PROMPTS);
    if(error)throw error;
    ({error}=await sb.from("config").upsert({id:"site",email:SEED_CONFIG.email||"",whatsapp:SEED_CONFIG.whatsapp||"",socials:SEED_CONFIG.socials||{}}));
    if(error)throw error;
    await loadLiveData();draw();
    $("#cMail").value=CONFIG.email||"";$("#cWa").value=CONFIG.whatsapp||"";
    $("#socialInputs").innerHTML=SOCIALS.map(([n,u])=>`<div><label for="s-${n}">${n} URL</label><input id="s-${n}" data-soc="${n}" value="${esc(CONFIG.socials[n]||u)}"></div>`).join("");
    $("#seedHint").classList.add("hide");
    msg("Seeded. Your live site now shows the starter content.");
  }catch(e){msg("Couldn't seed the database: "+(e.message||e),true)}
};

/* refresh: re-pull live data (e.g. if edited from another device) */
$("#refresh").onclick=async()=>{await loadLiveData();resetForm();draw();$("#cMail").value=CONFIG.email||"";$("#cWa").value=CONFIG.whatsapp||"";msg("Refreshed from the database.")};

/* export fallback data.js (optional — a static mirror of the live content, for your repo/offline fallback) */
$("#dl").onclick=()=>{
  const js=`/* PromptHub SEED/FALLBACK data, exported from Supabase by admin.html on ${new Date().toISOString().slice(0,10)}. Optional: replace js/data.js with this to update your offline fallback/seed. */\nvar SEED_CONFIG=${JSON.stringify(CONFIG,null,2)};\n\nvar SEED_PROMPTS=${JSON.stringify(PROMPTS,null,2)};\n`;
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
    let{error}=await sb.from("prompts").upsert(parsed.prompts);
    if(error)throw error;
    ({error}=await sb.from("config").upsert({id:"site",email:parsed.config.email||"",whatsapp:parsed.config.whatsapp||"",socials:parsed.config.socials||{}}));
    if(error)throw error;
    await loadLiveData();resetForm();draw();
    $("#cMail").value=CONFIG.email||"";$("#cWa").value=CONFIG.whatsapp||"";
    $("#socialInputs").innerHTML=SOCIALS.map(([n,u])=>`<div><label for="s-${n}">${n} URL</label><input id="s-${n}" data-soc="${n}" value="${esc(CONFIG.socials[n]||u)}"></div>`).join("");
    msg("Backup restored — live on the site now.");
  }catch(err){msg("That file doesn't look like a PromptHub backup, or the database rejected it: "+(err.message||err),true)}
  e.target.value="";
};

$("#lock").onclick=()=>{sb.auth.signOut()};
draw();
}

/* ===== sign-in gate (Supabase Auth — Email/Password) ===== */
(function gate(){
  const g=s=>document.querySelector(s);
  const gm=t=>{g("#gMsg").textContent=t};
  if(!SUPABASE_READY){
    gm("Supabase isn't connected yet — fill in js/supabase-config.js (see the README), then reload this page.");
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
