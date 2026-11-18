import * as pc from "playcanvas";
import workshopUrl from "../assets/workshop.glb?url";

export async function loadWorkshop(app: pc.AppBase, signal: AbortSignal) {
  const response = await fetch(workshopUrl, { signal });
  if (!response.ok) throw new Error("Workshop mesh could not be loaded.");
  const contents = await response.arrayBuffer();
  signal.throwIfAborted();
  const asset = new pc.Asset("workshop", "container", {
    url: workshopUrl,
    filename: "workshop.glb",
    contents,
  });
  const resource = await new Promise<pc.ContainerResource>(
    (resolve, reject) => {
      asset.once("load", () => {
        if (asset.resource) resolve(asset.resource);
        else reject(new Error("Workshop mesh is empty."));
      });
      asset.once("error", reject);
      app.assets.add(asset);
      app.assets.load(asset);
    },
  );
  signal.throwIfAborted();

  const kit = resource.instantiateRenderEntity({ castShadows: false });
  app.root.addChild(kit);
  kit.enabled = false;
  return (
    name: string,
    parent: pc.Entity,
    x = 0,
    y = 0,
    z = 0,
    batchGroupId = -1,
  ) => {
    const model = kit.findByName(name);
    if (!(model instanceof pc.Entity))
      throw new Error(`Missing workshop mesh ${name}.`);
    const part = model.clone();
    part.setLocalPosition(x, y, z);
    parent.addChild(part);
    part.render!.batchGroupId = batchGroupId;
    return part;
  };
}

export type Workshop = Awaited<ReturnType<typeof loadWorkshop>>;
