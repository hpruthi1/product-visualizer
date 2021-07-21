import { database } from "./Database";

let model;
let skybox;
let xrayState;

let event = new Event("onModelLoad");

//Model importing
export function ImportModel(ctx, URL, name) {
  ctx.loader.load(
    URL,
    (Model) => {
      Model.scene.name = name;
      const temp = ctx.scene.getObjectByName(Model.scene.name);
      if (temp !== null) {
        ctx.scene.remove(temp);
      }
      model = Model.scene;
      ctx.scene.add(model);
      window.dispatchEvent(event);
      if (skybox) {
        model.traverse((child) => {
          if (child.isMesh) child.material.envMap = skybox;
        });
      }
      model.traverse((child) => {
        if (child.isMesh) child.material.wireframe = xrayState;
      });
    },
    () => {},
    (error) => {
      console.log(error);
    }
  );
}

export function LoadSkybox(ctx, URL) {
  ctx.textureLoader.load(
    URL,
    (texture) => {
      skybox = texture;
      texture.mapping = ctx.three.EquirectangularReflectionMapping;
      ctx.scene.background = skybox;
      if (model) {
        model.traverse((child) => {
          if (child.isMesh) child.material.envMap = skybox;
        });
      }
    },
    () => {},
    (error) => {
      console.log(error);
    }
  );
}

export function xrayView(bool) {
  xrayState = bool;
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.wireframe = xrayState;
        child.material.transparent = true;
      }
    });
  }
}

export { model };
