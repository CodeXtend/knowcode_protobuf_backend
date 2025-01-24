import mongoose from 'mongoose';

const wasteSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropType: {
    type: String,
    required: [true, 'Please specify the crop type']
  },
  wasteType: {
    type: String,
    required: [true, 'Please specify the waste type'],
    enum: ['straw', 'husk', 'leaves', 'stalks', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the quantity']
  },
  unit: {
    type: String,
    required: [true, 'Please specify the unit'],
    enum: ['kg', 'ton', 'quintal']
  },
  price: {
    type: Number,
    required: [true, 'Please specify the price per unit']
  },
  availableFrom: {
    type: Date,
    required: [true, 'Please specify availability date']
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please specify location coordinates']
    },
    address: String,
    district: String,
    state: String,
    pincode: String
  },
  images: [String],
  status: {
    type: String,
    enum: ['available', 'booked', 'sold', 'cancelled'],
    default: 'available'
  },
  description: String
}, {
  timestamps: true
});

// Add geospatial index for location-based queries
wasteSchema.index({ location: '2dsphere' });

const Waste = mongoose.model('Waste', wasteSchema);

export default Waste;
