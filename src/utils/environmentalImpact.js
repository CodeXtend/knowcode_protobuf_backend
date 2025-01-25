// Impact factors (approximate values)
const IMPACT_FACTORS = {
  straw: {
    co2PreventedPerKg: 1.5,     // CO2 emissions prevented from burning (kg)
    waterSavedPerKg: 0.5,       // Water saved from alternative disposal (liters)
    soilHealthScore: 8,         // Soil health improvement score (1-10)
  },
  husk: {
    co2PreventedPerKg: 1.2,
    waterSavedPerKg: 0.3,
    soilHealthScore: 7,
  },
  leaves: {
    co2PreventedPerKg: 0.8,
    waterSavedPerKg: 0.2,
    soilHealthScore: 6,
  },
  stalks: {
    co2PreventedPerKg: 1.0,
    waterSavedPerKg: 0.4,
    soilHealthScore: 7,
  },
  other: {
    co2PreventedPerKg: 0.5,
    waterSavedPerKg: 0.2,
    soilHealthScore: 5,
  }
};

export const calculateEnvironmentalImpact = (wasteType, quantity) => {
  const factors = IMPACT_FACTORS[wasteType] || IMPACT_FACTORS.other;
  
  return {
    co2Prevented: factors.co2PreventedPerKg * quantity,
    waterSaved: factors.waterSavedPerKg * quantity,
    soilHealthScore: factors.soilHealthScore,
  };
};
