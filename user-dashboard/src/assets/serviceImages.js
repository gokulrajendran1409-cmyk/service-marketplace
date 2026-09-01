const enc = (p) => encodeURIComponent(p);

const img = (prompt, size = 'square_hd') =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?image_size=${size}&prompt=${enc(prompt)}`;

const serviceImages = {
  plumbing: img('product photo of chrome brass plumbing pipes, elbow joint, faucet valve and monkey wrench arranged on soft pastel blue background, soft studio lighting, rounded square composition, no text, realistic clean minimalist editorial style, 3d icon vibe, drop shadow, top view angle'),
  plumber: img('product photo of chrome brass plumbing pipes, elbow joint, faucet valve and monkey wrench arranged on soft pastel blue background, soft studio lighting, rounded square composition, no text, realistic clean minimalist editorial style, 3d icon vibe, drop shadow, top view angle'),
  plumbing: img('product photo of chrome brass plumbing pipes, elbow joint, faucet valve and monkey wrench arranged on soft pastel blue background, soft studio lighting, rounded square composition, no text, realistic clean minimalist editorial style, 3d icon vibe, drop shadow, top view angle'),
  electrician: img('product photo of yellow black multimeter, insulated screwdriver set, wire stripper and electrical wall socket on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view'),
  electrical: img('product photo of yellow black multimeter, insulated screwdriver set, wire stripper and electrical wall socket on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view'),
  electricity: img('product photo of yellow black multimeter, insulated screwdriver set, wire stripper and electrical wall socket on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view'),
  cleaning: img('product photo of spray bottle, microfiber cloths, rubber gloves and scrub brush arranged on soft lavender pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down angle, house cleaning tools'),
  'house cleaning': img('product photo of spray bottle, microfiber cloths, rubber gloves and scrub brush arranged on soft lavender pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down angle, house cleaning tools'),
  painting: img('product photo of open paint can with sage green paint, wooden paintbrush, roller and paint swatch samples arranged on soft warm cream pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, house painting tools'),
  painter: img('product photo of open paint can with sage green paint, wooden paintbrush, roller and paint swatch samples arranged on soft warm cream pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, house painting tools'),
  gardening: img('realistic product photo of lush green potted plant in white ceramic pot with small garden trowel, soil scattered on soft blush pink pastel background, soft natural lighting, rounded square composition, no text, premium editorial style, drop shadow, top down view angle, realistic leaves and soil texture, plant label says gardening'),
  'gardening landscaping': img('realistic product photo of lush green potted plant in white ceramic pot with small garden trowel, soil scattered on soft blush pink pastel background, soft natural lighting, rounded square composition, no text, premium editorial style, drop shadow, top down view angle, realistic leaves and soil texture, plant label says gardening'),
  landscape: img('realistic product photo of lush green potted plant in white ceramic pot with small garden trowel, soil scattered on soft blush pink pastel background, soft natural lighting, rounded square composition, no text, premium editorial style, drop shadow, top down view angle, realistic leaves and soil texture'),
  lawn: img('realistic product photo of lush green potted plant in white ceramic pot with small garden trowel, soil scattered on soft blush pink pastel background, soft natural lighting, rounded square composition, no text, premium editorial style, drop shadow, top down view angle, realistic leaves and soil texture'),
  appliances: img('realistic product photo of white front loading washing machine appliance with blue handled screwdriver leaning against it, on soft pale sky blue pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic appliance photo, label appliances written bold dark green under'),
  appliance: img('realistic product photo of white front loading washing machine appliance with blue handled screwdriver leaning against it, on soft pale sky blue pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic appliance photo'),
  'ac appliance repair': img('realistic product photo of white split AC indoor unit mounted on wall, crossed green screwdriver and silver wrench, black yellow hard toolbox, all arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, ac and tools composition'),
  'ac repair': img('realistic product photo of white split AC indoor unit mounted on wall, crossed green screwdriver and silver wrench, black yellow hard toolbox, all arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, ac and tools composition'),
  'appliance repair': img('realistic product photo of white split AC indoor unit mounted on wall, crossed green screwdriver and silver wrench, black yellow hard toolbox, all arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, ac and tools composition'),
  'air conditioner': img('realistic product photo of white split AC indoor unit mounted on wall, crossed green screwdriver and silver wrench, black yellow hard toolbox, all arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, ac and tools composition'),
  carpentry: img('realistic product photo of light brown wooden cabinet, wooden toolbox with hammer hand saw chisel, yellow retractable measuring tape arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic wood grain texture, label carpentry dark green under'),
  carpenter: img('realistic product photo of light brown wooden cabinet, wooden toolbox with hammer hand saw chisel, yellow retractable measuring tape arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic wood grain texture'),
  furniture: img('realistic product photo of light brown wooden cabinet, wooden toolbox with hammer hand saw chisel, yellow retractable measuring tape arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic wood grain texture'),
  woodwork: img('realistic product photo of light brown wooden cabinet, wooden toolbox with hammer hand saw chisel, yellow retractable measuring tape arranged on soft warm beige pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic wood grain texture'),
  cctv: img('product photo of white dome CCTV security camera, ethernet cable and black DVR box arranged on soft slate gray pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, security camera installation tools'),
  'cctv security': img('product photo of white dome CCTV security camera, ethernet cable and black DVR box arranged on soft slate gray pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, security camera installation tools'),
  security: img('product photo of white dome CCTV security camera, ethernet cable and black DVR box arranged on soft slate gray pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, security camera installation tools'),
  'vehicle recovery': img('product photo of red tow truck with yellow recovery van toy model, tire wrench and orange warning triangle arranged on soft gray pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view angle, roadside assistance'),
  'recovery van': img('product photo of red tow truck with yellow recovery van toy model, tire wrench and orange warning triangle arranged on soft gray pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view angle, roadside assistance'),
  vehicle: img('product photo of red tow truck with yellow recovery van toy model, tire wrench and orange warning triangle arranged on soft gray pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view angle, roadside assistance'),
  towing: img('product photo of red tow truck with yellow recovery van toy model, tire wrench and orange warning triangle arranged on soft gray pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view angle, roadside assistance'),
  'home repair': img('product photo of hand tool set including hammer, pliers, screwdrivers and spirit level on soft teal pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, handyman toolkit'),
  maintenance: img('product photo of hand tool set including hammer, pliers, screwdrivers and spirit level on soft teal pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, handyman toolkit'),
  handyman: img('product photo of hand tool set including hammer, pliers, screwdrivers and spirit level on soft teal pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, handyman toolkit'),
  'computer repair': img('realistic product photo of open black desktop PC tower case with exposed fan and cables, black monitor, keyboard, screwdriver and doctor stethoscope arranged on soft warm cream pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic computer repair composition, label computer repairing dark green under'),
  'computer mobile repair': img('realistic product photo of open black desktop PC tower case with exposed fan and cables, black monitor, keyboard, screwdriver and doctor stethoscope arranged on soft warm cream pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic computer repair composition'),
  laptop: img('realistic product photo of open black desktop PC tower case with exposed fan and cables, black monitor, keyboard, screwdriver and doctor stethoscope arranged on soft warm cream pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic computer repair composition'),
  mobile: img('product photo of smartphone with cracked screen and small repair screwdriver set on soft pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow'),
  photography: img('product photo of black DSLR camera with 50mm lens, camera strap, SD card and lens cloth arranged on soft terracotta pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, photography equipment'),
  'photography videography': img('product photo of black DSLR camera with 50mm lens, camera strap, SD card and lens cloth arranged on soft terracotta pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, photography equipment'),
  photo: img('product photo of black DSLR camera with 50mm lens, camera strap, SD card and lens cloth arranged on soft terracotta pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, photography equipment'),
  camera: img('product photo of black DSLR camera with 50mm lens, camera strap, SD card and lens cloth arranged on soft terracotta pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow, top down view, photography equipment'),
  computer: img('realistic product photo of open black desktop PC tower case with exposed fan and cables, black monitor, keyboard, screwdriver and doctor stethoscope arranged on soft warm cream pastel background, soft studio lighting, rounded square composition, no text, premium editorial style, drop shadow, realistic computer repair composition'),
};

const covers = {
  plumbing: img('wide banner showing plumber at work under kitchen sink with wrench, realistic lifestyle photo, soft warm home kitchen background, no text, editorial professional banner composition, professional lighting'),
  electrician: img('wide banner showing professional electrician working on wall electrical panel with tools, realistic lifestyle photo, modern home interior background, no text, editorial professional banner composition'),
  cleaning: img('wide banner showing professional cleaner in uniform spraying and wiping kitchen counter, realistic lifestyle photo, bright modern kitchen, no text, editorial professional banner composition'),
  painting: img('wide banner showing professional painter rolling sage green paint on interior wall, realistic lifestyle photo, cozy home background, no text, editorial professional banner composition'),
  gardening: img('wide banner showing professional gardener trimming potted plants with shears, realistic lifestyle photo, lush green garden balcony background, no text, editorial professional banner composition'),
  appliances: img('wide banner showing appliance repair technician working on washing machine with screwdriver, realistic lifestyle photo, laundry room interior, no text, editorial professional banner composition'),
  'ac & appliance repair': img('wide banner showing HVAC technician servicing wall mounted AC unit with tools, realistic lifestyle photo, modern home interior, no text, editorial professional banner composition'),
  carpentry: img('wide banner showing carpenter sanding wooden cabinet with sandpaper in workshop, realistic lifestyle photo, woodworking workshop background, no text, editorial professional banner composition'),
  cctv: img('wide banner showing security technician installing white dome CCTV camera on wall, realistic lifestyle photo, office interior, no text, editorial professional banner composition'),
  'vehicle recovery': img('wide banner showing roadside assistance mechanic towing a car, realistic lifestyle photo, street roadside scene, no text, editorial professional banner composition'),
  'home repair': img('wide banner showing handyman using cordless drill on wooden door frame, realistic lifestyle photo, home interior background, no text, editorial professional banner composition'),
  'computer & mobile repair': img('wide banner showing technician repairing laptop motherboard with soldering iron, realistic lifestyle photo, electronic workshop, no text, editorial professional banner composition'),
  photography: img('wide banner showing professional photographer with DSLR camera at outdoor event, realistic lifestyle photo, soft bokeh event background, no text, editorial professional banner composition', 'landscape_16_9'),
};

const defaultImg = img('product photo of home services tools icon set on soft cream pastel background, soft studio lighting, rounded square composition, no text, realistic clean editorial style, drop shadow');

export function getServiceImage(name) {
  if (!name) return defaultImg;
  const key = String(name).toLowerCase().trim();
  if (serviceImages[key]) return serviceImages[key];
  for (const [k, v] of Object.entries(serviceImages)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return defaultImg;
}

export function getServiceCover(name) {
  if (!name) return defaultImg;
  const key = String(name).toLowerCase().trim();
  if (covers[key]) return covers[key];
  for (const [k, v] of Object.entries(covers)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return getServiceImage(name);
}

export const INCLUDED_SERVICES = {
  plumbing: ['Leak Detection', 'Tap / Mixer Repair', 'Pipe Installation', 'Sink / Basin Fix', 'Bathroom Fittings', 'Water Tank'],
  electrician: ['Wiring & Rewiring', 'Switch / Socket Repair', 'Fan / Light Fitting', 'MCB / Fuse Board', 'Inverter Setup', 'Appliance Wiring'],
  'house cleaning': ['Full Kitchen Deep Clean', 'Bathroom Sanitization', 'Floor Scrubbing', 'Wall Spot Cleaning', 'Dust & Cobweb', 'Furniture Polish'],
  cleaning: ['Full Kitchen Deep Clean', 'Bathroom Sanitization', 'Floor Scrubbing', 'Wall Spot Cleaning', 'Dust & Cobweb', 'Furniture Polish'],
  painting: ['Interior Wall Painting', 'Exterior Painting', 'Wood / Varnish Work', 'Wallpaper / Putty', 'Texture / Stencil', 'Door & Window Paint'],
  gardening: ['Lawn Mowing & Trimming', 'Pest / Weed Control', 'Potted Plant Care', 'Tree Pruning', 'Landscape Design', 'Fertilization'],
  appliances: ['Washing Machine Repair', 'Fridge / Refrigerator', 'Microwave Service', 'Dishwasher Repair', 'Dryer Service', 'Installation Help'],
  'ac & appliance repair': ['Split AC Service', 'Window AC Repair', 'Gas Refill / Top-up', 'Washing Machine', 'Fridge Service', 'Installation'],
  carpentry: ['Furniture Assembly', 'Door & Window Repair', 'Carpentry Work', 'Custom Woodwork', 'Polish & Refinish', 'Curtain / Wardrobe'],
  cctv: ['CCTV Camera Install', 'DVR / NVR Setup', 'Wiring & Cabling', 'Remote View Config', 'Annual Maintenance', 'Security Audit'],
  'vehicle recovery': ['24/7 Tow Truck', 'Flatbed Recovery', 'Jump Start', 'Flat Tire Help', 'Fuel Delivery', 'Roadside Lockout'],
  'home repair': ['Handyman for Odd Jobs', 'Hanging Fixtures', 'Door / Lock Repair', 'Grout & Caulking', 'Furniture Fix', 'General Maintenance'],
  'computer & mobile repair': ['Laptop Screen Repair', 'OS Installation', 'Virus / Malware', 'Mobile Screen Fix', 'Battery Replacement', 'Data Recovery'],
  photography: ['Wedding / Event Shoot', 'Portrait Session', 'Product Photography', 'Videography & Edit', 'Maternity / Baby', 'Corporate Event'],
  default: ['Inspection & Diagnosis', 'Expert Visit', 'Genuine Spares', 'Post Service Warranty', 'Transparent Pricing', 'Re-work if Required'],
};

export function getIncludedServices(name) {
  if (!name) return INCLUDED_SERVICES.default;
  const key = String(name).toLowerCase().trim();
  if (INCLUDED_SERVICES[key]) return INCLUDED_SERVICES[key];
  for (const [k, v] of Object.entries(INCLUDED_SERVICES)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return INCLUDED_SERVICES.default;
}

export function getPriceRange(name) {
  const map = {
    plumbing: ['₹249', '₹1,499'],
    electrician: ['₹249', '₹1,799'],
    cleaning: ['₹499', '₹2,499'],
    'house cleaning': ['₹499', '₹2,499'],
    painting: ['₹1,499', '₹14,999'],
    gardening: ['₹349', '₹2,499'],
    appliances: ['₹399', '₹1,999'],
    'ac & appliance repair': ['₹399', '₹2,499'],
    carpentry: ['₹349', '₹3,499'],
    cctv: ['₹499', '₹2,499'],
    'vehicle recovery': ['₹599', '₹3,999'],
    'home repair': ['₹249', '₹1,499'],
    'computer & mobile repair': ['₹249', '₹2,499'],
    photography: ['₹4,999', '₹24,999'],
  };
  const key = String(name || '').toLowerCase().trim();
  if (map[key]) return map[key];
  for (const k of Object.keys(map)) {
    if (k.includes(key) || key.includes(k)) return map[k];
  }
  return ['₹299', '₹1,999'];
}
