const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  getProductByEan,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createProduct)
  .get(protect, getProducts);

router.route('/ean/:ean')
  .get(protect, getProductByEan);

router.route('/:id')
  .get(protect, getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router; 