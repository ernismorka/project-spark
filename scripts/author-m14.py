"""Bake the original M14 art kit to glTF 2.0 using Python's standard library."""

import json
import math
import struct
from pathlib import Path


def normalize(vector):
    length = math.sqrt(sum(value * value for value in vector))
    return tuple(value / length for value in vector)


def linear_color(hex_code):
    values = [int(hex_code[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(round(((v + 0.055) / 1.055) ** 2.4 * 255) if v > 0.04045
                 else round(v / 12.92 * 255) for v in values) + (255,)


class Model:
    def __init__(self):
        self.positions = []
        self.normals = []
        self.colors = []
        self.indices = []

    def vertex(self, point, normal, color):
        self.positions.append(point)
        self.normals.append(normal)
        self.colors.append(color)

    def quads(self, start, rows, columns, reverse=False):
        for row in range(rows - 1):
            for col in range(columns - 1):
                a = start + row * columns + col
                b = a + columns
                if reverse:
                    self.indices.extend((a, b + 1, b, a, a + 1, b + 1))
                else:
                    self.indices.extend((a, b, b + 1, a, b + 1, a + 1))

    def box(self, origin, dimensions, radius, shade):
        half = [size / 2 for size in dimensions]
        bevel = [size - radius for size in half]
        color = linear_color(shade)
        detail = 6 if max(dimensions) < 1 and radius >= 0.055 else 4
        for axis in range(3):
            u, v = (axis + 1) % 3, (axis + 2) % 3
            coordinates = [
                [-h, -h + radius * 0.35, -c, c, h - radius * 0.35, h]
                if detail == 6 else [-h, -c, c, h]
                for h, c in zip(half, bevel)
            ]
            for direction in (-1, 1):
                start = len(self.positions)
                for a in coordinates[u]:
                    for b in coordinates[v]:
                        vertex = [0, 0, 0]
                        vertex[axis] = half[axis] * direction
                        vertex[u], vertex[v] = a, b
                        inner = [
                            min(limit, max(-limit, value))
                            for value, limit in zip(vertex, bevel)
                        ]
                        normal = normalize(tuple(p - q for p, q in zip(vertex, inner)))
                        point = tuple(o + q + n * radius for o, q, n in zip(origin, inner, normal))
                        self.vertex(point, normal, color)
                self.quads(start, detail, detail, reverse=direction < 0)
        return self

    def lathe(self, origin, profile, shade, segments=24, axis=1, depth=1, normals=None):
        # Rings are listed bottom to top. The profile supplies the real side silhouette.
        color = linear_color(shade)
        start = len(self.positions)
        for i, (height, radius) in enumerate(profile):
            before = profile[max(0, i - 1)]
            after = profile[min(len(profile) - 1, i + 1)]
            dy, dr = after[0] - before[0], after[1] - before[1]
            if normals is not None:
                dy, dr = normals[i]
            for segment in range(segments + 1):
                angle = segment * 2 * math.pi / segments
                c, s = math.cos(angle), math.sin(angle)
                point = (radius * c, height, radius * s * depth)
                normal = normalize((dy * c, -dr, dy * s / depth))
                if axis == 0:
                    point = (point[1], -point[0], point[2])
                    normal = (normal[1], -normal[0], normal[2])
                elif axis == 2:
                    point = (point[0], -point[2], point[1])
                    normal = (normal[0], -normal[2], normal[1])
                self.vertex(tuple(a + b for a, b in zip(origin, point)), normal, color)
        self.quads(start, len(profile), segments + 1)
        return self

    def oval(self, origin, dimensions, shade, segments=16, rings=8):
        # An ellipsoid is useful for contoured protective surfaces and lenses.
        rx, ry, rz = (size / 2 for size in dimensions)
        profile = []
        normals = []
        for ring in range(rings + 1):
            angle = math.pi * ring / rings
            profile.append((-ry * math.cos(angle), rx * math.sin(angle)))
            normals.append((math.sin(angle) / rx, math.cos(angle) / ry))
        return self.lathe(origin, profile, shade, segments, depth=rz / rx, normals=normals)

    def weld(self):
        seen = {}
        remap = []
        positions, normals, colors = [], [], []
        for point, normal, color in zip(self.positions, self.normals, self.colors):
            key = tuple(round(value, 6) for value in point + normal) + color
            if key not in seen:
                seen[key] = len(positions)
                positions.append(point)
                normals.append(normal)
                colors.append(color)
            remap.append(seen[key])
        indices = []
        for i in range(0, len(self.indices), 3):
            triangle = [remap[j] for j in self.indices[i : i + 3]]
            if len(set(triangle)) == 3:
                indices.extend(triangle)
        self.positions, self.normals, self.colors, self.indices = positions, normals, colors, indices


ivory = "ffecd2"
navy = "183951"
ceramic = "e4bb83"
gold = "ffb548"
mint = "80f3d5"
steel = "a8c5cb"
copper = "de9a59"
parts = {}


def part(name):
    parts[name] = Model()
    return parts[name]


# Rigid pieces keep a clear toy silhouette when the joints bend.
torso = part("torso")
torso.box((0, 0.96, 0), (0.64, 0.64, 0.46), 0.17, gold)
torso.box((0, 0.93, 0.21), (0.45, 0.43, 0.14), 0.065, ivory)
torso.box((0, 0.87, 0.29), (0.26, 0.14, 0.055), 0.026, navy)
torso.box((0, 0.87, 0.32), (0.13, 0.035, 0.015), 0.006, mint)
torso.box((0, 0.68, 0), (0.54, 0.18, 0.42), 0.08, navy)
torso.box((0, 1.01, -0.235), (0.51, 0.57, 0.26), 0.1, navy)
torso.box((0, 1.01, -0.34), (0.41, 0.45, 0.14), 0.06, "5b899c")
torso.box((0, 1.08, -0.42), (0.21, 0.14, 0.025), 0.01, mint)
for side in (-1, 1):
    torso.box((side * 0.185, 1.07, -0.416), (0.055, 0.39, 0.05), 0.022, ivory)
    torso.box((side * 0.31, 0.81, -0.14), (0.15, 0.24, 0.23), 0.053, "bd7441")

helmet = part("helmet")
helmet.box((0, 0.215, -0.03), (0.87, 0.69, 0.71), 0.258, ivory)
helmet.box((0, 0.19, 0.243), (0.74, 0.49, 0.23), 0.104, "33596c")
helmet.oval((0, 0.19, 0.315), (0.666, 0.425, 0.21), "112d46", 24, 10)
helmet.box((0, 0.533, -0.064), (0.17, 0.065, 0.52), 0.03, gold)
helmet.box((0, 0.503, -0.27), (0.11, 0.072, 0.13), 0.027, "bc7544")
for side in (-1, 1):
    helmet.oval((side * 0.402, 0.18, -0.04), (0.16, 0.32, 0.29), gold)
    helmet.oval((side * 0.461, 0.18, -0.04), (0.055, 0.17, 0.17), navy)
    helmet.box((side * 0.225, 0.097, 0.372), (0.066, 0.018, 0.013), 0.006, "d48c7a")

part("eye").oval((0, 0, 0), (0.103, 0.137, 0.027), mint)
part("mouth").oval((0, 0, 0), (0.09, 0.027, 0.014), "49c6c6", 12, 6)

part("upperArm").box((0, -0.125, 0), (0.25, 0.32, 0.265), 0.092, ivory).oval(
    (0, -0.258, 0), (0.182, 0.175, 0.191), navy
)
part("forearm").box((0, -0.086, 0), (0.228, 0.245, 0.229), 0.08, gold).box(
    (0, -0.165, 0), (0.211, 0.077, 0.214), 0.034, "cc7942"
)
part("glove").box((0, -0.04, 0.024), (0.207, 0.153, 0.183), 0.062, ivory).oval(
    (0.07, -0.011, 0.081), (0.086, 0.122, 0.086), ivory
)
part("thigh").box((0, -0.133, 0), (0.24, 0.31, 0.252), 0.09, "536b85").oval(
    (0, -0.246, 0.026), (0.197, 0.166, 0.188), navy
)
part("boot").box((0, -0.12, 0.012), (0.235, 0.293, 0.227), 0.077, ivory).box(
    (0, -0.286, 0.066), (0.27, 0.165, 0.37), 0.068, navy
).box((0, -0.341, 0.075), (0.271, 0.065, 0.345), 0.027, "c68045").box(
    (0, -0.283, 0.243), (0.134, 0.049, 0.035), 0.012, mint
)

# Wings share a physical spine. Their visible paper stack has separately modeled edges.
part("bookSpine").box((0, -0.02, 0), (0.096, 0.095, 0.81), 0.035, navy)
for side, name in ((-1, "bookLeft"), (1, "bookRight")):
    book = part(name)
    book.box((side * 0.302, -0.063, 0), (0.627, 0.09, 0.822), 0.04, "254c63")
    book.box((side * 0.304, -0.014, 0), (0.576, 0.064, 0.771), 0.021, "e2bd90")
    for y in (-0.03, -0.012, 0.005):
        book.box((side * 0.316, y, 0), (0.549, 0.009, 0.741), 0.004, "ffe4b9")
    book.box((side * 0.308, -0.11, 0.02), (0.37, 0.025, 0.51), 0.012, "547d8a")
    book.box((side * 0.527, -0.117, -0.28), (0.091, 0.021, 0.13), 0.009, gold)

board = part("board")
board.box((0, -0.53, 0), (48, 1.06, 80), 0.19, "287369")
board.box((0, -0.8, 0), (48.06, 0.43, 80.06), 0.12, "184f53")
board.box((0, -1.03, 0), (46.9, 0.13, 79.45), 0.059, "bf8d57")

resistor = part("resistor")
resistor.lathe((0, 0.8, 0), [(-1.73, 0.03), (-1.73, 0.37), (-1.57, 0.56),
                            (-1.33, 0.64), (-1.12, 0.68), (1.12, 0.68),
                            (1.33, 0.64), (1.57, 0.56), (1.73, 0.37), (1.73, 0.03)],
               ceramic, axis=0)
for x, shade in ((-0.99, "328985"), (-0.45, "664f74"), (0.19, "d37659"), (0.96, "dca24f")):
    resistor.lathe((x, 0.8, 0), [(-0.11, 0.678), (-0.085, 0.687),
                                   (0.085, 0.687), (0.11, 0.678)], shade, axis=0)
for side in (-1, 1):
    resistor.box((side * 1.83, 0.43, 0), (0.24, 0.76, 0.23), 0.102, steel)
    resistor.box((side * 1.65, 0.07, 0), (0.68, 0.13, 1.05), 0.05, copper)

cap = part("capacitor")
cap.lathe((0, 0, 0), [(0.02, 0), (0.02, 1.36), (0.11, 1.47), (0.34, 1.48),
                        (0.45, 1.39), (0.48, 0)], navy)
cap.lathe((0, 0, 0), [(0.35, 1.39), (0.47, 1.49), (0.72, 1.50), (1.04, 1.43),
                        (4.75, 1.43), (4.92, 1.41), (4.95, 0)], "4d92b8", 32)
cap.lathe((0, 0, 0), [(4.63, 1.43), (4.66, 1.48), (4.84, 1.48), (4.99, 1.31),
                        (4.99, 0)], steel, 32)
for cross in ((2.05, 0.023, 0.084), (0.084, 0.023, 2.05)):
    cap.box((0, 4.999, 0), cross, 0.01, navy)
cap.box((0.96, 2.65, 1.067), (0.36, 2.74, 0.19), 0.087, "a1d7d7")
for y in (1.9, 2.4, 2.9, 3.4):
    cap.box((0.96, y, 1.164), (0.225, 0.068, 0.03), 0.012, navy)

chip = part("microcontroller")
chip.box((0, 1.36, 0), (8.9, 2.69, 6.77), 0.51, "28384e")
chip.box((0, 2.63, 0), (8.11, 0.56, 6.01), 0.24, "435d75")
chip.box((0, 2.943, 0), (6.87, 0.11, 4.55), 0.044, "354c64")
for side in (-1, 1):
    for i in range(10):
        x = -3.74 + i * 0.8311
        chip.box((x, 0.125, side * 3.63), (0.46, 0.21, 0.72), 0.091, copper)
        chip.box((x, 0.215, side * 3.63), (0.31, 0.28, 0.58), 0.11, steel)
        chip.box((x, 0.43, side * 3.49), (0.32, 0.42, 0.39), 0.128, steel)
chip.oval((-3.19, 2.98, 2.29), (0.58, 0.08, 0.58), gold, 16, 6)
for z in (-0.3, 0, 0.3):
    chip.box((0, 3, z), (2.88, 0.022, 0.08), 0.01, "668598")

lamp = part("led")
lamp.lathe((0, 0, 0), [(0.15, 0), (0.15, 1.13), (0.23, 1.23), (0.51, 1.23),
                         (0.63, 1.05), (0.63, 0)], navy)
lamp.lathe((0, 0, 0), [(0.55, 1.03), (0.65, 1.07), (1.63, 1.07), (1.99, 0.94),
                         (2.23, 0.76), (2.44, 0.49), (2.51, 0.14), (2.52, 0)],
           "eb8278", 32)
lamp.oval((-0.36, 1.87, 0.69), (0.23, 0.76, 0.24), "ffc2a2")

launch = part("launchPad")
launch.lathe((0, 0, 0), [(0.014, 2.23), (0.025, 2.02), (0.082, 1.88),
                         (0.082, 1.64), (0.034, 1.55)], "f0b877", 44)
launch.lathe((0, 0, 0), [(0.029, 1.75), (0.033, 1.66), (0.033, 0)], "225664", 44)
for side in (-1, 1):
    launch.box((side * 1.75, 0.052, 0), (0.85, 0.073, 0.84), 0.035, "d5935a")
    for z in (-0.26, 0, 0.26):
        launch.box((side * 2.22, 0.026, z), (0.47, 0.035, 0.08), 0.015, "e9b67f")

# Low perimeter fittings add scale without encroaching on the playable component silhouettes.
for side, label in ((-1, "westRail"), (1, "eastRail")):
    rail = part(label)
    rail.box((side * 23.5, -0.07, 0), (0.68, 0.26, 74.8), 0.093, "22555f")
    rail.box((side * 23.48, 0.05, 0), (0.24, 0.095, 71.3), 0.044, "78b1a6")
    for z in range(-33, 36, 7):
        rail.box((side * 22.7, 0.02, z), (0.96, 0.073, 2.09), 0.034, "78b1a6")
        rail.box((side * 22.67, 0.058, z), (0.58, 0.354, 1.7), 0.129, "2c5964")
        for v in (-0.68, 0.68):
            rail.box((side * 22.67, 0.093, z + v), (0.61, 0.24, 0.38), 0.108, steel)
    for z in (-37, 37):
        rail.lathe((side * 21, 0, z), [(0.02, 0.58), (0.06, 0.7), (0.12, 1.07),
                                        (0.04, 1.16), (0.02, 1.16)], copper)
        rail.lathe((side * 21, 0, z), [(0.019, 0), (0.023, 0.62), (0.027, 0)],
                   "164353")

connector = part("connector")
connector.box((0, -0.18, -39.2), (37, 0.66, 1.27), 0.16, "1b4d5c")
for i in range(17):
    x = -17.6 + i * 2.2
    connector.box((x, 0.052, -38.3), (1.21, 0.095, 2.89), 0.043, copper)
    connector.box((x, 0.104, -39.27), (1.10, 0.104, 0.54), 0.046, "ffce8e")

bench = part("bench")
bench.box((0, -4.8, 0), (184, 1.9, 161), 0.8, "38557a")
bench.box((0, -3.805, 0), (118, 0.11, 137), 0.05, "466c8d")
for x, z in ((-29.5, 40), (29.5, 40), (-29.5, -39), (29.5, -39)):
    bench.box((x, -2.5, z), (6.6, 2.8, 6.6), 0.85, "587b96")
    bench.box((x, -1.13, z), (5.3, 0.55, 5.3), 0.22, "7695a6")
for side in (-1, 1):
    bench.box((side * 39.2, -2.98, -10), (2.74, 1.6, 95), 0.64, "557d95")
    bench.box((side * 42.2, -3.1, -11), (0.36, 0.41, 96), 0.15, "7da6af")
    for z in (-45, -19, 9, 34):
        bench.box((side * 48, -2.98, z), (7.8, 1.8, 13.5), 0.81, "52738f")
for z in range(-56, 60, 8):
    bench.box((0, -3.735, z), (113, 0.027, 0.06), 0.012, "567f9b")
for x, z, shade in ((-29, 8, "d89968"), (29.3, -16, "6dacc0"), (-30, -27, "7b9fc8")):
    bench.box((x, -1.18, z), (6.7, 5.1, 7.1), 0.31, "37627d")
    bench.box((x, 1.65, z), (5.8, 0.75, 6.21), 0.28, shade)
    for tab in (-1, 1):
        bench.box((x + tab * 1.6, 2.15, z), (1.15, 0.3, 3.5), 0.12, "a0b5b9")
    bench.box((x, -0.41, z + 3.56), (4.45, 0.95, 0.18), 0.084, "668ea1")

# M15 field kit, sized to the engineer's articulated hands.
meter = part("fieldMeter")
meter.box((0, 0, 0), (0.64, 0.85, 0.215), 0.075, "203747")
meter.box((0, 0.008, 0.049), (0.592, 0.798, 0.144), 0.061, "ffc260")
meter.box((0, 0.027, 0.105), (0.482, 0.668, 0.047), 0.023, "293f4a")
meter.box((0, 0.243, 0.130), (0.426, 0.248, 0.038), 0.017, "122f36")
meter.box((0, 0.246, 0.151), (0.378, 0.198, 0.012), 0.005, "9bcdb3")
for side in (-1, 1):
    shade = "293042" if side < 0 else "ef635f"
    meter.lathe((side * 0.176, -0.248, 0.131),
               [(0, 0.064), (0.023, 0.068), (0.047, 0.056), (0.047, 0.034)], shade,
               segments=14, axis=2)
    for offset in (-0.235, 0.0, 0.235):
        meter.box((side * 0.302, offset, 0.015), (0.063, 0.105, 0.137), 0.024, "283844")
for i in range(9):
    angle = math.radians(27 + 33 * i)
    meter.oval((math.cos(angle) * 0.144, math.sin(angle) * 0.144 - 0.047, 0.131),
               (0.019, 0.016, 0.014), "87b7aa" if i == 5 else "c6b194", 8, 4)

dial = part("meterDial")
dial.lathe((0, 0, 0), [(0, 0.101), (0.021, 0.107), (0.051, 0.08), (0.053, 0)],
           "537177", segments=20, axis=2)
dial.box((0, 0, 0.052), (0.061, 0.165, 0.035), 0.014, "bfd4c7")
dial.box((0, 0.057, 0.072), (0.027, 0.036, 0.009), 0.004, "f3d48d")

for name, color, dark in (("redProbe", "e75655", "8e353a"), ("blackProbe", "344452", "172a37")):
    probe = part(name)
    probe.lathe((0, 0, 0), [(-0.345, 0.010), (-0.302, 0.027), (-0.23, 0.032)],
                "b8ced1", segments=12, axis=2)
    probe.lathe((0, 0, 0), [(-0.253, 0.027), (-0.181, 0.053), (-0.168, 0.078),
                            (-0.137, 0.081), (-0.118, 0.056), (0.035, 0.053),
                            (0.061, 0.036)], color, segments=16, axis=2)
    for z in (-0.114, -0.072, -0.030, 0.012):
        probe.lathe((0, 0, z), [(-0.013, 0.055), (0.012, 0.055)], dark, segments=12, axis=2)
    probe.lathe((0, 0, 0.055), [(0.0, 0.035), (0.055, 0.018), (0.091, 0.014)],
                dark, segments=12, axis=2)

iron = part("solderPen")
iron.lathe((0, 0, 0), [(-0.63, 0.019), (-0.59, 0.037), (-0.48, 0.048), (-0.40, 0.061)],
           "cbccd0", segments=16, axis=2)
iron.lathe((0, 0, 0), [(-0.44, 0.054), (-0.394, 0.08), (-0.26, 0.082), (-0.234, 0.059)],
           "e37d48", segments=16, axis=2)
iron.box((0, 0, -0.085), (0.208, 0.199, 0.442), 0.063, "304657")
iron.box((0, 0.094, -0.098), (0.122, 0.053, 0.304), 0.024, "426879")
iron.box((0, 0.123, -0.109), (0.079, 0.018, 0.124), 0.008, "94e2bc")
iron.box((0, 0, 0.127), (0.162, 0.153, 0.132), 0.05, "eea15f")

shield = part("faceShield")
shield.box((0, -0.041, 0.094), (0.72, 0.101, 0.1), 0.043, "b37440")
shield.box((0, -0.221, 0.209), (0.682, 0.378, 0.153), 0.073, "db9954")
shield.box((0, -0.222, 0.285), (0.526, 0.218, 0.045), 0.02, "353849")
shield.box((0, -0.197, 0.31), (0.391, 0.107, 0.015), 0.007, "b06e50")
for side in (-1, 1):
    shield.oval((side * 0.303, -0.035, 0.106), (0.122, 0.12, 0.101),
                "d1af76", 12, 6)

bridge = part("solderBridge")
bridge.box((0, 0, 0), (0.399, 0.087, 1.49), 0.039, "b5c8c5")
for z in (-0.525, -0.267, 0.0, 0.267, 0.525):
    bridge.oval((0, 0.035, z), (0.348, 0.153, 0.396), "a9bebb", 12, 6)

data = bytearray()
views = []
accessors = []
meshes = []
nodes = []


def accessor(rows, component, kind, fmt, normalized=False, bounds=False):
    data.extend(bytes(-len(data) % 4))
    start = len(data)
    for row in rows:
        data.extend(struct.pack("<" + fmt, *row))
    view = len(views)
    views.append({"buffer": 0, "byteOffset": start, "byteLength": len(data) - start})
    result = {"bufferView": view, "componentType": component, "count": len(rows), "type": kind}
    if normalized:
        result["normalized"] = True
    if bounds:
        result["min"] = [min(a) for a in zip(*rows)]
        result["max"] = [max(a) for a in zip(*rows)]
    accessors.append(result)
    return len(accessors) - 1


for name, model in parts.items():
    model.weld()
    position = accessor(model.positions, 5126, "VEC3", "3f", bounds=True)
    normal = accessor(model.normals, 5126, "VEC3", "3f")
    color = accessor(model.colors, 5121, "VEC4", "4B", normalized=True)
    triangles = accessor([(i,) for i in model.indices], 5123, "SCALAR", "H")
    nodes.append({"name": name, "mesh": len(meshes)})
    meshes.append({"name": name, "primitives": [{
        "attributes": {"POSITION": position, "NORMAL": normal, "COLOR_0": color},
        "indices": triangles,
        "material": 1 if name in ("eye", "mouth") else 0,
    }]})

data.extend(bytes(-len(data) % 4))
layout = {
    "asset": {"version": "2.0", "generator": "Project Spark original art kit"},
    "scene": 0,
    "scenes": [{"nodes": list(range(len(nodes)))}],
    "nodes": nodes,
    "meshes": meshes,
    "materials": [
        {"pbrMetallicRoughness": {"metallicFactor": 0, "roughnessFactor": 0.49}},
        {"pbrMetallicRoughness": {"metallicFactor": 0, "roughnessFactor": 0.36},
         "emissiveFactor": [0.045, 0.22, 0.22]},
    ],
    "buffers": [{"byteLength": len(data)}],
    "bufferViews": views,
    "accessors": accessors,
}
metadata = json.dumps(layout, separators=(",", ":")).encode()
metadata += b" " * (-len(metadata) % 4)
path = Path(__file__).resolve().parents[1] / "apps/web/src/assets/workshop.glb"
with path.open("wb") as stream:
    stream.write(struct.pack("<4sII", b"glTF", 2, 28 + len(metadata) + len(data)))
    stream.write(struct.pack("<I4s", len(metadata), b"JSON") + metadata)
    stream.write(struct.pack("<I4s", len(data), b"BIN\0") + data)
print(f"{path.name}: {len(parts)} meshes, {path.stat().st_size:,} bytes")
