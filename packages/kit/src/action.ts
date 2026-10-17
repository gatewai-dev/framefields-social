/**
 * Actions are the grammar of a post. An action is a value: how long it lasts,
 * and what it writes onto the timeline when played at some frame. Actors make
 * actions; seq, all and stagger compose them; a scene plays one at frame 0.
 *
 * Nothing happens when an action is made, only when it is played, so actions
 * can be stored, passed around, reused and combined freely.
 */
import type { Frames } from "./time.js";

export interface Action {
	readonly duration: Frames;
	play(at: Frames): void;
}

export function action(duration: Frames, play: (at: Frames) => void = () => {}): Action {
	return { duration: Math.max(0, Math.round(duration)), play };
}

/** Nothing, for a while. */
export const wait = (frames: Frames): Action => action(frames);

/** One after another. */
export function seq(...actions: Action[]): Action {
	return action(
		actions.reduce((sum, a) => sum + a.duration, 0),
		(at) => {
			let t = at;
			for (const a of actions) {
				a.play(t);
				t += a.duration;
			}
		},
	);
}

/** All at once; done when the longest is. */
export function all(...actions: Action[]): Action {
	return action(Math.max(0, ...actions.map((a) => a.duration)), (at) => {
		for (const a of actions) a.play(at);
	});
}

/** Each starts `gap` frames after the one before; done when the last one is. */
export function stagger(gap: Frames, ...actions: Action[]): Action {
	const start = (i: number) => Math.round(i * gap);
	return action(Math.max(0, ...actions.map((a, i) => start(i) + a.duration)), (at) => {
		actions.forEach((a, i) => a.play(at + start(i)));
	});
}

/** `a`, `frames` from now. */
export const after = (frames: Frames, a: Action): Action => seq(wait(frames), a);

/** Starts `a` and moves straight on: it takes no time in a sequence. */
export const meanwhile = (a: Action): Action => action(0, (at) => a.play(at));

/** Exactly `frames` long, whatever `a` would take: trims or pads it. */
export const lasting = (frames: Frames, a: Action): Action => action(frames, (at) => a.play(at));
