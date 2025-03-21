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

// @desc    Obter todas as recorrências com paginação e filtros
// @route   GET /api/recurrences
// @access  Private
exports.getRecurrences = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const filter = { };
    
    // Filtro por status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filtro por cliente
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }
    
    // Filtro por próxima data
    if (req.query.nextDate) {
      const startDate = new Date(req.query.nextDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.nextDate);
      endDate.setHours(23, 59, 59, 999);
      
      filter.nextDate = { $gte: startDate, $lte: endDate };
    }
    
    // Filtro por data próxima
    if (req.query.upcoming) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const future = new Date();
      future.setDate(future.getDate() + parseInt(req.query.upcoming));
      future.setHours(23, 59, 59, 999);
      
      filter.nextDate = { $gte: today, $lte: future };
      filter.status = 'active';
    }
    
    // Executar a consulta com paginação
    const recurrences = await Recurrence.find(filter)
      .populate('customer', 'name cpf phone')
      .populate('items.product', 'name ean')
      .sort({ nextDate: 1 })
      .skip(skip)
      .limit(limit);
    
    // Contar total para paginação
    const total = await Recurrence.countDocuments(filter);
    
    res.json({
      success: true,
      count: recurrences.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: recurrences
    });
  } catch (error) {
    console.error(`Erro ao listar recorrências: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar recorrências', 
      error: error.message 
    });
  }
};

// @desc    Obter uma recorrência pelo ID
// @route   GET /api/recurrences/:id
// @access  Private
exports.getRecurrenceById = async (req, res) => {
  try {
    const recurrence = await Recurrence.findById(req.params.id)
      .populate('customer')
      .populate('items.product')
      .populate('logs.registeredBy', 'name');
    
    if (!recurrence) {
      return res.status(404).json({ 
        success: false,
        message: 'Recorrência não encontrada' 
      });
    }
    
    res.json({
      success: true,
      data: recurrence
    });
  } catch (error) {
    console.error(`Erro ao buscar recorrência: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar recorrência', 
      error: error.message 
    });
  }
};

// @desc    Atualizar uma recorrência
// @route   PUT /api/recurrences/:id
// @access  Private
exports.updateRecurrence = async (req, res) => {
  try {
    const {
      periodDays,
      items,
      discount,
      status,
      nextDate
    } = req.body;
    
    let recurrence = await Recurrence.findById(req.params.id);
    
    if (!recurrence) {
      return res.status(404).json({ 
        success: false,
        message: 'Recorrência não encontrada' 
      });
    }
    
    // Atualizar os campos
    const updateFields = {};
    
    if (periodDays) updateFields.periodDays = periodDays;
    if (discount !== undefined) updateFields.discount = discount;
    if (status) updateFields.status = status;
    if (nextDate) updateFields.nextDate = new Date(nextDate);
    
    // Processar itens se fornecidos
    if (items && items.length > 0) {
      const processedItems = [];
      
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ 
            success: false,
            message: `Produto com ID ${item.product} não encontrado` 
          });
        }
        
        processedItems.push({
          product: product._id,
          ean: product.ean,
          name: product.name,
          quantity: item.quantity,
          price: item.price || product.price
        });
      }
      
      updateFields.items = processedItems;
    }
    
    // Atualizar a recorrência
    recurrence = await Recurrence.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('customer', 'name cpf phone')
     .populate('items.product', 'name ean');
    
    res.json({
      success: true,
      data: recurrence
    });
  } catch (error) {
    console.error(`Erro ao atualizar recorrência: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar recorrência', 
      error: error.message 
    });
  }
};

// @desc    Confirmar uma compra recorrente
// @route   POST /api/recurrences/:id/confirm
// @access  Private
exports.confirmRecurrence = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const recurrence = await Recurrence.findById(req.params.id);
    
    if (!recurrence) {
      return res.status(404).json({ 
        success: false,
        message: 'Recorrência não encontrada' 
      });
    }
    
    // Verificar se a recorrência está ativa
    if (recurrence.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Apenas recorrências ativas podem ser confirmadas' 
      });
    }
    
    // Confirmar a compra e atualizar próxima data
    await recurrence.confirmPurchase(req.user.id, notes);
    
    const updatedRecurrence = await Recurrence.findById(req.params.id)
      .populate('customer', 'name cpf phone')
      .populate('items.product', 'name ean')
      .populate('logs.registeredBy', 'name');
    
    res.json({
      success: true,
      message: 'Compra recorrente confirmada com sucesso',
      data: updatedRecurrence
    });
  } catch (error) {
    console.error(`Erro ao confirmar recorrência: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao confirmar recorrência', 
      error: error.message 
    });
  }
};

// @desc    Pular uma ocorrência de recorrência
// @route   POST /api/recurrences/:id/skip
// @access  Private
exports.skipRecurrence = async (req, res) => {
  try {
    const { notes } = req.body;
    
    let recurrence = await Recurrence.findById(req.params.id);
    
    if (!recurrence) {
      return res.status(404).json({ 
        success: false,
        message: 'Recorrência não encontrada' 
      });
    }
    
    // Verificar se a recorrência está ativa
    if (recurrence.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Apenas recorrências ativas podem ser puladas' 
      });
    }
    
    // Adicionar log de recorrência pulada
    recurrence.logs.push({
      date: new Date(),
      status: 'skipped',
      notes: notes || 'Compra pulada pelo usuário',
      registeredBy: req.user.id
    });
    
    // Calcular a próxima data de recorrência
    const nextDate = new Date(recurrence.nextDate);
    nextDate.setDate(nextDate.getDate() + recurrence.periodDays);
    recurrence.nextDate = nextDate;
    
    await recurrence.save();
    
    const updatedRecurrence = await Recurrence.findById(req.params.id)
      .populate('customer', 'name cpf phone')
      .populate('items.product', 'name ean')
      .populate('logs.registeredBy', 'name');
    
    res.json({
      success: true,
      message: 'Compra recorrente pulada com sucesso',
      data: updatedRecurrence
    });
  } catch (error) {
    console.error(`Erro ao pular recorrência: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao pular recorrência', 
      error: error.message 
    });
  }
};

// @desc    Cancelar uma recorrência
// @route   DELETE /api/recurrences/:id
// @access  Private
exports.cancelRecurrence = async (req, res) => {
  try {
    const { reason } = req.body;
    
    let recurrence = await Recurrence.findById(req.params.id);
    
    if (!recurrence) {
      return res.status(404).json({ 
        success: false,
        message: 'Recorrência não encontrada' 
      });
    }
    
    // Atualizar o status para cancelado
    recurrence.status = 'canceled';
    
    // Adicionar log de cancelamento
    recurrence.logs.push({
      date: new Date(),
      status: 'canceled',
      notes: reason || 'Cancelada pelo usuário',
      registeredBy: req.user.id
    });
    
    await recurrence.save();
    
    res.json({
      success: true,
      message: 'Recorrência cancelada com sucesso',
      data: { id: recurrence._id }
    });
  } catch (error) {
    console.error(`Erro ao cancelar recorrência: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao cancelar recorrência', 
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