import Waste from "../db/models/Waste.js";
import { calculateEnvironmentalImpact, getCarbonOffsetEquivalent } from '../utils/environmentalImpact.js';

export const createWaste = async (wasteData) => {
  console.log(wasteData);
  const waste = await Waste.create({
    ...wasteData,
    status: "available",
  });
  return waste;
};

export const getWasteById = async (id) => {
  return await Waste.findById(id).populate("seller", "name email phone");
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
      query["location.pincode"] = filters.location.pincode;
    }
    if (filters.location.state) {
      query["location.state"] = filters.location.state;
    }
    if (filters.location.district) {
      query["location.district"] = filters.location.district;
    }
  }

  const sortOptions = filters.searchText
    ? { score: { $meta: "textScore" } }
    : { createdAt: -1 };

  return await Waste.find(query)
    .sort(sortOptions)
    .limit(filters.limit || 10)
    .skip(filters.skip || 0)
    .populate("seller", "name email phone");
};

export const getWasteStats = async () => {
  const stats = await Waste.aggregate([
    {
      $facet: {
        'statusStats': [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        'totalWaste': [
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$quantity' },
              totalRevenue: {
                $sum: { $multiply: ['$quantity', '$price'] }
              },
              wasteByType: {
                $push: {
                  type: '$wasteType',
                  quantity: '$quantity',
                  unit: '$unit'
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalQuantity: 1,
              totalRevenue: 1,
              wasteByType: {
                $reduce: {
                  input: '$wasteByType',
                  initialValue: {},
                  in: {
                    $mergeObjects: [
                      '$$value',
                      {
                        $arrayToObject: [[
                          { 
                            k: '$$this.type', 
                            v: { 
                              quantity: '$$this.quantity', 
                              unit: '$$this.unit' 
                            } 
                          }
                        ]]
                      }
                    ]
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]);

  // Transform the results into a more user-friendly format
  const formattedStats = {
    statusBreakdown: stats[0].statusStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    totalWaste: stats[0].totalWaste[0]?.totalQuantity || 0,
    totalRevenue: stats[0].totalWaste[0]?.totalRevenue || 0,
    wasteByType: stats[0].totalWaste[0]?.wasteByType || {}
  };

  return formattedStats;
};

export const getMonthlyAnalytics = async (year = new Date().getFullYear()) => {
  const monthlyStats = await Waste.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          wasteType: "$wasteType"
        },
        totalQuantity: { $sum: "$quantity" },
        totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
        avgPrice: { $avg: "$price" }
      }
    },
    {
      $group: {
        _id: "$_id.month",
        wasteTypes: {
          $push: {
            type: "$_id.wasteType",
            quantity: "$totalQuantity",
            revenue: "$totalRevenue",
            avgPrice: "$avgPrice"
          }
        },
        totalQuantity: { $sum: "$totalQuantity" },
        totalRevenue: { $sum: "$totalRevenue" }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        month: "$_id",
        wasteTypes: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        _id: 0
      }
    }
  ]);

  // Fill in missing months with zero values
  const filledMonths = Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
    const existingData = monthlyStats.find(stat => stat.month === month);
    if (existingData) return existingData;
    return {
      month,
      wasteTypes: [],
      totalQuantity: 0,
      totalRevenue: 0
    };
  });

  return filledMonths;
};

export const getEnvironmentalImpact = async () => {
  const wasteData = await Waste.aggregate([
    {
      $group: {
        _id: '$wasteType',
        totalQuantity: { $sum: '$quantity' },
        locationCount: {
          $addToSet: '$location.district'
        }
      }
    }
  ]);

  let totalCarbonImpact = 0;
  const impactByType = wasteData.map(({ _id, totalQuantity }) => {
    const impact = calculateEnvironmentalImpact(_id, totalQuantity);
    totalCarbonImpact += impact.totalCarbonImpact;
    return {
      wasteType: _id,
      quantity: totalQuantity,
      impact
    };
  });

  const offsetEquivalent = getCarbonOffsetEquivalent(totalCarbonImpact);

  return {
    summary: {
      totalWasteManaged: wasteData.reduce((acc, curr) => acc + curr.totalQuantity, 0),
      totalCarbonImpact,
      totalLocations: new Set(wasteData.flatMap(w => w.locationCount)).size,
    },
    impactByType,
    offsetEquivalent,
    carbonReductionProgress: {
      current: totalCarbonImpact,
      target: 100000, // Example: 100 tonnes CO2 target
      percentageAchieved: (totalCarbonImpact / 100000) * 100
    }
  };
};

export const getMapData = async (bounds) => {
  const query = {};
  
  if (bounds) {
    query['location.geoLocation'] = {
      $geoWithin: {
        $box: [
          [bounds.sw.lng, bounds.sw.lat],
          [bounds.ne.lng, bounds.ne.lat]
        ]
      }
    };
  }

  return await Waste.find(query)
    .select('location quantity wasteType status')
    .lean();
};
