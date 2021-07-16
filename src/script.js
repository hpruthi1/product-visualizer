import * as THREE from "../three/build/three.module.js";
import { GLTFLoader } from "../three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../three/examples/jsm/controls/OrbitControls.js";
import * as Database from "./Database.js";
import * as Loader from "./Loader.js";

//Scene
const scene = new THREE.Scene();

//Loader
let modelLoader = new GLTFLoader();

//An object that can be accessed in other scripts
let ctx = {
  database: Database,
  loader: modelLoader,
  scene: scene,
};

function SetURL() {
  for (let i = 0; i < Buttons.length; i++) {
    ItemInfo[Buttons[i].id] = ctx.database.database[i].URL;
  }
}

let selectedItemURL;
let ItemInfo = {
  button1: "",
  button2: "",
  button3: "",
};

let Buttons = document.getElementsByClassName("buttons");

function BindSelectionEvent() {
  for (let i = 0; i < Buttons.length; i++) {
    Buttons[i].addEventListener("click", () => {
      SetURL();
      selectedItemURL = ItemInfo[Buttons[i].id];
      ctx.database.database.URL = selectedItemURL;
      Loader.ImportModel(ctx, selectedItemURL, ctx.database.database.name);
    });
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  BindSelectionEvent();
});

//Camera
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.z = 5;
scene.add(camera);

//Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

//Window Resize event
window.addEventListener("resize", function () {
  let aspectRatio = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
});

//Adding light to Scene
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 12, 8);
scene.add(light);

//Calling function from Loader.js to load models in scene
//Loader.ImportModel(ctx);

//Update function
const animate = function () {
  // render the scene with our camera
  renderer.render(scene, camera);

  // runs 60 times each seconds
  requestAnimationFrame(animate);
};

// start loop
animate();
