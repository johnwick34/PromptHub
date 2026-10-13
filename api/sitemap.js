/* /sitemap.xml and /robots.txt (built from your live prompts, so new prompts are discoverable automatically) */
const {sb,slug,originOf}=require("./_lib");
module.exports=async(req,res)=>{
  const origin=originOf(req);
  if(req.query.robots){
    res.setHeader("Content-Type","text/plain");res.setHeader("Cache-Control","public, s-maxage=86400");
    return res.end(`User-agent: *\nAllow: /\nDisallow: /admin.html\n\nSitemap: ${origin}/sitemap.xml\n`);
  }
  let rows=[];try{rows=await sb("prompts?select=id,title,category&order=id.desc&limit=5000")}catch(e){}
  const day=new Date().toISOString().slice(0,10),cats=[...new Set(rows.map(r=>r.category))];
  const u=(loc,p)=>`<url><loc>${loc}</loc><lastmod>${day}</lastmod><priority>${p}</priority></url>`;
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[u(origin+"/","1.0"),...cats.map(c=>u(`${origin}/c/${slug(c)}`,"0.8")),...rows.map(r=>u(`${origin}/p/${r.id}-${slug(r.title)}`,"0.6"))].join("\n")}\n</urlset>`;
  res.setHeader("Content-Type","application/xml");res.setHeader("Cache-Control","public, s-maxage=86400, stale-while-revalidate=604800");
  res.end(xml);
};
