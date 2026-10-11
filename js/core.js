/* Shared constants and helpers (used by the site and the admin page) */
const CATS=["Cinematic","Portrait","Fashion","Anime","Cyberpunk","Fantasy","Photography","Product","Architecture","3D","Vintage","Travel"];
const HUE={Cinematic:215,Portrait:20,Fashion:350,Anime:290,Cyberpunk:320,Fantasy:150,Photography:35,Product:0,Architecture:200,"3D":260,Vintage:42,Travel:175};
const SOCIALS=[["GitHub","https://github.com/your-username","M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.100.8 2.200v3.200c0 .3.2.7.8.6A11.500 11.500 0 0 0 12 .5z"],
["LinkedIn","https://linkedin.com/in/your-username","M4.5 3A2.5 2.5 0 1 0 4.5 8 2.5 2.5 0 0 0 4.500 3zM2 9.500h5V22H2zM10 9.500h4.800v1.800c.7-1.200 2.200-2.100 4.200-2.100 4 0 4.500 2.600 4.500 6V22h-5v-5.800c0-1.400 0-3-1.900-3-2 0-2.100 1.500-2.100 2.900V22h-5z"],
["Facebook","https://facebook.com/your-username","M14 8V6.200c0-.9.200-1.200 1.200-1.200H17V2h-2.600C11.300 2 10 3.600 10 6v2H7.500v3H10v11h4V11h2.800l.4-3z"],
["Instagram","https://instagram.com/your-username","M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.500a4.500 4.500 0 1 1 0 9 4.500 4.500 0 0 1 0-9zm0 2a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5zM17.500 5.500a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"],
["YouTube","https://youtube.com/@your-channel","M22 8.200c-.2-1.500-.9-2.200-2.400-2.400C17.800 5.500 12 5.500 12 5.500s-5.800 0-7.600.3C2.900 6 2.200 6.700 2 8.200 1.800 9.500 1.800 12 1.800 12s0 2.500.2 3.800c.2 1.500.9 2.200 2.400 2.400 1.800.3 7.600.3 7.600.3s5.800 0 7.600-.3c1.500-.2 2.200-.9 2.400-2.400.2-1.300.2-3.800.2-3.800s0-2.500-.2-3.800zM10 15V9l5.200 3z"],
["Portfolio","https://your-portfolio.example.com","M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.900 9h-3a15 15 0 0 0-1.200-5A8 8 0 0 1 18.900 11zM12 4c.8 1 1.600 3 1.900 7h-3.800C10.400 7 11.200 5 12 4zM4.600 13h3a15 15 0 0 0 1.200 5A8 8 0 0 1 4.600 13zm3-2h-3A8 8 0 0 1 9.300 6a15 15 0 0 0-1.700 5zM12 20c-.8-1-1.600-3-1.900-7h3.800c-.3 4-1.100 6-1.900 7zm2.700-2a15 15 0 0 0 1.200-5h3a8 8 0 0 1-4.200 5z"]];

/* ===== helpers ===== */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function art(p){ // generated placeholder art (swap for real files via the `image` field)
  const h=HUE[p.category]||0,s=p.id*37;
  const c=[...Array(4)].map((_,i)=>`<circle cx="${(s*(i+3)*7)%400}" cy="${(s*(i+5)*11)%500}" r="${70+(s*(i+2))%110}" fill="hsl(${h+i*22} 90% ${28+i*9}%)" opacity=".75"/>`).join("");
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 70% 12%)"/><stop offset="1" stop-color="#0B0B0B"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="28"/></filter></defs><rect width="400" height="500" fill="url(#g)"/><g filter="url(#b)">${c}</g><circle cx="200" cy="215" r="42" fill="#fff" opacity=".12"/><path d="M110 500c0-90 40-140 90-140s90 50 90 140z" fill="#fff" opacity=".1"/></svg>`;
  return "data:image/svg+xml;utf8,"+encodeURIComponent(svg);
}
const img=p=>p.image||art(p);


/* Working copies the rest of the app reads/writes. SEED_PROMPTS/SEED_CONFIG (from data.js)
   stay untouched as the original fallback — used by "Seed database" and as the offline fallback. */
var PROMPTS=JSON.parse(JSON.stringify(SEED_PROMPTS));
var CONFIG=JSON.parse(JSON.stringify(SEED_CONFIG));

/* ===== Supabase (live content store) =====
   supabase-config.js, loaded just before this file, defines SUPABASE_URL / SUPABASE_ANON_KEY.
   PROMPTS and CONFIG (from data.js) are the offline fallback/seed; READY resolves once
   we've tried to replace them with the live Supabase content. Both index.html (app.js)
   and admin.html (admin.js) wait on READY before rendering or editing anything. */
let sb=null,SUPABASE_READY=false;
try{
  if(window.supabase&&typeof SUPABASE_URL!=="undefined"&&SUPABASE_URL&&!SUPABASE_URL.startsWith("PASTE_")){
    sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
    SUPABASE_READY=true;
  }
}catch(e){console.warn("Supabase did not initialize — showing seed data from data.js.",e)}

async function loadLiveData(){
  if(!SUPABASE_READY)return;
  try{
    const{data:rows,error:perr}=await sb.from("prompts").select("*").order("id",{ascending:false});
    if(!perr&&rows&&rows.length)PROMPTS=rows;
    const{data:cfgRow}=await sb.from("config").select("*").eq("id","site").maybeSingle();
    if(cfgRow)CONFIG=Object.assign({},CONFIG,{email:cfgRow.email||"",whatsapp:cfgRow.whatsapp||"",socials:cfgRow.socials||{}});
  }catch(e){
    console.warn("Could not reach Supabase — showing seed data from data.js.",e);
  }
}
const READY=loadLiveData();
