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
    () => {}
  );
}
