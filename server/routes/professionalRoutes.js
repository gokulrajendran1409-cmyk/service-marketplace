const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');

router.get('/', professionalController.searchProfessionals);
router.get('/:id', professionalController.getProfessionalById);
router.put('/:id', professionalController.updateProfessional);

module.exports = router;
