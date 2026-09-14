import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';

// 5 Curated, high-resolution aesthetic pictures specifically related to each service category
export const SERVICE_SLIDESHOW_IMAGES = {
  'Plumbing': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', // Modern bathroom faucet & sink
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80', // Luxury modern bathroom plumbing
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80', // Copper pipeline & valve system
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80', // Professional plumber tools & pipe repair
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', // Contemporary shower & bathroom fixtures
  ],
  'Electrical': [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80', // Electrician working on circuit breaker panel
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', // Architectural warm designer lighting
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80', // Smart home wall switch & clean electrical work
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', // High-tech electrical wiring & electronics
    'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=1200&q=80', // Modern ceiling pendant light fixture installation
  ],
  'AC Repair': [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80', // Split air conditioner indoor unit in modern room
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80', // HVAC technician testing condenser pressure
    'https://images.unsplash.com/photo-1527016021513-b09758b777bd?auto=format&fit=crop&w=1200&q=80', // AC cooling airflow & modern ventilation
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', // Diagnostic tools & AC system repair
    'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1200&q=80', // Clean energy efficient AC thermostat control
  ],
  'AC & Appliance Repair': [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80', // Split air conditioner indoor unit
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80', // Modern kitchen appliances & refrigerator
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80', // HVAC service technician with tools
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=80', // Washing machine & dryer installation
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', // Appliance diagnostics & motherboard fix
  ],
  'Carpentry': [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', // Master carpenter woodworking with chisel & wood grain
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80', // Custom wooden furniture craftsmanship
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80', // Elegant bespoke wooden kitchen cabinetry
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80', // Workshop carpentry tools & measuring timber
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', // Natural hardwood interior joinery & door
  ],
  'Cleaning': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80', // Deep cleaning sparkling modern kitchen counter
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80', // Spotless sunlit living room vacuuming
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80', // Professional housekeeping & sanitization supplies
    'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=80', // Pristine clean luxury bathroom
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', // Bright organized clean home interior
  ],
  'Painting': [
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80', // Painter rolling fresh teal paint on wall
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80', // Paint brushes, color swatches & paint buckets
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80', // Designer interior wall color styling
    'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=1200&q=80', // Precision edge trim painting with masking tape
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', // Beautiful freshly painted modern architectural home
  ],
  'Mechanic': [
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80', // Auto mechanic inspecting car engine bay
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80', // Modern garage with cars on hydraulic lifts
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80', // Brake caliper and wheel suspension servicing
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', // Precision motorcycle / vehicle maintenance
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80', // Diagnostic scanner & engine tuning
  ],
  'Vehicle Services': [
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80', // Engine inspection
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80', // Car workshop & lift
    'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80', // Car detailing & foam wash
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80', // Tire, brake & wheel alignment
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', // Two-wheeler & bike tune-up
  ],
  'CCTV Installation': [
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80', // Modern dome CCTV security camera
    'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=1200&q=80', // Security control room with multi-screen surveillance
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80', // Smart electronic digital door lock & keypad
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80', // Outdoor weatherproof surveillance camera
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80', // Smart home security hub & intrusion sensor
  ],
  'CCTV & Security': [
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80', // Dome CCTV security camera
    'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=1200&q=80', // Surveillance monitoring system
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80', // Biometric smart lock
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80', // Wall-mounted IP security camera
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80', // High-tech security alarm system
  ],
  'Appliance Repair': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80', // Refrigerator in kitchen
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=80', // Washing machine repair
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80', // Microwave and kitchen appliances
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', // Electronic motherboard troubleshooting
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80', // Technician servicing home appliances
  ],
  'Beauty & Wellness': [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', // Luxury spa aromatherapy atmosphere
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80', // Hair salon stylist at work
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80', // Skincare facial & rejuvenation
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', // Relaxing deep tissue massage
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80', // Aesthetic makeup artist & beauty care
  ],
  'Personal Care': [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80', // Barber & styling salon
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', // Wellness therapy
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80', // Organic facial treatment
    'https://images.unsplash.com/photo-1512290900672-1f55b9319a37?auto=format&fit=crop&w=1200&q=80', // Spa body scrub & wellness
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80', // Modern grooming & haircut
  ],
  'Tutoring': [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80', // Study desk with books & notes
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', // Teacher coaching student
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', // Group study & academic coaching
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80', // Textbooks and learning materials
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80', // Interactive classroom & mentoring
  ],
  'Photography': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80', // Professional DSLR camera & lens
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80', // Studio photo shoot with lighting setup
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80', // Golden hour outdoor portrait photography
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80', // Cinematic video capture & gimbal
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80', // Photo post-processing & editing suite
  ],
  'Photography & Videography': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80', // DSLR camera
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80', // Studio lighting
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80', // Wedding portrait shoot
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80', // Video gimbal
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80', // Color grading & video editing
  ],
  'Event Planning': [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', // Wedding celebration table & floral decor
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80', // Festive banquet & lights
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', // Elegant ballroom event setup
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', // Party celebration & balloons
    'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1200&q=80', // Outdoor night garden event with fairy lights
  ],
  'Landscaping': [
    'https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&w=1200&q=80', // Lush manicured garden lawn
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80', // Gardening & planting ornamental flowers
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=1200&q=80', // Modern patio stone landscaping
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', // Garden pathway & hedges
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80', // Greenhouse & vibrant plant nursery
  ],
  'Gardening & Landscaping': [
    'https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&w=1200&q=80', // Manicured lawn
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80', // Flower planting
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=1200&q=80', // Stone pavers & garden design
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', // Tree pruning & hedge trimming
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80', // Garden irrigation & nursery
  ],
  'Moving & Packing': [
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80', // Stacked cardboard moving boxes in clean home
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', // Bright spacious new home interior
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', // Packaging tape & packing supplies
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', // Logistics & moving cargo storage
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', // New living room ready for settlement
  ],
  'Home Renovation': [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', // Architectural blueprints & tape measure
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80', // Luxury kitchen renovation island
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', // Interior remodeling in progress
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80', // Renovation construction site
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', // Completed dream home remodeling
  ],
  'Home Repair & Maintenance': [
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80', // Professional tool set & handyman equipment
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80', // Repairing wooden structure
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80', // Home pipe fixture maintenance
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80', // Touchup wall paint & patching
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', // Home fixture & electric repair
  ],
  'IT & Computer Support': [
    'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=1200&q=80', // Laptop motherboard repair with precision tools
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', // Server rack glowing data cables
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', // IT cybersecurity and tech diagnostics
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', // Software & networking workstation
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80', // Computer hardware CPU & cooling build
  ],
  'Computer & Mobile Repair': [
    'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=1200&q=80', // Laptop motherboard
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80', // CPU chip & RAM
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', // Screen diagnostics
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', // Network cables
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', // IT repair desk
  ],
  'Language Classes': [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80', // Books & notes on wooden desk
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80', // Reading literature & study
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', // Interactive group learning & language exchange
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80', // Library book stacks
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', // Global students conversational class
  ],
  'Pet Care': [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80', // Adorable happy golden dog
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80', // Gentle dog grooming & brushing
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80', // Beautiful calm cat
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80', // Dog walking in green sunny meadow
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=1200&q=80', // Veterinarian health check for pet
  ],
  'Other Services': [
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80', // Complete toolkit with wrench, hammer, drill
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80', // Skilled craftsman at work
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80', // Pipe fixture & hardware
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80', // Home surface finishing
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80', // Multi-skilled maintenance work
  ],
};

// Helper to look up the 5 related images for any service category string
export const getServiceSlideshowImages = (categoryName) => {
  if (!categoryName) return SERVICE_SLIDESHOW_IMAGES['Plumbing'];
  const trimmed = categoryName.trim();
  if (SERVICE_SLIDESHOW_IMAGES[trimmed]) return SERVICE_SLIDESHOW_IMAGES[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [catKey, imgs] of Object.entries(SERVICE_SLIDESHOW_IMAGES)) {
    if (lower === catKey.toLowerCase()) return imgs;
  }
  for (const [catKey, imgs] of Object.entries(SERVICE_SLIDESHOW_IMAGES)) {
    if (lower.includes(catKey.toLowerCase()) || catKey.toLowerCase().includes(lower)) {
      return imgs;
    }
  }
  // Keyword fallbacks
  if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('leak') || lower.includes('tap')) return SERVICE_SLIDESHOW_IMAGES['Plumbing'];
  if (lower.includes('elect') || lower.includes('wire') || lower.includes('switch') || lower.includes('light')) return SERVICE_SLIDESHOW_IMAGES['Electrical'];
  if (lower.includes('ac') || lower.includes('cool') || lower.includes('air')) return SERVICE_SLIDESHOW_IMAGES['AC Repair'];
  if (lower.includes('clean') || lower.includes('maid') || lower.includes('sweep')) return SERVICE_SLIDESHOW_IMAGES['Cleaning'];
  if (lower.includes('paint')) return SERVICE_SLIDESHOW_IMAGES['Painting'];
  if (lower.includes('wood') || lower.includes('carpent')) return SERVICE_SLIDESHOW_IMAGES['Carpentry'];
  if (lower.includes('car') || lower.includes('bike') || lower.includes('mechanic') || lower.includes('auto') || lower.includes('vehicle')) return SERVICE_SLIDESHOW_IMAGES['Mechanic'];
  if (lower.includes('cctv') || lower.includes('camera') || lower.includes('secur')) return SERVICE_SLIDESHOW_IMAGES['CCTV Installation'];
  if (lower.includes('appliance') || lower.includes('fridge') || lower.includes('wash')) return SERVICE_SLIDESHOW_IMAGES['Appliance Repair'];
  if (lower.includes('beauty') || lower.includes('salon') || lower.includes('spa') || lower.includes('barber')) return SERVICE_SLIDESHOW_IMAGES['Beauty & Wellness'];
  if (lower.includes('tutor') || lower.includes('teach') || lower.includes('class')) return SERVICE_SLIDESHOW_IMAGES['Tutoring'];
  if (lower.includes('photo') || lower.includes('video')) return SERVICE_SLIDESHOW_IMAGES['Photography'];
  if (lower.includes('event') || lower.includes('party')) return SERVICE_SLIDESHOW_IMAGES['Event Planning'];
  if (lower.includes('garden') || lower.includes('landscap') || lower.includes('lawn')) return SERVICE_SLIDESHOW_IMAGES['Landscaping'];
  if (lower.includes('pack') || lower.includes('move') || lower.includes('shift')) return SERVICE_SLIDESHOW_IMAGES['Moving & Packing'];
  if (lower.includes('renovat') || lower.includes('remodel')) return SERVICE_SLIDESHOW_IMAGES['Home Renovation'];
  if (lower.includes('it') || lower.includes('computer') || lower.includes('laptop')) return SERVICE_SLIDESHOW_IMAGES['IT & Computer Support'];
  if (lower.includes('language') || lower.includes('english')) return SERVICE_SLIDESHOW_IMAGES['Language Classes'];
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return SERVICE_SLIDESHOW_IMAGES['Pet Care'];

  return SERVICE_SLIDESHOW_IMAGES['Plumbing'];
};

function SubcategorySlideshow({
  categoryName,
  subcategories = [],
  onSelectSubcategory,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const images = getServiceSlideshowImages(categoryName);
  const timerRef = useRef(null);

  // Auto-advance slideshow every 4.8 seconds with smooth match-and-move transition
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, isPaused, categoryName]);

  // Reset slide index when category changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [categoryName]);

  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div
      className="subcat-showcase-container fade-up"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Match and Move 5-Picture Slideshow Backdrop ── */}
      <div className="subcat-slideshow-backdrop" aria-hidden="true">
        {images.map((imgUrl, index) => {
          const isActive = index === currentSlide;
          // Apply matching kinetic pan/zoom based on the active index
          const motionClass = `motion-${index % 5}`;
          return (
            <div
              key={index}
              className={`subcat-slide-layer ${isActive ? 'active' : ''}`}
            >
              <img
                src={imgUrl}
                alt={`${categoryName} showcase ${index + 1}`}
                className={`subcat-slide-img ${isActive ? `active ${motionClass}` : ''}`}
                loading="lazy"
              />
            </div>
          );
        })}

        {/* Ambient Aesthetic Scrim Overlays */}
        <div className="subcat-slideshow-gradient-scrim" />
        <div className="subcat-slideshow-tint-overlay" />
      </div>

      {/* ── Foreground Header (Photo Text & Count Pill Removed) ── */}
      <div className="subcat-showcase-header">
        <div className="subcat-showcase-title-wrap">
          <div className="subcat-showcase-badge">
            <Sparkles size={13} className="subcat-sparkle-icon" />
            <span>{categoryName} Services</span>
          </div>
          <h3 className="subcat-showcase-heading">Select a Sub-Service</h3>
        </div>

        {/* 5-Slide Match & Move Progress Indicators */}
        <div className="subcat-slide-controls" title="Match & Move Slideshow">
          <div className="subcat-slide-dots">
            {images.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`subcat-slide-dot ${dotIdx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(dotIdx)}
                aria-label={`Show ${categoryName} photo ${dotIdx + 1} of ${images.length}`}
              />
            ))}
          </div>
          <span className="subcat-slide-counter">
            <ImageIcon size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
            {currentSlide + 1}/{images.length}
          </span>
        </div>
      </div>

      {/* ── Sub-Categories Floating Glass Cards Grid ── */}
      <div className="subcat-glass-grid">
        {subcategories.map((item, idx) => (
          <div
            key={item.id || idx}
            className="subcat-glass-card"
            onClick={() => onSelectSubcategory?.(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectSubcategory?.(item);
              }
            }}
          >
            <div className="subcat-glass-card-content">
              <h4 className="subcat-glass-card-title">{item.name}</h4>
              <div className="subcat-glass-card-meta">
                <span className="subcat-glass-card-price">
                  {item.price_estimate || 'Standard rate'}
                </span>
                {item.count && (
                  <span className="subcat-glass-card-availability">
                    • {item.count}
                  </span>
                )}
              </div>
            </div>
            <div className="subcat-glass-card-chevron-wrap">
              <ChevronRight size={17} className="subcat-glass-card-chevron" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubcategorySlideshow;
