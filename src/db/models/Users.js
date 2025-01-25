import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: [true, 'Please specify user role']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  // Farmer specific fields (renamed from seller)
  farmDetails: {
    type: {
      farmSize: Number,
      primaryCrops: [String],
      farmAddress: String
    },
    required: [
      function() { 
        return this.role === 'farmer';
      },
      'Farm details are required for farmers'
    ],
    default: undefined
  },
  // Buyer specific fields
  businessDetails: {
    type: {
      companyName: String,
      businessType: String,
      gstNumber: String
    },
    required: [
      function() {
        return this.role === 'buyer';
      },
      'Business details are required for buyers'
    ],
    default: undefined
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text indexes for user search
userSchema.index({
  name: 'text',
  'location.city': 'text',
  'location.state': 'text'
});

// Add regular indexes for common queries
userSchema.index({ auth0Id: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.pincode': 1 });

const User = mongoose.model('User', userSchema);

export default User;