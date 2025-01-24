import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['seller', 'buyer'],
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
  // Seller specific fields
  farmDetails: {
    farmSize: Number,
    primaryCrops: [String],
    farmAddress: String,
    required: function() { return this.role === 'seller'; }
  },
  // Buyer specific fields
  businessDetails: {
    companyName: String,
    businessType: String,
    gstNumber: String,
    required: function() { return this.role === 'buyer'; }
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;