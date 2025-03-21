const mongoose = require('mongoose');

const RecurrenceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  ean: String,
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const RecurrenceLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'skipped', 'canceled'],
    required: true
  },
  notes: String,
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const RecurrenceSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  nextDate: {
    type: Date,
    required: true
  },
  periodDays: {
    type: Number,
    required: true,
    min: 1
  },
  items: [RecurrenceItemSchema],
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'canceled'],
    default: 'active'
  },
  logs: [RecurrenceLogSchema],
  totalValue: {
    type: Number,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calcular valor total antes de salvar
RecurrenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calcula o valor total baseado nos itens e desconto
  const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (this.discount / 100);
  this.totalValue = subtotal - discountAmount;
  
  next();
});

RecurrenceSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Método para confirmar uma compra e atualizar a próxima data
RecurrenceSchema.methods.confirmPurchase = function(userId, notes = '') {
  const today = new Date();
  
  // Adiciona um log de confirmação
  this.logs.push({
    date: today,
    status: 'confirmed',
    notes: notes,
    registeredBy: userId
  });
  
  // Calcula a próxima data de recorrência
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + this.periodDays);
  this.nextDate = nextDate;
  
  return this.save();
};

module.exports = mongoose.model('Recurrence', RecurrenceSchema); 