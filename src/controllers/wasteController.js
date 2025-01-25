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

export const getWasteStats = async (req, res) => {
  try {
    const stats = await wasteService.getWasteStats();
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMonthlyAnalytics = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const monthlyData = await wasteService.getMonthlyAnalytics(year);
    
    res.status(200).json({
      status: 'success',
      data: {
        year,
        monthlyData
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

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

export const getEnvironmentalImpact = async (req, res) => {
  try {
    const impact = await wasteService.getEnvironmentalImpact();
    res.status(200).json({
      status: 'success',
      data: {
        impact,
        metadata: {
          lastUpdated: new Date(),
          dataQuality: 'estimated',
          methodology: 'Based on IPCC guidelines for agricultural waste management',
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
      errorCode: 'IMPACT_CALCULATION_ERROR'
    });
  }
};

export const getMapData = async (req, res) => {
  try {
    const bounds = req.query.bounds ? JSON.parse(req.query.bounds) : null;
    const mapData = await wasteService.getMapData(bounds);
    res.status(200).json({
      status: 'success',
      data: { mapData }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};