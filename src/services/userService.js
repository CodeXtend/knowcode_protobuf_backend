import User from '../db/models/Users.js';
import jwt from 'jsonwebtoken';
import { ManagementClient } from 'auth0';

const auth0Management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

export const createUser = async (userData, auth0UserId) => {
  if (!['buyer', 'seller'].includes(userData.role)) {
    throw new Error('Invalid role specified');
  }
  
  // Validate role-specific required fields
  if (userData.role === 'seller' && !userData.farmDetails) {
    throw new Error('Farm details are required for sellers');
  }
  if (userData.role === 'buyer' && !userData.businessDetails) {
    throw new Error('Business details are required for buyers');
  }

  const user = await User.create({
    ...userData,
    auth0Id: auth0UserId
  });
  return user;
};

export const loginUser = async (email, password, role) => {
  const user = await User.findOne({ email, role }).select('+password');
  
  if (!user) {
    throw new Error(`Invalid credentials for ${role}`);
  }

  if (!(await user.comparePassword(password))) {
    throw new Error('Invalid password');
  }
  
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  return { user, token };
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const getUserByAuth0Id = async (auth0Id) => {
  return await User.findOne({ auth0Id });
};

export const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  });
};

export const updateUserMetadata = async (auth0Id, metadata) => {
  await auth0Management.updateUserMetadata({ id: auth0Id }, metadata);
  return await getUserByAuth0Id(auth0Id);
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
