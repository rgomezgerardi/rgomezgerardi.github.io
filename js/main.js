import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


const PIXEL_SIZE = 2;
const BB_EXPORT_SCALE = 16; // Blockbench
const BB_UNIT = 1 / BB_EXPORT_SCALE; // 0.0625


// Rendered
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({canvas: canvas});


// Composer
const composer = new EffectComposer(renderer);


// Scene
const scene = new THREE.Scene();


// Camera
const near = 0.05;
const far = 100;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, near, far);

// Camera Position
const CAMERA_DISTANCE = 10;
camera.position.set(
    CAMERA_DISTANCE,
    CAMERA_DISTANCE * Math.SQRT2 * Math.tan(Math.PI / 6),
    CAMERA_DISTANCE
);
camera.lookAt(0, 0, 0);


// Render Pixelated Pass
const renderPixelatedPass = new RenderPixelatedPass(PIXEL_SIZE, scene, camera);
renderPixelatedPass.depthEdgeStrength = 0
renderPixelatedPass.normalEdgeStrength = 0
composer.addPass(renderPixelatedPass);


// Output Pass
const outputPass = new OutputPass();
composer.addPass(outputPass);


// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(3, 5, 2);

scene.add(ambientLight);
scene.add(directionalLight);


function resize(){
    const DPR = window.devicePixelRatio;

    // const RENDER_WIDTH = Math.floor(window.innerWidth * DPR / PIXEL_SIZE);
    // const RENDER_HEIGHT = Math.floor((window.innerHeight * DPR / PIXEL_SIZE));
    const RENDER_WIDTH = Math.floor(window.innerWidth * DPR / PIXEL_SIZE / 2) * 2;
    const RENDER_HEIGHT = Math.floor(window.innerHeight * DPR / PIXEL_SIZE / 2) * 2;
    
    if (RENDER_WIDTH <= 0 || RENDER_HEIGHT <= 0) {
        return;
    }

    const VIEW_HEIGHT = RENDER_HEIGHT / (16 * Math.SQRT2);

    const PHYS_WIDTH = RENDER_WIDTH * PIXEL_SIZE;
    const PHYS_HEIGHT = RENDER_HEIGHT * PIXEL_SIZE;

    
    // Rendered
    // renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT, false);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(PHYS_WIDTH, PHYS_HEIGHT, false);

    canvas.style.width = PHYS_WIDTH / DPR + 'px';
    canvas.style.height = PHYS_HEIGHT / DPR + 'px';
    //console.log(canvas.clientWidth, canvas.clientHeight, canvas.width, canvas.height);
    
    
    // Composer
    composer.setSize(PHYS_WIDTH, PHYS_HEIGHT);

    
    // Camera
    const aspect = RENDER_WIDTH / RENDER_HEIGHT;
    camera.top = VIEW_HEIGHT / 2;
    camera.bottom = camera.top * -1;
    camera.right = VIEW_HEIGHT * aspect / 2;
    camera.left = camera.right * -1;
    camera.updateProjectionMatrix();
}


// Group
const group = new THREE.Group();
group.position.x += 5;
group.position.z += 5;
scene.add(group);

// Models
let floor = null;
const loader1 = new GLTFLoader();

loader1.load('glb/floor.glb', (gltf) => {
    floor = gltf.scene;
    floor.traverse((obj) => {
        if (obj.isMesh) {
            obj.material.map.magFilter = THREE.NearestFilter;
            obj.material.map.minFilter = THREE.NearestFilter;
        }
    })
    group.add(floor);
    
    // const size = new THREE.Box3().setFromObject(model1).getSize(new THREE.Vector3());
    // console.log(size); 
})


let wall = null;
const loader2 = new GLTFLoader();
loader2.load('glb/wall.glb', (gltf) => {
    wall = gltf.scene;
    wall.traverse((obj) => {
        if (obj.isMesh) {
            obj.material.map.magFilter = THREE.NearestFilter;
            obj.material.map.minFilter = THREE.NearestFilter;
        }
    })
    wall.position.set(-0.5 * BB_UNIT, 12.66 * BB_UNIT, (-66 - 0.5) * BB_UNIT);
    group.add(wall);
    
    
    // Left Wall 
    const leftWall = wall.clone();    // shares geometry and material
    leftWall.rotation.y = Math.PI / 2;
    // leftWall.position.z += BB_UNIT;   // 1p nudge at 90° and 270°
    leftWall.position.set((-67+0.5) * BB_UNIT, 12.66 * BB_UNIT, (1 - 0.5) * BB_UNIT);
    group.add(leftWall);
})


// group.position.x = 0;                // at 0° and 180°
// group.rotation.y = 0;                // 0°
//
// group.position.x += BB_UNIT;         // 1pixel at 90° and 270°
// group.rotation.y = Math.PI / 2;      // 90°
//
// group.position.x = 0;                // at 0° and 180°
// group.rotation.y = Math.PI;          // 180°
//
// group.position.x += BB_UNIT;         // 1p nudge at 90° and 270°
// group.rotation.y = -Math.PI / 2;     // 270° (same as 3 * Math.PI / 2)


const clock = new THREE.Clock();

window.addEventListener('resize', resize);
resize();

function animate() {
    const delta = clock.getDelta();
    
    group.rotation.y += delta * 0.4;
    
    requestAnimationFrame(animate);
    composer.render()
}

animate();
