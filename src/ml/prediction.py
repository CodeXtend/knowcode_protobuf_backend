import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import requests
from fuzzywuzzy import process
import json
import os

class AgriculturePredictor:
    def __init__(self):
        self.model_yield = None
        self.model_waste = None
        self.label_encoders = {}
        self.valid_soil_conditions = ['sandy', 'clay', 'loamy']
        self.crops_cache_file = 'crops_database.json'
        self.locations_cache_file = 'india_locations.json'
        self.crops_data = self._load_crops()
        self.locations = self._load_locations()
        self._initialize_data()

    def _load_crops(self):
        """Load or fetch crops database"""
        if os.path.exists(self.crops_cache_file):
            with open(self.crops_cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return self._fetch_and_cache_crops()

    def _fetch_and_cache_crops(self):
        """Create comprehensive Indian crops database"""
        crops_data = {
            # Cereals
            "rice": {
                "yield_factor": 0.4, 
                "waste_factor": 0.1, 
                "price_per_ton": 20000,
                "waste_price_per_ton": 2000  # 10% of crop price
            },
            "wheat": {
                "yield_factor": 0.35, 
                "waste_factor": 0.08, 
                "price_per_ton": 22000,
                "waste_price_per_ton": 2200
            },
            "maize": {"yield_factor": 0.45, "waste_factor": 0.12, "price_per_ton": 18000},
            "sorghum": {"yield_factor": 0.3, "waste_factor": 0.1, "price_per_ton": 16000},
            "pearl_millet": {"yield_factor": 0.25, "waste_factor": 0.1, "price_per_ton": 15000},
            "finger_millet": {"yield_factor": 0.25, "waste_factor": 0.1, "price_per_ton": 15000},
            
            # Pulses
            "chickpeas": {"yield_factor": 0.2, "waste_factor": 0.08, "price_per_ton": 45000},
            "pigeon_peas": {"yield_factor": 0.2, "waste_factor": 0.08, "price_per_ton": 48000},
            "lentils": {"yield_factor": 0.2, "waste_factor": 0.08, "price_per_ton": 50000},
            "black_gram": {"yield_factor": 0.2, "waste_factor": 0.08, "price_per_ton": 46000},
            "green_gram": {"yield_factor": 0.2, "waste_factor": 0.08, "price_per_ton": 47000},
            
            # Oilseeds
            "groundnut": {"yield_factor": 0.3, "waste_factor": 0.1, "price_per_ton": 40000},
            "rapeseed": {"yield_factor": 0.25, "waste_factor": 0.1, "price_per_ton": 38000},
            "mustard": {"yield_factor": 0.25, "waste_factor": 0.1, "price_per_ton": 38000},
            "soybean": {"yield_factor": 0.3, "waste_factor": 0.1, "price_per_ton": 36000},
            "sunflower": {"yield_factor": 0.28, "waste_factor": 0.1, "price_per_ton": 35000},
            "sesame": {"yield_factor": 0.2, "waste_factor": 0.1, "price_per_ton": 55000},
            
            # Commercial Crops
            "sugarcane": {"yield_factor": 0.7, "waste_factor": 0.15, "price_per_ton": 3000},
            "cotton": {"yield_factor": 0.25, "waste_factor": 0.15, "price_per_ton": 45000},
            "jute": {"yield_factor": 0.3, "waste_factor": 0.15, "price_per_ton": 40000},
            "tobacco": {"yield_factor": 0.3, "waste_factor": 0.2, "price_per_ton": 130000},
            
            # Plantation Crops
            "tea": {"yield_factor": 0.4, "waste_factor": 0.1, "price_per_ton": 200000},
            "coffee": {"yield_factor": 0.35, "waste_factor": 0.1, "price_per_ton": 180000},
            "rubber": {"yield_factor": 0.4, "waste_factor": 0.1, "price_per_ton": 150000},
            "coconut": {"yield_factor": 0.5, "waste_factor": 0.2, "price_per_ton": 25000},
            "arecanut": {"yield_factor": 0.4, "waste_factor": 0.15, "price_per_ton": 250000},
            
            # Fruits
            "mango": {"yield_factor": 0.5, "waste_factor": 0.3, "price_per_ton": 35000},
            "banana": {"yield_factor": 0.6, "waste_factor": 0.25, "price_per_ton": 25000},
            "apple": {"yield_factor": 0.5, "waste_factor": 0.2, "price_per_ton": 45000},
            "grapes": {"yield_factor": 0.55, "waste_factor": 0.2, "price_per_ton": 50000},
            "orange": {"yield_factor": 0.5, "waste_factor": 0.25, "price_per_ton": 30000},
            "pineapple": {"yield_factor": 0.6, "waste_factor": 0.2, "price_per_ton": 28000},
            "guava": {"yield_factor": 0.5, "waste_factor": 0.25, "price_per_ton": 25000},
            "papaya": {"yield_factor": 0.6, "waste_factor": 0.3, "price_per_ton": 22000},
            "litchi": {"yield_factor": 0.4, "waste_factor": 0.25, "price_per_ton": 60000},
            "pomegranate": {"yield_factor": 0.45, "waste_factor": 0.2, "price_per_ton": 55000},
            
            # Vegetables
            "potato": {"yield_factor": 0.6, "waste_factor": 0.2, "price_per_ton": 15000},
            "tomato": {"yield_factor": 0.55, "waste_factor": 0.25, "price_per_ton": 18000},
            "onion": {"yield_factor": 0.5, "waste_factor": 0.2, "price_per_ton": 20000},
            "brinjal": {"yield_factor": 0.5, "waste_factor": 0.25, "price_per_ton": 16000},
            "okra": {"yield_factor": 0.45, "waste_factor": 0.2, "price_per_ton": 25000},
            "cabbage": {"yield_factor": 0.6, "waste_factor": 0.25, "price_per_ton": 12000},
            "cauliflower": {"yield_factor": 0.55, "waste_factor": 0.25, "price_per_ton": 15000},
            "carrot": {"yield_factor": 0.5, "waste_factor": 0.2, "price_per_ton": 18000},
            "peas": {"yield_factor": 0.4, "waste_factor": 0.15, "price_per_ton": 30000},
            "spinach": {"yield_factor": 0.45, "waste_factor": 0.2, "price_per_ton": 20000},
            
            # Spices
            "chillies": {"yield_factor": 0.3, "waste_factor": 0.1, "price_per_ton": 80000},
            "turmeric": {"yield_factor": 0.35, "waste_factor": 0.1, "price_per_ton": 70000},
            "ginger": {"yield_factor": 0.4, "waste_factor": 0.15, "price_per_ton": 60000},
            "garlic": {"yield_factor": 0.45, "waste_factor": 0.15, "price_per_ton": 40000},
            "cardamom": {"yield_factor": 0.2, "waste_factor": 0.1, "price_per_ton": 700000},
            "black_pepper": {"yield_factor": 0.25, "waste_factor": 0.1, "price_per_ton": 350000},
            "coriander": {"yield_factor": 0.3, "waste_factor": 0.1, "price_per_ton": 45000},
            "cumin": {"yield_factor": 0.25, "waste_factor": 0.1, "price_per_ton": 150000},
            "fenugreek": {"yield_factor": 0.3, "waste_factor": 0.1, "price_per_ton": 40000},
            
            # Flowers
            "rose": {"yield_factor": 0.4, "waste_factor": 0.3, "price_per_ton": 100000},
            "marigold": {"yield_factor": 0.45, "waste_factor": 0.3, "price_per_ton": 40000},
            "jasmine": {"yield_factor": 0.35, "waste_factor": 0.3, "price_per_ton": 150000},
            "chrysanthemum": {"yield_factor": 0.4, "waste_factor": 0.3, "price_per_ton": 60000},
            "gladiolus": {"yield_factor": 0.4, "waste_factor": 0.3, "price_per_ton": 80000}
        }
        
        # Add waste_price_per_ton for all crops (10% of crop price)
        for crop in crops_data:
            if 'waste_price_per_ton' not in crops_data[crop]:
                crops_data[crop]['waste_price_per_ton'] = crops_data[crop]['price_per_ton'] * 0.1
        
        with open(self.crops_cache_file, 'w', encoding='utf-8') as f:
            json.dump(crops_data, f)
        
        return crops_data

    def _load_locations(self):
        """Load or fetch Indian locations"""
        if os.path.exists(self.locations_cache_file):
            with open(self.locations_cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return self._fetch_and_cache_locations()

    def _fetch_and_cache_locations(self):
        """Fetch locations from Geonames API and cache them"""
        # Geonames API requires username
        username = "TejasShirsath"  # Sign up at http://www.geonames.org/
        
        # Fetch cities with population > 1000
        url = f"http://api.geonames.org/searchJSON?country=IN&maxRows=1000&username={username}"
        response = requests.get(url)
        
        if (response.status_code == 200):
            data = response.json()
            locations = [place['name'] for place in data['geonames']]
            
            # Cache the results
            with open(self.locations_cache_file, 'w', encoding='utf-8') as f:
                json.dump(locations, f)
            
            return locations
        return ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Nashik']  # Default locations if API fails

    def find_closest_location(self, input_location):
        """Find closest matching location using fuzzy matching"""
        closest_match = process.extractOne(input_location, self.locations)
        return closest_match[0] if closest_match[1] >= 60 else None

    def find_closest_crop(self, input_crop):
        """Find closest matching crop using fuzzy matching"""
        crops = list(self.crops_data.keys())
        closest_match = process.extractOne(input_crop.lower(), crops)
        return closest_match[0] if closest_match[1] >= 60 else None

    def _initialize_data(self):
        # Create sample training data
        n_samples = 1000
        data = pd.DataFrame({
            'location': np.random.choice(self.locations, n_samples),
            'land_area': np.random.uniform(1, 2500, n_samples),  # Changed to acres (1 hectare ≈ 2.47 acres)
            'soil_condition': np.random.choice(self.valid_soil_conditions, n_samples),
            'crop_type': np.random.choice(list(self.crops_data.keys()), n_samples),
            'temperature': np.random.uniform(20, 40, n_samples),
            'rainfall': np.random.uniform(500, 2000, n_samples)
        })
        
        # Generate synthetic yield and waste based on features
        # Adjusted yield calculation for acres (approximately 0.4 tons per acre)
        data['yield'] = (
            data['land_area'] * 0.4 + 
            np.random.normal(0, 0.1, n_samples)
        )
        data['waste'] = data['yield'] * 0.1  # 10% waste
        
        # Initialize label encoders
        for column in ['location', 'soil_condition', 'crop_type']:
            self.label_encoders[column] = LabelEncoder()
            self.label_encoders[column].fit(data[column])
        
        # Train models
        self._train_models(data)
    
    def _train_models(self, data):
        X = data[['location', 'land_area', 'soil_condition', 'crop_type']]
        X = self.preprocess_data(X)
        
        self.model_yield = RandomForestRegressor(n_estimators=100)
        self.model_waste = RandomForestRegressor(n_estimators=100)
        
        self.model_yield.fit(X, data['yield'])
        self.model_waste.fit(X, data['waste'])
    
    def preprocess_data(self, data):
        processed_data = data.copy()
        for column in ['location', 'soil_condition', 'crop_type']:
            processed_data[column] = self.label_encoders[column].transform(processed_data[column])
        return processed_data
    
    def predict_crop(self, location, land_area, soil_condition, crop_type):
        # Find closest matching crop
        matched_crop = self.find_closest_crop(crop_type)
        if not matched_crop:
            return {"error": f"Crop type '{crop_type}' not recognized"}
        
        matched_location = self.find_closest_location(location)
        if not matched_location:
            return {"error": f"Location '{location}' not found"}

        if soil_condition not in self.valid_soil_conditions:
            return {"error": f"Invalid soil condition. Choose from: {', '.join(self.valid_soil_conditions)}"}

        # Use crop-specific factors with fallback values
        crop_data = self.crops_data[matched_crop]
        base_yield = land_area * crop_data.get('yield_factor', 0.4)
        base_waste = base_yield * crop_data.get('waste_factor', 0.1)
        
        # Calculate profits
        price_per_ton = crop_data.get('price_per_ton', 20000)
        waste_price_per_ton = crop_data.get('waste_price_per_ton', price_per_ton * 0.1)
        
        crop_profit = base_yield * price_per_ton
        waste_profit = base_waste * waste_price_per_ton
        total_profit = crop_profit + waste_profit

        return {
            'crop': matched_crop,
            'location': matched_location,
            'predicted_yield': round(base_yield, 2),
            'predicted_waste': round(base_waste, 2),
            'price_per_ton': price_per_ton,
            'waste_price_per_ton': waste_price_per_ton,
            'crop_profit': round(crop_profit, 2),
            'waste_profit': round(waste_profit, 2),
            'total_profit': round(total_profit, 2)
        }

if __name__ == "__main__":
    predictor = AgriculturePredictor()
    
    print("\nAvailable options:")
    print("Location: Enter any Indian city/village name")
    print(f"Soil conditions: {', '.join(predictor.valid_soil_conditions)}")
    print("Crop types: Enter any crop name (e.g., rice, wheat, potato, tomato, etc.)\n")
    
    location = input("Enter location: ")
    land_area = float(input("Enter land area (in acres): "))
    soil_condition = input("Enter soil condition (sandy/clay/loamy): ")
    crop_type = input("Enter crop type: ")
    
    result = predictor.predict_crop(location, land_area, soil_condition, crop_type)
    
    if "error" in result:
        print(f"\nError: {result['error']}")
    else:
        print("\nPrediction Results:")
        print("-" * 50)
        print(f"Crop Type: {result['crop'].title()}")
        print(f"Location: {result['location']}")
        print(f"Expected Yield: {result['predicted_yield']:,.2f} tons")
        print(f"Expected Waste: {result['predicted_waste']:,.2f} tons")
        print("\nFinancial Analysis:")
        print("-" * 50)
        print(f"Crop Price per ton: ₹{result['price_per_ton']:,.2f}")
        print(f"Waste Price per ton: ₹{result['waste_price_per_ton']:,.2f}")
        print(f"Crop Revenue: ₹{result['crop_profit']:,.2f}")
        print(f"Waste Revenue: ₹{result['waste_profit']:,.2f}")
        print("-" * 50)
        print(f"Total Estimated Profit: ₹{result['total_profit']:,.2f}")