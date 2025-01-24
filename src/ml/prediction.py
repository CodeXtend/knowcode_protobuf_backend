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
        self.valid_crops = ['rice', 'wheat', 'maize', 'cotton']
        self.locations_cache_file = 'india_locations.json'
        self.locations = self._load_locations()
        self._initialize_data()

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

    def _initialize_data(self):
        # Create sample training data
        n_samples = 1000
        data = pd.DataFrame({
            'location': np.random.choice(self.locations, n_samples),
            'land_area': np.random.uniform(1, 2500, n_samples),  # Changed to acres (1 hectare ≈ 2.47 acres)
            'soil_condition': np.random.choice(self.valid_soil_conditions, n_samples),
            'crop_type': np.random.choice(self.valid_crops, n_samples),
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
        # Find closest matching location
        matched_location = self.find_closest_location(location)
        if not matched_location:
            return {"error": f"Location '{location}' not found in database"}
            
        # Rest of the validation
        if soil_condition not in self.valid_soil_conditions:
            return {"error": f"Invalid soil condition. Choose from: {', '.join(self.valid_soil_conditions)}"}
        if crop_type not in self.valid_crops:
            return {"error": f"Invalid crop type. Choose from: {', '.join(self.valid_crops)}"}

        # Use matched location for prediction
        input_data = pd.DataFrame({
            'location': [matched_location],
            'land_area': [land_area],
            'soil_condition': [soil_condition],
            'crop_type': [crop_type]
        })
        
        processed_input = self.preprocess_data(input_data)
        predicted_yield = self.model_yield.predict(processed_input)[0]
        predicted_waste = self.model_waste.predict(processed_input)[0]
        
        return {
            'predicted_yield': round(predicted_yield, 2),
            'predicted_waste': round(predicted_waste, 2),
            'estimated_profit': round(predicted_yield * 20000, 2)
        }

if __name__ == "__main__":
    predictor = AgriculturePredictor()
    
    print("\nAvailable options:")
    print("Location: Enter any Indian city/village name")
    print(f"Soil conditions: {', '.join(predictor.valid_soil_conditions)}")
    print(f"Crop types: {', '.join(predictor.valid_crops)}\n")
    
    location = input("Enter location: ")
    land_area = float(input("Enter land area (in acres): "))
    soil_condition = input("Enter soil condition (sandy/clay/loamy): ")
    crop_type = input("Enter crop type (rice/wheat/maize/cotton): ")
    
    result = predictor.predict_crop(location, land_area, soil_condition, crop_type)
    
    if "error" in result:
        print(f"\nError: {result['error']}")
    else:
        print("\nPrediction Results:")
        print(f"Expected Yield: {result['predicted_yield']} tons")
        print(f"Expected Waste: {result['predicted_waste']} tons")
        print(f"Estimated Profit: ₹{result['estimated_profit']}")