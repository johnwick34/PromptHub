/* Shared helpers for the serverless functions. The anon key is public by design (same one the browser uses). */
const SB_URL=process.env.SUPABASE_URL||"https://jllikpymbqhomhncotrc.supabase.co";
const SB_KEY=process.env.SUPABASE_ANON_KEY||"sb_publishable_OJ62Sao4XB_B9HHtT-elQg_LwCbKt9r";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);
async function sb(path){
  const r=await fetch(SB_URL+"/rest/v1/"+path,{headers:{apikey:SB_KEY}});
  if(!r.ok)throw new Error("supabase "+r.status);
  return r.json();
}
const originOf=req=>(req.headers["x-forwarded-proto"]||"https")+"://"+(req.headers["x-forwarded-host"]||req.headers.host);
module.exports={sb,esc,slug,originOf};
