"use client"
import React, { useRef, useEffect } from 'react';
import { twMerge } from "tailwind-merge";
import * as THREE from 'three';
import spline from "@/_utils/spline";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useTheme } from "@/_context/themeProvider";

const THEME_BG = { dark: 0x07070d, light: 0xe8e8e8 } as const;
const THEME_FOG = { dark: 0x07070d, light: 0xe8e8e8 } as const;
const THEME_TUBE = { dark: 0x0099ff, light: 0x0055cc } as const;
const THEME_BLOOM_STRENGTH = { dark: 3.5, light: 1.5 } as const;

interface ThreeSceneProps {
  className?: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const sceneRef = useRef<THREE.Scene | null>(null);
    const fogRef = useRef<THREE.FogExp2 | null>(null);
    const tubeMatRef = useRef<THREE.LineBasicMaterial | null>(null);
    const bloomRef = useRef<UnrealBloomPass | null>(null);
    useEffect(() => {

        if (typeof window !== 'undefined') {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x000000, 0.7);
            sceneRef.current = scene;
            fogRef.current = scene.fog;
            const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
            camera.position.z = 5;
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(w, h);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            containerRef.current?.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.03;

            // post-processing
            const renderScene = new RenderPass(scene, camera);
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
            bloomPass.threshold = 0.002;
            bloomPass.strength = 3.5;
            bloomPass.radius = 0;
            bloomRef.current = bloomPass;
            const composer = new EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(bloomPass);

            // create a line geometry from the spline
            const points = spline.getPoints(100);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
            const line = new THREE.Line(geometry, material);
            // scene.add(line);

            // create a tube geometry from the spline
            const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);

            // create edges geometry from the spline
            const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x0099ff });
            tubeMatRef.current = lineMat;
            const tubeLines = new THREE.LineSegments(edges, lineMat);
            scene.add(tubeLines);

            const numBoxes = 55;
            const size = 0.075;
            const boxGeo = new THREE.BoxGeometry(size, size, size);
            for (let i = 0; i < numBoxes; i += 1) {
                const boxMat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    wireframe: true
                });
                const box = new THREE.Mesh(boxGeo, boxMat);
                const p = (i / numBoxes + Math.random() * 0.1) % 1;
                const pos = tubeGeo.parameters.path.getPointAt(p);
                pos.x += Math.random() - 0.4;
                pos.z += Math.random() - 0.4;
                box.position.copy(pos);
                const rote = new THREE.Vector3(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                box.rotation.set(rote.x, rote.y, rote.z);
                const edges = new THREE.EdgesGeometry(boxGeo, 0.2);
                const color = new THREE.Color().setHSL(0.7 - p, 1, 0.5);
                const lineMat = new THREE.LineBasicMaterial({ color });
                const boxLines = new THREE.LineSegments(edges, lineMat);
                boxLines.position.copy(pos);
                boxLines.rotation.set(rote.x, rote.y, rote.z);
                // scene.add(box);
                scene.add(boxLines);
            }

            function updateCamera(t = 0) {
                const time = t * 0.1;
                const looptime = 10 * 1000;
                const p = (time % looptime) / looptime;
                const pos = tubeGeo.parameters.path.getPointAt(p);
                const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
                camera.position.copy(pos);
                camera.lookAt(lookAt);
            }

            function animate(t = 0) {
                requestAnimationFrame(animate);
                updateCamera(t);
                composer.render(t);
                controls.update();
            }
            animate();

            function handleWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
            window.addEventListener('resize', handleWindowResize, false);
        }
    }, []);
    useEffect(() => {
        if (!sceneRef.current || !fogRef.current) return;
        const bg = THEME_BG[theme];
        sceneRef.current.background = new THREE.Color(bg);
        fogRef.current.color.setHex(bg);
        if (tubeMatRef.current) {
            tubeMatRef.current.color.setHex(THEME_TUBE[theme]);
        }
        if (bloomRef.current) {
            bloomRef.current.strength = THEME_BLOOM_STRENGTH[theme];
        }
    }, [theme]);
    return <div className={twMerge("fixed left-0 top-0 inset-0 w-full h-full -z-10", className)} ref={containerRef} />;
};
export default ThreeScene;