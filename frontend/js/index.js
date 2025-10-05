// Enhanced Learning Manager with interactive elements
const learningManager = {
    currentStep: 1,
    totalSteps: 7,
    quizQuestions: [
        {
            question: "Which factor has the greatest influence on an asteroid's impact energy?",
            options: ["Asteroid diameter", "Impact velocity", "Approach angle", "Asteroid composition"],
            correct: 1,
            explanation: "Velocity has the greatest impact because energy increases with the square of velocity (E=½mv²). Doubling velocity quadruples the energy, while doubling diameter only increases mass by 8x (for a sphere)."
        },
        {
            question: "What is the primary reason some asteroids are considered 'potentially hazardous'?",
            options: ["They are very large", "They come close to Earth's orbit", "They are made of rare minerals", "They have unusual shapes"],
            correct: 1,
            explanation: "Asteroids are classified as potentially hazardous based on their size and how close their orbits come to Earth's orbit, not just their size alone."
        },
        {
            question: "What happens when an asteroid impacts an ocean?",
            options: ["It creates a massive tsunami", "It immediately evaporates", "It sinks without effect", "It bounces off the surface"],
            correct: 0,
            explanation: "Ocean impacts create massive tsunamis that can travel across entire ocean basins, causing devastation to coastal areas thousands of kilometers away."
        }
    ],
    currentQuestion: 0,
    
    init: function() {
        this.generateProgressDots();
        this.setupEventListeners();
        this.setupInteractiveDemos();
    },
    
    setupEventListeners: function() {
        document.getElementById('learn-icon').addEventListener('click', () => this.toggleLearningPanel());
        document.getElementById('close-learning-panel').addEventListener('click', () => this.closeLearningPanel());
        
        // Demo sliders
        document.getElementById('angle-slider-demo').addEventListener('input', (e) => this.updateTrajectoryDemo());
        document.getElementById('diameter-slider-demo').addEventListener('input', (e) => this.updateEnergyDemo());
        document.getElementById('velocity-slider-demo').addEventListener('input', (e) => this.updateEnergyDemo());
        document.getElementById('challenge-diameter-slider').addEventListener('input', (e) => this.updateChallenge());
        document.getElementById('challenge-velocity-slider').addEventListener('input', (e) => this.updateChallenge());
    },
    
    setupInteractiveDemos: function() {
        // Initialize trajectory demo
        this.updateTrajectoryDemo();
        
        // Initialize energy demo
        this.updateEnergyDemo();
        
        // Initialize challenge
        this.updateChallenge();
        
        // Initialize quiz
        this.loadQuizQuestion();
    },
    
    updateTrajectoryDemo: function() {
        const angle = parseInt(document.getElementById('angle-slider-demo').value);
        document.getElementById('angle-value-demo').textContent = `${angle}°`;
        
        const asteroid = document.getElementById('trajectory-asteroid');
        const trajectory = document.getElementById('trajectory-path');
        const impactZone = document.getElementById('impact-zone');
        
        // Clear previous trajectory
        trajectory.innerHTML = '';
        
        // Calculate trajectory based on angle - FIXED calculation
        const startX = 100;
        const startY = 20;
        const endX = 50;
        const endY = 50;
        
        // Create SVG path for trajectory
        const svgNS = "http://www.w3.org/2000/svg";
        const path = document.createElementNS(svgNS, "path");
        
        // CORRECTED: Higher angles (closer to 90) should have steeper approach
        const controlX = 75;
        const controlY = 20 + (angle / 90) * 30; // Fixed calculation
        
        path.setAttribute("d", `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`);
        path.setAttribute("stroke", "#4facfe");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-dasharray", "5,5");
        
        trajectory.appendChild(path);
        
        // Position asteroid along trajectory
        const progress = 0.7;
        const t = 1 - progress;
        const x = (1-t)*(1-t)*startX + 2*(1-t)*t*controlX + t*t*endX;
        const y = (1-t)*(1-t)*startY + 2*(1-t)*t*controlY + t*t*endY;
        
        asteroid.style.left = `${x}%`;
        asteroid.style.top = `${y}%`;
        
        // CORRECTED: Update impact zone visibility
        if (angle > 70) {
            impactZone.style.borderColor = "rgba(255, 107, 107, 0.7)";
            impactZone.style.boxShadow = "0 0 10px rgba(255, 107, 107, 0.5)";
        } else if (angle > 40) {
            impactZone.style.borderColor = "rgba(255, 200, 0, 0.7)";
            impactZone.style.boxShadow = "0 0 10px rgba(255, 200, 0, 0.5)";
        } else {
            impactZone.style.borderColor = "rgba(76, 175, 80, 0.7)";
            impactZone.style.boxShadow = "0 0 10px rgba(76, 175, 80, 0.5)";
        }
    },
    
    testTrajectory: function() {
        const angle = parseInt(document.getElementById('angle-slider-demo').value);
        const asteroid = document.getElementById('trajectory-asteroid');
        const impactZone = document.getElementById('impact-zone');
        
        // Reset asteroid to starting position
        const startX = 100;
        const startY = 20;
        asteroid.style.left = `${startX}%`;
        asteroid.style.top = `${startY}%`;
        
        // Animate asteroid along trajectory
        let progress = 0;
        const animation = setInterval(() => {
            progress += 0.02;
            if (progress > 1) {
                clearInterval(animation);
                
                // CORRECTED: Check if impact occurred - higher angles should impact
                if (angle > 70) { // Changed from 60 to 70 for better threshold
                    this.showImpactEffect(impactZone);
                }
                return;
            }
            
            const startX = 100;
            const startY = 20;
            const endX = 50;
            const endY = 50;
            const controlX = 75;
            const controlY = 20 + (angle / 90) * 30; // Fixed calculation
            
            // CORRECTED Bezier curve calculation
            const x = Math.pow(1-progress, 2) * startX + 2 * (1-progress) * progress * controlX + Math.pow(progress, 2) * endX;
            const y = Math.pow(1-progress, 2) * startY + 2 * (1-progress) * progress * controlY + Math.pow(progress, 2) * endY;
            
            asteroid.style.left = `${x}%`;
            asteroid.style.top = `${y}%`;
        }, 20);
    },
    
    showImpactEffect: function(impactZone) {
        // Create blast effect
        const blast = document.createElement('div');
        blast.className = 'blast-wave';
        blast.style.width = '0px';
        blast.style.height = '0px';
        blast.style.left = '50%';
        blast.style.top = '50%';
        blast.style.opacity = '1';
        
        impactZone.parentElement.appendChild(blast);
        
        // Animate blast wave
        let size = 0;
        const blastAnimation = setInterval(() => {
            size += 5;
            blast.style.width = `${size}px`;
            blast.style.height = `${size}px`;
            
            if (size > 200) {
                clearInterval(blastAnimation);
                blast.style.opacity = '0';
                setTimeout(() => {
                    blast.remove();
                }, 1000);
            }
        }, 30);
    },
    
    updateEnergyDemo: function() {
        const diameter = parseFloat(document.getElementById('diameter-slider-demo').value);
        const velocity = parseFloat(document.getElementById('velocity-slider-demo').value);
        
        document.getElementById('diameter-value-demo').textContent = `${diameter.toFixed(1)} km`;
        document.getElementById('velocity-value-demo').textContent = `${velocity} km/s`;
        
        // Update asteroid size
        const asteroid = document.getElementById('energy-asteroid');
        const size = Math.max(10, diameter * 10);
        asteroid.style.width = `${size}px`;
        asteroid.style.height = `${size}px`;
        
        // Update velocity indicator
        const indicator = document.getElementById('velocity-indicator');
        indicator.style.width = `${velocity * 2}px`;
        indicator.style.left = `${50 - (velocity * 2) / 2}%`;
        indicator.style.top = '50%';
        
        // Calculate and display energy
        const energy = this.calculateEnergy(diameter, velocity);
        document.getElementById('energy-value').textContent = Math.round(energy).toLocaleString();
    },
    
    calculateEnergy: function(diameter, velocity) {
        // Simplified energy calculation (kinetic energy)
        // Mass = volume * density (assuming spherical asteroid with density of 3000 kg/m³)
        const radius = diameter * 500; // Convert km to meters (half diameter)
        const volume = (4/3) * Math.PI * Math.pow(radius, 3);
        const mass = volume * 3000; // kg
        
        // Kinetic energy = 0.5 * m * v^2
        const energyJoules = 0.5 * mass * Math.pow(velocity * 1000, 2);
        
        // Convert to megatons of TNT (1 megaton = 4.184e15 joules)
        return energyJoules / 4.184e15;
    },
    
    updateChallenge: function() {
        const diameter = parseFloat(document.getElementById('challenge-diameter-slider').value);
        const velocity = parseFloat(document.getElementById('challenge-velocity-slider').value);
        
        document.getElementById('challenge-diameter').textContent = `${diameter.toFixed(1)} km`;
        document.getElementById('challenge-velocity').textContent = `${velocity} km/s`;
    },
    
    runChallenge: function() {
        const diameter = parseFloat(document.getElementById('challenge-diameter-slider').value);
        const velocity = parseFloat(document.getElementById('challenge-velocity-slider').value);
        const energy = this.calculateEnergy(diameter, velocity);
        
        const result = document.getElementById('challenge-result');
        
        // Check if parameters meet challenge criteria
        const diameterOk = diameter >= 1.0 && diameter <= 2.5;
        const velocityOk = velocity >= 15 && velocity <= 25;
        const energyOk = energy >= 50000 && energy <= 200000;
        
        if (diameterOk && velocityOk && energyOk) {
            result.className = 'challenge-result success';
            result.innerHTML = `
                <strong>Success! 🎉</strong><br>
                You created a regional impact scenario with:<br>
                - Diameter: ${diameter.toFixed(1)} km<br>
                - Velocity: ${velocity} km/s<br>
                - Energy: ${Math.round(energy).toLocaleString()} MT<br>
                This would cause significant regional damage but wouldn't threaten civilization.
            `;
            result.style.display = 'block';
        } else {
            result.className = 'challenge-result failure';
            let issues = [];
            
            if (!diameterOk) issues.push("Diameter outside target range (1.0-2.5 km)");
            if (!velocityOk) issues.push("Velocity outside target range (15-25 km/s)");
            if (!energyOk) {
                const energyText = energy < 50000 ? 'below' : 'above';
                issues.push(`Energy ${energyText} target range (50,000-200,000 MT)`);
            }
            
            result.innerHTML = `
                <strong>Needs Adjustment ⚠️</strong><br>
                Your impact scenario doesn't meet the challenge criteria:<br>
                - ${issues.join('<br>- ')}<br>
                Try adjusting the parameters and test again!
            `;
            result.style.display = 'block';
        }
    },
    
    loadQuizQuestion: function() {
        const question = this.quizQuestions[this.currentQuestion];
        document.getElementById('quiz-question').textContent = question.question;
        
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            optionElement.textContent = option;
            optionElement.onclick = () => this.checkAnswer(index, optionElement);
            optionsContainer.appendChild(optionElement);
        });
        
        // Clear feedback
        document.getElementById('quiz-feedback').innerHTML = '';
        document.getElementById('quiz-feedback').style.display = 'none';
    },
    
    checkAnswer: function(selectedIndex, element) {
        const question = this.quizQuestions[this.currentQuestion];
        const options = document.querySelectorAll('#quiz-options .quiz-option');
        const feedback = document.getElementById('quiz-feedback');
        
        // Reset all options
        options.forEach(opt => {
            opt.classList.remove('correct', 'incorrect');
        });
        
        // Mark correct and incorrect answers
        options[question.correct].classList.add('correct');
        if (selectedIndex !== question.correct) {
            element.classList.add('incorrect');
        }
        
        // Show feedback
        feedback.className = selectedIndex === question.correct ? 'quiz-feedback correct' : 'quiz-feedback incorrect';
        feedback.innerHTML = selectedIndex === question.correct ? 
            `<strong>Correct! ✅</strong><br>${question.explanation}` :
            `<strong>Incorrect ❌</strong><br>The correct answer is: ${question.options[question.correct]}<br><br>${question.explanation}`;
        feedback.style.display = 'block';
    },
    
    toggleLearningPanel: function() {
        const panel = document.getElementById('learning-panel');
        const isVisible = panel.style.display === 'block';
        
        // Close all panels first
        this.closeAllPanels();
        
        if (!isVisible) {
            panel.style.display = 'block';
            document.getElementById('learn-icon').classList.add('active');
            this.showStep(1);
        }
    },
    
    closeLearningPanel: function() {
        document.getElementById('learning-panel').style.display = 'none';
        document.getElementById('learn-icon').classList.remove('active');
    },
    
    closeAllPanels: function() {
        document.querySelectorAll('.minimal-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        document.querySelectorAll('.ui-icon').forEach(icon => {
            icon.classList.remove('active');
        });
    },
    
    showStep: function(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.learning-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show the current step
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        
        // Update progress dots
        this.updateProgressDots(stepNumber);
        
        // Update current step
        this.currentStep = stepNumber;
        
        // Special handling for specific steps
        this.handleStepSpecificContent(stepNumber);
    },
    
    nextStep: function() {
        if (this.currentStep < this.totalSteps) {
            // If we're on the quiz step, advance to the next question
            if (this.currentStep === 5 && this.currentQuestion < this.quizQuestions.length - 1) {
                this.currentQuestion++;
                this.loadQuizQuestion();
                return;
            }
            
            this.showStep(this.currentStep + 1);
            
            // Reset quiz if we're moving away from it
            if (this.currentStep === 5) {
                this.currentQuestion = 0;
                this.loadQuizQuestion();
            }
        }
    },
    
    previousStep: function() {
        if (this.currentStep > 1) {
            // If we're on the quiz step, go to the previous question
            if (this.currentStep === 5 && this.currentQuestion > 0) {
                this.currentQuestion--;
                this.loadQuizQuestion();
                return;
            }
            
            this.showStep(this.currentStep - 1);
            
            // Reset quiz if we're moving away from it
            if (this.currentStep === 5) {
                this.currentQuestion = 0;
                this.loadQuizQuestion();
            }
        }
    },
    
    generateProgressDots: function() {
        const progressContainer = document.getElementById('learning-progress');
        progressContainer.innerHTML = '';
        
        for (let i = 1; i <= this.totalSteps; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            dot.dataset.step = i;
            dot.addEventListener('click', () => this.showStep(i));
            progressContainer.appendChild(dot);
        }
        
        this.updateProgressDots(1);
    },
    
    updateProgressDots: function(stepNumber) {
        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            if (index + 1 <= stepNumber) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    },
    
    handleStepSpecificContent: function(stepNumber) {
        // Clear any previous highlights
        document.querySelectorAll('.interactive-element').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        switch(stepNumber) {
            case 2:
                this.createAsteroidSizeVisual();
                break;
            case 3:
                // Just highlight the icon without opening the panel
                this.highlightAsteroidIcon();
                break;
            case 4:
                // Just highlight the icon without opening the panel
                this.highlightControlsIcon();
                break;
            case 5:
                // Just highlight the icon without opening the panel
                this.highlightControlsIcon();
                break;
            case 6:
                // FIXED: Reset challenge result when step is loaded
                this.resetChallengeResult();
                this.highlightSimulationButton();
                break;
        }
    },
    
    // FIXED: Reset challenge result when step is loaded
    resetChallengeResult: function() {
        const result = document.getElementById('challenge-result');
        result.style.display = 'none';
        result.className = 'challenge-result';
        result.innerHTML = '';
    },
    
    createAsteroidSizeVisual: function() {
        const visualContainer = document.getElementById('asteroid-size-visual');
        visualContainer.innerHTML = '';
        
        // Create a simple visualization of asteroid sizes
        const sizes = [
            { name: 'Small', diameter: 10, color: '#4facfe' },
            { name: 'Medium', diameter: 30, color: '#00f2fe' },
            { name: 'Large', diameter: 60, color: '#ff6b6b' }
        ];
        
        sizes.forEach(size => {
            const asteroid = document.createElement('div');
            asteroid.style.width = `${size.diameter}px`;
            asteroid.style.height = `${size.diameter}px`;
            asteroid.style.borderRadius = '50%';
            asteroid.style.backgroundColor = size.color;
            asteroid.style.margin = '0 15px';
            asteroid.style.display = 'flex';
            asteroid.style.alignItems = 'center';
            asteroid.style.justifyContent = 'center';
            asteroid.style.fontSize = '10px';
            asteroid.style.color = 'white';
            asteroid.title = `${size.name} Asteroid (${size.diameter}m)`;
            
            visualContainer.appendChild(asteroid);
        });
    },
    
    // Just highlight the icon without opening the panel
    highlightAsteroidIcon: function() {
        const asteroidIcon = document.getElementById('asteroids-icon');
        asteroidIcon.classList.add('interactive-element', 'highlighted');
    },
    
    // Just highlight the icon without opening the panel
    highlightControlsIcon: function() {
        const controlsIcon = document.getElementById('controls-icon');
        controlsIcon.classList.add('interactive-element', 'highlighted');
    },
    
    highlightSimulationButton: function() {
        const simulateBtn = document.getElementById('simulate-btn');
        if (simulateBtn) {
            simulateBtn.classList.add('interactive-element', 'highlighted');
        }
    },
    
    completeTutorial: function() {
        this.closeLearningPanel();
        if (typeof simulator !== 'undefined') {
            simulator.updateStatus('🎓 Tutorial completed! Try experimenting with the simulation.');
        }
    }
};

// ULTIMATE Asteroid Impact Simulator Class
class UltimateAsteroidImpactSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.earth = null;
        this.asteroid = null;
        this.stars = null;
        this.selectedAsteroid = null;
        this.isSimulating = false;
        this.backendUrl = 'https://asteroidsbelikebackend.onrender.com';
        this.impactMarker = null;
        this.trajectoryLine = null;
        this.asteroidTrail = [];
        this.trailPoints = [];
        this.stats = null;
        this.zoomLevel = 1.0;
        this.maxZoom = 3.0;
        this.minZoom = 0.3;
        this.currentImpactResults = null;
        this.lastAsteroidDiameter = 1.0;
        
        this.earthTextures = {
            surface: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
            specular: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
            normal: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
            clouds: 'https://threejs.org/examples/textures/planets/earth_clouds.png'
        };
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadAsteroids();
        // this.hideLoading();
        
        // Initialize learning manager
        learningManager.init();
    }
    
    // hideLoading() {
    //     setTimeout(() => {
    //         document.getElementById('loading').style.display = 'none';
    //         this.updateStatus('🟢 Ultimate Simulator Ready - Advanced Physics Engine Active');
    //     }, 2000);
    // }

    saveSimulationData(results) {
        try {
            // Get existing data or initialize empty array
            const existingData = JSON.parse(localStorage.getItem('asteroidSimulations')) || [];
            
            // Add timestamp and unique ID to the results
            const simulationData = {
                ...results,
                id: Date.now(), // Use timestamp as unique ID
                timestamp: new Date().toISOString(),
                simulationParameters: {
                    diameter: parseFloat(document.getElementById('diameter-slider').value),
                    velocity: parseFloat(document.getElementById('velocity-slider').value),
                    angle: parseFloat(document.getElementById('angle-slider').value)
                }
            };
            
            // Add to beginning of array (newest first)
            existingData.unshift(simulationData);
            
            // Keep only last 50 simulations to prevent storage issues
            const trimmedData = existingData.slice(0, 50);
            
            // Save back to localStorage
            localStorage.setItem('asteroidSimulations', JSON.stringify(trimmedData));
            
            console.log('Simulation data saved successfully');
            
        } catch (error) {
            console.error('Failed to save simulation data:', error);
        }
    }
    
    setupEventListeners() {
        // Navigation
        document.getElementById('enter-simulation').addEventListener('click', () => this.enterSimulation());
        document.getElementById('simulate-btn').addEventListener('click', () => this.simulateImpact());

        // Add visualization button listener
        document.getElementById('enter-visualization').addEventListener('click', () => this.enterVisualization());
        
        // Panel controls
        document.getElementById('asteroids-icon').addEventListener('click', () => this.togglePanel('asteroids-panel'));
        document.getElementById('controls-icon').addEventListener('click', () => this.togglePanel('controls-panel'));
        document.getElementById('info-icon').addEventListener('click', () => this.showInfo());
        
        document.getElementById('close-asteroids-panel').addEventListener('click', () => this.closePanel('asteroids-panel'));
        document.getElementById('close-controls-panel').addEventListener('click', () => this.closePanel('controls-panel'));
        
        // Full screen
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        
        // Analysis buttons - UPDATED FOR REDIRECTS
        document.getElementById('detail-analysis-btn').addEventListener('click', () => this.showDetailedAnalysis());
        document.getElementById('mitigation-btn').addEventListener('click', () => this.showMitigationPlan());
        
        // Real-time control updates
        this.setupSlider('diameter-slider', 'diameter-value', 'km', 2);
        this.setupSlider('velocity-slider', 'velocity-value', 'km/s', 1);
        this.setupSlider('angle-slider', 'angle-value', '°', 0);
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    enterVisualization() {
        window.location.href = 'visualization.html';
    }

    updateAsteroidPositionBasedOnAngle(angle) {
        if (!this.asteroid) return;
        
        const distance = 100; // Starting distance from Earth
        const angleRad = THREE.MathUtils.degToRad(angle);
        
        // Calculate position based on approach angle - FIXED: Proper 3D positioning
        const x = Math.sin(angleRad) * distance;
        const y = Math.cos(angleRad) * distance * 0.3; // Reduced vertical component
        const z = Math.cos(angleRad) * distance;
        
        this.asteroid.position.set(x, y, z);
        
        // Make asteroid look at Earth
        this.asteroid.lookAt(0, 0, 0);
        
        // Clear any existing trail
        this.clearTrail();
        
        // Update trail starting point
        this.updateTrail();
    }

    updateAsteroidVisuals() {
        if (!this.asteroid) return;
        
        const diameter = parseFloat(document.getElementById('diameter-slider').value);
        const angle = parseFloat(document.getElementById('angle-slider').value);
        
        // Calculate proper scale factor relative to Earth - FIXED: Dynamic scaling
        const earthDiameter = 30; // Earth is 30 units in diameter in our scene
        const asteroidScale = (diameter / 12742) * earthDiameter * 50; // Scale factor to make asteroid visible
        
        // Update asteroid size - FIXED: Actually change the scale
        this.asteroid.scale.set(asteroidScale, asteroidScale, asteroidScale);
        
        // Update position based on new angle
        this.updateAsteroidPositionBasedOnAngle(angle);
        
        // Update trail
        this.updateTrail();
        
        console.log(`Asteroid diameter: ${diameter} km, Scale: ${asteroidScale}`); // Debug log
    }
    
    setupSlider(sliderId, valueId, unit, decimals) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueDisplay.textContent = `${value.toFixed(decimals)} ${unit}`;
            
            // Special handling for diameter slider - FIXED: Recreate asteroid when diameter changes significantly
            if (sliderId === 'diameter-slider') {
                const currentDiameter = parseFloat(document.getElementById('diameter-slider').value);
                
                // Recreate asteroid if diameter changes significantly for better visual representation
                if (this.asteroid && Math.abs(currentDiameter - this.lastAsteroidDiameter) > 0.5) {
                    this.createAdvancedAsteroid(currentDiameter);
                    this.lastAsteroidDiameter = currentDiameter;
                } else {
                    this.updateAsteroidVisuals();
                }
            } else {
                this.updateAsteroidVisuals();
            }
        });
        
        // Initialize last diameter tracking
        if (sliderId === 'diameter-slider') {
            this.lastAsteroidDiameter = parseFloat(slider.value);
        }
    }
    
    showDetailedAnalysis() {
        if (!this.currentImpactResults) {
            alert('Please run a simulation first to see detailed analysis.');
            return;
        }
        
        // Store data for the new page
        localStorage.setItem('impactData', JSON.stringify(this.currentImpactResults));
        
        // Redirect to impact analysis page
        window.open('impact-analysis.html?data=' + encodeURIComponent(JSON.stringify(this.currentImpactResults)), '_blank');
    }
    
    showMitigationPlan() {
        if (!this.currentImpactResults) {
            alert('Please run a simulation first to see mitigation plans.');
            return;
        }
        
        // Store data for the new page
        localStorage.setItem('impactData', JSON.stringify(this.currentImpactResults));
        
        // Redirect to mitigation plan page
        window.open('mitigation-plan.html?data=' + encodeURIComponent(JSON.stringify(this.currentImpactResults)), '_blank');
    }
    
    zoomIn() {
        if (this.zoomLevel < this.maxZoom) {
            this.zoomLevel *= 1.2;
            this.updateCameraZoom();
        }
    }
    
    zoomOut() {
        if (this.zoomLevel > this.minZoom) {
            this.zoomLevel /= 1.2;
            this.updateCameraZoom();
        }
    }
    
    updateCameraZoom() {
        if (this.camera) {
            // Adjust camera position based on zoom level
            const basePosition = new THREE.Vector3(0, 40, 80);
            const zoomedPosition = basePosition.multiplyScalar(1 / this.zoomLevel);
            this.camera.position.copy(zoomedPosition);
            
            // Update controls
            if (this.controls) {
                this.controls.update();
            }
        }
    }
    
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        const isVisible = panel.style.display === 'block';
        
        // Close all panels first
        this.closeAllPanels();
        
        if (!isVisible) {
            panel.style.display = 'block';
            const iconId = panelId.replace('-panel', '-icon');
            const icon = document.getElementById(iconId);
            if (icon) {
                icon.classList.add('active');
            }
            
            // Special handling for controls panel
            if (panelId === 'controls-panel') {
                this.showControlsPanel();
            }
        }
    }
    
    closePanel(panelId) {
        document.getElementById(panelId).style.display = 'none';
        document.getElementById(panelId.replace('-panel', '-icon')).classList.remove('active');
    }
    
    closeAllPanels() {
        document.querySelectorAll('.minimal-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        document.querySelectorAll('.ui-icon').forEach(icon => {
            icon.classList.remove('active');
        });
    }
    
    showInfo() {
        alert('Ultimate Asteroid Impact Simulator\n\n• Real NASA asteroid data\n• Advanced physics engine\n• Realistic 3D visualization\n• Impact effects simulation\n• Detailed analysis and mitigation plans\n• Interactive learning experience\n\nUse mouse to orbit, scroll to zoom. Use + and - buttons to adjust zoom level.');
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    handleKeyboard(event) {
        if (!this.scene) return;
        
        switch(event.key) {
            case ' ':
                event.preventDefault();
                if (this.asteroid && !this.isSimulating) {
                    this.simulateImpact();
                }
                break;
            case 'Escape':
                this.closeAllPanels();
                break;
            case 'r':
            case 'R':
                if (this.controls) this.controls.reset();
                break;
            case '+':
            case '=':
                this.zoomIn();
                break;
            case '-':
            case '_':
                this.zoomOut();
                break;
        }
    }
    
    async loadAsteroids() {
        this.updateStatus('🛰️ Loading real-time NASA asteroid data...');
        
        try {
            const response = await fetch(`${this.backendUrl}/api/asteroids`);
            const data = await response.json();
            
            if (data.success) {
                this.displayAsteroids(data.asteroids);
                document.getElementById('data-source').textContent = data.data_source;
                this.updateStatus(`✅ Loaded ${data.count} real asteroids from NASA`);
            } else {
                throw new Error(data.error || 'Failed to load asteroid data');
            }
        } catch (error) {
            console.error('Failed to load asteroids:', error);
            this.displayAsteroids(this.getSampleAsteroids());
            document.getElementById('data-source').textContent = 'Sample Data (NASA API Unavailable)';
            this.updateStatus('⚠️ Using sample data (NASA API unavailable)');
        }
    }
    
    displayAsteroids(asteroids) {
        const container = document.getElementById('asteroid-list');
        container.innerHTML = '';
        
        asteroids.forEach(asteroid => {
            const item = document.createElement('div');
            item.className = 'asteroid-item';
            item.innerHTML = `
                <div class="asteroid-name">
                    ${asteroid.name}
                    <span class="hazard-indicator ${asteroid.hazardous ? 'hazardous' : 'safe'}">
                        ${asteroid.hazardous ? '☠️' : '🛡️'}
                    </span>
                </div>
                <div class="asteroid-details">
                    <strong>💥 Diameter:</strong> ${asteroid.diameter.toFixed(3)} km<br>
                    <strong>⚡ Velocity:</strong> ${asteroid.velocity} km/s<br>
                    <strong>🛰️ Orbit:</strong> ${asteroid.orbit}<br>
                    <strong>🎯 Miss Distance:</strong> ${(asteroid.miss_distance / 1000000).toFixed(3)}M km
                </div>
            `;
            
            item.addEventListener('click', () => this.selectAsteroid(asteroid, item));
            container.appendChild(item);
        });
    }
    
    selectAsteroid(asteroid, item) {
        this.selectedAsteroid = asteroid;
        
        // Update UI state
        document.querySelectorAll('.asteroid-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Update controls with asteroid data
        document.getElementById('diameter-slider').value = asteroid.diameter;
        document.getElementById('diameter-value').textContent = `${asteroid.diameter} km`;
        
        document.getElementById('velocity-slider').value = asteroid.velocity;
        document.getElementById('velocity-value').textContent = `${asteroid.velocity} km/s`;
        
        // Create 3D asteroid
        this.createAdvancedAsteroid(asteroid.diameter);
        this.updateAsteroidPositionBasedOnAngle(45);
        
        // Show controls panel
        this.togglePanel('controls-panel');
        document.getElementById('asteroid-panel-title').textContent = `☄️ ${asteroid.name} Controls`;
        
        this.updateStatus(`🎯 Selected: ${asteroid.name} - Real NASA data loaded`);
    }

    showControlsPanel() {
        // Close all panels first
        this.closeAllPanels();
        
        // Show controls panel
        const panel = document.getElementById('controls-panel');
        panel.style.display = 'block';
        document.getElementById('controls-icon').classList.add('active');
        
        // Make sure the simulate button is visible
        const simulateBtn = document.getElementById('simulate-btn');
        if (simulateBtn) {
            simulateBtn.style.display = 'block';
        }
        
        // Hide impact results when showing a new asteroid
        const impactResult = document.getElementById('impact-result');
        if (impactResult) {
            impactResult.style.display = 'none';
        }
    }
    
    enterSimulation() {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('simulation-container').style.display = 'block';
        this.setupAdvancedThreeJS();
        this.updateStatus('🚀 Simulation Active - Use mouse to orbit, scroll to zoom');
    }
    
    setupAdvancedThreeJS() {
        // Enhanced Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Enhanced Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 40, 80);
        
        // Enhanced Renderer
        const canvas = document.getElementById('simulation-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Enhanced Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 500;
        this.controls.autoRotate = false;
        
        // Enhanced Lighting
        this.setupAdvancedLighting();
        
        // Create celestial bodies
        this.createUltimateEarth();
        this.createGalaxy();
        
        // Performance stats
        this.setupStats();
        
        // Start animation loop
        this.animate();
    }
    
    setupAdvancedLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x333333, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light (Sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(100, 50, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        this.scene.add(sunLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4477ff, 0.3);
        fillLight.position.set(-50, -20, -30);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xff8844, 0.2);
        rimLight.position.set(0, 0, -100);
        this.scene.add(rimLight);
    }
    
    createUltimateEarth() {
        const textureLoader = new THREE.TextureLoader();
        
        // Load ultra-high resolution Earth textures
        const surfaceTexture = textureLoader.load(this.earthTextures.surface);
        const specularTexture = textureLoader.load(this.earthTextures.specular);
        const normalTexture = textureLoader.load(this.earthTextures.normal);
        const cloudTexture = textureLoader.load(this.earthTextures.clouds);
        
        // Ultra-detailed Earth geometry
        const geometry = new THREE.SphereGeometry(15, 128, 128);
        
        // Advanced Earth material
        const material = new THREE.MeshPhongMaterial({
            map: surfaceTexture,
            specularMap: specularTexture,
            normalMap: normalTexture,
            normalScale: new THREE.Vector2(0.8, 0.8),
            shininess: 15,
            specular: new THREE.Color(0x333333)
        });
        
        this.earth = new THREE.Mesh(geometry, material);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);
        
        // Advanced cloud layer
        const cloudGeometry = new THREE.SphereGeometry(15.2, 128, 128);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.scene.add(this.clouds);
        
        // Advanced atmosphere with glow
        const atmosphereGeometry = new THREE.SphereGeometry(15.4, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0x0077ff) },
                viewVector: { value: this.camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(1.0 - dot(vNormal, vNormel), 3.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, intensity * 0.5);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
    }
    
    createAdvancedAsteroid(diameter = 1.0) {
        // Remove existing asteroid
        if (this.asteroid) {
            this.scene.remove(this.asteroid);
            this.clearTrail();
        }

        // Calculate proper scale factor relative to Earth
        const earthDiameter = 30; // Earth is 30 units in diameter in our scene
        const asteroidScale = (diameter / 12742) * earthDiameter * 50; // Scale factor to make asteroid visible
        
        // Create geometry with proper size calculation
        const baseRadius = 0.5; // Base radius for the geometry
        const segments = Math.max(32, Math.min(64, diameter * 10)); // Dynamic detail based on size
        
        const geometry = new THREE.SphereGeometry(baseRadius, segments, segments);
        
        // Enhanced surface displacement for realism
        const positionAttribute = geometry.getAttribute('position');
        
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            
            // Multi-octave noise for realistic surface
            const noise1 = Math.sin(x * 8 + y * 12 + z * 16) * 0.3;
            const noise2 = Math.sin(x * 4 + y * 6 + z * 8) * 0.2;
            const noise3 = Math.sin(x * 16 + y * 24 + z * 32) * 0.1;
            const totalDisplacement = 0.1 + noise1 + noise2 + noise3;
            
            const normalized = new THREE.Vector3(x, y, z).normalize();
            positionAttribute.setXYZ(
                i, 
                x + normalized.x * totalDisplacement,
                y + normalized.y * totalDisplacement,
                z + normalized.z * totalDisplacement
            );
        }
        
        geometry.computeVertexNormals();
        
        // Enhanced asteroid material
        const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0x333333,
            shininess: 20,
            bumpScale: 0.05
        });
        
        this.asteroid = new THREE.Mesh(geometry, material);
        this.asteroid.castShadow = true;
        
        // Set the scale based on diameter - FIXED: Proper scaling
        this.asteroid.scale.set(asteroidScale, asteroidScale, asteroidScale);
        
        this.updateAsteroidPositionBasedOnAngle(45);
        this.scene.add(this.asteroid);
        
        // Create asteroid trail
        this.createAsteroidTrail();
        
        return this.asteroid;
    }
    
    createAsteroidTrail() {
        if (this.trajectoryLine) {
            this.scene.remove(this.trajectoryLine);
        }
        
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0x4facfe,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        this.trajectoryLine = new THREE.Line(trailGeometry, trailMaterial);
        this.scene.add(this.trajectoryLine);
        this.trailPoints = [];
    }
    
    updateTrail() {
        if (!this.asteroid || !this.trajectoryLine) return;
        
        this.trailPoints.push(this.asteroid.position.clone());
        
        // Limit trail length for performance
        if (this.trailPoints.length > 100) {
            this.trailPoints.shift();
        }
        
        this.trajectoryLine.geometry.setFromPoints(this.trailPoints);
        this.trajectoryLine.geometry.attributes.position.needsUpdate = true;
    }
    
    clearTrail() {
        if (this.trajectoryLine) {
            this.scene.remove(this.trajectoryLine);
            this.trajectoryLine = null;
        }
        this.trailPoints = [];
    }
    
    createGalaxy() {
        // Create an amazing galaxy background
        const galaxyGeometry = new THREE.BufferGeometry();
        const starCount = 20000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Spiral galaxy distribution
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 800 + 200;
            const height = (Math.random() - 0.5) * 400;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // Realistic star colors
            const starType = Math.random();
            if (starType < 0.6) {
                colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1; // White
            } else if (starType < 0.8) {
                colors[i3] = 0.8; colors[i3 + 1] = 0.9; colors[i3 + 2] = 1; // Blue-white
            } else if (starType < 0.9) {
                colors[i3] = 1; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.6; // Yellow
            } else {
                colors[i3] = 1; colors[i3 + 1] = 0.6; colors[i3 + 2] = 0.6; // Red
            }
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        galaxyGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const galaxyMaterial = new THREE.PointsMaterial({
            size: 1.5,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true
        });
        
        this.galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
        this.scene.add(this.galaxy);
    }
    
    setupStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        this.stats.dom.style.cssText = 'position:absolute;top:20px;right:70px;';
    }
    
    async simulateImpact() {
        if (!this.asteroid || this.isSimulating) return;
        
        this.isSimulating = true;
        this.updateStatus('⚡ Calculating advanced trajectory with gravitational effects...');
        
        const diameter = parseFloat(document.getElementById('diameter-slider').value);
        const velocity = parseFloat(document.getElementById('velocity-slider').value);
        const angle = parseFloat(document.getElementById('angle-slider').value);
        
        try {
            const response = await fetch(`${this.backendUrl}/api/calculate-impact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diameter, velocity, angle })
            });
            
            const results = await response.json();
            
            if (results.success) {
                this.displayImpactResults(results);
                this.animateUltimateTrajectory(results);
                this.updateStatus('🎯 Advanced physics simulation running...');
            } else {
                throw new Error(results.error);
            }
            
        } catch (error) {
            console.error('Simulation failed:', error);
            const sampleResults = this.getAdvancedSampleResults();
            this.displayImpactResults(sampleResults);
            this.animateUltimateTrajectory(sampleResults);
            this.updateStatus('⚠️ Simulation running with advanced sample data');
        }
    }
    
    animateUltimateTrajectory(results) {
        const startPosition = this.asteroid.position.clone();
        const earthCenter = new THREE.Vector3(0, 0, 0);
        const earthRadius = 15;
        const asteroidRadius = parseFloat(document.getElementById('diameter-slider').value) / 2;
        
        // Calculate trajectory based on physics
        const trajectoryData = this.calculateAdvancedTrajectory(startPosition, results);
        
        // Create impact marker if impact occurs
        if (results.impact_occurred && results.impact_location) {
            this.createImpactMarker(
                results.impact_location.latitude,
                results.impact_location.longitude,
                results.impact_location.location_type
            );
        }
        
        let progress = 0;
        const duration = results.impact_occurred ? 4 : 5;
        const startTime = Date.now();
        
        const animateFrame = () => {
            if (!this.isSimulating) return;
            
            this.stats.begin();
            
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000;
            progress = Math.min(elapsed / duration, 1);
            
            // Advanced trajectory calculation
            const newPosition = this.calculateTrajectoryPoint(
                startPosition, 
                trajectoryData, 
                progress, 
                results.impact_occurred
            );
            
            this.asteroid.position.copy(newPosition);
            
            // Advanced rotation based on velocity
            const rotationSpeed = 0.03 + (1 - progress) * 0.05;
            this.asteroid.rotation.x += rotationSpeed;
            this.asteroid.rotation.y += rotationSpeed * 0.7;
            this.asteroid.rotation.z += rotationSpeed * 0.3;
            
            // Visual effects
            this.updateAsteroidEffects(progress, results.impact_occurred);
            
            // Update trail
            this.updateTrail();
            
            // Check for impact completion
            if (progress >= 1) {
                this.isSimulating = false;
                if (results.impact_occurred) {
                    this.createUltimateImpactEffects(this.asteroid.position);
                    this.updateStatus('💥 IMPACT DETECTED! Catastrophic effects simulated');
                } else {
                    this.updateStatus('☄️ Asteroid safely passed Earth - Trajectory complete');
                }
            } else {
                requestAnimationFrame(animateFrame);
            }
            
            this.stats.end();
        };
        
        animateFrame();
    }
    
    calculateAdvancedTrajectory(startPosition, results) {
        const earthCenter = new THREE.Vector3(0, 0, 0);
        const earthRadius = 15;
        const approachVector = new THREE.Vector3(
            results.approach_vector.x,
            results.approach_vector.y,
            results.approach_vector.z
        ).normalize();
        
        if (results.impact_occurred) {
            // Impact trajectory - curve towards Earth
            const impactPoint = this.latLongToVector3(
                results.impact_location.latitude,
                results.impact_location.longitude,
                earthRadius
            );
            
            return {
                type: 'impact',
                start: startPosition,
                end: impactPoint,
                control: startPosition.clone().lerp(impactPoint, 0.3).add(new THREE.Vector3(0, 30, 0)),
                curve: results.trajectory_data.trajectory_curve || 0.5
            };
        } else {
            // Miss trajectory - curve around Earth
            const missDistance = (results.trajectory_data.miss_distance_km / 6371) * 15;
            const endPoint = approachVector.multiplyScalar(200);
            const controlPoint = earthCenter.clone().add(approachVector.multiplyScalar(earthRadius + missDistance));
            
            return {
                type: 'miss',
                start: startPosition,
                end: endPoint,
                control: controlPoint,
                curve: results.trajectory_data.trajectory_curve || 1.0
            };
        }
    }
    
    calculateTrajectoryPoint(start, trajectory, progress, willImpact) {
        if (trajectory.type === 'impact') {
            // Bezier curve for impact
            return this.cubicBezier(
                start,
                trajectory.control,
                trajectory.end,
                progress
            );
        } else {
            // More dramatic curve for miss
            const curvedProgress = this.easeInOutCubic(progress);
            const basePoint = new THREE.Vector3().lerpVectors(start, trajectory.end, curvedProgress);
            
            // Add gravitational curvature
            const curveAmount = Math.sin(progress * Math.PI) * trajectory.curve * 20;
            basePoint.y += curveAmount;
            
            return basePoint;
        }
    }
    
    cubicBezier(p0, p1, p2, t) {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
        const z = Math.pow(1 - t, 2) * p0.z + 2 * (1 - t) * t * p1.z + Math.pow(t, 2) * p2.z;
        return new THREE.Vector3(x, y, z);
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    updateAsteroidEffects(progress, willImpact) {
        const intensity = 1 - progress;
        
        // Glow effect as asteroid approaches
        this.asteroid.material.emissive = new THREE.Color(intensity * 0.5, intensity * 0.2, 0);
        
        // Scale effect
        const scale = 1 + intensity * 0.5;
        this.asteroid.scale.set(scale, scale, scale);
    }
    
    latLongToVector3(lat, lon, radius) {
        const latRad = THREE.MathUtils.degToRad(lat);
        const lonRad = THREE.MathUtils.degToRad(lon);
        
        const x = radius * Math.cos(latRad) * Math.cos(lonRad);
        const y = radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.sin(lonRad);
        
        return new THREE.Vector3(x, y, z);
    }
    
    createImpactMarker(latitude, longitude, locationType) {
        if (this.impactMarker) {
            this.scene.remove(this.impactMarker);
        }
        
        const position = this.latLongToVector3(latitude, longitude, 15.1);
        const color = locationType === 'Ocean' ? 0x4facfe : 0x4caf50;
        
        const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3
        });
        
        this.impactMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.impactMarker.position.copy(position);
        this.scene.add(this.impactMarker);
        
        // Add pulsing effect
        this.impactMarker.userData = { pulse: 1, direction: 1 };
    }
    
    createUltimateImpactEffects(position) {
        // Massive explosion effect
        this.createExplosionSphere(position);
        this.createShockwave(position);
        this.createDebrisField(position);
    }
    
    createExplosionSphere(position) {
        const explosionGeometry = new THREE.SphereGeometry(1, 32, 32);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            transparent: true,
            opacity: 0.9
        });
        
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(position);
        this.scene.add(explosion);
        
        // Animate explosion
        let progress = 0;
        const animateExplosion = () => {
            progress += 0.02;
            if (progress < 1) {
                const scale = 1 + progress * 25;
                explosion.scale.set(scale, scale, scale);
                explosionMaterial.opacity = 0.9 * (1 - progress);
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(explosion);
            }
        };
        
        animateExplosion();
    }
    
    createShockwave(position) {
        const shockwaveGeometry = new THREE.RingGeometry(1, 1.2, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.position.copy(position);
        shockwave.rotation.x = Math.PI / 2;
        this.scene.add(shockwave);
        
        let progress = 0;
        const animateShockwave = () => {
            progress += 0.015;
            if (progress < 1) {
                const scale = 1 + progress * 40;
                shockwave.scale.set(scale, scale, scale);
                shockwaveMaterial.opacity = 0.8 * (1 - progress);
                requestAnimationFrame(animateShockwave);
            } else {
                this.scene.remove(shockwave);
            }
        };
        
        animateShockwave();
    }
    
    createDebrisField(position) {
        // Create multiple debris particles
        for (let i = 0; i < 50; i++) {
            this.createDebrisParticle(position);
        }
    }
    
    createDebrisParticle(position) {
        const size = Math.random() * 0.3 + 0.1;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: Math.random() * 0x808080 + 0x808080,
            transparent: true,
            opacity: 0.8
        });
        
        const debris = new THREE.Mesh(geometry, material);
        debris.position.copy(position);
        
        // Random velocity
        debris.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ),
            life: 1.0
        };
        
        this.scene.add(debris);
        
        const animateDebris = () => {
            debris.userData.life -= 0.01;
            if (debris.userData.life > 0) {
                debris.position.add(debris.userData.velocity);
                debris.userData.velocity.multiplyScalar(0.98); // Slow down
                material.opacity = debris.userData.life * 0.8;
                requestAnimationFrame(animateDebris);
            } else {
                this.scene.remove(debris);
            }
        };
        
        animateDebris();
    }
    
    displayImpactResults(results) {
        // Store the results for use in the new pages
        this.currentImpactResults = results;

        // Save simulation data to localStorage
        this.saveSimulationData(results);
        
        const resultElement = document.getElementById('impact-result');
        const titleElement = document.getElementById('impact-title');
        const detailsElement = document.getElementById('impact-details');
        
        if (results.impact_occurred) {
            resultElement.className = 'impact-result impact-success';
            titleElement.innerHTML = '💥 CATASTROPHIC IMPACT DETECTED';
            titleElement.style.color = '#ff6b6b';
        } else {
            resultElement.className = 'impact-result impact-failure';
            titleElement.innerHTML = '☄️ ASTEROID MISSED EARTH';
            titleElement.style.color = '#4caf50';
        }
        
        const locationEmoji = results.impact_location.location_type === 'Ocean' ? '🌊' : '🏔️';
        const locationColor = results.impact_location.location_type === 'Ocean' ? '#4facfe' : '#4caf50';
        
        detailsElement.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Impact Occurred:</strong> 
                <span class="impact-value" style="color: ${results.impact_occurred ? '#ff6b6b' : '#4caf50'};">
                    ${results.impact_occurred ? '✅ YES' : '❌ NO'}
                </span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Impact Probability:</strong> 
                <span class="impact-value">${results.trajectory_data.impact_probability}%</span>
            </div>
            
            ${results.impact_occurred ? `
            <div style="margin-bottom: 10px;">
                <strong>Impact Date:</strong> 
                <span class="impact-value">${results.impact_date}</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Impact Location:</strong> 
                <span class="impact-value">
                    ${locationEmoji} ${results.impact_location.latitude}°N, ${results.impact_location.longitude}°E<br>
                    <small style="color: ${locationColor};">${results.impact_location.continent} • ${results.impact_location.location_type}</small>
                </span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Energy Release:</strong> 
                <span class="impact-value">${results.energy_megatons} megatons of TNT</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Crater Diameter:</strong> 
                <span class="impact-value">${results.crater_diameter_km} km</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Seismic Magnitude:</strong> 
                <span class="impact-value">${results.seismic_magnitude} Richter</span>
            </div>
            ` : `
            <div style="margin-bottom: 10px;">
                <strong>Miss Distance:</strong> 
                <span class="impact-value">${results.trajectory_data.miss_distance_km.toLocaleString()} km</span>
            </div>
            `}
            
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; color: #a0a0c0;">
                ⚡ Advanced Physics Engine v2.0
            </div>
        `;
        
        resultElement.style.display = 'block';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.stats) this.stats.begin();
        
        // Enhanced Earth rotation
        if (this.earth) {
            this.earth.rotation.y += 0.001;
            if (this.clouds) this.clouds.rotation.y += 0.0015;
            if (this.atmosphere) this.atmosphere.rotation.y += 0.0005;
        }
        
        // Enhanced asteroid effects when idle
        if (this.asteroid && !this.isSimulating) {
            this.asteroid.rotation.x += 0.01;
            this.asteroid.rotation.y += 0.005;
            
            // Gentle floating motion
            const time = Date.now() * 0.001;
            this.asteroid.position.y += Math.sin(time) * 0.01;
        }
        
        // Pulse impact marker
        if (this.impactMarker) {
            this.impactMarker.userData.pulse += this.impactMarker.userData.direction * 0.02;
            if (this.impactMarker.userData.pulse > 1.3 || this.impactMarker.userData.pulse < 0.7) {
                this.impactMarker.userData.direction *= -1;
            }
            this.impactMarker.scale.setScalar(this.impactMarker.userData.pulse);
        }
        
        // Galaxy rotation
        if (this.galaxy) {
            this.galaxy.rotation.y += 0.00001;
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        if (this.stats) this.stats.end();
    }
    
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    updateStatus(message) {
        document.getElementById('status-message').textContent = message;
    }
    
    getSampleAsteroids() {
        return [
            {
                id: '3542519',
                name: '2025 Impactor',
                diameter: 1.2,
                velocity: 18.5,
                miss_distance: 4500000,
                hazardous: true,
                orbit: 'Earth',
                close_approach_date: '2025-04-13'
            },
            {
                id: '2001031', 
                name: 'Apophis',
                diameter: 0.37,
                velocity: 30.7,
                miss_distance: 31000000,
                hazardous: true,
                orbit: 'Earth',
                close_approach_date: '2029-04-13'
            }
        ];
    }
    
    getAdvancedSampleResults() {
        const impactOccurred = Math.random() > 0.4;
        
        return {
            success: true,
            impact_occurred: impactOccurred,
            energy_megatons: 150.5,
            crater_diameter_km: 12.3,
            seismic_magnitude: 7.8,
            fireball_radius_km: 3.2,
            tsunami_height_m: 45.6,
            category: impactOccurred ? 'Regional devastation' : 'Asteroid missed Earth',
            mass_kg: '1.23e+12',
            energy_joules: '6.30e+17',
            trajectory_data: {
                will_impact: impactOccurred,
                impact_angle: 45,
                approach_velocity: 20,
                impact_probability: impactOccurred ? 85 : 35,
                miss_distance_km: impactOccurred ? 0 : 15000,
                gravitational_influence_km: 12.5,
                trajectory_curve: 0.8
            },
            impact_location: {
                latitude: impactOccurred ? Math.random() * 140 - 70 : 0,
                longitude: impactOccurred ? Math.random() * 360 - 180 : 0,
                location_type: impactOccurred ? (Math.random() > 0.3 ? 'Ocean' : 'Land') : 'Ocean',
                continent: impactOccurred ? 'Pacific Ocean' : 'N/A'
            },
            impact_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            approach_vector: {x: 0.7, y: 0.5, z: 0.5, speed_multiplier: 1.0},
            physics_engine: 'advanced_v2'
        };
    }
}

// Initialize the ultimate simulator when the page loads
window.addEventListener('load', () => {
    window.simulator = new UltimateAsteroidImpactSimulator();
});