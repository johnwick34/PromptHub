/* PromptHub SEED/FALLBACK data. Once Supabase is connected, the live site reads real
   content from the database — this file is only the starting content used the very first
   time (via "Seed database" in the admin panel) and the offline fallback shown if
   the database can't be reached. You no longer need to redeploy this file after every edit. */
var SEED_CONFIG={
  "email": "hello@example.com",
  "whatsapp": "",
  "socials": {
    "GitHub": "https://github.com/your-username",
    "LinkedIn": "https://linkedin.com/in/your-username",
    "Facebook": "https://facebook.com/your-username",
    "Instagram": "https://instagram.com/your-username",
    "YouTube": "https://youtube.com/@your-channel",
    "Portfolio": "https://your-portfolio.example.com"
  }
};

var SEED_PROMPTS=[
{id:1,title:"Cinematic Rain Portrait",image:"",category:"Cinematic",tags:["portrait","rain","photography"],badge:"TRENDING",prompt:"A cinematic close-up portrait of a young man standing under heavy rain at night, dramatic rim lighting, wet hair, realistic skin texture, shallow depth of field, 85mm lens, atmospheric background, volumetric lighting, high detail, professional photography"},
{id:2,title:"Neon Alley Runner",image:"",category:"Cyberpunk",tags:["neon","city","night"],badge:"TRENDING",prompt:"A lone runner sprinting through a narrow neon-lit alley in a futuristic megacity, reflective wet pavement, holographic signs in red and cyan, steam rising from vents, motion blur, ultra detailed, cinematic wide shot"},
{id:3,title:"Soft Studio Portrait",image:"",category:"Portrait",tags:["studio","soft light","woman"],badge:"EDITOR'S PICK",prompt:"Studio portrait of a woman with freckles, soft diffused window light, neutral gray backdrop, 50mm lens, natural skin texture, gentle catchlights, muted tones, fine-art photography"},
{id:4,title:"Spirit Fox Shrine",image:"",category:"Anime",tags:["fox","shrine","spirit"],badge:"NEW",prompt:"Anime style illustration of a nine-tailed fox spirit sitting on the steps of a mountain shrine at dusk, floating lanterns, cherry blossoms, painterly clouds, vibrant colors, studio-quality key art"},
{id:5,title:"Runway in Red",image:"",category:"Fashion",tags:["runway","red","editorial"],badge:"TRENDING",prompt:"High-fashion editorial of a model in a sculptural red gown walking a mirrored runway, strobe lighting, sharp shadows, wide-angle lens, magazine cover composition, ultra sharp"},
{id:6,title:"Dragon Over Glass Valley",image:"",category:"Fantasy",tags:["dragon","landscape","epic"],badge:"",prompt:"An enormous crystalline dragon gliding over a valley of glass spires at sunrise, god rays, drifting mist, epic scale, matte painting style, intricate detail, dramatic color grading"},
{id:7,title:"Golden Hour Mountain Road",image:"",category:"Photography",tags:["landscape","road","golden hour"],badge:"NEW",prompt:"A winding mountain road at golden hour, long shadows, warm backlight, light haze in the valley, telephoto compression, high dynamic range, National Geographic style landscape photography"},
{id:8,title:"Matte Black Headphones",image:"",category:"Product",tags:["product","studio","minimal"],badge:"",prompt:"Product photo of matte black wireless headphones floating above a dark reflective surface, red rim light, minimal composition, crisp edges, commercial advertising style, 8k"},
{id:9,title:"Brutalist Light Hall",image:"",category:"Architecture",tags:["concrete","interior","light"],badge:"EDITOR'S PICK",prompt:"Interior of a brutalist concrete hall with a single beam of sunlight cutting through a skylight, tiny human figure for scale, symmetrical composition, fine film grain, architectural photography"},
{id:10,title:"Chrome Toy Astronaut",image:"",category:"3D",tags:["render","toy","chrome"],badge:"NEW",prompt:"3D render of a cute chrome astronaut toy on a pastel pedestal, glossy plastic and metal materials, soft studio lighting, subsurface scattering, octane render, shallow depth of field"},
{id:11,title:"1970s Diner at Dusk",image:"",category:"Vintage",tags:["retro","film","diner"],badge:"",prompt:"A 1970s roadside diner at dusk, glowing neon sign, parked vintage cars, faded Kodachrome colors, film grain, slight light leaks, nostalgic atmosphere, 35mm photograph"},
{id:12,title:"Lantern Night in Kyoto",image:"",category:"Travel",tags:["japan","street","night"],badge:"TRENDING",prompt:"A quiet Kyoto street at night lined with paper lanterns, light drizzle, a traveler with an umbrella, warm glow on wet stone, cinematic framing, travel magazine photography"},
{id:13,title:"Chrome Samurai",image:"",category:"Cyberpunk",tags:["samurai","armor","neon"],badge:"",prompt:"A samurai in chrome armor standing on a rooftop above a neon city, rain, red katana glow, low angle, hyper-detailed, dramatic cinematic lighting"},
{id:14,title:"Moonlit Forest Elf",image:"",category:"Fantasy",tags:["elf","forest","magic"],badge:"",prompt:"An elf archer in a moonlit ancient forest, bioluminescent plants, drifting fireflies, silver armor, soft rim light, highly detailed fantasy illustration"}
];
