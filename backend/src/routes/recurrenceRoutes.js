const express = require('express');
const router = express.Router();
const { 
  getRecurrences, 
  getRecurrenceById, 
  createRecurrence, 
  updateRecurrence, 
  confirmRecurrence,
  skipRecurrence,
  cancelRecurrence
} = require('../controllers/recurrenceController');
const { protect } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas principais
router.route('/')
  .get(getRecurrences)
  .post(createRecurrence);

router.route('/:id')
  .get(getRecurrenceById)
  .put(updateRecurrence)
  .delete(cancelRecurrence);

// Rotas específicas
router.post('/:id/confirm', confirmRecurrence);
router.post('/:id/skip', skipRecurrence);

module.exports = router; 