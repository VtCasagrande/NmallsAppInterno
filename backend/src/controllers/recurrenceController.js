const Recurrence = require('../models/Recurrence');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Criar uma recorrência
// @route   POST /api/recurrences
// @access  Private
exports.createRecurrence = async (req, res) => {
  try {
    // Adicionar o usuário que está criando a recorrência
    req.body.createdBy = req.user.id;

    // Verificar se o cliente existe
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Verificar e formatar os itens da recorrência
    if (req.body.items && req.body.items.length > 0) {
      for (let item of req.body.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            error: `Produto ${item.product} não encontrado`
          });
        }
        
        // Adicionar informações do produto ao item
        item.ean = product.ean;
        item.name = product.name;
        
        // Se não for fornecido o preço, usar o preço do produto
        if (!item.price) {
          item.price = product.price;
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'É necessário pelo menos um item na recorrência'
      });
    }

    // Calcular a data da próxima recorrência
    const startDate = new Date(req.body.startDate);
    req.body.nextDate = new Date(startDate);

    const recurrence = await Recurrence.create(req.body);

    res.status(201).json({
      success: true,
      data: recurrence
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter todas as recorrências
// @route   GET /api/recurrences
// @access  Private
exports.getRecurrences = async (req, res) => {
  try {
    // Preparar a query
    let query = Recurrence.find()
      .populate({
        path: 'customer',
        select: 'name cpf phone'
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      });

    // Filtrar por status
    if (req.query.status) {
      query = query.where('status').equals(req.query.status);
    }

    // Filtrar por cliente
    if (req.query.customer) {
      query = query.where('customer').equals(req.query.customer);
    }

    // Filtrar por data de próxima compra
    if (req.query.overdue === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.where('nextDate').lt(today).where('status').equals('active');
    }

    // Busca por nome do cliente ou CPF
    if (req.query.search) {
      const customers = await Customer.find({
        $or: [
          { name: new RegExp(req.query.search, 'i') },
          { cpf: new RegExp(req.query.search, 'i') }
        ]
      }).select('_id');
      
      const customerIds = customers.map(customer => customer._id);
      query = query.where('customer').in(customerIds);
    }

    // Paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Recurrence.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit);

    // Ordenação
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      query = query.sort(sort);
    } else {
      query = query.sort({ nextDate: 1 });
    }

    // Executar query
    const recurrences = await query;

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
      count: recurrences.length,
      pagination,
      data: recurrences
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter uma recorrência pelo ID
// @route   GET /api/recurrences/:id
// @access  Private
exports.getRecurrence = async (req, res) => {
  try {
    const recurrence = await Recurrence.findById(req.params.id)
      .populate({
        path: 'customer',
        select: 'name cpf phone email address'
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      })
      .populate({
        path: 'logs.registeredBy',
        select: 'name'
      });

    if (!recurrence) {
      return res.status(404).json({
        success: false,
        error: 'Recorrência não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: recurrence
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Atualizar uma recorrência
// @route   PUT /api/recurrences/:id
// @access  Private
exports.updateRecurrence = async (req, res) => {
  try {
    let recurrence = await Recurrence.findById(req.params.id);

    if (!recurrence) {
      return res.status(404).json({
        success: false,
        error: 'Recorrência não encontrada'
      });
    }

    // Verificar itens e produtos se estão sendo atualizados
    if (req.body.items && req.body.items.length > 0) {
      for (let item of req.body.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            error: `Produto ${item.product} não encontrado`
          });
        }
        
        // Adicionar informações do produto ao item
        item.ean = product.ean;
        item.name = product.name;
        
        // Se não for fornecido o preço, usar o preço do produto
        if (!item.price) {
          item.price = product.price;
        }
      }
    }

    recurrence = await Recurrence.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: recurrence
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancelar uma recorrência
// @route   PUT /api/recurrences/:id/cancel
// @access  Private
exports.cancelRecurrence = async (req, res) => {
  try {
    const recurrence = await Recurrence.findById(req.params.id);

    if (!recurrence) {
      return res.status(404).json({
        success: false,
        error: 'Recorrência não encontrada'
      });
    }

    // Adicionar log de cancelamento
    recurrence.logs.push({
      date: new Date(),
      status: 'canceled',
      notes: req.body.notes || 'Cancelado pelo usuário',
      registeredBy: req.user.id
    });

    recurrence.status = 'canceled';
    await recurrence.save();

    res.status(200).json({
      success: true,
      data: recurrence
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Confirmar compra de uma recorrência
// @route   PUT /api/recurrences/:id/confirm
// @access  Private
exports.confirmPurchase = async (req, res) => {
  try {
    const recurrence = await Recurrence.findById(req.params.id);

    if (!recurrence) {
      return res.status(404).json({
        success: false,
        error: 'Recorrência não encontrada'
      });
    }

    if (recurrence.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Apenas recorrências ativas podem ter compras confirmadas'
      });
    }

    // Atualizar a recorrência
    await recurrence.confirmPurchase(req.user.id, req.body.notes);

    res.status(200).json({
      success: true,
      data: recurrence
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter estatísticas de recorrências
// @route   GET /api/recurrences/stats
// @access  Private
exports.getRecurrenceStats = async (req, res) => {
  try {
    const stats = {
      total: await Recurrence.countDocuments(),
      active: await Recurrence.countDocuments({ status: 'active' }),
      paused: await Recurrence.countDocuments({ status: 'paused' }),
      canceled: await Recurrence.countDocuments({ status: 'canceled' })
    };

    // Recorrências com compra atrasada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.overdue = await Recurrence.countDocuments({
      nextDate: { $lt: today },
      status: 'active'
    });

    // Recorrências com compra para hoje
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    stats.today = await Recurrence.countDocuments({
      nextDate: { $gte: today, $lt: tomorrow },
      status: 'active'
    });

    // Recorrências para os próximos 7 dias
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    stats.nextWeek = await Recurrence.countDocuments({
      nextDate: { $gte: today, $lt: nextWeek },
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 