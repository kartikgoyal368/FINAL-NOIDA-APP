// Main Three.js variables
let scene, camera, renderer, controls;
let earth, asteroids = [];
let asteroidLabels = [];
let asteroidData = [];
let asteroidTrajectories = [];
let focusedAsteroid = null;
let originalAsteroidSizes = new Map();
let isFocusMode = false;
let currentAsteroidId = null;

// NASA API Key (DEMO_KEY has rate limits, for production use your own key)
const NASA_API_KEY = '68jNM8rUrzvzLaO2RGVbGG5RmeMkRPnxhRm13UaQ';
const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
const JPL_SBDB_API_URL = 'https://ssd-api.jpl.nasa.gov/sbdb.api';

// Gemini API key - Replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyCh-UZaMEvaOY9QS9eI6x32hiUkuvSqb_g';

// Enhanced asteroid image database with unique images for each asteroid
const ASTEROID_IMAGES = {
    // Famous asteroids with actual NASA images
    "2000433": "https://solarsystem.nasa.gov/system/resources/detail_files/246_PIA00271.jpg", // Eros
    "20025143": "https://solarsystem.nasa.gov/system/resources/detail_files/248_PIA00269.jpg", // Itokawa
    "2005535": "https://solarsystem.nasa.gov/system/resources/detail_files/249_PIA00268.jpg", // Annefrank
    "2009969": "https://solarsystem.nasa.gov/system/resources/detail_files/250_PIA00267.jpg", // Braille
    "2002867": "https://solarsystem.nasa.gov/system/resources/detail_files/247_PIA00270.jpg", // Steins
    "2004179": "https://apod.nasa.gov/apod/image/0409/toutatis_goldstone.jpg", // Toutatis
    "2003200": "https://apod.nasa.gov/apod/image/1712/Phaethon_goldstone_960.jpg", // Phaethon
    "2001862": "https://cdn.mos.cms.futurecdn.net/3f4f995a7b8b4b8c9c9e9e9e9e9e9e9e.jpg", // Apollo
    "2002212": "https://www.jpl.nasa.gov/spaceimages/images/largesize/PIA00271_hires.jpg", // Hephaistos
    
    // Additional unique asteroid images from various sources
    "fallback_1": "https://images-assets.nasa.gov/image/PIA00271/PIA00271~medium.jpg",
    "fallback_2": "https://images-assets.nasa.gov/image/PIA00269/PIA00269~medium.jpg",
    "fallback_3": "https://images-assets.nasa.gov/image/PIA00267/PIA00267~medium.jpg",
    "fallback_4": "https://images-assets.nasa.gov/image/PIA00268/PIA00268~medium.jpg",
    "fallback_5": "https://apod.nasa.gov/apod/image/2105/asteroid2021jp2_20210522_1000.jpg",
    "fallback_6": "https://apod.nasa.gov/apod/image/2105/asteroid2021jp2_20210522_1000.jpg",
    "fallback_7": "https://www.jpl.nasa.gov/spaceimages/images/largesize/PIA00271_hires.jpg",
    "fallback_8": "https://cdn.mos.cms.futurecdn.net/3f4f995a7b8b4b8c9c9e9e9e9e9e9e9e.jpg",
    "fallback_9": "https://apod.nasa.gov/apod/image/0409/toutatis_goldstone.jpg",
    "fallback_10": "https://apod.nasa.gov/apod/image/1712/Phaethon_goldstone_960.jpg",
    "fallback_11": "https://www.nasa.gov/sites/default/files/thumbnails/image/pia24546.jpg",
    "fallback_12": "https://www.nasa.gov/sites/default/files/thumbnails/image/pia24547.jpg",
    "fallback_13": "https://www.nasa.gov/sites/default/files/thumbnails/image/pia24548.jpg",
    "fallback_14": "https://www.nasa.gov/sites/default/files/thumbnails/image/pia24549.jpg",
    "fallback_15": "https://www.nasa.gov/sites/default/files/thumbnails/image/pia24550.jpg"
};

// Track used images to avoid repetition
let usedImages = new Set();

// Initialize the application
async function init() {
    // Show loading screen
    document.getElementById('loading').style.display = 'flex';
    
    try {
        // Fetch asteroid data from NASA API
        await fetchAsteroidData();
        
        // Set up the scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        
        // Add stars to the background
        createStarfield();
        
        // Set up the camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;
        
        // Set up the renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('earth-container').appendChild(renderer.domElement);
        
        // Add orbit controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
        
        // Create Earth with realistic texture
        createEarth();
        
        // Create asteroids with trajectories coming from random directions
        createAsteroids();
        
        // Update UI with asteroid data
        updateUI();
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
        
        // Start animation loop
        animate();
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Set up panel close button
        document.getElementById('close-panel').addEventListener('click', function() {
            document.getElementById('asteroid-panel').classList.remove('active');
        });
        
        // Set up refresh button
        document.getElementById('refresh-btn').addEventListener('click', function() {
            document.getElementById('error-message').style.display = 'none';
            location.reload();
        });
        
        // Set up back button
        document.getElementById('back-btn').addEventListener('click', function() {
            resetView();
        });
        
        // Set up scan button
        document.getElementById('scan-button').addEventListener('click', function() {
            if (currentAsteroidId) {
                scanAsteroid(currentAsteroidId);
            }
        });
        
        // Set up chatbot functionality
        setupChatbot();
        
    } catch (error) {
        console.error('Error initializing application:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
    }
}

function setupChatbot() {
    // Chatbot icon click event
    document.getElementById('chatbot-icon').addEventListener('click', function() {
        document.getElementById('chatbot-panel').classList.toggle('active');
    });
    
    // Close chat panel
    document.getElementById('close-chat').addEventListener('click', function() {
        document.getElementById('chatbot-panel').classList.remove('active');
    });
    
    // Hide API key input since we're using hardcoded key
    document.getElementById('api-key-container').style.display = 'none';
    
    // Send message on button click
    document.getElementById('send-message').addEventListener('click', sendMessage);
    
    // Send message on Enter key
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add welcome message
    addMessage('Hello! I\'m your AI space assistant powered by Gemini. Ask me anything about asteroids, space, or this visualization!', 'bot');
}

function cleanMessageText(text) {
    // Remove markdown formatting while preserving the content
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic
        .replace(/`(.*?)`/g, '$1')       // Remove code
        .replace(/#+\s*/g, '')           // Remove headers
        .replace(/\n{3,}/g, '\n\n')      // Limit consecutive newlines
        .trim();
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    // Send message to Gemini API
    callGeminiAPI(message, typingIndicator);
}

async function callGeminiAPI(message, typingIndicator) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful assistant specializing in asteroids, space science, and astronomy. Provide accurate and informative answers about asteroids, their characteristics, orbits, and any related space topics. Keep responses concise but informative. If asked about something unrelated to space, politely redirect back to space topics.

User question: ${message}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const responseText = data.candidates[0].content.parts[0].text;
            // Clean up the response text by removing markdown formatting
            const cleanText = cleanMessageText(responseText);
            addMessage(cleanText, 'bot');
        } else {
            addMessage('Sorry, I encountered an error processing your request. Please try again.', 'bot');
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (error.message.includes('429')) {
            addMessage('Rate limit exceeded. Please wait a few moments before sending another message.', 'bot');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            addMessage('API authentication error. Please check the API key configuration.', 'bot');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            addMessage('API quota exceeded. Please try again later.', 'bot');
        } else {
            addMessage('Sorry, I encountered an error. Please check your connection and try again.', 'bot');
        }
    }
}

function addTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'bot-message', 'typing-indicator');
    typingElement.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return typingElement;
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    // Format the text with proper paragraphs
    const formattedText = formatMessageText(text);
    messageElement.innerHTML = formattedText;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageElement;
}

function formatMessageText(text) {
    // Split into paragraphs and format properly
    return text
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim()) {
                return `<p>${paragraph.trim()}</p>`;
            }
            return '';
        })
        .join('');
}

function createStarfield() {
    // Create a starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        // Random positions in a sphere
        const i3 = i * 3;
        const radius = 100 + Math.random() * 900;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Random colors (mostly white with some blue/red stars)
        const colorVal = 0.8 + Math.random() * 0.2;
        const colorVariation = Math.random();
        
        if (colorVariation < 0.7) {
            colors[i3] = colorVal;
            colors[i3 + 1] = colorVal;
            colors[i3 + 2] = colorVal;
        } else if (colorVariation < 0.85) {
            colors[i3] = 0.8;
            colors[i3 + 1] = 0.9;
            colors[i3 + 2] = 1.0;
        } else {
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.8;
            colors[i3 + 2] = 0.8;
        }
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

async function fetchAsteroidData() {
    // Get today's date and next week's date for API query
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const startDate = formatDate(today);
    const endDate = formatDate(nextWeek);
    
    try {
        const response = await fetch(`${NASA_API_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`);
        const data = await response.json();
        
        // Process the API response
        asteroidData = [];
        
        // Extract asteroids from the response
        for (const date in data.near_earth_objects) {
            const asteroidsForDate = data.near_earth_objects[date];
            
            asteroidsForDate.forEach(asteroid => {
                // Extract close approach data (use the first one)
                const closeApproach = asteroid.close_approach_data[0];
                
                // Calculate average diameter in meters
                const diameterMin = asteroid.estimated_diameter.meters.estimated_diameter_min;
                const diameterMax = asteroid.estimated_diameter.meters.estimated_diameter_max;
                const avgDiameter = (diameterMin + diameterMax) / 2;
                
                // Format the data for our application
                const asteroidInfo = {
                    id: asteroid.id,
                    name: asteroid.name,
                    diameter: avgDiameter,
                    velocity: `${parseFloat(closeApproach.relative_velocity.kilometers_per_second).toFixed(2)} km/s`,
                    missDistance: `${parseFloat(closeApproach.miss_distance.kilometers).toLocaleString()} km`,
                    approachDate: closeApproach.close_approach_date,
                    approachTime: closeApproach.close_approach_date_full.split(' ')[1],
                    orbitingBody: closeApproach.orbiting_body,
                    magnitude: asteroid.absolute_magnitude_h,
                    hazardous: asteroid.is_potentially_hazardous_asteroid
                };
                
                asteroidData.push(asteroidInfo);
            });
        }
        
        // Show all asteroids from API without limiting
        console.log(`Loaded ${asteroidData.length} asteroids from NASA API`);
        
    } catch (error) {
        console.error('Error fetching asteroid data:', error);
        // Use fallback data if API fails
        asteroidData = getFallbackAsteroidData();
    }
}

function getFallbackAsteroidData() {
    // Fallback data in case NASA API is unavailable
    return [
        {
            id: "2000433",
            name: "433 Eros",
            diameter: 16840,
            velocity: "24.36 km/s",
            missDistance: "41,884,032 km",
            approachDate: "2023-11-05",
            approachTime: "08:15",
            orbitingBody: "Earth",
            magnitude: "10.4",
            hazardous: false
        },
        {
            id: "2001862",
            name: "1862 Apollo",
            diameter: 1500,
            velocity: "22.48 km/s",
            missDistance: "7,479,342 km",
            approachDate: "2023-11-12",
            approachTime: "14:30",
            orbitingBody: "Earth",
            magnitude: "16.2",
            hazardous: true
        },
        {
            id: "2002212",
            name: "2212 Hephaistos",
            diameter: 5700,
            velocity: "19.87 km/s",
            missDistance: "26,923,456 km",
            approachDate: "2023-11-18",
            approachTime: "03:45",
            orbitingBody: "Earth",
            magnitude: "14.9",
            hazardous: true
        },
        {
            id: "2003200",
            name: "3200 Phaethon",
            diameter: 5100,
            velocity: "35.76 km/s",
            missDistance: "17,952,384 km",
            approachDate: "2023-12-10",
            approachTime: "20:20",
            orbitingBody: "Earth",
            magnitude: "14.6",
            hazardous: false
        },
        {
            id: "2004179",
            name: "4179 Toutatis",
            diameter: 4500,
            velocity: "16.94 km/s",
            missDistance: "34,398,720 km",
            approachDate: "2023-12-25",
            approachTime: "11:10",
            orbitingBody: "Earth",
            magnitude: "15.3",
            hazardous: false
        }
    ];
}

function createEarth() {
    // Create Earth geometry
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    
    // Load Earth textures
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    const earthBump = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg');
    const earthSpec = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg');
    
    // Create realistic Earth material
    const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: earthBump,
        bumpScale: 0.05,
        specularMap: earthSpec,
        specular: new THREE.Color(0x333333),
        shininess: 5
    });
    
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
    
    // Add clouds
    const cloudGeometry = new THREE.SphereGeometry(5.1, 64, 64);
    const cloudTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png');
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.4
    });
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    
    // Store rotation speeds
    earth.userData = { rotationSpeed: 0.001 };
    clouds.userData = { rotationSpeed: 0.0005 };
}

function createAsteroids() {
    // Clear any existing asteroids first
    asteroids.forEach(asteroid => {
        scene.remove(asteroid);
        if (asteroid.userData.trajectory) {
            scene.remove(asteroid.userData.trajectory);
        }
    });
    asteroids = [];
    asteroidLabels = [];
    
    // Remove existing labels from DOM
    const existingLabels = document.querySelectorAll('.asteroid-label');
    existingLabels.forEach(label => label.remove());
    
    // Create asteroid field with trajectories coming from random directions
    for (let i = 0; i < asteroidData.length; i++) {
        const data = asteroidData[i];
        
        // Create random trajectory parameters
        // Asteroids will come from different directions in space
        const distance = 25 + Math.random() * 30; // Distance from Earth
        const inclination = (Math.random() - 0.5) * Math.PI; // Inclination angle
        const azimuth = Math.random() * Math.PI * 2; // Direction around Earth
        const orbitSpeed = 0.0002 + Math.random() * 0.0008; // Orbit speed
        const startAngle = Math.random() * Math.PI * 2; // Starting position in orbit
        
        // Create asteroid with rocky appearance
        const asteroid = createRockyAsteroid(data.diameter, data.hazardous);
        
        // Store trajectory parameters
        asteroid.userData = {
            ...data,
            distance: distance,
            inclination: inclination,
            azimuth: azimuth,
            orbitSpeed: orbitSpeed,
            angle: startAngle,
            originalScale: 1
        };
        
        // Set initial position
        updateAsteroidPosition(asteroid);
        
        // Add to scene and asteroids array
        scene.add(asteroid);
        asteroids.push(asteroid);
        
        // Create trajectory visualization
        createTrajectory(asteroid);
        
        // Create label for asteroid
        createAsteroidLabel(asteroid, data.name);
    }
    
    console.log(`Created ${asteroids.length} asteroids in 3D scene`);
}

function createRockyAsteroid(diameter, isHazardous) {
    // Scale down the size for visualization - make them smaller to handle many asteroids
    const size = Math.max(0.03, Math.min(0.2, diameter / 50000));
    
    // Create irregular asteroid geometry
    const geometry = new THREE.SphereGeometry(size, 6, 4);
    
    // Make the asteroid irregular by distorting vertices
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        // Add random noise to vertex positions
        positions[i] += (Math.random() - 0.5) * size * 0.7;
        positions[i + 1] += (Math.random() - 0.5) * size * 0.7;
        positions[i + 2] += (Math.random() - 0.5) * size * 0.7;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Create rocky material
    const material = new THREE.MeshPhongMaterial({
        color: isHazardous ? 0xff4444 : 0x886633,
        shininess: 10,
        flatShading: true
    });
    
    return new THREE.Mesh(geometry, material);
}

function createTrajectory(asteroid) {
    const { distance, inclination, azimuth } = asteroid.userData;
    
    // Create a circular trajectory
    const points = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Calculate position on circular orbit
        const x = distance * Math.cos(angle);
        const y = 0;
        const z = distance * Math.sin(angle);
        
        // Apply inclination (rotate around x-axis)
        const inclinedY = y * Math.cos(inclination) - z * Math.sin(inclination);
        const inclinedZ = y * Math.sin(inclination) + z * Math.cos(inclination);
        
        // Apply azimuth (rotate around y-axis)
        const finalX = x * Math.cos(azimuth) - inclinedZ * Math.sin(azimuth);
        const finalZ = x * Math.sin(azimuth) + inclinedZ * Math.cos(azimuth);
        
        points.push(new THREE.Vector3(finalX, inclinedY, finalZ));
    }
    
    const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create trajectory line
    const trajectoryMaterial = new THREE.LineBasicMaterial({
        color: asteroid.userData.hazardous ? 0xff6666 : 0x6666ff,
        transparent: true,
        opacity: 0.2 // Reduced opacity for better visibility with many asteroids
    });
    
    const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    scene.add(trajectory);
    
    // Store reference to trajectory
    asteroid.userData.trajectory = trajectory;
}

function updateAsteroidPosition(asteroid) {
    const { distance, inclination, azimuth, angle } = asteroid.userData;
    
    // Calculate position on circular orbit
    const x = distance * Math.cos(angle);
    const y = 0;
    const z = distance * Math.sin(angle);
    
    // Apply inclination (rotate around x-axis)
    const inclinedY = y * Math.cos(inclination) - z * Math.sin(inclination);
    const inclinedZ = y * Math.sin(inclination) + z * Math.cos(inclination);
    
    // Apply azimuth (rotate around y-axis)
    const finalX = x * Math.cos(azimuth) - inclinedZ * Math.sin(azimuth);
    const finalZ = x * Math.sin(azimuth) + inclinedZ * Math.cos(azimuth);
    
    asteroid.position.set(finalX, inclinedY, finalZ);
}

function createAsteroidLabel(asteroid, name) {
    const label = document.createElement('div');
    label.className = 'asteroid-label';
    label.innerHTML = `<div class="asteroid-icon"></div> ${name}`;
    document.getElementById('ui-overlay').appendChild(label);
    
    // Store reference to update position later
    asteroidLabels.push({
        element: label,
        asteroid: asteroid
    });
    
    // Add click event to show panel
    label.addEventListener('click', function() {
        showAsteroidPanel(asteroid.userData);
        focusOnAsteroid(asteroid);
    });
}

function focusOnAsteroid(asteroid) {
    // Store the focused asteroid
    focusedAsteroid = asteroid;
    currentAsteroidId = asteroid.userData.id;
    isFocusMode = true;
    
    // Show back button
    document.getElementById('back-btn').style.display = 'block';
    
    // Make the asteroid larger for better view
    const originalScale = asteroid.scale.x;
    originalAsteroidSizes.set(asteroid, originalScale);
    
    // Calculate the scale factor based on asteroid size
    const scaleFactor = Math.max(3, 8 / asteroid.userData.diameter * 10000);
    asteroid.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // Move camera to focus on the asteroid
    const asteroidPosition = asteroid.position.clone();
    
    // Calculate camera position (behind and above the asteroid)
    const cameraDistance = 2;
    const cameraPosition = asteroidPosition.clone().add(new THREE.Vector3(
        -cameraDistance,
        cameraDistance * 0.5,
        -cameraDistance
    ));
    
    // Animate camera movement
    animateCameraToPosition(cameraPosition, asteroidPosition);
}

function animateCameraToPosition(targetPosition, lookAtPosition) {
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    const duration = 1000; // 1 second
    
    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easedProgress = easeOutCubic(progress);
        
        // Interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
        
        // Make camera look at the asteroid
        controls.target.copy(lookAtPosition);
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }
    
    updateCamera();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function resetView() {
    isFocusMode = false;
    focusedAsteroid = null;
    currentAsteroidId = null;
    
    // Hide back button
    document.getElementById('back-btn').style.display = 'none';
    
    // Reset asteroid scale
    originalAsteroidSizes.forEach((scale, asteroid) => {
        asteroid.scale.set(scale, scale, scale);
    });
    originalAsteroidSizes.clear();
    
    // Reset camera to original position
    const targetPosition = new THREE.Vector3(0, 0, 15);
    const lookAtPosition = new THREE.Vector3(0, 0, 0);
    
    animateCameraToPosition(targetPosition, lookAtPosition);
}

function getAsteroidImage(asteroidId, asteroidName) {
    // Check if we have a specific image for this asteroid
    if (ASTEROID_IMAGES[asteroidId]) {
        return ASTEROID_IMAGES[asteroidId];
    }
    
    // For asteroids without specific images, generate a unique image based on asteroid properties
    const asteroidHash = simpleHash(asteroidId + asteroidName);
    
    // Use the hash to select from our fallback images
    const fallbackKeys = Object.keys(ASTEROID_IMAGES).filter(key => key.startsWith('fallback_'));
    
    // Reset used images if all have been used
    if (usedImages.size >= fallbackKeys.length) {
        usedImages.clear();
    }
    
    // Find an unused fallback image
    let selectedFallback;
    let attempts = 0;
    do {
        const fallbackIndex = (asteroidHash + attempts) % fallbackKeys.length;
        selectedFallback = fallbackKeys[fallbackIndex];
        attempts++;
        
        // Prevent infinite loop
        if (attempts > fallbackKeys.length * 2) {
            break;
        }
    } while (usedImages.has(selectedFallback));
    
    // Mark this image as used
    usedImages.add(selectedFallback);
    
    return ASTEROID_IMAGES[selectedFallback];
}

// Simple hash function to generate consistent numbers from strings
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

function showAsteroidPanel(data) {
    const panel = document.getElementById('asteroid-panel');
    const hazardIndicator = document.getElementById('hazard-indicator');
    const asteroidVisualization = document.getElementById('asteroid-visualization');
    
    // Update panel content
    document.getElementById('asteroid-name').textContent = data.name;
    document.getElementById('diameter').textContent = `${(data.diameter).toFixed(2)} m`;
    document.getElementById('velocity').textContent = data.velocity;
    document.getElementById('miss-distance').textContent = data.missDistance;
    document.getElementById('orbiting-body').textContent = data.orbitingBody;
    document.getElementById('approach-date').textContent = data.approachDate;
    document.getElementById('approach-time').textContent = data.approachTime;
    document.getElementById('magnitude').textContent = data.magnitude;
    
    // Update hazard indicator
    if (data.hazardous) {
        hazardIndicator.textContent = "Potentially Hazardous";
        hazardIndicator.className = "hazardous";
    } else {
        hazardIndicator.textContent = "Non-Hazardous";
        hazardIndicator.className = "safe";
    }
    
    // Get asteroid image
    const asteroidImageUrl = getAsteroidImage(data.id, data.name);
    
    // Update asteroid visualization with real image
    asteroidVisualization.innerHTML = `
        <img src="${asteroidImageUrl}" alt="${data.name}" 
             style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"
             onerror="this.onerror=null; this.src='https://images-assets.nasa.gov/image/PIA00268/PIA00268~medium.jpg'">
        <div id="scan-animation">
            <div class="scan-line"></div>
            <div class="scan-pulse"></div>
        </div>
    `;
    
    // Reset scan button and hide composition/value sections
    document.getElementById('scan-button').disabled = false;
    document.getElementById('scan-button').textContent = "Scan Asteroid Composition";
    document.getElementById('scan-progress').classList.remove('scanning');
    document.getElementById('composition-section').style.display = 'none';
    document.getElementById('value-section').style.display = 'none';
    
    // Show panel
    panel.classList.add('active');
}

async function scanAsteroid(asteroidId) {
    // Disable scan button and show progress
    const scanButton = document.getElementById('scan-button');
    const scanProgress = document.getElementById('scan-progress');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    scanButton.disabled = true;
    scanButton.textContent = "Scanning...";
    scanProgress.classList.add('scanning');
    
    // Start scan animation
    document.getElementById('scan-animation').classList.add('scanning');
    
    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 10) {
        progressFill.style.width = `${i}%`;
        progressText.textContent = `Scanning: ${i}%`;
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    try {
        // Fetch composition data from JPL SBDB API
        const compositionData = await fetchCompositionData(asteroidId);
        
        // Calculate asteroid value based on composition and size
        const asteroidValue = calculateAsteroidValue(compositionData, getAsteroidSize(asteroidId));
        
        // Update UI with composition and value
        updateCompositionUI(compositionData, asteroidValue);
        
        // Hide scan progress and show results
        scanProgress.classList.remove('scanning');
        document.getElementById('composition-section').style.display = 'block';
        document.getElementById('value-section').style.display = 'block';
        
        // Re-enable scan button
        scanButton.disabled = false;
        scanButton.textContent = "Scan Complete";
        
    } catch (error) {
        console.error('Error scanning asteroid:', error);
        
        // Show error message
        progressText.textContent = "Scan failed. Try again.";
        progressFill.style.width = "0%";
        
        // Re-enable scan button
        scanButton.disabled = false;
        scanButton.textContent = "Scan Asteroid Composition";
    } finally {
        // Stop scan animation
        document.getElementById('scan-animation').classList.remove('scanning');
    }
}

async function fetchCompositionData(asteroidId) {
    // For demonstration, we'll use mock data since the JPL SBDB API doesn't always return composition data
    // In a real application, you would make a request to: 
    // https://ssd-api.jpl.nasa.gov/sbdb.api?sstr={asteroidId}
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock composition data based on asteroid type
    const asteroidTypes = [
        {
            type: "Carbonaceous (C-type)",
            composition: [
                { name: "Carbon", percentage: 20 },
                { name: "Silicon", percentage: 15 },
                { name: "Iron", percentage: 10 },
                { name: "Magnesium", percentage: 8 },
                { name: "Water Ice", percentage: 5 },
                { name: "Other", percentage: 42 }
            ]
        },
        {
            type: "Silicate (S-type)",
            composition: [
                { name: "Silicon", percentage: 25 },
                { name: "Iron", percentage: 18 },
                { name: "Magnesium", percentage: 12 },
                { name: "Nickel", percentage: 5 },
                { name: "Aluminum", percentage: 4 },
                { name: "Other", percentage: 36 }
            ]
        },
        {
            type: "Metallic (M-type)",
            composition: [
                { name: "Iron", percentage: 45 },
                { name: "Nickel", percentage: 15 },
                { name: "Cobalt", percentage: 5 },
                { name: "Platinum", percentage: 2 },
                { name: "Iridium", percentage: 1 },
                { name: "Other", percentage: 32 }
            ]
        }
    ];
    
    // Select a random type for demonstration
    const randomType = asteroidTypes[Math.floor(Math.random() * asteroidTypes.length)];
    
    return randomType;
}

function getAsteroidSize(asteroidId) {
    const asteroid = asteroidData.find(a => a.id === asteroidId);
    return asteroid ? asteroid.diameter : 1000; // Default to 1000m if not found
}

function calculateAsteroidValue(compositionData, diameter) {
    // Calculate volume (assuming spherical asteroid)
    const radius = diameter / 2;
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    
    // Define approximate market values per kg for different materials (in USD)
    const materialValues = {
        "Iron": 0.1,
        "Nickel": 15,
        "Cobalt": 33,
        "Platinum": 30000,
        "Iridium": 160000,
        "Silicon": 2,
        "Magnesium": 3,
        "Aluminum": 2,
        "Carbon": 0.5,
        "Water Ice": 0.1
    };
    
    // Calculate total value based on composition
    let totalValue = 0;
    const density = 2000; // Average asteroid density in kg/m³
    
    compositionData.composition.forEach(material => {
        const materialValue = materialValues[material.name] || 1; // Default to $1/kg if unknown
        const materialMass = volume * density * (material.percentage / 100);
        totalValue += materialMass * materialValue;
    });
    
    return totalValue;
}

function updateCompositionUI(compositionData, asteroidValue) {
    const compositionSection = document.getElementById('composition-data');
    const valueElement = document.getElementById('asteroid-value');
    
    // Clear previous composition data
    compositionSection.innerHTML = '';
    
    // Add asteroid type
    const typeElement = document.createElement('div');
    typeElement.className = 'composition-item';
    typeElement.innerHTML = `
        <div class="composition-name"><strong>Type:</strong> ${compositionData.type}</div>
    `;
    compositionSection.appendChild(typeElement);
    
    // Add composition breakdown
    compositionData.composition.forEach(material => {
        const itemElement = document.createElement('div');
        itemElement.className = 'composition-item';
        itemElement.innerHTML = `
            <div class="composition-name">${material.name}</div>
            <div class="composition-percentage">${material.percentage}%</div>
        `;
        compositionSection.appendChild(itemElement);
    });
    
    // Format and display asteroid value
    let formattedValue;
    if (asteroidValue >= 1e12) {
        formattedValue = `$${(asteroidValue / 1e12).toFixed(2)} trillion`;
    } else if (asteroidValue >= 1e9) {
        formattedValue = `$${(asteroidValue / 1e9).toFixed(2)} billion`;
    } else if (asteroidValue >= 1e6) {
        formattedValue = `$${(asteroidValue / 1e6).toFixed(2)} million`;
    } else {
        formattedValue = `$${asteroidValue.toLocaleString()}`;
    }
    
    valueElement.textContent = formattedValue;
}

function updateUI() {
    // Update stats
    document.getElementById('total-count').textContent = asteroidData.length;
    
    const hazardousCount = asteroidData.filter(a => a.hazardous).length;
    document.getElementById('hazard-count').textContent = hazardousCount;
    
    // Find closest approach date
    if (asteroidData.length > 0) {
        const closest = asteroidData.reduce((prev, curr) => 
            new Date(curr.approachDate) < new Date(prev.approachDate) ? curr : prev
        );
        document.getElementById('closest-date').textContent = closest.approachDate;
    } else {
        document.getElementById('closest-date').textContent = "N/A";
    }
}

function updateLabels() {
    // Update positions of asteroid labels based on 3D positions
    for (const label of asteroidLabels) {
        const vector = label.asteroid.position.clone();
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        
        // Only show labels if they're in front of the camera
        if (vector.z > 0 && vector.z < 1) {
            label.element.style.display = 'flex';
            label.element.style.left = x + 'px';
            label.element.style.top = y + 'px';
        } else {
            label.element.style.display = 'none';
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate Earth
    if (earth) {
        earth.rotation.y += earth.userData.rotationSpeed;
    }
    
    // Update asteroid positions along their trajectories
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        
        // Only update orbital movement if not in focus mode
        if (!isFocusMode || asteroid !== focusedAsteroid) {
            asteroid.userData.angle += asteroid.userData.orbitSpeed;
            updateAsteroidPosition(asteroid);
        }
        
        // Rotate asteroid for more natural appearance
        asteroid.rotation.x += 0.01;
        asteroid.rotation.y += 0.01;
    }
    
    // Update controls
    if (controls) {
        controls.update();
    }
    
    // Update labels
    updateLabels();
    
    // Render the scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the application when the page loads
window.addEventListener('load', init);