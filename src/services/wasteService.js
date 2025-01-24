
import Waste from '../db/models/Waste.js';

export const createWaste = async (wasteData) => {
  const waste = await Waste.create(wasteData);
  return waste;
};

export const getWasteById = async (id) => {
  return await Waste.findById(id).populate('seller', 'name email phone');
};

export const updateWaste = async (id, updateData) => {
  return await Waste.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};

export const deleteWaste = async (id) => {
  return await Waste.findByIdAndDelete(id);
};

export const listWasteBySeller = async (sellerId) => {
  return await Waste.find({ seller: sellerId });
};

export const searchWaste = async (filters) => {
  const query = {};
  
  if (filters.cropType) query.cropType = filters.cropType;
  if (filters.wasteType) query.wasteType = filters.wasteType;
  if (filters.status) query.status = filters.status;
  
  if (filters.location) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [filters.location.longitude, filters.location.latitude]
        },
        $maxDistance: filters.radius || 10000 // Default 10km radius
      }
    };
  }
  
  return await Waste.find(query).populate('seller', 'name email phone');
};