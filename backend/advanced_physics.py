import math
import random
from datetime import datetime, timedelta

class AdvancedPhysicsEngine:
    """Advanced physics engine for realistic asteroid trajectory and impact calculations"""
    
    # Constants
    EARTH_RADIUS_KM = 6371
    GRAVITATIONAL_CONSTANT = 6.67430e-11
    EARTH_MASS = 5.972e24
    
    @staticmethod
    def calculate_realistic_trajectory(diameter_km, velocity_kms, angle_degrees, density=3000):
        """Calculate realistic trajectory with gravitational effects"""
        angle_rad = math.radians(angle_degrees)
        asteroid_mass = AdvancedPhysicsEngine.calculate_asteroid_mass(diameter_km, density)
        
        # Convert to m/s for physics calculations
        velocity_ms = velocity_kms * 1000
        
        # Calculate gravitational influence distance
        grav_influence = AdvancedPhysicsEngine.calculate_gravitational_influence(velocity_ms, asteroid_mass)
        
        # Determine impact based on realistic orbital mechanics
        impact_probability = AdvancedPhysicsEngine.calculate_impact_probability(
            angle_degrees, velocity_kms, diameter_km
        )
        
        # Add realistic randomness based on orbital parameters
        orbital_variance = random.uniform(0.8, 1.2)
        will_impact = (impact_probability * orbital_variance) > 0.5
        
        # Calculate precise miss distance if not impacting
        if not will_impact:
            miss_distance = AdvancedPhysicsEngine.calculate_miss_distance(
                angle_degrees, velocity_kms, grav_influence
            )
        else:
            miss_distance = 0
            
        # Calculate approach vector with realistic 3D physics
        approach_vector = AdvancedPhysicsEngine.calculate_3d_approach_vector(angle_degrees, velocity_kms)
        
        return {
            'will_impact': will_impact,
            'impact_probability': round(impact_probability * 100, 1),
            'miss_distance_km': round(miss_distance, 2),
            'approach_vector': approach_vector,
            'gravitational_influence_km': round(grav_influence / 1000, 2),
            'trajectory_curve': AdvancedPhysicsEngine.calculate_trajectory_curve(angle_degrees, velocity_kms)
        }
    
    @staticmethod
    def calculate_impact_probability(angle, velocity, diameter):
        """Calculate realistic impact probability based on orbital mechanics"""
        # Base probability from angle (0° = direct hit, 90° = grazing)
        angle_factor = 1.0 - (angle / 90.0) * 0.8
        
        # Velocity factor (faster = harder to miss)
        velocity_factor = min(velocity / 30.0, 1.5)
        
        # Size factor (larger = easier to hit)
        size_factor = min(diameter / 5.0, 2.0)
        
        probability = angle_factor * velocity_factor * size_factor * 0.6
        
        return max(0.05, min(0.95, probability))
    
    @staticmethod
    def calculate_miss_distance(angle, velocity, grav_influence):
        """Calculate realistic miss distance"""
        base_miss = (angle / 90.0) * AdvancedPhysicsEngine.EARTH_RADIUS_KM * 3
        grav_effect = grav_influence / 1000  # Convert to km
        velocity_effect = (70 - velocity) / 70 * AdvancedPhysicsEngine.EARTH_RADIUS_KM
        
        return base_miss + grav_effect + velocity_effect * random.uniform(0.5, 2.0)
    
    @staticmethod
    def calculate_gravitational_influence(velocity_ms, asteroid_mass):
        """Calculate gravitational influence distance"""
        escape_velocity = 11200  # Earth's escape velocity in m/s
        relative_velocity = max(velocity_ms, 1000)  # Avoid division by zero
        
        influence = (AdvancedPhysicsEngine.GRAVITATIONAL_CONSTANT * AdvancedPhysicsEngine.EARTH_MASS * asteroid_mass) / (relative_velocity ** 2)
        return math.sqrt(influence) * (escape_velocity / relative_velocity)
    
    @staticmethod
    def calculate_3d_approach_vector(angle_degrees, velocity_kms):
        """Calculate realistic 3D approach vector"""
        angle_rad = math.radians(angle_degrees)
        
        # Base vector components based on angle
        x = math.cos(angle_rad) * random.uniform(0.5, 1.5)
        y = math.sin(angle_rad) * random.uniform(0.3, 1.2)
        z = math.cos(angle_rad) * math.sin(angle_rad) * random.uniform(0.4, 1.6)
        
        # Normalize
        magnitude = math.sqrt(x**2 + y**2 + z**2)
        
        return {
            'x': x / magnitude,
            'y': y / magnitude,
            'z': z / magnitude,
            'speed_multiplier': min(velocity_kms / 20.0, 3.0)
        }
    
    @staticmethod
    def calculate_trajectory_curve(angle, velocity):
        """Calculate how much the trajectory should curve due to gravity"""
        curve_intensity = (90 - angle) / 90.0  # Higher angles curve more
        velocity_factor = 50 / max(velocity, 5)  # Slower objects curve more
        
        return curve_intensity * velocity_factor * random.uniform(0.8, 1.2)
    
    @staticmethod
    def calculate_asteroid_mass(diameter_km, density):
        """Calculate asteroid mass"""
        radius_m = (diameter_km * 1000) / 2
        volume = (4/3) * math.pi * (radius_m ** 3)
        return volume * density
    
    @staticmethod
    def calculate_impact_effects(diameter_km, velocity_kms, density=3000):
        """Calculate detailed impact effects"""
        velocity_ms = velocity_kms * 1000
        mass = AdvancedPhysicsEngine.calculate_asteroid_mass(diameter_km, density)
        
        # Kinetic energy
        energy_joules = 0.5 * mass * (velocity_ms ** 2)
        energy_megatons = energy_joules / (4.184e15)
        
        # Impact effects
        crater_diameter = 0.07 * (energy_megatons ** 0.294) * (density/1000) ** (-1/3)
        if energy_megatons > 1000:
            crater_diameter = 0.12 * (energy_megatons ** 0.294) * (density/1000) ** (-1/3)
            
        seismic_magnitude = 0.67 * math.log10(energy_joules) - 5.87
        fireball_radius = 0.002 * (energy_megatons ** 0.41)
        tsunami_height = 0.5 * (energy_megatons ** 0.5)
        
        # Determine category
        if energy_megatons < 0.01:
            category = "Local effects"
        elif energy_megatons < 10:
            category = "Regional devastation"
        elif energy_megatons < 1000:
            category = "Continental effects"
        elif energy_megatons < 1000000:
            category = "Global catastrophe"
        else:
            category = "Extinction-level event"
            
        return {
            'energy_megatons': round(energy_megatons, 2),
            'crater_diameter_km': round(max(crater_diameter, 0.1), 2),
            'seismic_magnitude': round(seismic_magnitude, 1),
            'fireball_radius_km': round(fireball_radius, 2),
            'tsunami_height_m': round(tsunami_height, 1),
            'category': category,
            'mass_kg': f"{mass:.2e}",
            'energy_joules': f"{energy_joules:.2e}"
        }
    
    @staticmethod
    def calculate_impact_location():
        """Calculate realistic impact location"""
        # Weight probabilities toward oceans (71% of Earth's surface)
        is_ocean = random.random() < 0.71
        
        if is_ocean:
            latitude = random.uniform(-60, 60)
            longitude = random.uniform(-180, 180)
            continent = "Ocean"
        else:
            # Land impact - weighted by continent size
            continents = [
                (-35, 35, -20, 60, "Africa"),           # Africa
                (10, 75, -180, -30, "North America"),   # North America
                (-60, 15, -90, -30, "South America"),   # South America
                (35, 75, -10, 60, "Europe"),            # Europe
                (10, 75, 60, 180, "Asia"),              # Asia
                (-50, -10, 110, 180, "Australia")       # Australia
            ]
            
            continent = random.choices(
                continents, 
                weights=[20, 24, 18, 10, 43, 5]  # Relative sizes
            )[0]
            
            lat_min, lat_max, lon_min, lon_max, continent_name = continent
            latitude = random.uniform(lat_min, lat_max)
            longitude = random.uniform(lon_min, lon_max)
            continent = continent_name
            
        return {
            'latitude': round(latitude, 2),
            'longitude': round(longitude, 2),
            'location_type': 'Ocean' if is_ocean else 'Land',
            'continent': continent
        }