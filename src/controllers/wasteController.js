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
    const searchResult = await wasteService.searchWaste({
      query: req.query.query,
      cropType: req.query.cropType,
      wasteType: req.query.wasteType,
      status: req.query.status,
      location: req.query.location,
      limit: parseInt(req.query.limit) || 10,
      skip: parseInt(req.query.skip) || 0
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        wastes: searchResult.wastes,
        meta: {
          total: searchResult.meta.total,
          page: Math.floor((req.query.skip || 0) / (req.query.limit || 10)) + 1,
          hasMore: searchResult.wastes.length === (req.query.limit || 10)
        }
      }
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

export const getAllWaste = async (req, res) => {
  try {
    const waste = await wasteService.getAllWaste();
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

export const getLocationStats = async (req, res) => {
  try {
    const { groupBy = 'district', limit = 10 } = req.query;
    const stats = await wasteService.getLocationStats(groupBy, parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      data: {
        stats,
        visualization: {
          type: 'pie',
          recommended: {
            title: `Waste Distribution by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`,
            labels: stats.locations.map(loc => loc.location),
            values: stats.locations.map(loc => parseFloat(loc.percentage)),
          }
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
      errorCode: 'LOCATION_STATS_ERROR'
    });
  }
};

export const getFarmerWaste = async (req, res) => {
  try {
    const auth0Id = req.params.farmerId || req.auth0Id; // Use provided ID or authenticated user's ID
    const farmerWaste = await wasteService.getFarmerWasteDetails(auth0Id);
    
    res.status(200).json({
      status: 'success',
      data: {
        farmerWaste,
        visualizations: {
          monthly: {
            type: 'line',
            data: farmerWaste.stats.monthly.map(stat => ({
              x: `${stat._id.year}-${stat._id.month}`,
              y: stat.quantity
            }))
          },
          wasteTypes: {
            type: 'pie',
            data: farmerWaste.stats.byWasteType.map(type => ({
              label: type._id,
              value: type.totalQuantity
            }))
          }
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
      errorCode: 'FARMER_WASTE_ERROR'
    });
  }
};

export const getDetailedWaste = async (req, res) => {
  try {
    const wasteInfo = await wasteService.getDetailedWasteInfo(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        wasteInfo,
        visualizations: {
          priceComparison: {
            type: 'bar',
            data: {
              labels: ['Listed Price', 'Market Average'],
              values: [
                wasteInfo.details.price,
                wasteInfo.marketContext.averagePrice
              ]
            }
          },
          environmentalImpact: {
            type: 'metric',
            data: {
              co2Prevented: wasteInfo.environmentalImpact.co2Prevented,
              treesEquivalent: wasteInfo.environmentalImpact.offsetEquivalent.treesPerYear
            }
          }
        }
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message,
      errorCode: 'WASTE_DETAIL_ERROR'
    });
  }
};

export const updateWasteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, auth0Id } = req.body;

    if (!status) {
      throw new Error('Status is required');
    }

    const result = await wasteService.updateWasteStatus(id, status, auth0Id);
    
    res.status(200).json({
      status: 'success',
      data: {
        waste: result.waste,
        impact: {
          statusChange: result.statusChangeImpact,
          message: `Successfully updated waste status from ${result.statusChangeImpact.previousStatus} to ${status}`
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
      errorCode: 'STATUS_UPDATE_ERROR',
      requestedAt: new Date()
    });
  }
};