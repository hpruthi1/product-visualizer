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
      Model.envMap = ctx.scene.background;
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
      texture.mapping = ctx.three.EquirectangularReflectionMapping;
      ctx.scene.background = texture;
      console.log(texture);
    },
    () => {},
    (error) => {
      console.log(error);
    }
  );
}
