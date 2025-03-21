const mongoose = require('mongoose');

const DeliveryItemSchema = new mongoose.Schema({
  recurrence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recurrence'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'not_delivered', 'canceled'],
    default: 'pending'
  },
  deliveryTime: Date,
  notes: String
});

const RouteSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'canceled'],
    default: 'planned'
  },
  deliveries: [DeliveryItemSchema],
  startTime: Date,
  endTime: Date,
  notes: String,
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

RouteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

RouteSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Route', RouteSchema); 