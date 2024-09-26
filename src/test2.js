import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Flow,
  InstancedFlow,
} from "three/examples/jsm/modifiers/CurveModifier.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

let scene, camera, renderer, stats;
let confettiPapers = [],
  ribbons = [];
const confettiCount = 100;
let controls, flow, zigzagCurve1, overlay;
let textureLoader = new THREE.TextureLoader();

// Animation state flag
let isAnimating = true;

// Initialize Three.js scene
async function init() {
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    window.innerWidth / -200,
    window.innerWidth / 200,
    window.innerHeight / 200,
    window.innerHeight / -200,
    0.1,
    8.5
  );
  camera.position.set(0, 0, 5); // Adjusted camera position for better view
  // camera.lookAt(0, 0, 0);
  // scene.add(new THREE.AxesHelper(5));
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Debug info overlay
  overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "100px";
  overlay.style.padding = "10px";
  overlay.style.color = "white";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  document.body.appendChild(overlay);

  controls = new OrbitControls(camera, renderer.domElement);

  let ambientLight = new THREE.AmbientLight(0xffffff, 1.5),
    dLight = new THREE.DirectionalLight(0xffffff, 1.5);
  scene.add(dLight, ambientLight);

  textureLoader.load("/Images/Ri_B1 1.png", (texture) => {
    // Ribbon effect
    for (let i = 0; i < 15; i++) createPlane(texture); // Add zigzag plane
  });
  // Add confetti papers

  for (let i = 0; i < confettiCount; i++) createConfetti();

  animate();
}

function updateOverlay() {
  const memoryInfo = performance.memory || {
    totalJSHeapSize: 0,
    usedJSHeapSize: 0,
  };
  overlay.innerHTML = `
     <strong>Draw Calls:</strong> ${renderer.info.render.calls}<br>
     <strong>Frame:</strong> ${renderer.info.render.frame}<br>
     <strong>Textures:</strong> ${renderer.info.memory.textures}<br>
     <strong>Geometries:</strong> ${renderer.info.memory.geometries} <br>
     <strong>Memory Usage:</strong> ${(
       memoryInfo.usedJSHeapSize /
       (1024 * 1024)
     ).toFixed(2)} MB / ${(memoryInfo.totalJSHeapSize / (1024 * 1024)).toFixed(
    2
  )} MB
 `;
}

function createPlane(texture) {
  // Increase the size of the ribbon for better visibility
  const planeGeometry = new THREE.PlaneGeometry(0.1, 5, 100, 100); // Larger ribbon size
  planeGeometry.rotateZ(Math.PI / 2);
  planeGeometry.rotateX(Math.PI / 2);
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    wireframe: false, // Enable wireframe for debugging visibility
    transparent: true,
  });

  let points = [
    new THREE.Vector3(Math.random() * 2 - 1, 8, -10),
    new THREE.Vector3(Math.random() * 2 - 1, 7, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 6.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 6, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 5.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 4.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 4, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 3.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 3, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 2.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 2, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 1.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 1, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 0.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, 0, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -0.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -1.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -2.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -4.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -5.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -6, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -6.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -6.5, 0),
    new THREE.Vector3(Math.random() * 2 - 1, -7, -10),
  ];

  // Define the zigzag curve with more points for better smoothness
  zigzagCurve1 = new THREE.CatmullRomCurve3(points);
  let curvesArray = [zigzagCurve1];
  // console.log(zigzagCurve1);
  for (let i = 0; i < curvesArray.length; i++) {
    curvesArray[i].curveType = "centripetal";
    curvesArray[i].tension = 0.7;
    curvesArray[i].closed = true; // Open curve to animate from top to bottom
    // console.log(curvesArray[i])
  }

  // Create InstancedFlow with a larger number of instances for better visibility
  const instanceCount = 10; // Increase number of instances
  const instanceCuves = 1; // Increase number of instances
  flow = new InstancedFlow(
    instanceCount,
    instanceCuves,
    planeGeometry,
    planeMaterial
  );
  flow.object3D.position.x = (Math.random() - 0.5) * 20; // Random x position for each ribbon
  scene.add(flow.object3D);
  ribbons.push(flow);

  // Apply the zigzag curve to the flow
  for (let i = 0; i < instanceCuves; i++) {
    flow.updateCurve(i, curvesArray[i]); // Update each instance's curve
    flow.setCurve(i, i);
    flow.moveIndividualAlongCurve(i, Math.random());
    flow.object3D.setColorAt(i, new THREE.Color(0xffffff * Math.random() * 2));
    flow.curveArray[0].needsUpdate = true;
  }
}

// Create a confetti particle
function createConfetti() {
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.copy(new THREE.PlaneGeometry(0.1, 0.1)); // Confetti size
  const material = new THREE.MeshBasicMaterial({
    color: getRandomColor(),
    side: THREE.DoubleSide,
  });
  const confetti = new THREE.InstancedMesh(geometry, material, confettiCount);

  confetti.position.set(
    (Math.random() - 0.5) * 25, // Random X position
    5,
    -1.5
  );

  confetti.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  confetti.userData = {
    xSpeed: (Math.random() - 0.5) * 0.04, // Random X movement
    ySpeed: -(Math.random() * 0.03 + 0.01), // Fall downwards with random speed
    rotationSpeed: (Math.random() - 0.5) * 0.1,
  };

  scene.add(confetti);
  confettiPapers.push(confetti);
}

function getRandomColor() {
  const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200];
  return colors[Math.floor(Math.random() * colors.length)];
}

let clock = new THREE.Clock();
let flowProgress = 0;

function animate() {
  stats.begin();
  stats.update();

  updateOverlay();
  requestAnimationFrame(animate);
  controls.update();

  let elapsedTime = clock.getElapsedTime();
  if (isAnimating) {
    // Animate the confetti
    confettiPapers.forEach((paper, index) => {
      paper.position.x +=
        Math.sin(elapsedTime + index * 0.8) * 0.01 + paper.userData.xSpeed;
      paper.position.y += paper.userData.ySpeed;
      paper.rotation.x += paper.userData.rotationSpeed;
      paper.rotation.y += 0.25;

      // Reset position when it falls off-screen
      if (paper.position.y < -5) {
        paper.position.y = 5;
        paper.position.x = (Math.random() - 0.5) * 20;
      }
    });

    // Animate the ribbons along the curve
    ribbons.forEach((flow, index) => {
      if (flow) {
        // Initialize previousY if it doesn't exist
        if (flow.previousY === undefined) {
          flow.previousY = flow.object3D.position.y;
        }

        // Move along the curve
        const flowProgress = 0.0005; // Increment progress
        flow.moveAlongCurve(flowProgress);
        flow.object3D.position.needsUpdate = true;

        // Check if the y position is increasing or decreasing
        const currentY = flow.object3D.position.y;

        if (currentY > flow.previousY) {
          flow.object3D.visible = false; // Y is increasing, make it invisible
        } else {
          flow.object3D.visible = true; // Y is decreasing, make it visible
        }

        // Store the current Y position for the next frame
        flow.previousY = currentY;
      }
    });
  }

  renderer.render(scene, camera);
  stats.end();
}

// Handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.left = window.innerWidth / -200;
  camera.right = window.innerWidth / 200;
  camera.top = window.innerHeight / 200;
  camera.bottom = window.innerHeight / -200;
  camera.updateProjectionMatrix();
});

// Initialize the scene
init();
