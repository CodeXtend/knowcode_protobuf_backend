import Waste from '../db/models/Waste.js';

export const createWaste = async (wasteData) => {
  const waste = await Waste.create(wasteData); // store auth0Id, cropType, wasteType, quantity, unit, price, availableFrom, location, images, status, description
  return waste;
};

// export const getWasteById = async (id) => {
//   return await Waste.findById(id).populate('seller', 'name email phone');
// };

// export const updateWaste = async (id, updateData) => {
//   return await Waste.findByIdAndUpdate(id, updateData, {
//     new: true,
//     runValidators: true
//   });
// };

// export const deleteWaste = async (id) => {
//   return await Waste.findByIdAndDelete(id);
// };

// export const listWasteBySeller = async (sellerId) => {
//   return await Waste.find({ seller: sellerId });
// };

export const searchWaste = async (filters) => {
  const query = {};
  
  // Text search
  if (filters.searchText) {
    query.$text = { $search: filters.searchText };
  }
  
  // Direct matches
  if (filters.cropType) query.cropType = filters.cropType;
  if (filters.wasteType) query.wasteType = filters.wasteType;
  if (filters.status) query.status = filters.status;
  
  // Location based search using pincode
  if (filters.pincode) {
    query['location.pincode'] = filters.pincode;
  }
  
  // State and district filters
  if (filters.state) {
    query['location.state'] = filters.state;
  }
  if (filters.district) {
    query['location.district'] = filters.district;
  }

  return await Waste.find(query)
    .sort(filters.searchText ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
    .populate('seller', 'name email phone');
};