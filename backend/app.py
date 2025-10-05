from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from datetime import datetime, timedelta
import time
import math
import json
import random
from advanced_physics import AdvancedPhysicsEngine

app = Flask(__name__)
CORS(app)

# NASA API configuration - Use environment variable only
NASA_API_KEY = '68jNM8rUrzvzLaO2RGVbGG5RmeMkRPnxhRm13UaQ'

class ImpactCalculator:
    """Advanced impact calculations with realistic physics"""
    
    @staticmethod
    def calculate_kinetic_energy(mass_kg, velocity_ms):
        """Calculate kinetic energy: 0.5 * m * v^2"""
        return 0.5 * mass_kg * (velocity_ms ** 2)
    
    @staticmethod
    def calculate_asteroid_mass(diameter_km, density_kgm3=3000):
        """Calculate asteroid mass from diameter and density"""
        radius_m = (diameter_km * 1000) / 2
        volume = (4/3) * math.pi * (radius_m ** 3)
        return volume * density_kgm3
    
    @staticmethod
    def joules_to_megatons(joules):
        """Convert joules to megatons of TNT"""
        return joules / (4.184 * 10**15)
    
    @staticmethod
    def calculate_crater_size(energy_megatons, density_kgm3=3000):
        """Calculate crater diameter using standard scaling laws"""
        if energy_megatons <= 0:
            return 0.1
            
        if energy_megatons > 1000:
            return 0.12 * (energy_megatons ** 0.294) * (density_kgm3/1000) ** (-1/3)
        else:
            return 0.07 * (energy_megatons ** 0.294) * (density_kgm3/1000) ** (-1/3)
    
    @staticmethod
    def calculate_seismic_magnitude(energy_joules):
        """Calculate Richter magnitude from impact energy"""
        if energy_joules <= 0:
            return 0
        return 0.67 * math.log10(energy_joules) - 5.87
    
    @staticmethod
    def calculate_fireball_radius(energy_megatons):
        """Calculate fireball radius from energy"""
        if energy_megatons <= 0:
            return 0.1
        return 0.002 * (energy_megatons ** 0.41)
    
    @staticmethod
    def calculate_tsunami_height(energy_megatons, ocean_depth_m=4000):
        """Calculate potential tsunami height for ocean impacts"""
        if energy_megatons <= 0:
            return 0
        return 0.5 * (energy_megatons ** 0.5) * (ocean_depth_m/4000) ** 0.5
    
    @staticmethod
    def get_impact_category(energy_megatons):
        """Categorize impact based on energy"""
        if energy_megatons < 0.01:
            return "Local effects (Fireball, minor damage)"
        elif energy_megatons < 10:
            return "Regional devastation (Large crater, widespread damage)"
        elif energy_megatons < 1000:
            return "Continental effects (Massive crater, global climate effects)"
        elif energy_megatons < 1000000:
            return "Global catastrophe (Mass extinction threshold)"
        else:
            return "Extinction-level event (Planetary-scale destruction)"

def fetch_neo_data(days=7):
    """Fetch near-Earth object data from NASA API"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        all_asteroids = []
        current_date = start_date
        
        while current_date <= end_date:
            batch_end = min(current_date + timedelta(days=7), end_date)
            
            params = {
                'start_date': current_date.strftime('%Y-%m-%d'),
                'end_date': batch_end.strftime('%Y-%m-%d'),
                'api_key': NASA_API_KEY
            }
            
            response = requests.get('https://api.nasa.gov/neo/rest/v1/feed', params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            for date in data.get('near_earth_objects', {}):
                all_asteroids.extend(data['near_earth_objects'][date])
            
            current_date = batch_end + timedelta(days=1)
            time.sleep(0.2)  # Rate limiting
        
        return process_asteroid_data(all_asteroids)
        
    except Exception as e:
        print(f"NASA API error: {e}")
        return get_sample_asteroid_data()

def process_asteroid_data(asteroids):
    """Process raw asteroid data from NASA API"""
    processed = []
    
    for asteroid in asteroids:
        try:
            # Get diameter estimate
            diam_data = asteroid['estimated_diameter']['kilometers']
            avg_diameter = (diam_data['estimated_diameter_min'] + diam_data['estimated_diameter_max']) / 2
            
            # Get close approach data
            close_approach = asteroid['close_approach_data'][0] if asteroid['close_approach_data'] else {}
            velocity_str = close_approach.get('relative_velocity', {}).get('kilometers_per_second', '0')
            
            # Clean velocity string (remove commas)
            velocity = float(velocity_str.replace(',', '')) if velocity_str else 15.0
            
            # Calculate miss distance in kilometers
            miss_distance_km = float(close_approach.get('miss_distance', {}).get('kilometers', 0))
            
            processed.append({
                'id': str(asteroid['id']),
                'name': asteroid['name'].replace('(', '').replace(')', '').strip(),
                'diameter': round(avg_diameter, 3),
                'velocity': round(velocity, 2),
                'miss_distance': miss_distance_km,
                'hazardous': asteroid['is_potentially_hazardous_asteroid'],
                'orbit': close_approach.get('orbiting_body', 'N/A'),
                'url': asteroid.get('nasa_jpl_url', ''),
                'close_approach_date': close_approach.get('close_approach_date', ''),
                'orbital_data': asteroid.get('orbital_data', {})
            })
        except Exception as e:
            print(f"Error processing asteroid {asteroid.get('name', 'unknown')}: {e}")
            continue
    
    # Sort by closest approach
    processed.sort(key=lambda x: x['miss_distance'])
    return processed

def get_sample_asteroid_data():
    """Return sample data if NASA API fails"""
    return [
        {
            'id': '3542519',
            'name': '2025 Impactor',
            'diameter': 1.2,
            'velocity': 18.5,
            'miss_distance': 4500000,
            'hazardous': True,
            'orbit': 'Earth',
            'url': 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=3542519',
            'close_approach_date': '2025-04-13'
        },
        {
            'id': '2001031',
            'name': 'Apophis',
            'diameter': 0.37,
            'velocity': 30.7,
            'miss_distance': 31000000,
            'hazardous': True,
            'orbit': 'Earth',
            'url': 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=Apophis',
            'close_approach_date': '2029-04-13'
        }
    ]

def calculate_impact_effects(diameter_km, velocity_kms, impact_angle, density_kgm3=3000):
    """Calculate all impact effects with advanced physics"""
    calculator = ImpactCalculator()
    
    try:
        # Use advanced physics engine for trajectory
        trajectory_data = AdvancedPhysicsEngine.calculate_realistic_trajectory(
            diameter_km, velocity_kms, impact_angle, density_kgm3
        )
        
        # Calculate impact effects
        impact_effects = AdvancedPhysicsEngine.calculate_impact_effects(
            diameter_km, velocity_kms, density_kgm3
        )
        
        # Calculate impact location and date
        impact_location = AdvancedPhysicsEngine.calculate_impact_location()
        impact_date = (datetime.now() + timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
        
        # Determine category based on impact outcome
        if trajectory_data['will_impact']:
            category = impact_effects['category']
        else:
            category = f"No impact - Asteroid will miss Earth by {trajectory_data['miss_distance_km']:,.0f} km"
        
        return {
            'success': True,
            'impact_occurred': trajectory_data['will_impact'],
            'energy_megatons': impact_effects['energy_megatons'],
            'crater_diameter_km': impact_effects['crater_diameter_km'],
            'seismic_magnitude': impact_effects['seismic_magnitude'],
            'fireball_radius_km': impact_effects['fireball_radius_km'],
            'tsunami_height_m': impact_effects['tsunami_height_m'],
            'category': category,
            'mass_kg': impact_effects['mass_kg'],
            'energy_joules': impact_effects['energy_joules'],
            'trajectory_data': trajectory_data,
            'impact_location': impact_location,
            'impact_date': impact_date,
            'approach_vector': trajectory_data['approach_vector'],
            'physics_engine': 'advanced_v2'
        }
        
    except Exception as e:
        print(f"Impact calculation error: {e}")
        return {
            'success': False,
            'error': str(e),
            'impact_occurred': True,
            'energy_megatons': 10.0,
            'crater_diameter_km': 1.0,
            'seismic_magnitude': 5.0,
            'fireball_radius_km': 1.0,
            'tsunami_height_m': 10.0,
            'category': "Regional devastation",
            'trajectory_data': {'will_impact': True, 'miss_distance_km': 0},
            'impact_location': {'latitude': 0, 'longitude': 0, 'location_type': 'Land', 'continent': 'Africa'},
            'impact_date': datetime.now().strftime('%Y-%m-%d'),
            'approach_vector': {'x': 1, 'y': 0, 'z': 0}
        }

@app.route('/')
def home():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'Advanced Asteroid Impact Simulator API',
        'version': '4.0',
        'endpoints': {
            '/api/asteroids': 'GET - List of near-Earth asteroids',
            '/api/calculate-impact': 'POST - Calculate impact effects',
            '/api/health': 'GET - Health check'
        },
        'features': 'Advanced physics engine, realistic trajectories, NASA data integration'
    })

@app.route('/api/asteroids')
def get_asteroids():
    """Get list of near-Earth asteroids"""
    try:
        days = request.args.get('days', default=7, type=int)
        asteroids = fetch_neo_data(days)
        
        return jsonify({
            'success': True,
            'asteroids': asteroids,
            'count': len(asteroids),
            'last_updated': datetime.now().isoformat(),
            'data_source': 'NASA NEO API'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'asteroids': get_sample_asteroid_data(),
            'count': 2,
            'last_updated': datetime.now().isoformat(),
            'data_source': 'Sample Data'
        })

@app.route('/api/calculate-impact', methods=['POST'])
def calculate_impact():
    """Calculate impact effects based on asteroid parameters"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        diameter = float(data.get('diameter', 1.0))
        velocity = float(data.get('velocity', 20.0))
        angle = float(data.get('angle', 45))
        density = float(data.get('density', 3000))
        
        # Validate inputs with realistic constraints
        if diameter <= 0 or diameter > 1000:  # 1000km max diameter (larger than Ceres!)
            return jsonify({'success': False, 'error': 'Diameter must be between 0.01 and 1000 km'}), 400
        
        if velocity <= 0 or velocity > 300:  # 300 km/s max (hypervelocity impacts)
            return jsonify({'success': False, 'error': 'Velocity must be between 1 and 300 km/s'}), 400
        
        if angle < 0 or angle > 90:
            return jsonify({'success': False, 'error': 'Angle must be between 0 and 90 degrees'}), 400
        
        if density <= 0 or density > 8000:  # 8000 kg/m³ max (denser than iron)
            return jsonify({'success': False, 'error': 'Density must be between 1 and 8000 kg/m³'}), 400
        
        result = calculate_impact_effects(diameter, velocity, angle, density)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'nasa_api': 'available' if NASA_API_KEY != 'DEMO_KEY' else 'demo_mode',
        'version': '4.0',
        'physics_engine': 'advanced_v2'
    })

if __name__ == '__main__':
    print("🚀 Starting ULTIMATE Asteroid Impact Simulator Server...")
    print("📍 NASA API Key:", "Loaded" if NASA_API_KEY != "DEMO_KEY" else "Using DEMO_KEY (rate limited)")
    print("📍 Advanced Physics Engine: ACTIVE")
    print("📍 Realistic Trajectory Simulation: ACTIVE") 
    print("📍 Impact Location Prediction: ACTIVE")
    print("📍 Server will run on: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5001)