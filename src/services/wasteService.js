import Waste from "../db/models/Waste.js";
import User from "../db/models/Users.js";  // Add User model import
import {
  calculateEnvironmentalImpact,
  getCarbonOffsetEquivalent,
} from "../utils/environmentalImpact.js";

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
        statusStats: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        totalWaste: [
          {
            $match: {
              status: 'sold'  // Filter for sold waste only
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$quantity" },
              totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }, // Simple accumulator
              wasteByType: {
                $push: {
                  type: "$wasteType",
                  quantity: "$quantity",
                  unit: "$unit",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalQuantity: 1,
              totalRevenue: 1,
              wasteByType: {
                $reduce: {
                  input: "$wasteByType",
                  initialValue: {},
                  in: {
                    $mergeObjects: [
                      "$$value",
                      {
                        $arrayToObject: [
                          [
                            {
                              k: "$$this.type",
                              v: {
                                quantity: "$$this.quantity",
                                unit: "$$this.unit",
                              },
                            },
                          ],
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
      },
    },
  ]);

  // Transform the results into a more user-friendly format
  const formattedStats = {
    statusBreakdown: stats[0].statusStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    totalWaste: stats[0].totalWaste[0]?.totalQuantity || 0,
    totalRevenue: stats[0].totalWaste[0]?.totalRevenue || 0,
    wasteByType: stats[0].totalWaste[0]?.wasteByType || {},
  };

  return formattedStats;
};

export const getMonthlyAnalytics = async (year = new Date().getFullYear()) => {
  const monthlyStats = await Waste.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31),
        }
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          wasteType: "$wasteType",
        },
        totalQuantity: { $sum: "$quantity" },
        totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
        avgPrice: { $avg: "$price" },
      },
    },
    {
      $group: {
        _id: "$_id.month",
        wasteTypes: {
          $push: {
            type: "$_id.wasteType",
            quantity: "$totalQuantity",
            revenue: "$totalRevenue",
            avgPrice: "$avgPrice",
          },
        },
        totalQuantity: { $sum: "$totalQuantity" },
        totalRevenue: { $sum: "$totalRevenue" },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        month: "$_id",
        wasteTypes: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        _id: 0,
      },
    },
  ]);

  // Fill in missing months with zero values
  const filledMonths = Array.from({ length: 12 }, (_, i) => i + 1).map(
    (month) => {
      const existingData = monthlyStats.find((stat) => stat.month === month);
      if (existingData) return existingData;
      return {
        month,
        wasteTypes: [],
        totalQuantity: 0,
        totalRevenue: 0,
      };
    }
  );

  return filledMonths;
};

export const getEnvironmentalImpact = async () => {
  const wasteData = await Waste.aggregate([
    {
      $group: {
        _id: "$wasteType",
        totalQuantity: { $sum: "$quantity" },
        locationCount: {
          $addToSet: "$location.district",
        },
      },
    },
  ]);

  let totalCarbonImpact = 0;
  const impactByType = wasteData.map(({ _id, totalQuantity }) => {
    const impact = calculateEnvironmentalImpact(_id, totalQuantity);
    totalCarbonImpact += impact.totalCarbonImpact;
    return {
      wasteType: _id,
      quantity: totalQuantity,
      impact,
    };
  });

  const offsetEquivalent = getCarbonOffsetEquivalent(totalCarbonImpact);

  return {
    summary: {
      totalWasteManaged: wasteData.reduce(
        (acc, curr) => acc + curr.totalQuantity,
        0
      ),
      totalCarbonImpact,
      totalLocations: new Set(wasteData.flatMap((w) => w.locationCount)).size,
    },
    impactByType,
    offsetEquivalent,
    carbonReductionProgress: {
      current: totalCarbonImpact,
      target: 100000, // Example: 100 tonnes CO2 target
      percentageAchieved: (totalCarbonImpact / 100000) * 100,
    },
  };
};

export const getMapData = async (bounds) => {
  const query = {};

  if (bounds) {
    query["location.geoLocation"] = {
      $geoWithin: {
        $box: [
          [bounds.sw.lng, bounds.sw.lat],
          [bounds.ne.lng, bounds.ne.lat],
        ],
      },
    };
  }

  return await Waste.find(query)
    .select("location quantity wasteType status")
    .lean();
};

export const getAllWaste = async () => {
  return await Waste.find();
};

export const getLocationStats = async (groupBy = 'district', limit = 10) => {
  const validGroupings = ['district', 'state', 'pincode'];
  if (!validGroupings.includes(groupBy)) {
    throw new Error('Invalid grouping parameter. Use district, state, or pincode');
  }

  const locationField = `location.${groupBy}`;
  
  const stats = await Waste.aggregate([
    {
      $group: {
        _id: `$${locationField}`,
        totalWaste: { $sum: '$quantity' },
        wasteTypes: {
          $push: {
            type: '$wasteType',
            quantity: '$quantity'
          }
        },
        listings: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $project: {
        location: '$_id',
        totalWaste: 1,
        listings: 1,
        averagePrice: { $round: ['$averagePrice', 2] },
        wasteBreakdown: {
          $reduce: {
            input: '$wasteTypes',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    {
                      k: '$$this.type',
                      v: { $sum: ['$$value.quantity', '$$this.quantity'] }
                    }
                  ]]
                }
              ]
            }
          }
        },
        _id: 0
      }
    },
    { $sort: { totalWaste: -1 } },
    { $limit: limit }
  ]);

  // Calculate percentages of total
  const totalAllWaste = stats.reduce((sum, loc) => sum + loc.totalWaste, 0);
  
  return {
    groupBy,
    locations: stats.map(loc => ({
      ...loc,
      percentage: ((loc.totalWaste / totalAllWaste) * 100).toFixed(2)
    })),
    summary: {
      totalLocations: stats.length,
      totalWaste: totalAllWaste,
      topLocation: stats[0]?.location || null,
      topLocationPercentage: stats[0] ? ((stats[0].totalWaste / totalAllWaste) * 100).toFixed(2) : 0
    }
  };
};

export const getFarmerWasteDetails = async (auth0Id) => {
  const [wasteDetails, aggregatedStats] = await Promise.all([
    // Get all waste listings
    Waste.find({ auth0Id })
      .sort({ createdAt: -1 })
      .lean(),
    
    // Get aggregated stats
    Waste.aggregate([
      { $match: { auth0Id } },
      {
        $facet: {
          'overallStats': [
            {
              $group: {
                _id: null,
                totalListings: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' },
                totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } },
                averagePrice: { $avg: '$price' }
              }
            }
          ],
          'statusBreakdown': [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' }
              }
            }
          ],
          'wasteTypeStats': [
            {
              $group: {
                _id: '$wasteType',
                count: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' },
                averagePrice: { $avg: '$price' }
              }
            }
          ],
          'monthlyStats': [
            {
              $group: {
                _id: {
                  month: { $month: '$createdAt' },
                  year: { $year: '$createdAt' }
                },
                quantity: { $sum: '$quantity' },
                revenue: { $sum: { $multiply: ['$quantity', '$price'] } }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ]
        }
      }
    ])
  ]);

  // Calculate environmental impact
  const totalImpact = wasteDetails.reduce((acc, waste) => {
    const impact = calculateEnvironmentalImpact(waste.wasteType, waste.quantity);
    return {
      co2Prevented: acc.co2Prevented + impact.co2Prevented,
      waterSaved: acc.waterSaved + impact.waterSaved,
      carbonSequestered: acc.carbonSequestered + impact.carbonSequestered
    };
  }, { co2Prevented: 0, waterSaved: 0, carbonSequestered: 0 });

  return {
    recentListings: wasteDetails.slice(0, 5),
    stats: {
      overall: aggregatedStats[0].overallStats[0] || {
        totalListings: 0,
        totalQuantity: 0,
        totalRevenue: 0,
        averagePrice: 0
      },
      byStatus: aggregatedStats[0].statusBreakdown,
      byWasteType: aggregatedStats[0].wasteTypeStats,
      monthly: aggregatedStats[0].monthlyStats
    },
    environmentalImpact: {
      ...totalImpact,
      offsetEquivalent: getCarbonOffsetEquivalent(totalImpact.co2Prevented)
    }
  };
};

export const getDetailedWasteInfo = async (wasteId) => {
  const waste = await Waste.findById(wasteId).lean();
  
  if (!waste) {
    throw new Error('Waste listing not found');
  }

  // Get farmer details from User model using auth0Id
  const farmer = await User.findOne({ auth0Id: waste.auth0Id })
    .select('name email phone')
    .lean();

  // Get farmer contact info
  const farmerContact = {
    name: farmer?.name || 'Not Available',
    phone: farmer?.phone || 'Not Available',
    email: farmer?.email || 'Not Available'
  };

  // Calculate environmental impact for this specific waste
  const impact = calculateEnvironmentalImpact(waste.wasteType, waste.quantity);
  const offsetEquivalent = getCarbonOffsetEquivalent(impact.totalCarbonImpact);

  // Get similar listings in the same area
  const similarListings = await Waste.find({
    _id: { $ne: wasteId },
    wasteType: waste.wasteType,
    'location.district': waste.location.district,
    status: 'available'
  })
  .select('quantity price wasteType availableFrom')
  .limit(3)
  .lean();

  // Calculate average market price in the area
  const marketStats = await Waste.aggregate([
    {
      $match: {
        wasteType: waste.wasteType,
        'location.district': waste.location.district,
        status: 'available'
      }
    },
    {
      $group: {
        _id: null,
        avgPrice: { $avg: '$price' },
        totalAvailable: { $sum: '$quantity' }
      }
    }
  ]);

  return {
    details: {
      ...waste,
      seller: undefined  // Remove seller field if it exists
    },
    farmerContact,
    environmentalImpact: {
      ...impact,
      offsetEquivalent
    },
    marketContext: {
      averagePrice: marketStats[0]?.avgPrice || waste.price,
      totalAvailableInArea: marketStats[0]?.totalAvailable || 0,
      priceComparisonToMarket: marketStats[0]?.avgPrice 
        ? ((waste.price - marketStats[0].avgPrice) / marketStats[0].avgPrice * 100).toFixed(2)
        : 0
    },
    similarListings,
    metadata: {
      lastUpdated: new Date(),
      availabilityStatus: waste.availableFrom > new Date() ? 'upcoming' : 'current'
    }
  };
};

const VALID_STATUS_TRANSITIONS = {
  available: ['booked', 'cancelled'],
  booked: ['sold', 'available', 'cancelled'],
  sold: ['cancelled'],
  cancelled: ['available']
};

export const updateWasteStatus = async (wasteId, newStatus, auth0Id) => {
  const waste = await Waste.findById(wasteId);
  
  if (!waste) {
    throw new Error('Waste listing not found');
  }

  if (waste.auth0Id !== auth0Id) {
    throw new Error('Not authorized to update this waste listing');
  }

  const validNextStatuses = VALID_STATUS_TRANSITIONS[waste.status] || [];
  if (!validNextStatuses.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${waste.status} to ${newStatus}`);
  }

  waste.status = newStatus;
  waste.updatedAt = new Date();

  const updatedWaste = await waste.save();
  
  // Calculate impact of status change
  const statusChangeImpact = {
    timestamp: new Date(),
    previousStatus: waste.status,
    newStatus,
    quantityAffected: waste.quantity,
    environmentalImpact: calculateEnvironmentalImpact(waste.wasteType, waste.quantity)
  };

  return {
    waste: updatedWaste,
    statusChangeImpact
  };
};
