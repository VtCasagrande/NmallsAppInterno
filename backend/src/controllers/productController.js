const Product = require('../models/Product');

// @desc    Criar um produto
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    // Verificar se o EAN já existe
    const existingProduct = await Product.findOne({ ean: req.body.ean });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'EAN já cadastrado'
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter todos os produtos
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    // Preparar a query
    let query = Product.find({ active: true });

    // Busca por nome ou EAN
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { name: searchRegex },
        { ean: searchRegex },
        { description: searchRegex }
      ]);
    }

    // Paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments({ active: true });

    query = query.skip(startIndex).limit(limit);

    // Ordenação
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      query = query.sort(sort);
    } else {
      query = query.sort({ name: 1 });
    }

    // Executar query
    const products = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter um produto pelo ID
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter um produto pelo EAN
// @route   GET /api/products/ean/:ean
// @access  Private
exports.getProductByEan = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      ean: req.params.ean,
      active: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Atualizar um produto
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Se estiver atualizando EAN, verificar se já existe
    if (req.body.ean && req.body.ean !== product.ean) {
      const existingProduct = await Product.findOne({ ean: req.body.ean });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          error: 'EAN já cadastrado'
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Desativar um produto
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    await Product.findByIdAndUpdate(req.params.id, { active: false });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 