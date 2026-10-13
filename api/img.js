/* Serves a prompt's image at a real URL (for Open Graph / Pinterest previews).
   Works for Storage URLs, local image paths and images saved inside the database. */
const {sb,originOf}=require("./_lib");
module.exports=async(req,res)=>{
  const origin=originOf(req),id=parseInt(req.query.id,10);
  const go=u=>{res.writeHead(302,{Location:u,"Cache-Control":"public, s-maxage=3600"});res.end()};
  try{
    const im=((await sb(`prompts?id=eq.${id}&select=image&limit=1`))[0]||{}).image||"";
    if(im.startsWith("data:")){
      const m=im.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
      if(m){
        const buf=m[2]?Buffer.from(m[3],"base64"):Buffer.from(decodeURIComponent(m[3]));
        res.setHeader("Content-Type",m[1]||"image/jpeg");res.setHeader("Cache-Control","public, s-maxage=86400, stale-while-revalidate=604800");
        return res.end(buf);
      }
    }else if(/^https?:/.test(im))return go(im);
    else if(im)return go(origin+"/"+im.replace(/^\//,""));
  }catch(e){}
  go(origin+"/og-default.png");
};
