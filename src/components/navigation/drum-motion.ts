/** Position is measured in detents (one detent = one face), not pixels. */
export type DrumPhase = 'idle' | 'dragging' | 'coasting' | 'snapping' | 'locked';

export function drumIndex(position: number, count: number): number {
  return ((Math.round(position) % count) + count) % count;
}

/** `index` on the lap of the rail that `position` is on: a choice travels straight along the
 * rail and never takes the Contact/Home seam (only the arrows step across it). */
export function railPosition(position: number, index: number, count: number): number {
  return Math.round(position) - drumIndex(position, count) + index;
}

export function wheelSteps(delta: number, mode: number, height: number): number {
  const pixels = delta * (mode === 1 ? 16 : mode === 2 ? height : 1);
  return Math.max(-1.25, Math.min(1.25, pixels / 180));
}

/*
 * Detent profile (detents, milliseconds). The carriage glides most of the way and slows near the
 * tab, is pulled into the detent over the last 0.14 detent so that it arrives with a little
 * momentum, swings past by about 0.05 detent (3–4 px), and settles before the lock: a mechanical
 * detent instead of an ease-out slide. The swing does not grow with the distance travelled.
 * Phase timing is unchanged: 'snapping' for 240 ms, 'locked' for 110 ms, then the lock.
 */
const SNAP = 240;
const LOCK = 110;
const ARRIVE = 230;
const PULL_TIME = 48;
const PULL = 0.14;
const CREEP = 0.0015;
const STRIKE = 0.0046;
const SWING = Math.PI / 70;
const DAMPING = 0.0271;

/** Cubic Hermite step from 0 to 1 with start/end slopes m0/m1: [value, slope]. */
function hermite(u: number, m0: number, m1: number): [number, number] {
  const u2 = u * u;
  const u3 = u2 * u;
  return [
    3 * u2 - 2 * u3 + m0 * (u3 - 2 * u2 + u) + m1 * (u3 - u2),
    6 * u - 6 * u2 + m0 * (3 * u2 - 4 * u + 1) + m1 * (3 * u2 - 2 * u),
  ];
}

interface MotionOptions {
  count: number;
  frame: (callback: (time: number) => void) => number;
  cancelFrame: (id: number) => void;
  now: () => number;
  paint: (position: number, phase: DrumPhase) => void;
  onLock: (index: number) => void;
}

/** Owns one cancellable frame loop, including the lock dwell before navigation. */
export class DrumMotion {
  position = 0;
  target = 0;
  /** Where the current snap started (its direction tells the view which way the carriage swings). */
  origin = 0;
  /** Detents per millisecond; carried into the next snap so that rapid steps keep their momentum. */
  velocity = 0;
  reduced = false;
  private frameId: number | null = null;
  private generation = 0;
  private lastDrag = -Infinity;
  private options: MotionOptions;

  constructor(options: MotionOptions) {
    this.options = options;
  }

  cancel() {
    this.generation++;
    if (this.frameId !== null) this.options.cancelFrame(this.frameId);
    this.frameId = null;
    this.target = Math.round(this.position);
    this.velocity = 0;
  }

  sync(index: number) {
    this.cancel();
    this.position = this.target = this.origin = index;
    this.options.paint(index, 'idle');
  }

  drag(delta: number) {
    const previous = this.velocity;
    const time = this.options.now();
    this.cancel();
    this.position += delta;
    this.target = Math.round(this.position);
    this.velocity = previous * 0.5 + (delta / Math.min(100, Math.max(8, time - this.lastDrag))) * 0.5;
    this.lastDrag = time;
    this.options.paint(this.position, 'dragging');
  }

  select(index: number, commit: boolean) {
    this.snap(railPosition(this.position, index, this.options.count), commit);
  }

  step(direction: number, commit: boolean) {
    this.snap(this.target + direction, commit);
  }

  release(velocity = 0) {
    this.cancel();
    // Cap momentum: even a fast flick adds less than half a detent after release.
    let speed = Math.max(-0.006, Math.min(0.006, velocity));
    this.velocity = speed;
    if (this.reduced || Math.abs(speed) < 0.0003) {
      this.snap(Math.round(this.position), true);
      return;
    }
    const started = this.options.now();
    let last = started;
    this.loop((time) => {
      const dt = Math.min(32, Math.max(0, time - last));
      last = time;
      const decay = Math.exp(-0.018 * dt);
      this.position += (speed * (1 - decay)) / 0.018;
      speed *= decay;
      this.velocity = speed;
      this.options.paint(this.position, 'coasting');
      if (time - started < 220 && Math.abs(speed) > 0.0003) return true;
      this.snap(Math.round(this.position), true);
      return false;
    });
  }

  private snap(target: number, commit: boolean) {
    const incoming = this.velocity;
    this.cancel();
    this.target = target;
    const from = (this.origin = this.position);
    const start = this.options.now();
    if (this.reduced) {
      this.position = target;
      this.options.paint(target, 'idle');
      if (commit) this.options.onLock(drumIndex(target, this.options.count));
      return;
    }
    const distance = Math.abs(target - from);
    const travel = distance < 0.001 ? 0 : SNAP;
    const direction = Math.sign(target - from);
    // Very short corrections scale the pull (and so the swing) down instead of overshooting.
    const pull = Math.min(PULL, distance / 2);
    const creep = (CREEP * pull) / PULL;
    const strike = (STRIKE * pull) / PULL;
    const glideTime = ARRIVE - PULL_TIME;
    const glide = distance - pull;
    const glideEnd = Math.min(2.5, (creep * glideTime) / Math.max(glide, 1e-6));
    // Incoming momentum carries over (capped so that the glide itself never overshoots); from rest
    // the carriage starts at half its mean speed: a firm push rather than a slow crawl.
    const carried = (incoming * direction * glideTime) / Math.max(glide, 1e-6);
    const glideStart = Math.max(-1, Math.min(Math.sqrt(9 - glideEnd * glideEnd), carried < 0 ? carried : Math.max(0.5, carried)));
    const pullStart = (creep * PULL_TIME) / Math.max(pull, 1e-6);
    const pullEnd = (strike * PULL_TIME) / Math.max(pull, 1e-6);
    const at = (elapsed: number): [number, number] => {
      if (elapsed < glideTime) {
        const [value, slope] = hermite(elapsed / glideTime, glideStart, glideEnd);
        return [from + direction * glide * value, (direction * glide * slope) / glideTime];
      }
      if (elapsed < ARRIVE) {
        const [value, slope] = hermite((elapsed - glideTime) / PULL_TIME, pullStart, pullEnd);
        return [target - direction * pull * (1 - value), (direction * pull * slope) / PULL_TIME];
      }
      const t = elapsed - ARRIVE;
      const fade = Math.exp(-DAMPING * t);
      return [
        target + (direction * strike * fade * Math.sin(SWING * t)) / SWING,
        direction * strike * fade * (Math.cos(SWING * t) - (DAMPING / SWING) * Math.sin(SWING * t)),
      ];
    };
    this.options.paint(from, travel ? 'snapping' : 'locked');
    this.loop((time) => {
      const elapsed = time - start;
      if (elapsed < travel + LOCK) {
        if (travel) [this.position, this.velocity] = at(elapsed);
        this.options.paint(this.position, elapsed < travel ? 'snapping' : 'locked');
        return true;
      }
      this.position = this.target = target;
      this.velocity = 0;
      this.options.paint(target, 'idle');
      if (commit) this.options.onLock(drumIndex(target, this.options.count));
      return false;
    });
  }

  private loop(tick: (time: number) => boolean) {
    const generation = this.generation;
    const next = (time: number) => {
      if (generation !== this.generation) return;
      this.frameId = null;
      if (tick(time) && generation === this.generation) this.frameId = this.options.frame(next);
    };
    this.frameId = this.options.frame(next);
  }
}
