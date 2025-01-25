import * as wasteService from '../services/wasteService.js';

export const createWasteEntry = async (req, res) => {
  try {
    const wasteData = {
      ...req.body,
      auth0Id: req.body.auth0Id
    };
    const waste = await wasteService.createWaste(wasteData);
    
    res.status(201).json({
      status: 'success',
      data: { waste }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getWaste = async (req, res) => {
  try {
    const waste = await wasteService.getWasteById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { waste }
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
};

// export const updateWaste = async (req, res) => {
//   try {
//     const waste = await wasteService.updateWaste(req.params.id, req.body);
//     res.status(200).json({
//       status: 'success',
//       data: { waste }
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'error',
//       message: error.message
//     });
//   }
// };

// export const deleteWaste = async (req, res) => {
//   try {
//     await wasteService.deleteWaste(req.params.id);
//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'error',
//       message: error.message
//     });
//   }
// };

// export const getMyWaste = async (req, res) => {
//   try {
//     const waste = await wasteService.listWasteBySeller(req.user._id);
//     res.status(200).json({
//       status: 'success',
//       data: { waste }
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'error',
//       message: error.message
//     });
//   }
// };

export const searchWaste = async (req, res) => {
  try {
    const waste = await wasteService.searchWaste(req.query);
    res.status(200).json({
      status: 'success',
      data: { waste }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};