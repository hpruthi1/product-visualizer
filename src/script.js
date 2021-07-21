import * as THREE from "../three/build/three.module.js";
import { GLTFLoader } from "../three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "../three/examples/jsm/loaders/RGBELoader.js";
import * as Database from "./Database.js";
import * as Loader from "./Loader.js";
import { GUI } from "../three/examples/jsm/libs/dat.gui.module.js";

//Scene
const scene = new THREE.Scene();

let gui;

gui = new GUI();

//Loader
let modelLoader = new GLTFLoader();

let textureLoader = new RGBELoader();

//An object that can be accessed in other scripts
let ctx = {
  database: Database,
  loader: modelLoader,
  scene: scene,
  textureLoader: textureLoader,
  three: THREE,
  gui: gui,
};

let Buttons = document.getElementsByClassName("buttons");
let SkyboxButtons = document.getElementsByClassName("skyboxBTN");
let lights = document.getElementsByClassName("light");

function SetURL() {
  for (let i = 0; i < Buttons.length; i++) {
    ItemInfo[Buttons[i].id] = ctx.database.database[i].URL;
  }
}

function SetSkyboxURL() {
  for (let index = 0; index < SkyboxButtons.length; index++) {
    Skyboxes[SkyboxButtons[index].id] = ctx.database.skyboxDatabase[index].URL;
  }
}

let selectedItemURL;
let selectedSkyboxURL;

let ItemInfo = {
  button1: "",
  button2: "",
  button3: "",
};

let Skyboxes = {
  button4: "",
  button5: "",
  button6: "",
};

function BindSelectionEvent() {
  for (let i = 0; i < Buttons.length; i++) {
    Buttons[i].addEventListener("click", () => {
      SetURL();
      selectedItemURL = ItemInfo[Buttons[i].id];
      Loader.ImportModel(ctx, selectedItemURL, ctx.database.database.name);
    });
  }
}

function BindSkyboxSelectionEvent() {
  for (let i = 0; i < SkyboxButtons.length; i++) {
    SkyboxButtons[i].addEventListener("click", () => {
      SetSkyboxURL();
      selectedSkyboxURL = Skyboxes[SkyboxButtons[i].id];
      Loader.LoadSkybox(ctx, selectedSkyboxURL);
    });
  }
}

let id;

function GetLightsID() {
  for (let index = 0; index < lights.length; index++) {
    lights[index].addEventListener("click", () => {
      id = lights[index].id;
      AddLightToScene(id);
    });
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  BindSelectionEvent();
  BindSkyboxSelectionEvent();
  GetLightsID();
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

function AddLightToScene(id) {
  switch (id) {
    case "hemisphereButton":
      let hemispherelight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
      scene.add(hemispherelight);
      const helper = new THREE.HemisphereLightHelper(hemispherelight, 5);
      scene.add(helper);
      console.log(hemispherelight);
      break;
    case "directionalButton":
      let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      scene.add(directionalLight);
      const dirlighthelper = new THREE.DirectionalLightHelper(
        directionalLight,
        5
      );
      scene.add(dirlighthelper);
      console.log(directionalLight);
      break;
    case "spotLightButton":
      let spotLight = new THREE.SpotLight(0xffffff);
      spotLight.position.set(100, 1000, 100);
      spotLight.castShadow = true;
      scene.add(spotLight);
      const spotLightHelper = new THREE.SpotLightHelper(spotLight);
      scene.add(spotLightHelper);
      console.log(spotLight);
      break;
    case "pointLightButton":
      let pointlight = new THREE.PointLight(0xff0000, 1, 100);
      pointlight.position.set(50, 50, 50);
      scene.add(pointlight);
      const sphereSize = 1;
      const pointLightHelper = new THREE.PointLightHelper(
        pointlight,
        sphereSize
      );
      scene.add(pointLightHelper);
      console.log(pointlight);
      break;
    case "AmbientLightButton":
      let ambientlight = new THREE.AmbientLight(0x404040);
      scene.add(ambientlight);
      break;
  }
}

//Update function
const animate = function () {
  // render the scene with our camera
  renderer.render(scene, camera);

  // runs 60 times each seconds
  requestAnimationFrame(animate);
};

// start loop
animate();
