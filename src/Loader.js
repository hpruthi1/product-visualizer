import { database } from "./Database";

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
      ctx.scene.add(Model.scene);
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
      ctx.scene.background = texture;
    },
    () => {},
    (error) => {
      console.log(error);
    }
  );
}
