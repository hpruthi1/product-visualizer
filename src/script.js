import * as THREE from "../three/build/three.module.js";
import { GLTFLoader } from "../three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "../three/examples/jsm/loaders/RGBELoader.js";
import * as Database from "./Database.js";
import * as Loader from "./Loader.js";

//Scene
const scene = new THREE.Scene();

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
};

let Buttons = document.getElementsByClassName("buttons");
let SkyboxButtons = document.getElementsByClassName("skyboxBTN");
let xRayBTN = document.getElementById("xray");

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

window.addEventListener("DOMContentLoaded", (event) => {
  BindSelectionEvent();
  BindSkyboxSelectionEvent();
  xRayBTN.onclick = () => {
    Loader.xrayView(xRayBTN.checked);
  };
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
controls.enablePan = false;
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

//Update function
const animate = function () {
  // render the scene with our camera
  renderer.render(scene, camera);

  // runs 60 times each seconds
  requestAnimationFrame(animate);
};

// start loop
animate();

window.addEventListener("onModelLoad", () => {
  if (Loader.model) {
    Loader.model.traverse((child) => {
      if (child.isMesh) {
        child.material.onBeforeCompile = (shader) => {
          shader.uniforms.isXRay = uniforms.isXRay;
          shader.uniforms.rayAng = uniforms.rayAng;
          shader.uniforms.rayOri = uniforms.rayOri;
          shader.uniforms.rayDir = uniforms.rayDir;
          shader.vertexShader = `
          uniform vec3 rayOri;
          varying vec3 vPos;
          varying float vXRay;
          ${shader.vertexShader}
        `.replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
            vPos = (modelMatrix * vec4(position, 1.)).xyz;

            vec3 vNormal = normalize( normalMatrix * normal );
            vec3 vNormel = normalize( normalMatrix * normalize(rayOri - vPos) );
            vXRay = pow(1. - dot(vNormal, vNormel), 3. );
          `
          );
          shader.fragmentShader = `
          uniform float isXRay;
          uniform float rayAng;
          uniform vec3 rayOri;
          uniform vec3 rayDir;

         varying vec3 vPos;
         varying float vXRay;
          ${shader.fragmentShader}
        `.replace(
            `#include <dithering_fragment>`,
            `#include <dithering_fragment>

          if(abs(isXRay) > 0.5){

            vec3 xrVec = vPos - rayOri;
            vec3 xrDir = normalize( xrVec );
            float angleCos = dot( xrDir, rayDir );

            vec4 col = vec4(0, 1, 1, 1) * vXRay;
            col.a = 0.5;
            gl_FragColor = mix(gl_FragColor, col, smoothstep(rayAng - 0.02, rayAng, angleCos));

          }

          `
          );
        };
      }
    });
  }

  let uniforms = {
    isXRay: { value: false },
    rayAng: { value: 0.975 },
    rayOri: { value: new THREE.Vector3() },
    rayDir: { value: new THREE.Vector3() },
  };

  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.button == 2) {
      uniforms.isXRay.value = true;
    }
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (event.button == 2) {
      uniforms.isXRay.value = false;
    }
  });
  renderer.domElement.addEventListener("pointermove", (event) => {
    setXRay(event);
  });

  renderer.setAnimationLoop((_) => {
    renderer.render(scene, camera);
  });

  function setXRay(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (Loader.model && uniforms.isXRay.value) {
      uniforms.rayOri.value.copy(raycaster.ray.origin);
      uniforms.rayDir.value.copy(raycaster.ray.direction);
    }
  }
});
