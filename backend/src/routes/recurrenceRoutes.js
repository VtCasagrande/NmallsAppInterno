const express = require('express');
const {
  createRecurrence,
  getRecurrences,
  getRecurrence,
  updateRecurrence,
  cancelRecurrence,
  confirmPurchase,
  getRecurrenceStats
} = require('../controllers/recurrenceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createRecurrence)
  .get(protect, getRecurrences);

router.route('/stats')
  .get(protect, getRecurrenceStats);

router.route('/:id')
  .get(protect, getRecurrence)
  .put(protect, updateRecurrence);

router.route('/:id/cancel')
  .put(protect, cancelRecurrence);

router.route('/:id/confirm')
  .put(protect, confirmPurchase);

module.exports = router; 