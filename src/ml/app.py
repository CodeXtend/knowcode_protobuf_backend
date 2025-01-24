from flask import Flask, request, jsonify
from prediction import AgriculturePredictor
import traceback

app = Flask(__name__)
predictor = AgriculturePredictor()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['location', 'land_area', 'soil_condition', 'crop_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Convert land_area to float
        try:
            land_area = float(data['land_area'])
        except ValueError:
            return jsonify({'error': 'land_area must be a number'}), 400

        # Get prediction
        result = predictor.predict_crop(
            location=data['location'],
            land_area=land_area,
            soil_condition=data['soil_condition'],
            crop_type=data['crop_type']
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)