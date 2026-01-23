import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './GlobeIntro.css';

interface GlobeIntroProps {
    onComplete: () => void;
    canFinish: boolean;
}

// Üsküdar koordinatları - 3D küre koordinatlarına çevrilecek
const USKUDAR_COORDS = {
    lat: 41.026,
    lng: 29.015
};

// Derece -> Radyan dönüşümü
const degToRad = (deg: number) => deg * (Math.PI / 180);

// Lat/lng -> 3D küre koordinatları
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = degToRad(90 - lat);
    const theta = degToRad(lng + 180);

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

const GlobeIntro = ({ onComplete, canFinish }: GlobeIntroProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fadeOut, setFadeOut] = useState(false);
    const [showSunrise, setShowSunrise] = useState(false);
    const animationCompleteRef = useRef(false);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        earth: THREE.Mesh;
        atmosphere: THREE.Mesh;
        ambientLight: THREE.AmbientLight;
        sunLight: THREE.DirectionalLight;
    } | null>(null);
    const frameRef = useRef<number>(0);

    // Skip butonu
    const handleSkip = () => {
        if (canFinish) {
            setFadeOut(true);
            setTimeout(() => {
                onComplete();
            }, 800);
        }
    };

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;

        // Scene setup
        const scene = new THREE.Scene();

        // Camera - uzaktan başla
        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 5);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Earth geometry
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

        // Earth texture - procedural night texture
        const earthCanvas = document.createElement('canvas');
        earthCanvas.width = 1024;
        earthCanvas.height = 512;
        const ctx = earthCanvas.getContext('2d')!;

        // Dark blue base (ocean)
        ctx.fillStyle = '#0a1628';
        ctx.fillRect(0, 0, 1024, 512);

        // Land masses with city lights
        const drawContinent = (x: number, y: number, w: number, h: number, brightness: number) => {
            ctx.fillStyle = `rgba(30, 50, 30, ${0.8 + brightness * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // City lights
            for (let i = 0; i < 20 * brightness; i++) {
                const cx = x + Math.random() * w;
                const cy = y + Math.random() * h;
                const size = 1 + Math.random() * 2;
                ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 100}, ${0.6 + Math.random() * 0.4})`;
                ctx.beginPath();
                ctx.arc(cx, cy, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // Simple continent shapes
        drawContinent(100, 80, 200, 150, 0.8);    // Europe/Africa
        drawContinent(350, 120, 150, 100, 0.7);   // Asia
        drawContinent(500, 100, 200, 180, 1);     // Turkey/Middle East area
        drawContinent(700, 120, 180, 140, 0.9);   // East Asia
        drawContinent(50, 180, 120, 100, 0.6);    // Americas
        drawContinent(800, 280, 100, 80, 0.4);    // Australia

        // Turkey - bright spot (İstanbul)
        ctx.fillStyle = 'rgba(255, 220, 100, 1)';
        ctx.beginPath();
        // Türkiye'nin yaklaşık konumu (texture mapping'e göre)
        const turkeyX = 512 + (USKUDAR_COORDS.lng / 180) * 256;
        const turkeyY = 256 - (USKUDAR_COORDS.lat / 90) * 256;
        ctx.arc(turkeyX, turkeyY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Glow around Istanbul
        const gradient = ctx.createRadialGradient(turkeyX, turkeyY, 0, turkeyX, turkeyY, 20);
        gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(turkeyX, turkeyY, 20, 0, Math.PI * 2);
        ctx.fill();

        const earthTexture = new THREE.CanvasTexture(earthCanvas);

        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthTexture,
            roughness: 0.8,
            metalness: 0.1
        });

        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);

        // Atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(1.1, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        varying vec3 vNormal;
        uniform float intensity;
        void main() {
          float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 color = mix(vec3(0.1, 0.3, 0.8), vec3(1.0, 0.8, 0.5), intensity);
          gl_FragColor = vec4(color, glow * 0.6);
        }
      `,
            uniforms: {
                intensity: { value: 0 }
            },
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.3);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffee, 0);
        sunLight.position.set(5, 3, 5);
        scene.add(sunLight);

        // Store refs
        sceneRef.current = {
            scene,
            camera,
            renderer,
            earth,
            atmosphere,
            ambientLight,
            sunLight
        };

        // Animation
        const targetPosition = latLngToVector3(USKUDAR_COORDS.lat, USKUDAR_COORDS.lng, 1);
        const startTime = Date.now();
        const totalDuration = 4500; // 4.5 seconds total

        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);

            // Easing function - smooth in-out
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Rotate earth - slow down as we zoom in
            earth.rotation.y += 0.002 * (1 - eased * 0.8);
            atmosphere.rotation.y = earth.rotation.y;

            // Camera zoom in
            const startZ = 5;
            const endZ = 1.2;
            camera.position.z = startZ + (endZ - startZ) * eased;

            // Camera position - approach Üsküdar
            const targetX = targetPosition.x * 0.3;
            const targetY = targetPosition.y * 0.3;
            camera.position.x = targetX * eased;
            camera.position.y = targetY * eased;

            // Sunrise effect (after 50%)
            if (progress > 0.5) {
                const sunriseProgress = (progress - 0.5) * 2;

                // Increase sun light
                sunLight.intensity = sunriseProgress * 1.5;

                // Increase ambient light
                ambientLight.intensity = 0.3 + sunriseProgress * 0.5;

                // Change atmosphere color
                (atmosphereMaterial.uniforms.intensity as { value: number }).value = sunriseProgress;

                // Show sunrise overlay
                if (!showSunrise && sunriseProgress > 0.2) {
                    setShowSunrise(true);
                }
            }

            renderer.render(scene, camera);

            // Animation complete
            if (progress >= 1 && !animationCompleteRef.current) {
                animationCompleteRef.current = true;

                // If map is ready, fade out. Otherwise wait.
                if (canFinish) {
                    setTimeout(() => {
                        setFadeOut(true);
                        setTimeout(() => {
                            onComplete();
                        }, 800);
                    }, 500);
                }
            }
        };

        animate();

        // Handle resize
        const handleResize = () => {
            if (!sceneRef.current || !container) return;

            const { camera: cam, renderer: ren } = sceneRef.current;
            cam.aspect = container.clientWidth / container.clientHeight;
            cam.updateProjectionMatrix();
            ren.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameRef.current);

            if (sceneRef.current) {
                sceneRef.current.renderer.dispose();
                sceneRef.current.earth.geometry.dispose();
                (sceneRef.current.earth.material as THREE.Material).dispose();
                sceneRef.current.atmosphere.geometry.dispose();
                (sceneRef.current.atmosphere.material as THREE.Material).dispose();
            }
        };
    }, [onComplete]);

    // Watch for canFinish change when animation is complete
    useEffect(() => {
        if (canFinish && animationCompleteRef.current && !fadeOut) {
            setFadeOut(true);
            setTimeout(() => {
                onComplete();
            }, 800);
        }
    }, [canFinish, onComplete, fadeOut]);

    return (
        <div
            ref={containerRef}
            className={`globe-intro-container ${fadeOut ? 'fade-out' : ''}`}
        >
            <div className="stars-background" />

            <canvas ref={canvasRef} className="globe-canvas" />

            <div className={`sunrise-overlay ${showSunrise ? 'active' : ''}`} />

            <div className="globe-intro-text">
                <h1 className="globe-title">İstanbul'un İncisi</h1>
                <p className="globe-subtitle">ÜSKÜDAR</p>
            </div>

            {!canFinish && (
                <div className="globe-loading-indicator">
                    <span>Harita hazırlanıyor</span>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            )}

            <button className="skip-button" onClick={handleSkip}>
                Geç →
            </button>
        </div>
    );
};

export default GlobeIntro;
