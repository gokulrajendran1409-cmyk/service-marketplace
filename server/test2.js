try {
  const proRoutes = require('./routes/professionalRoutes');
  console.log('professionalRoutes loaded OK');
  console.log('router:', typeof proRoutes);
} catch(e) {
  console.error('Error:', e.message);
}