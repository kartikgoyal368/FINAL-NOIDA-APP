import requests
import os
from datetime import datetime, timedelta
import time

# CORRECTED: Only the environment variable name, not the actual key
NASA_API_KEY = '68jNM8rUrzvzLaO2RGVbGG5RmeMkRPnxhRm13UaQ'
NEO_URL = 'https://api.nasa.gov/neo/rest/v1/feed'

def fetch_neo_data(days=7):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    all_asteroids = []
    current_date = start_date
    
    while current_date <= end_date:
        # API limited to 7 days per request
        batch_end = min(current_date + timedelta(days=7), end_date)
        
        params = {
            'start_date': current_date.strftime('%Y-%m-%d'),
            'end_date': batch_end.strftime('%Y-%m-%d'),
            'api_key': NASA_API_KEY
        }
        
        try:
            response = requests.get(NEO_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            for date in data['near_earth_objects']:
                all_asteroids.extend(data['near_earth_objects'][date])
            
            current_date = batch_end + timedelta(days=1)
            time.sleep(0.2)  # Rate limiting
            
        except Exception as e:
            print(f"Error fetching NASA data for {current_date}: {e}")
            break
    
    # Process and simplify data
    processed_asteroids = []
    for asteroid in all_asteroids:
        try:
            # Get estimated diameter
            diam_data = asteroid['estimated_diameter']['kilometers']
            avg_diameter = (diam_data['estimated_diameter_min'] + diam_data['estimated_diameter_max']) / 2
            
            # Get close approach data
            close_approach = asteroid['close_approach_data'][0] if asteroid['close_approach_data'] else {}
            
            # Clean velocity string (remove commas)
            velocity_str = close_approach.get('relative_velocity', {}).get('kilometers_per_second', '0')
            velocity = float(velocity_str.replace(',', '')) if velocity_str else 15.0
            
            # Calculate miss distance in kilometers
            miss_distance_km = float(close_approach.get('miss_distance', {}).get('kilometers', 0))
            
            processed_asteroids.append({
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
    processed_asteroids.sort(key=lambda x: x['miss_distance'])
    return processed_asteroids

def fetch_neo_details(asteroid_id):
    url = f'https://api.nasa.gov/neo/rest/v1/neo/{asteroid_id}'
    params = {'api_key': NASA_API_KEY}
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    return response.json()