/**
 * Where things land, measured from the track (assets/audio/launch/track.wav,
 * seed-audio/1.0). The music drifts a little, so the grid is not a nominal
 * bpm: the hats run a steady 0.2453 s eighth note, and the drop (2.70 s) and
 * the final impact (11.016 s) are exactly 17 beats apart, so a beat is
 * 0.4892 s. Every cut in the film is one of these frames.
 *
 * Scenes push each other in: each transition runs `T` frames and lands on its
 * beat, so a scene starts T frames before the beat that is its downbeat.
 */
import path from "node:path";
import { ASSETS } from "@framefields-social/brand";

export const FPS = 30;
export const TRACK = path.join(ASSETS, "audio/launch/track.wav");
export const DANCER = path.join(ASSETS, "video/launch/dancer.mp4");

const DROP_SEC = 2.7;
const BEAT_SEC = 0.4892;

/** Film frame of beat `n` after the drop (0 is the drop itself, 17 the impact). */
export const beat = (n: number): number => Math.round((DROP_SEC + n * BEAT_SEC) * FPS);

/** The stabs over the riser, before the drop: one hook word each. */
export const STABS = [14, 26, 40, 51] as const;
/** The riser's last push: the hook starts to break up. */
export const RISE = 62;
export const END = 450;

/** How long each scene's way in lasts, in frames; it ends on the scene's downbeat. */
export const T = { build: 8, montage: 8, breath: 6, outro: 8 } as const;

/** Film frame each scene starts on. */
export const START = {
	hook: 0,
	build: beat(0) - T.build,
	montage: beat(8) - T.montage,
	breath: beat(16) - T.breath,
	outro: beat(17) - T.outro,
} as const;

/** Each scene runs until the next one has fully arrived. */
export const LENGTH = {
	hook: beat(0) - START.hook,
	build: beat(8) - START.build,
	montage: beat(16) - START.montage,
	breath: beat(17) - START.breath,
	outro: END - START.outro,
} as const;

/** Frame of beat `n` in a scene that starts at `start`. */
export const local = (start: number) => (n: number): number => beat(n) - start;
