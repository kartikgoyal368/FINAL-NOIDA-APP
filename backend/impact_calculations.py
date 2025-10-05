import math

def calculate_impact_effects(diameter_km, velocity_kms, impact_angle, density_kgm3=3000):
    """
    Calculate realistic impact effects based on:
    - Robert Marcus, H. Jay Melosh, and Gareth Collins' Earth Impact Effects Program:cite[7]
    - Standard asteroid impact physics
    """
    
    # Convert units
    radius_m = (diameter_km * 1000) / 2
    velocity_ms = velocity_kms * 1000
    
    # Calculate projectile mass (sphere volume * density)
    volume = (4/3) * math.pi * (radius_m ** 3)
    mass_kg = volume * density_kgm3
    
    # Kinetic energy (0.5 * m * v^2)
    energy_joules = 0.5 * mass_kg * (velocity_ms ** 2)
    energy_megatons_tnt = energy_joules / (4.184 * 10**15)  # Convert to megatons TNT
    
    # Crater dimensions (using standard scaling laws)
    # Simple crater diameter (for crystalline rock target)
    crater_diameter_km = 0.07 * (energy_megatons_tnt ** 0.294) * (density_kgm3/1000) ** (-1/3)
    
    # Complex crater diameter (larger impacts)
    if energy_megatons_tnt > 1000:
        crater_diameter_km = 0.12 * (energy_megatons_tnt ** 0.294) * (density_kgm3/1000) ** (-1/3)
    
    # Seismic effects (Richter magnitude)
    seismic_magnitude = 0.67 * math.log10(energy_joules) - 5.87
    
    # Fireball radius (thermal radiation)
    fireball_radius_km = 0.002 * (energy_megatons_tnt ** 0.41)
    
    # Determine impact category
    if energy_megatons_tnt < 0.01:
        category = "Local effects"
    elif energy_megatons_tnt < 10:
        category = "Regional devastation"
    elif energy_megatons_tnt < 1000:
        category = "Continental effects"
    elif energy_megatons_tnt < 1000000:
        category = "Global catastrophe"
    else:
        category = "Extinction-level event"
    
    return {
        'energy_megatons': round(energy_megatons_tnt, 2),
        'crater_diameter_km': round(crater_diameter_km, 2),
        'seismic_magnitude': round(seismic_magnitude, 1),
        'fireball_radius_km': round(fireball_radius_km, 2),
        'category': category,
        'mass_kg': mass_kg
    }