import type { Explorer } from "@spark/shared";
import { movement as m, solids, world } from "./world";
export function recoverPlayer(player: Explorer): Explorer {
  const { x, y, z } = player.position;
  return ![x, y, z].every(Number.isFinite) ||
    y < -8 ||
    Math.abs(x) > world.halfWidth + 8 ||
    Math.abs(z) > world.halfDepth + 8
    ? {
        ...player,
        position: { ...world.spawn },
        velocity: { x: 0, y: 0, z: 0 },
        grounded: true,
      }
    : player;
}
export function movePlayer(
  player: Explorer,
  input: { x: number; z: number; run: boolean; jump: boolean },
): Explorer {
  const dt = m.step;
  const length = Math.max(1, Math.hypot(input.x, input.z));
  const speed = input.run ? m.run : m.walk;
  const approach = (a: number, b: number) =>
    a + Math.sign(b - a) * Math.min(Math.abs(b - a), m.acceleration * dt);
  const velocity = {
    x: approach(player.velocity.x, (input.x / length) * speed),
    y: player.velocity.y,
    z: approach(player.velocity.z, (input.z / length) * speed),
  };
  if (input.jump && player.grounded) velocity.y = m.jump;
  velocity.y -= m.gravity * dt;
  const position = { ...player.position };
  // Axis-separated cylinder-vs-expanded-box approximation. Vertical sweep lands on tops.
  for (const axis of ["x", "z"] as const) {
    const next = position[axis] + velocity[axis] * dt;
    const blocked = solids.some(
      (s) =>
        position.y < s.height - 0.02 &&
        position.y + m.height > 0 &&
        Math.abs((axis === "x" ? next : position.x) - s.x) <
          s.width / 2 + m.radius &&
        Math.abs((axis === "z" ? next : position.z) - s.z) <
          s.depth / 2 + m.radius,
    );
    if (blocked) velocity[axis] = 0;
    else position[axis] = next;
  }
  const oldY = position.y;
  position.y += velocity.y * dt;
  let floor = -Infinity;
  if (
    Math.abs(position.x) <= world.halfWidth &&
    Math.abs(position.z) <= world.halfDepth
  )
    floor = 0;
  for (const s of solids)
    if (
      Math.abs(position.x - s.x) < s.width / 2 + m.radius &&
      Math.abs(position.z - s.z) < s.depth / 2 + m.radius &&
      oldY >= s.height - 0.02 &&
      position.y <= s.height &&
      velocity.y <= 0
    )
      floor = Math.max(floor, s.height);
  let grounded = false;
  if (position.y <= floor && velocity.y <= 0) {
    position.y = floor;
    velocity.y = 0;
    grounded = true;
  }
  const facing =
    Math.hypot(velocity.x, velocity.z) > 0.1
      ? Math.atan2(velocity.x, velocity.z)
      : player.facing;
  return recoverPlayer({ ...player, position, velocity, grounded, facing });
}
