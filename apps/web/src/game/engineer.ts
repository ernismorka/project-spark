import * as pc from "playcanvas";
import type { Workshop } from "./workshop-art";
import { easePose, journalKeys, runKeys, walkKeys } from "./engineer-motion";

function joint(parent: pc.Entity, name: string, x = 0, y = 0, z = 0) {
  const entity = new pc.Entity(name);
  entity.setLocalPosition(x, y, z);
  parent.addChild(entity);
  return entity;
}

export function buildEngineer(workshop: Workshop, root: pc.Entity) {
  const entity = joint(root, "engineer");
  const body = joint(entity, "engineer-pose");
  const torso = workshop("torso", body);
  const head = workshop("helmet", body, 0, 1.29);
  const eyes = [-1, 1].map((side) =>
    workshop("eye", head, side * 0.135, 0.196, 0.409),
  );
  workshop("mouth", head, 0, 0.103, 0.406);
  const shield = workshop("faceShield", head, 0, 0.4, 0.32);
  shield.enabled = false;
  const legs = [-1, 1].map((side) => {
    const upper = workshop("thigh", body, side * 0.19, 0.65);
    return { upper, lower: workshop("boot", upper, 0, -0.28) };
  });
  const arms = [-1, 1].map((side) => {
    const upper = workshop("upperArm", body, side * 0.366, 1.13);
    const lower = workshop("forearm", upper, 0, -0.27);
    const hand = workshop("glove", lower, 0, -0.218);
    if (side < 0) hand.setLocalScale(-1, 1, 1);
    return { upper, lower, hand, side };
  });

  const book = workshop("bookSpine", body);
  const left = workshop("bookLeft", book);
  const right = workshop("bookRight", book);
  book.enabled = false;
  const down = new pc.Vec3(0, -1, 0);
  const grip = new pc.Vec3();
  const elbow = new pc.Vec3();
  const upperDirection = new pc.Vec3();
  const lowerDirection = new pc.Vec3();
  const upperRotation = new pc.Quat();
  const lowerRotation = new pc.Quat();
  const inverse = new pc.Quat();
  let stride = 0;
  let heading = Math.PI;
  let activity = 0;
  let runBlend = 0;
  let groundedBlend = 1;
  function gripArm(index: number, target: pc.Vec3, amount: number) {
    const { upper, lower } = arms[index];
    upperDirection.sub2(target, upper.getLocalPosition());
    const distance = Math.min(0.478, upperDirection.length());
    upperDirection.normalize();
    const along =
      (0.27 ** 2 - 0.218 ** 2 + distance ** 2) /
      (2 * Math.max(distance, 0.005));
    elbow
      .copy(down)
      .sub(
        lowerDirection.copy(upperDirection).mulScalar(down.dot(upperDirection)),
      )
      .normalize();
    elbow.mulScalar(Math.sqrt(Math.max(0, 0.27 ** 2 - along ** 2)));
    elbow.add(upperDirection.mulScalar(along));
    lowerDirection
      .sub2(target, upper.getLocalPosition())
      .sub(elbow)
      .normalize();
    upperRotation.setFromDirections(down, elbow.normalize());
    inverse
      .copy(upperRotation)
      .invert()
      .transformVector(lowerDirection, lowerDirection);
    lowerRotation.setFromDirections(down, lowerDirection);
    upper.setLocalRotation(
      upperRotation.slerp(upper.getLocalRotation(), upperRotation, amount),
    );
    lower.setLocalRotation(
      lowerRotation.slerp(lower.getLocalRotation(), lowerRotation, amount),
    );
  }
  const wristRotation = new pc.Quat().setFromEulerAngles(-78, 0, 0);
  return {
    entity,
    body,
    leftHand: arms[0].hand,
    hand: arms[1].hand,
    book,
    left,
    right,
    operate(left: pc.Vec3, right: pc.Vec3, weld: boolean) {
      for (let i = 0; i < arms.length; i++) {
        const { upper, lower, hand } = arms[i];
        gripArm(i, i === 0 ? left : right, 1);
        inverse
          .mul2(upper.getLocalRotation(), lower.getLocalRotation())
          .invert();
        hand.setLocalRotation(inverse.mul(wristRotation));
      }
      shield.enabled = weld;
      head.setLocalEulerAngles(14, 0, 0);
    },
    animate(
      dt: number,
      time: number,
      speed: number,
      grounded: boolean,
      facing: number,
      reach: number,
      journal: number,
      journalYaw: number,
      reduced: boolean,
    ) {
      const ease = reduced ? 1 : 1 - Math.exp(-14 * dt);
      const turn = Math.atan2(
        Math.sin(journalYaw - facing),
        Math.cos(journalYaw - facing),
      );
      const targetHeading =
        facing + turn * easePose(journal / journalKeys.lift);
      heading +=
        Math.atan2(
          Math.sin(targetHeading - heading),
          Math.cos(targetHeading - heading),
        ) * (journal === 1 ? 1 : ease);
      entity.setLocalEulerAngles(0, heading * pc.math.RAD_TO_DEG, 0);
      activity += (Math.min(speed / 3.6, 1) - activity) * ease;
      runBlend += (easePose((speed - 4) / 3) - runBlend) * ease;
      groundedBlend += (Number(grounded) - groundedBlend) * ease;
      stride += speed * dt * 0.45;
      const sway = reduced ? 0 : Math.sin(stride * Math.PI * 2) * activity;
      const breath = reduced
        ? 0
        : Math.sin(time * 2.75) * 0.018 * (1 - activity);
      const settle = easePose(journal / journalKeys.lift);
      body.setLocalPosition(
        0,
        (breath + Math.abs(sway) * groundedBlend * 0.057) * (1 - settle) -
          reach * 0.075,
        0,
      );
      body.setLocalEulerAngles(
        reach * 14 + activity * 8 * runBlend * (1 - settle),
        sway * 5 * (1 - settle),
        sway * 3 * (1 - settle),
      );
      head.setLocalEulerAngles(
        3 + settle * 10 - reach * 5,
        (reduced
          ? 0
          : Math.sin(time * 1.6) * 7 * (1 - activity) * (1 - settle)) +
          settle * 3,
        sway * -2,
      );
      const blink = reduced
        ? 1
        : 1 - 0.92 * Math.max(0, 1 - Math.abs((time % 4.2) - 3.75) * 14);
      for (const eye of eyes)
        eye.setLocalScale(1, blink * (1 - settle * 0.23), 1);

      const lifted = easePose(
        (journal - journalKeys.grip) / (journalKeys.lift - journalKeys.grip),
      );
      const spread = easePose(
        (journal - journalKeys.lift) / (journalKeys.spread - journalKeys.lift),
      );
      book.enabled = journal >= journalKeys.grip;
      const firstPerson = journal >= 0.88;
      head.enabled = !firstPerson;
      shield.enabled = false;
      torso.enabled = !firstPerson;
      for (const leg of legs) leg.upper.enabled = !firstPerson;
      if (book.enabled) {
        book.setLocalPosition(
          -0.45 * (1 - lifted),
          0.84 + 0.24 * lifted,
          -0.17 + 0.7 * lifted,
        );
        book.setLocalEulerAngles(
          -43 * lifted,
          -36 * (1 - lifted),
          12 * (1 - lifted),
        );
        const size = 0.23 + 0.69 * lifted;
        book.setLocalScale(size, size, size);
        left.setLocalEulerAngles(0, 0, -91 + 91 * spread);
        right.setLocalEulerAngles(0, 0, 91 - 91 * spread);
      }
      const swing = activity * groundedBlend * (reduced ? 0.45 : 1);
      for (let i = 0; i < 2; i++) {
        const phase = ((stride + i * 0.5) % 1) * 4;
        const frame = Math.floor(phase);
        const fraction = easePose(phase - frame);
        const angle = (axis: number) =>
          pc.math.lerp(
            pc.math.lerp(
              walkKeys[frame][axis],
              walkKeys[frame + 1][axis],
              fraction,
            ),
            pc.math.lerp(
              runKeys[frame][axis],
              runKeys[frame + 1][axis],
              fraction,
            ),
            runBlend,
          ) * swing;
        legs[i].upper.setLocalEulerAngles(
          angle(0) - 18 * (1 - groundedBlend),
          0,
          i === 0 ? -3 : 3,
        );
        legs[i].lower.setLocalEulerAngles(
          -angle(1) - 45 * (1 - groundedBlend),
          0,
          0,
        );
        const { upper, lower, hand, side } = arms[i];
        upper.setLocalEulerAngles(
          angle(2) - reach * (i === 1 ? 52 : 22),
          0,
          side * 10,
        );
        lower.setLocalEulerAngles(-angle(3) - 13 - reach * 19, 0, 0);
        hand.setLocalEulerAngles(0, 0, -side * 5);
        if (journal <= 0) continue;

        // Two rigid segments follow the cover edges. Keep the elbows below
        // the wrists so the hands support the book rather than hiding the text.
        const amount =
          i === 0 ? easePose(journal / 0.2) : easePose((journal - 0.22) / 0.34);
        grip.set(
          pc.math.lerp(-0.47, side * (0.16 + spread * 0.46), lifted),
          pc.math.lerp(0.85, 0.92 + (1 - spread) * 0.205, lifted),
          pc.math.lerp(-0.12, 0.33 + (1 - spread) * 0.12, lifted),
        );
        gripArm(i, grip, amount);
      }
    },
  };
}
