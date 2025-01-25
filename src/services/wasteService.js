import Waste from '../db/models/Waste.js';

export const createWaste = async (wasteData) => {
  const waste = await Waste.create({
    ...wasteData,
    status: 'available'
  });
  return waste;
};

export const getWasteById = async (id) => {
  return await Waste.findById(id).populate('seller', 'name email phone');
};

export const searchWaste = async (filters) => {
  const query = {};
  
  if (filters.searchText) {
    query.$text = { $search: filters.searchText };
  }
  
  if (filters.cropType) query.cropType = filters.cropType;
  if (filters.wasteType) query.wasteType = filters.wasteType;
  if (filters.status) query.status = filters.status;
  
  if (filters.location) {
    if (filters.location.pincode) {
      query['location.pincode'] = filters.location.pincode;
    }
    if (filters.location.state) {
      query['location.state'] = filters.location.state;
    }
    if (filters.location.district) {
      query['location.district'] = filters.location.district;
    }
  }
  
  const sortOptions = filters.searchText 
    ? { score: { $meta: 'textScore' } } 
    : { createdAt: -1 };

  return await Waste.find(query)
    .sort(sortOptions)
    .limit(filters.limit || 10)
    .skip(filters.skip || 0)
    .populate('seller', 'name email phone');
};