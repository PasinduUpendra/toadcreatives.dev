import * as THREE from "three";

export type BehaviorId =
  | "comb"
  | "rope"
  | "field"
  | "velocity"
  | "morph"
  | "curl"
  | "weave"
  | "tear"
  | "route"
  | "orbit";

export interface Strand {
  points: THREE.Vector3[];
  /** Rest positions, for behaviours with a restoring force. */
  rest: THREE.Vector3[];
  /** Previous positions, for Verlet integration. */
  prev: THREE.Vector3[];
  /** Per-strand target set, for formation behaviours. */
  targets: THREE.Vector3[];
  seed: number;
  phase: number;
  hue: number;
  radius: number;
  /** Break index for tear; -1 when whole. */
  break: number;
  heal: number;
}

export interface FrameContext {
  strands: Strand[];
  pointer: THREE.Vector3;
  pointerVelocity: THREE.Vector3;
  pointerSpeed: number;
  pointerDown: boolean;
  /** Rising on click, decaying after. */
  impulse: number;
  /** World-space anchors published by DOM elements. */
  anchors: THREE.Vector3[];
  activeAnchor: number;
  /** One coherent stroke per strand, sampled from the glyph, for `morph`. */
  glyph: THREE.Vector3[][];
  /** 0 → dispersed, 1 → fully in formation. */
  formation: number;
  time: number;
  dt: number;
  bounds: { x: number; y: number };
  reduced: boolean;
}

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

/** Cheap 3D value noise. Good enough to drive motion, far cheaper than simplex. */
function noise3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

/** Divergence-free flow. Curl of a potential field, so strands never bunch up. */
function curl(x: number, y: number, z: number, out: THREE.Vector3) {
  const e = 0.15;
  const n1 = Math.sin(y * 1.4 + z * 0.7) + noise3(x, y + e, z) * 0.6;
  const n2 = Math.sin(y * 1.4 - e + z * 0.7) + noise3(x, y - e, z) * 0.6;
  const n3 = Math.cos(x * 1.1 - z * 0.9) + noise3(x, y, z + e) * 0.6;
  const n4 = Math.cos(x * 1.1 - z * 0.9) + noise3(x, y, z - e) * 0.6;
  const n5 = Math.sin(x * 0.9 + y * 1.2) + noise3(x + e, y, z) * 0.6;
  const n6 = Math.sin(x * 0.9 + y * 1.2) + noise3(x - e, y, z) * 0.6;

  out.set((n1 - n2) / (2 * e) - (n3 - n4) / (2 * e), (n3 - n4) / (2 * e) - (n5 - n6) / (2 * e), (n5 - n6) / (2 * e) - (n1 - n2) / (2 * e));
  return out;
}

type Behavior = (ctx: FrameContext) => void;

/**
 * Filaments hang in a still lattice. The pointer parts them like a hand through
 * long grass, and they spring back — the field has a resting shape to disturb,
 * instead of being a permanent comet tail.
 */
const comb: Behavior = ({ strands, pointer, pointerSpeed, dt, reduced }) => {
  const reach = 1.5;
  const push = reduced ? 0.6 : 1.5 + Math.min(pointerSpeed * 0.35, 2.2);

  strands.forEach((strand) => {
    strand.points.forEach((p, i) => {
      const rest = strand.rest[i];
      tmp.subVectors(p, pointer);
      const dist = tmp.length();

      if (dist < reach && dist > 0.0001) {
        // Falloff squared so the parting has a soft shoulder, not a hard edge.
        const falloff = 1 - dist / reach;
        tmp.normalize().multiplyScalar(falloff * falloff * push * dt * 60);
        p.add(tmp);
      }

      // Restoring spring, weaker at the free end so the tips lag behind.
      const stiffness = 0.06 + (i / strand.points.length) * 0.05;
      p.lerp(rest, stiffness);
      p.z += (Math.sin(ctxTime * 0.6 + strand.phase + i * 0.3) * 0.12 - p.z) * 0.05;
    });
  });
};

/**
 * Verlet rope pinned at one end. Real momentum, real overshoot, real settle —
 * grab it and it swings with weight rather than easing to a stop.
 */
const rope: Behavior = ({ strands, pointer, pointerDown, dt, bounds, reduced }) => {
  const gravity = reduced ? -0.4 : -1.6;
  const damping = 0.985;
  const segment = 0.22;

  strands.forEach((strand) => {
    const pts = strand.points;

    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const prev = strand.prev[i];
      tmp.subVectors(p, prev).multiplyScalar(damping);
      prev.copy(p);
      p.add(tmp);
      p.y += gravity * dt * dt * 60;

      if (pointerDown) {
        tmp2.subVectors(pointer, p);
        const d = tmp2.length();
        if (d < 1.6) {
          tmp2.normalize().multiplyScalar((1.6 - d) * 0.14);
          p.add(tmp2);
        }
      }
    }

    // Constraint relaxation. Two passes reads as rope; one reads as elastic.
    for (let pass = 0; pass < 2; pass++) {
      pts[0].set(strand.rest[0].x, bounds.y * 0.85, 0);
      for (let i = 1; i < pts.length; i++) {
        tmp.subVectors(pts[i], pts[i - 1]);
        const d = tmp.length() || 0.0001;
        tmp.multiplyScalar((d - segment) / d * 0.5);
        pts[i - 1].add(tmp);
        pts[i].sub(tmp);
      }
    }
  });
};

/**
 * Strands trace the field lines of a charge distribution. The pointer is one
 * charge, every registered DOM anchor is another — so hovering a button visibly
 * reorganises the entire field.
 */
const field: Behavior = ({ strands, pointer, anchors, dt: _dt, bounds }) => {
  const charges = [pointer, ...anchors];

  strands.forEach((strand) => {
    const pts = strand.points;
    const start = strand.rest[0];
    pts[0].lerp(start, 0.08);

    for (let i = 1; i < pts.length; i++) {
      tmp.set(0, 0, 0);
      const from = pts[i - 1];

      charges.forEach((charge, ci) => {
        tmp2.subVectors(from, charge);
        const d2 = Math.max(tmp2.lengthSq(), 0.08);
        // Alternating sign gives dipoles, which is what makes the lines curve
        // back on themselves instead of radiating straight out.
        const sign = ci % 2 === 0 ? 1 : -1;
        tmp2.normalize().multiplyScalar((sign * 0.55) / d2);
        tmp.add(tmp2);
      });

      tmp.y += 0.35;
      if (tmp.lengthSq() < 0.0001) tmp.set(0, 1, 0);
      tmp.normalize().multiplyScalar(0.28);

      tmp2.copy(from).add(tmp);
      tmp2.x = THREE.MathUtils.clamp(tmp2.x, -bounds.x * 1.3, bounds.x * 1.3);
      tmp2.y = THREE.MathUtils.clamp(tmp2.y, -bounds.y * 1.3, bounds.y * 1.3);
      pts[i].lerp(tmp2, 0.25);
    }
  });
};

/**
 * Speed is the input, form is the output. Move fast and the strands draw out
 * into taut parallel lines along your travel; stop and they slacken into a coil.
 */
const velocity: Behavior = ({ strands, pointer, pointerVelocity, pointerSpeed, dt: _dt }) => {
  const taut = THREE.MathUtils.clamp(pointerSpeed / 7, 0, 1);
  const dir = tmp2.copy(pointerVelocity).normalize();
  if (dir.lengthSq() < 0.001) dir.set(1, 0, 0);

  strands.forEach((strand, si) => {
    const pts = strand.points;
    const spread = (si / strands.length - 0.5) * 1.9;

    pts[0].lerp(pointer, 0.3);

    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length;

      // Taut: a straight line trailing the direction of travel, fanned by strand.
      const stretched = tmp
        .copy(pointer)
        .addScaledVector(dir, -t * 5.5)
        .addScaledVector(new THREE.Vector3(-dir.y, dir.x, 0), spread * t);

      // Slack: a coil that keeps turning while idle.
      const angle = t * Math.PI * 4 + strand.phase + ctxTime * 0.8;
      const coilR = 0.75 + t * 0.5;
      const coiled = tmp2.set(
        pointer.x + Math.cos(angle) * coilR * (1 - t * 0.3),
        pointer.y + Math.sin(angle) * coilR * (1 - t * 0.3),
        Math.sin(angle * 0.7) * 0.5
      );

      stretched.lerp(coiled, 1 - taut);
      pts[i].lerp(stretched, 0.16 + t * 0.1);
    }
  });
};

/**
 * The field assembles into a shape — a wordmark, a numeral — holds, then lets
 * go. This is the intro: the strands *become* the logo rather than a loader
 * playing before it.
 */
const morph: Behavior = ({ strands, glyph, formation, pointer, dt: _dt }) => {
  if (!glyph.length) return;

  strands.forEach((strand, si) => {
    const pts = strand.points;
    const stroke = glyph[si % glyph.length];
    if (!stroke) return;

    pts.forEach((p, i) => {
      const target = stroke[Math.min(i, stroke.length - 1)];

      // Dispersed state still tracks the pointer, so release feels continuous.
      tmp.copy(pointer).add(
        tmp2.set(
          Math.cos(ctxTime * 0.5 + strand.phase + i * 0.4) * (1.2 + i * 0.12),
          Math.sin(ctxTime * 0.62 + strand.phase + i * 0.35) * (0.9 + i * 0.1),
          Math.sin(ctxTime * 0.4 + i) * 0.6
        )
      );

      tmp.lerp(target, formation);
      p.lerp(tmp, 0.12 + formation * 0.16);
    });
  });
};

/**
 * Divergence-free curl noise. The strands stop being a cursor tail and become
 * ink dropped in moving water; the pointer injects vorticity into the flow.
 */
const curlFlow: Behavior = ({ strands, pointer, pointerSpeed, dt: _dt, bounds }) => {
  const flow = new THREE.Vector3();

  strands.forEach((strand) => {
    const pts = strand.points;
    const head = pts[0];

    curl(head.x * 0.4, head.y * 0.4, ctxTime * 0.12, flow);
    flow.multiplyScalar(0.055);

    tmp.subVectors(pointer, head);
    const d = tmp.length();
    if (d < 2.6) {
      // Swirl rather than attract: perpendicular force makes a vortex.
      tmp2.set(-tmp.y, tmp.x, 0).normalize().multiplyScalar((2.6 - d) * 0.055 * (1 + pointerSpeed * 0.15));
      flow.add(tmp2);
    }

    head.add(flow);

    if (Math.abs(head.x) > bounds.x * 1.25 || Math.abs(head.y) > bounds.y * 1.25) {
      head.set((Math.random() - 0.5) * bounds.x, (Math.random() - 0.5) * bounds.y, 0);
      for (let i = 1; i < pts.length; i++) pts[i].copy(head);
    }

    for (let i = pts.length - 1; i > 0; i--) {
      pts[i].lerp(pts[i - 1], 0.42);
    }
  });
};

/**
 * Strands cross the z-plane the headline sits on, so they pass physically in
 * front of some letters and behind others. Kills the "background layer" read.
 */
const weave: Behavior = ({ strands, pointer, dt: _dt }) => {
  strands.forEach((strand, _si) => {
    const pts = strand.points;
    pts[0].lerp(pointer, 0.18);

    for (let i = 1; i < pts.length; i++) {
      pts[i].lerp(pts[i - 1], 0.28);
      const t = i / pts.length;
      // Each strand threads the plane on its own schedule.
      const target = Math.sin(ctxTime * 0.9 + strand.phase + t * Math.PI * 2) * 1.6;
      pts[i].z += (target - pts[i].z) * 0.08;
    }
  });
};

/**
 * Click and the bundle ruptures: the break propagates outward, the loose ends
 * recoil under tension, then the strand knits itself back together.
 */
const tear: Behavior = ({ strands, pointer, impulse: _impulse, pointerDown, dt }) => {
  strands.forEach((strand) => {
    const pts = strand.points;

    if (pointerDown && strand.break < 0) {
      let nearest = 1;
      let best = Infinity;
      pts.forEach((p, i) => {
        const d = p.distanceToSquared(pointer);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      if (best < 2.4) {
        strand.break = THREE.MathUtils.clamp(nearest, 1, pts.length - 2);
        strand.heal = 0;
      }
    }

    pts[0].lerp(pointer, 0.2);

    for (let i = 1; i < pts.length; i++) {
      if (strand.break > 0 && i >= strand.break) {
        // Severed section recoils away from the break, then eases back.
        const recoil = (1 - strand.heal) * 0.5;
        tmp.subVectors(pts[i], pointer).normalize().multiplyScalar(recoil * 0.22);
        pts[i].add(tmp);
        pts[i].lerp(pts[i - 1], 0.1 + strand.heal * 0.25);
      } else {
        pts[i].lerp(pts[i - 1], 0.3);
      }
    }

    if (strand.break > 0) {
      strand.heal += dt * 0.5;
      if (strand.heal >= 1) {
        strand.break = -1;
        strand.heal = 0;
      }
    }
  });
};

/**
 * Each strand is bound to a DOM element. Hover a nav item or a card and its
 * cable physically routes over and terminates there, like plugging in.
 */
const route: Behavior = ({ strands, pointer, anchors, activeAnchor, dt: _dt }) => {
  strands.forEach((strand, si) => {
    const pts = strand.points;
    const anchor = anchors.length ? anchors[si % anchors.length] : null;
    const locked = anchor && activeAnchor >= 0 && si % anchors.length === activeAnchor;

    pts[0].lerp(pointer, 0.24);

    const tail = pts[pts.length - 1];
    if (anchor) {
      tail.lerp(anchor, locked ? 0.2 : 0.05);
    }

    // Solve inward from both ends so the cable bows between them.
    for (let i = 1; i < pts.length - 1; i++) {
      const t = i / (pts.length - 1);
      tmp.copy(pts[i - 1]).lerp(tail, t);
      tmp.z += Math.sin(t * Math.PI) * (locked ? 0.3 : 1.1);
      pts[i].lerp(tmp, locked ? 0.24 : 0.12);
    }
  });
};

/** The original behaviour, kept so the new work can be compared against it. */
const orbit: Behavior = ({ strands, pointer, dt: _dt }) => {
  strands.forEach((strand) => {
    const pts = strand.points;
    const r = 0.28 + (strand.seed % 10) * 0.07;
    tmp.set(
      pointer.x + Math.cos(ctxTime * 0.3 + strand.phase) * r,
      pointer.y + Math.sin(ctxTime * 0.36 + strand.phase) * r,
      Math.sin(ctxTime * 0.4 + strand.phase) * 0.5
    );
    for (let i = pts.length - 1; i > 0; i--) pts[i].lerp(pts[i - 1], 0.2);
    pts[0].lerp(tmp, 0.22);
  });
};

// Behaviours read time from module scope so the signatures stay uniform.
let ctxTime = 0;
export function setBehaviorTime(t: number) {
  ctxTime = t;
}

export const BEHAVIORS: Record<BehaviorId, Behavior> = {
  comb,
  rope,
  field,
  velocity,
  morph,
  curl: curlFlow,
  weave,
  tear,
  route,
  orbit,
};

export const BEHAVIOR_META: { id: BehaviorId; name: string; hint: string }[] = [
  { id: "comb", name: "Comb", hint: "Move across the field — it parts like grass and springs back" },
  { id: "rope", name: "Rope", hint: "Hold the mouse down and drag — real Verlet weight and swing" },
  { id: "field", name: "Field Lines", hint: "Magnetic dipoles. Hover the buttons to warp the whole field" },
  { id: "velocity", name: "Velocity Draw", hint: "Move fast for taut lines, stop and it coils" },
  { id: "morph", name: "Formation", hint: "The strands assemble into the wordmark, hold, then release" },
  { id: "curl", name: "Ink Flow", hint: "Divergence-free curl noise. Your cursor injects vorticity" },
  { id: "weave", name: "Weave", hint: "Strands pass in front of and behind the headline" },
  { id: "tear", name: "Tear", hint: "Click to rupture the bundle — it recoils, then knits back" },
  { id: "route", name: "Cable Route", hint: "Hover an item — its cable routes over and plugs in" },
  { id: "orbit", name: "Orbit (current site)", hint: "What you have today, for comparison" },
];
