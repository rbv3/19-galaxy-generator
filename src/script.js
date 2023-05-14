import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/*
Galaxy
*/
const parameters = {
    count: 10000,
    radius: 7,
    size: 0.02,
    branches: 5,
    spin: 1,
    randomness: 0.25,
    randomnessPower: 5,
    height: 3,
    innerColor: '#ff6030',
    outColor: '#1b3984'
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    if(points != null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points)
    }
    // geometry
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3) // RGB

    const colorInside = new THREE.Color(parameters.innerColor);
    const colorOutside = new THREE.Color(parameters.outColor);

    for(let i=0; i<parameters.count; i++) {
        const i3 = i*3;
        //position
        const radius = Math.random() * parameters.radius;
        const spingAngle = radius * parameters.spin;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5? 1 : -1) * parameters.randomness;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5? 1 : -1) * parameters.randomness;
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5? 1 : -1) * parameters.randomness;

        positions[i3] = Math.cos(branchAngle + spingAngle) * radius + randomX;
        positions[i3+1] = 0 + randomY * parameters.height;
        positions[i3+2] = Math.sin(branchAngle + spingAngle) * radius + randomZ;

        //color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r;
        colors[i3+1] = mixedColor.g;
        colors[i3+2] = mixedColor.b;
    }
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    );

    // material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    // points
    points = new THREE.Points(geometry, material);
    scene.add(points);
}
generateGalaxy();


/*
Gui Updates
*/
gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(1).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.01).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(2).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'height').min(1).max(10).step(0.1).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'innerColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outColor').onFinishChange(generateGalaxy);
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()