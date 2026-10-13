/* Server-rendered shell for /p/<id>-<slug> and /c/<category>.
   Same index.html, but with real <title>, description, Open Graph / Twitter tags and JSON-LD,
   so shared links show a preview card and Google can index each prompt. The page then
   loads normally and app.js opens the prompt / category. */
const fs=require("fs"),path=require("path");
const {sb,esc,slug,originOf}=require("./_lib");
const j=o=>JSON.stringify(o).replace(/</g,"\\u003c");

async function shell(origin){
  try{return fs.readFileSync(path.join(process.cwd(),"index.html"),"utf8")}
  catch(e){return (await fetch(origin+"/index.html")).text()}
}
module.exports=async(req,res)=>{
  const origin=originOf(req),type=req.query.type,sl=String(req.query.slug||"");
  let html;try{html=await shell(origin)}catch(e){res.writeHead(302,{Location:"/"});return res.end()}
  let title,desc,canon,image=origin+"/og-default.png",ld,boot,body="";
  try{
    if(type==="p"){
      const id=parseInt(sl,10);if(!id)throw 0;
      const p=(await sb(`prompts?id=eq.${id}&select=id,title,category,tags,prompt&limit=1`))[0];if(!p)throw 0;
      canon=`${origin}/p/${p.id}-${slug(p.title)}`;image=`${origin}/api/img?id=${p.id}`;
      title=`${p.title} - Free AI Image Prompt | PromptHub`;
      desc=`Copy this free ${p.category} AI image prompt: ${p.prompt}`.slice(0,152)+"...";
      ld={"@context":"https://schema.org","@type":"ImageObject",name:p.title,description:p.prompt,contentUrl:image,url:canon,keywords:(p.tags||[]).join(", "),isAccessibleForFree:true};
      boot={type:"p",id:p.id};
      body=`<noscript><article><h1>${esc(p.title)}</h1><img src="${esc(image)}" alt="${esc(p.title)}"><p>${esc(p.prompt)}</p></article></noscript>`;
    }else if(type==="c"){
      const key=sl.replace(/[^a-z0-9]/gi,"");if(!key)throw 0;
      const rows=await sb(`prompts?category=ilike.${key}&select=id,title,category&order=id.desc&limit=60`);if(!rows.length)throw 0;
      const cat=rows[0].category;canon=`${origin}/c/${slug(cat)}`;
      title=`Best ${cat} AI Image Prompts (Free, Copy and Paste) | PromptHub`;
      desc=`Browse ${rows.length}+ free ${cat} AI image prompts. Copy in one click for ChatGPT, Gemini, Midjourney, Flux and more.`;
      ld={"@context":"https://schema.org","@type":"CollectionPage",name:title,url:canon,hasPart:rows.slice(0,20).map(r=>({"@type":"ImageObject",name:r.title,url:`${origin}/p/${r.id}-${slug(r.title)}`}))};
      boot={type:"c",cat};
      body=`<noscript><h1>${esc(cat)} AI image prompts</h1><ul>${rows.map(r=>`<li><a href="/p/${r.id}-${slug(r.title)}">${esc(r.title)}</a></li>`).join("")}</ul></noscript>`;
    }else throw 0;
  }catch(e){res.writeHead(302,{Location:"/"});return res.end()}

  html=html.replace(/<title>[\s\S]*?<\/title>/,"").replace(/<meta name="description"[^>]*>/,"").replace(/<meta property="og:[^>]*>/g,"").replace(/<meta name="twitter:[^>]*>/g,"").replace(/<link rel="canonical"[^>]*>/,"");
  const head=`<base href="/"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(canon)}">
<meta property="og:site_name" content="PromptHub"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canon)}"><meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(image)}">
<script type="application/ld+json">${j(ld)}</script><script>window.__BOOT=${j(boot)}</script>`;
  html=html.replace('<meta charset="utf-8">',()=>'<meta charset="utf-8">'+head).replace("<body>",()=>"<body>"+body);
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.setHeader("Cache-Control","public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(html);
};
