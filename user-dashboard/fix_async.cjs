const fs = require('fs');
let file, text;

file = 'src/pages/BrowseProfessionals.jsx';
text = fs.readFileSync(file, 'utf8');
text = text.replace('const requestLocation = () => new Promise((resolve, reject) => {', 'const requestLocation = () => new Promise(async (resolve, reject) => {');
fs.writeFileSync(file, text);

file = 'src/pages/Services.jsx';
text = fs.readFileSync(file, 'utf8');
text = text.replace('const requestLocation = () => new Promise((resolve, reject) => {', 'const requestLocation = () => new Promise(async (resolve, reject) => {');
fs.writeFileSync(file, text);

file = 'src/components/BookingModal.jsx';
text = fs.readFileSync(file, 'utf8');
text = text.replace('const handleDetectCurrentLocation = () => {', 'const handleDetectCurrentLocation = async () => {');
fs.writeFileSync(file, text);

file = 'src/pages/Profile.jsx';
text = fs.readFileSync(file, 'utf8');
text = text.replace('const handleDetectGpsForNewAddress = () => {', 'const handleDetectGpsForNewAddress = async () => {');
fs.writeFileSync(file, text);
