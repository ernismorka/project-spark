import * as pc from "playcanvas";
import { fieldPads, type FieldState } from "@spark/game-core";
import type { Language } from "@spark/shared";
import { fieldCopy, fieldTask, fieldVoltage } from "../FieldDiagnostics";
import type { Difficulty } from "../difficulty";

export function buildJournalPages(
  device: pc.GraphicsDevice,
  left: pc.Entity,
  right: pc.Entity,
) {
  const pages = [left, right].map((wing, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 512;
    const context = canvas.getContext("2d")!;
    const texture = new pc.Texture(device, {
      name: "Live journal page",
      width: canvas.width,
      height: canvas.height,
      mipmaps: true,
      minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
    });
    texture.setSource(canvas);
    const material = new pc.StandardMaterial();
    material.useLighting = false;
    material.diffuse.set(0, 0, 0);
    material.emissive.set(1, 1, 1);
    material.emissiveMap = texture;
    material.update();
    const mesh = pc.Mesh.fromGeometry(
      device,
      new pc.PlaneGeometry({
        halfExtents: new pc.Vec2(0.264, 0.358),
        widthSegments: 1,
        lengthSegments: 1,
      }),
    );
    const page = new pc.Entity("printed journal leaf");
    page.addComponent("render", {
      meshInstances: [new pc.MeshInstance(mesh, material, page)],
    });
    page.setLocalPosition(i === 0 ? -0.315 : 0.315, 0.022, 0);
    wing.addChild(page);
    return { context, texture, material };
  });
  let lastField: FieldState | undefined;
  let lastLanguage: Language | undefined;
  let lastDifficulty: Difficulty | undefined;
  return {
    write(field: FieldState, language: Language, difficulty: Difficulty) {
      if (
        field === lastField &&
        language === lastLanguage &&
        difficulty === lastDifficulty
      )
        return;
      lastField = field;
      lastLanguage = language;
      lastDifficulty = difficulty;
      const copy = fieldCopy[language];
      pages.forEach(({ context: ctx, texture }, i) => {
        ctx.fillStyle = i === 0 ? "#fff1cf" : "#fff5dd";
        ctx.fillRect(0, 0, 384, 512);
        ctx.strokeStyle = "#527a8c28";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 18; x < 378; x += 18) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 512);
        }
        for (let y = 18; y < 512; y += 18) {
          ctx.moveTo(0, y);
          ctx.lineTo(384, y);
        }
        ctx.stroke();
        ctx.fillStyle = "#294b5d";
        ctx.font = "bold 25px sans-serif";
        ctx.fillText(i === 0 ? copy.measurements : copy.stage, 26, 51, 332);
        ctx.font = "italic 25px Georgia, serif";
        ctx.fillText(i === 0 ? copy.before : copy.after, 27, 92, 330);
        ctx.strokeStyle = "#bb7757";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(25, 114);
        ctx.lineTo(357, 114);
        ctx.stroke();
        fieldPads.forEach(({ id }, index) => {
          const y = 168 + index * 88;
          ctx.font = "bold 24px sans-serif";
          ctx.fillStyle = "#425768";
          ctx.fillText(copy.labels[id], 28, y, 330);
          ctx.font = "italic bold 34px Georgia, serif";
          ctx.fillStyle = "#12697a";
          ctx.fillText(
            fieldVoltage(language, (i === 0 ? field.before : field.after)[id]),
            28,
            y + 37,
          );
        });
        ctx.font = "17px sans-serif";
        ctx.fillStyle = "#425768";
        const lines: string[] = [];
        for (const word of fieldTask(field, language, difficulty).split(" ")) {
          const index = lines.length - 1;
          const next = index < 0 ? word : `${lines[index]} ${word}`;
          if (index < 0 || ctx.measureText(next).width > 330) lines.push(word);
          else lines[index] = next;
        }
        lines
          .slice(0, 3)
          .forEach((line, index) => ctx.fillText(line, 27, 419 + index * 22));
        texture.upload();
      });
    },
    dispose() {
      for (const { material, texture } of pages) {
        material.destroy();
        texture.destroy();
      }
    },
  };
}
