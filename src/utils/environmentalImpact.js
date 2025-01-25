// Updated impact factors with detailed carbon metrics
const IMPACT_FACTORS = {
  straw: {
    co2PreventedPerKg: 1.5,     // CO2 emissions prevented from burning (kg)
    methanePreventedPerKg: 0.07, // Methane emissions prevented (kg)
    carbonSequesteredPerKg: 0.4, // Carbon sequestered if used as soil amendment (kg)
    waterSavedPerKg: 0.5,       // Water saved from alternative disposal (liters)
    soilHealthScore: 8,         // Soil health improvement score (1-10)
  },
  husk: {
    co2PreventedPerKg: 1.2,
    methanePreventedPerKg: 0.05,
    carbonSequesteredPerKg: 0.3,
    waterSavedPerKg: 0.3,
    soilHealthScore: 7,
  },
  leaves: {
    co2PreventedPerKg: 0.8,
    methanePreventedPerKg: 0.03,
    carbonSequesteredPerKg: 0.2,
    waterSavedPerKg: 0.2,
    soilHealthScore: 6,
  },
  stalks: {
    co2PreventedPerKg: 1.0,
    methanePreventedPerKg: 0.04,
    carbonSequesteredPerKg: 0.3,
    waterSavedPerKg: 0.4,
    soilHealthScore: 7,
  },
  other: {
    co2PreventedPerKg: 0.5,
    methanePreventedPerKg: 0.02,
    carbonSequesteredPerKg: 0.1,
    waterSavedPerKg: 0.2,
    soilHealthScore: 5,
  }
};

export const calculateEnvironmentalImpact = (wasteType, quantity) => {
  const factors = IMPACT_FACTORS[wasteType] || IMPACT_FACTORS.other;
  
  const co2Prevented = factors.co2PreventedPerKg * quantity;
  const methanePrevented = factors.methanePreventedPerKg * quantity;
  const carbonSequestered = factors.carbonSequesteredPerKg * quantity;
  
  // Convert methane to CO2 equivalent (methane is ~25 times more potent as greenhouse gas)
  const methaneCo2Equivalent = methanePrevented * 25;
  
  return {
    co2Prevented,
    methanePrevented,
    carbonSequestered,
    totalCarbonImpact: co2Prevented + methaneCo2Equivalent + carbonSequestered,
    waterSaved: factors.waterSavedPerKg * quantity,
    soilHealthScore: factors.soilHealthScore,
  };
};

export const getCarbonOffsetEquivalent = (totalCarbonImpact) => {
  return {
    treesPerYear: Math.floor(totalCarbonImpact / 20), // One tree absorbs ~20kg CO2 per year
    carKmAvoided: Math.floor(totalCarbonImpact * 4), // Average car emits ~0.25kg CO2 per km
    homeEnergySaved: Math.floor(totalCarbonImpact / 10), // Average home emits ~10kg CO2 per day
  };
};
