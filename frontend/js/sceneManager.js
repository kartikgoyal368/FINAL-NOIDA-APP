class SceneManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.earth = null;
        this.asteroid = null;
        this.asteroidTrail = [];
        this.isSimulating = false;
        this.textureLoader = new THREE.TextureLoader();
        
        this.earthTextures = {
            surface: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
            specular: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
            normal: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
            clouds: 'https://threejs.org/examples/textures/planets/earth_clouds.png'
        };
        
        this.init();
    }
    
    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000011);
        
        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0x333333, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Camera controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 200;
        
        this.camera.position.set(0, 20, 40);
        
        this.createRealisticEarth();
        this.createEnhancedStarfield();
        this.setupEventListeners();
        this.animate();
    }
    
    createRealisticEarth() {
        // High-detail Earth geometry
        const geometry = new THREE.SphereGeometry(10, 128, 128);
        
        // Load high-resolution Earth textures
        const surfaceTexture = this.textureLoader.load(this.earthTextures.surface);
        const specularTexture = this.textureLoader.load(this.earthTextures.specular);
        const normalTexture = this.textureLoader.load(this.earthTextures.normal);
        const cloudTexture = this.textureLoader.load(this.earthTextures.clouds);
        
        // Earth material with realistic textures
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: surfaceTexture,
            specularMap: specularTexture,
            normalMap: normalTexture,
            normalScale: new THREE.Vector2(0.5, 0.5),
            shininess: 10,
            specular: new THREE.Color(0x333333)
        });
        
        this.earth = new THREE.Mesh(geometry, earthMaterial);
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);
        
        // Add realistic cloud layer
        const cloudGeometry = new THREE.SphereGeometry(10.1, 128, 128);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.scene.add(this.clouds);
        
        // Add atmospheric glow
        const atmosphereGeometry = new THREE.SphereGeometry(10.3, 64, 64);
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
                    intensity = pow(0.6 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
    }
    
    createAsteroid(diameter = 1, detail = 64) {
        // Remove existing asteroid
        if (this.asteroid) {
            this.scene.remove(this.asteroid);
            this.asteroidTrail.forEach(point => this.scene.remove(point));
            this.asteroidTrail = [];
        }
        
        // Create highly detailed irregular asteroid geometry
        const geometry = new THREE.SphereGeometry(diameter/2, detail, detail);
        
        // Enhanced vertex displacement for realistic rocky appearance
        const positionAttribute = geometry.getAttribute('position');
        const displacement = new Float32Array(positionAttribute.count);
        
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            
            // Multi-frequency noise for realistic surface
            const noise1 = 0.5 + 0.5 * Math.sin(x * 10 + y * 15 + z * 20);
            const noise2 = 0.5 + 0.5 * Math.sin(x * 5 + y * 8 + z * 12);
            const totalDisplacement = 0.1 + (noise1 * 0.3) + (noise2 * 0.2);
            
            const normalized = new THREE.Vector3(x, y, z).normalize();
            positionAttribute.setXYZ(
                i, 
                x + normalized.x * totalDisplacement,
                y + normalized.y * totalDisplacement,
                z + normalized.z * totalDisplacement
            );
            
            displacement[i] = totalDisplacement;
        }
        
        geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1));
        geometry.computeVertexNormals();
        
        // Enhanced asteroid material
        const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0x222222,
            shininess: 15,
            flatShading: false
        });
        
        this.asteroid = new THREE.Mesh(geometry, material);
        this.asteroid.castShadow = true;
        this.asteroid.position.set(0, 0, 50);
        this.scene.add(this.asteroid);
        
        return this.asteroid;
    }
    
    createEnhancedStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 15000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 2500;
            positions[i3 + 1] = (Math.random() - 0.5) * 2500;
            positions[i3 + 2] = (Math.random() - 0.5) * 2500;
            
            // Random star colors (mostly white/blue with some variation)
            const colorVariation = Math.random();
            colors[i3] = 0.8 + colorVariation * 0.2;
            colors[i3 + 1] = 0.8 + colorVariation * 0.2;
            colors[i3 + 2] = 0.9 + colorVariation * 0.1;
            
            // Varying star sizes
            sizes[i] = 0.5 + Math.random() * 1.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1.2,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    animateRealisticImpact(startPosition, trajectoryData, onImpact, onMiss) {
        const earthCenter = new THREE.Vector3(0, 0, 0);
        const earthRadius = 10;
        const asteroidRadius = this.asteroid.geometry.parameters.radius;
        
        this.asteroid.position.copy(startPosition);
        
        let progress = 0;
        const duration = 4;
        const startTime = Date.now();
        
        const animateFrame = () => {
            if (!this.isSimulating) return;
            
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000;
            progress = Math.min(elapsed / duration, 1);
            
            // Realistic curved trajectory based on angle
            const curvedProgress = this.easeInOutCubic(progress);
            this.asteroid.position.lerpVectors(startPosition, earthCenter, curvedProgress);
            
            // Enhanced rotation during flight
            this.asteroid.rotation.x += 0.04;
            this.asteroid.rotation.y += 0.02;
            this.asteroid.rotation.z += 0.01;
            
            // Dynamic scaling for dramatic effect
            const approachScale = 1 + (1 - progress) * 0.8;
            this.asteroid.scale.set(approachScale, approachScale, approachScale);
            
            // Check collision with realistic physics
            const distanceToEarth = this.asteroid.position.distanceTo(earthCenter);
            
            if (distanceToEarth < earthRadius + asteroidRadius && trajectoryData.will_impact) {
                this.isSimulating = false;
                onImpact();
            } else if (progress >= 1) {
                this.isSimulating = false;
                onMiss();
            } else {
                requestAnimationFrame(animateFrame);
            }
        };
        
        animateFrame();
    }
    
    easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    
    createRealisticExplosion(position) {
        // Create explosion particle system
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            
            // Random explosion directions
            velocities[i3] = (Math.random() - 0.5) * 2;
            velocities[i3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i3 + 2] = (Math.random() - 0.5) * 2;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff6600,
            size: 0.5,
            transparent: true
        });
        
        const explosion = new THREE.Points(particles, particleMaterial);
        this.scene.add(explosion);
        
        return { explosion, velocities };
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Enhanced Earth rotation
        if (this.earth) {
            this.earth.rotation.y += 0.001;
            if (this.clouds) this.clouds.rotation.y += 0.0012;
            if (this.atmosphere) this.atmosphere.rotation.y += 0.0003;
        }
        
        // Enhanced asteroid rotation when idle
        if (this.asteroid && !this.isSimulating) {
            this.asteroid.rotation.x += 0.008;
            this.asteroid.rotation.y += 0.004;
        }
        
        // Enhanced starfield rotation
        if (this.stars) {
            this.stars.rotation.y += 0.00005;
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}