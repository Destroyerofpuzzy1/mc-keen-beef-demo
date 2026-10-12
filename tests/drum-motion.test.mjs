import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DrumMotion, drumIndex, railPosition, wheelSteps } from '../src/components/navigation/drum-motion.ts';

function harness() {
  let time = 0;
  let sequence = 0;
  const queue = new Map();
  const locks = [];
  const paints = [];
  const motion = new DrumMotion({
    count: 9, now: () => time,
    frame: (fn) => { queue.set(++sequence, fn); return sequence; },
    cancelFrame: (id) => queue.delete(id),
    paint: (position, phase) => paints.push({ position, phase }),
    onLock: (index) => locks.push(index),
  });
  return {
    motion, locks, paints, queue,
    advance(ms, interval = 10) {
      for (let elapsed = 0; elapsed < ms; elapsed += interval) {
        time += interval;
        const current = [...queue.values()];
        queue.clear();
        current.forEach((fn) => fn(time));
      }
    },
  };
}

test('wraps negative and multi-turn positions; a choice travels straight along the rail', () => {
  assert.equal(drumIndex(-1, 9), 8);
  assert.equal(drumIndex(27.6, 9), 1);
  // Contact → Home and Home → Contact cross the rail, never the seam; the lap is kept.
  assert.equal(railPosition(8, 0, 9), 0);
  assert.equal(railPosition(0, 8, 9), 8);
  assert.equal(railPosition(9, 5, 9), 14);
  assert.equal(railPosition(-1, 2, 9), -7);
});

test('Contact and Home wrap in both directions and navigate only after lock', () => {
  const h = harness();
  h.motion.sync(8);
  h.motion.step(1, true);
  h.advance(240);
  assert.deepEqual(h.locks, []);
  h.advance(120);
  assert.deepEqual(h.locks, [0]);
  assert.equal(h.motion.position, 9);
  h.motion.step(-1, true);
  h.advance(360);
  assert.deepEqual(h.locks, [0, 8]);
  assert.equal(h.motion.position, 8);
});

test('does not navigate until both snap and lock have finished', () => {
  const h = harness();
  h.motion.select(1, true);
  h.advance(240);
  assert.equal(h.paints.at(-1).phase, 'locked');
  assert.deepEqual(h.locks, []);
  h.advance(120);
  assert.deepEqual(h.locks, [1]);
  assert.equal(h.motion.position, 1);
  assert.equal(h.queue.size, 0);
});

test('a choice glides, is pulled into the detent, swings past slightly and settles before the lock', () => {
  for (const to of [1, 3, 8]) {
    const h = harness();
    h.motion.select(to, true);
    h.advance(360, 4);
    const positions = h.paints.map((paint) => paint.position);
    const arrival = positions.findIndex((position) => position >= to);
    assert.ok(positions.slice(1, arrival).every((position, i) => position >= positions[i]), 'no backward motion before arriving');
    assert.ok(positions.every((position) => position >= 0 && position < to + 0.1), 'stays on the rail');
    // The swing is the same small amount for short and long journeys (≈ 4 px at 80 px per tab).
    const swing = Math.max(...positions) - to;
    assert.ok(swing > 0.03 && swing < 0.07, `swing ${swing}`);
    assert.ok(Math.abs(positions.at(-2) - to) < 0.01, 'settled before the lock');
    assert.deepEqual(h.locks, [to]);
    assert.equal(h.motion.position, to);
  }
});

test('rapid steps keep their momentum instead of restarting from rest', () => {
  const h = harness();
  h.motion.step(1, false);
  h.advance(100, 4);
  const speed = h.motion.velocity;
  h.motion.step(1, false);
  h.advance(4, 4);
  assert.ok(h.motion.velocity > speed * 0.8, `${h.motion.velocity} after ${speed}`);
  h.advance(400, 4);
  const positions = h.paints.map((paint) => paint.position);
  const arrival = positions.findIndex((position) => position >= 2);
  assert.ok(positions.slice(1, arrival).every((position, i) => position >= positions[i]), 'no stall or backward motion');
  assert.equal(h.motion.position, 2);
});

test('new selection during lock cancels the obsolete navigation', () => {
  const h = harness();
  h.motion.select(1, true);
  h.advance(270);
  h.motion.select(5, true);
  h.advance(400);
  assert.deepEqual(h.locks, [5]);
});

test('keyboard preview never navigates; rapid steps accumulate', () => {
  const h = harness();
  h.motion.step(1, false);
  h.motion.step(1, false);
  h.motion.step(1, false);
  h.advance(400);
  assert.equal(h.motion.position, 3);
  assert.deepEqual(h.locks, []);
});

test('URL synchronization cancels motion without creating a history entry', () => {
  const h = harness();
  h.motion.select(4, true);
  h.advance(120);
  h.motion.sync(2);
  h.advance(600);
  assert.equal(h.motion.position, 2);
  assert.deepEqual(h.locks, []);
  assert.equal(h.queue.size, 0);
});

test('flick momentum is capped and settles consistently at different frame rates', () => {
  for (const interval of [8, 16, 32]) {
    const h = harness();
    h.motion.drag(1.3);
    h.motion.release(10);
    h.advance(900, interval);
    assert.deepEqual(h.locks, [2]);
    assert.equal(h.motion.position, 2);
    assert.equal(h.queue.size, 0);
  }
});

test('reduced motion commits immediately with no animation frames', () => {
  const h = harness();
  h.motion.reduced = true;
  h.motion.drag(-1.2);
  h.motion.release(-0.006);
  assert.equal(h.motion.position, -1);
  assert.deepEqual(h.locks, [8]);
  assert.equal(h.queue.size, 0);
});

test('cancelling prevents a late lock callback', () => {
  const h = harness();
  h.motion.select(1, true);
  h.advance(300);
  h.motion.cancel();
  h.advance(500);
  assert.deepEqual(h.locks, []);
  assert.equal(h.queue.size, 0);
});

test('wheel input normalizes line/page units and caps a single event', () => {
  assert.equal(wheelSteps(180, 0, 800), 1);
  assert.equal(wheelSteps(11.25, 1, 800), 1);
  assert.equal(wheelSteps(1, 2, 800), 1.25);
  assert.equal(wheelSteps(-10000, 0, 800), -1.25);
});
