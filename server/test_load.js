try {
  const auth = require('./middleware/authMiddleware');
  console.log('authMiddleware loaded, protectProfessional type:', typeof auth.protectProfessional);
  
  const proRoutes = require('./routes/professionalRoutes');
  console.log('professionalRoutes loaded OK');
} catch(e) {
  console.error('Error:', e.message);
}