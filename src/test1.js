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
  ribbons = [],
  testBox;
const confettiCount = 100;
let controls, flow, zigzagCurve1, overlay;
let textureLoader = new THREE.TextureLoader();

let topBox,topBoxBB,bottomBox,bottomBoxBB 

// Animation state flag
let isAnimating = true;

// Initialize Three.js scene
async function init() {
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    window.innerWidth / -100,
    window.innerWidth / 100,
    window.innerHeight / 100,
    window.innerHeight / -100,
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

  let testgeometry = new THREE.BoxGeometry(35,0.1)
  let testMaterial=new THREE.MeshBasicMaterial({color:"yellow"})

  topBox = new THREE.Mesh(testgeometry,testMaterial)
  topBox.position.y = 6
  bottomBox = new THREE.Mesh(testgeometry,testMaterial)
  bottomBox.position.y = -6
  
  scene.add(topBox,bottomBox)

  let ambientLight = new THREE.AmbientLight(0xffffff, 1.5),
    dLight = new THREE.DirectionalLight(0xffffff, 1.5);
  scene.add(dLight, ambientLight);

  textureLoader.load("/Images/Ri_B1 1.png", (texture) => {
    // Ribbon effect
    for (let i = 0; i < 15; i++) createRibbon(texture); // Add zigzag plane
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

function createRibbon(texture) {
  // Increase the size of the ribbon for better visibility
  const ribbonGeometry = new THREE.PlaneGeometry(0.1, 5, 100, 100); // Larger ribbon size
  ribbonGeometry.rotateZ(Math.PI / 2);
  ribbonGeometry.rotateX(Math.PI / 2);
  const ribbonMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    wireframe: false, // Enable wireframe for debugging visibility
    transparent: true,
    color: "green",
  });

  let points = [
    new THREE.Vector3(0.5, 8, 0),
    new THREE.Vector3(0.1, 7, 0),
    new THREE.Vector3(0.3, 6.5, 0),
    new THREE.Vector3(0.4, 6, 0),
    new THREE.Vector3(0.5, 5.5, 0),
    new THREE.Vector3(0.6, 5, 0),
    new THREE.Vector3(0.7, 4.5, 0),
    new THREE.Vector3(0.5, 4, 0),
    new THREE.Vector3(0.4, 3.5, 0),
    new THREE.Vector3(0.2, 3, 0),
    new THREE.Vector3(0.1, 2.5, 0),
    new THREE.Vector3(-0.1, 2, 0),
    new THREE.Vector3(0.5, 1.5, 0),
    new THREE.Vector3(-0.5, 1, 0),
    new THREE.Vector3(0.5, 0.5, 0),
    new THREE.Vector3(-0.5, 0, 0),
    new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(-0.5, -1.5, 0),
    new THREE.Vector3(0.5, -2.5, 0),
    new THREE.Vector3(-0.5, -4.5, 0),
    new THREE.Vector3(0.5, -5, 0),
    new THREE.Vector3(-0.5, -5.5, 0),
    new THREE.Vector3(0.5, -6, 0),
    new THREE.Vector3(-0.5, -6.5, 0),
    new THREE.Vector3(0.5, -6.5, 0),
    new THREE.Vector3(-0.5, -7, 0),
    new THREE.Vector3(-0.5, -5, 0),
    new THREE.Vector3(-0.5, -3, 0),
    new THREE.Vector3(-0.5, -1, 0),
    new THREE.Vector3(-0.5, 0, 0),
    new THREE.Vector3(-0.5, 1, 0),
    new THREE.Vector3(-0.5, 4, 0),
    new THREE.Vector3(-0.5, 6, 0),
    new THREE.Vector3(-0.5, 7, 0),
    new THREE.Vector3(-0.5, 8, 0),
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
  const instanceCuves = 1; // Increase number of curves
  let mesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
  flow = new Flow(mesh, instanceCuves);
  //   flow.object3D.position.x = Math.random() * 8;
  console.log(mesh.position, flow.object3D.position);

  // flow.object3D.position.x = (Math.random() - 0.5) * 20; // Random x position for each ribbon
  scene.add(flow.object3D);
  ribbons.push(flow);

  //*******************TESTBOX************************ */

  testBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  testBox.position.x = 0;
  scene.add(testBox);

  //*******************TESTBOX************************ */

  flow.updateCurve(0, curvesArray[0]); // Update each instance's curve
  console.log(flow.object3D);
  flow.curveArray[0].needsUpdate = true;
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
  const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd100];
  return colors[Math.floor(Math.random() * colors.length)];
}

let clock = new THREE.Clock();
let flowProgress = 0,
  t = 0.25;

function animate() {
  stats.begin();
  stats.update();

  updateOverlay();
  requestAnimationFrame(animate);
  controls.update();

  t += 0.00005;
  if (t > 1) t = 0.44;

  let elapsedTime = clock.getElapsedTime();
  let deltaTime = clock.getDelta();

  updateConfetti(elapsedTime);
  updateRibbons(elapsedTime, deltaTime, t);

  renderer.render(scene, camera);
  stats.end();
}

function updateRibbons(elapsedTime, deltaTime, t) {
  //   ribbons.forEach((flow, index) => {
  if (flow) {
    // Move along the curve
    flowProgress = 0.00005; // Increment progress
    flow.moveAlongCurve(flowProgress);

    const curbeProgress = t;
    let pointOnCurve = flow.curveArray[0].getPoint(curbeProgress);
    testBox.position.set(pointOnCurve.x, pointOnCurve.y, pointOnCurve.z);
  }
  //   });
}

function updateConfetti(elapsedTime) {
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
}

// Handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.left = window.innerWidth / -100;
  camera.right = window.innerWidth / 100;
  camera.top = window.innerHeight / 100;
  camera.bottom = window.innerHeight / -100;
  camera.updateProjectionMatrix();
});

// Initialize the scene
init();
