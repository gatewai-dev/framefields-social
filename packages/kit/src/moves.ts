/**
 * Moves are the ways an actor arrives and leaves. A move is a function of an
 * actor and a phase, so one vocabulary serves both enter() and exit(): rise()
 * comes up from below and keeps going up on the way out.
 */
import { type Action, all } from "./action.js";
import type { Actor } from "./actor.js";
import { by, type Pose } from "./limb.js";
import type { Frames } from "./time.js";

export type Phase = "in" | "out";
export type Move = (actor: Actor, phase: Phase) => Action;

export interface Timing {
	dur?: Frames;
	/** Ease for the arrival; defaults to the look's. */
	arrive?: string;
	/** Ease for the departure; defaults to the look's. */
	leave?: string;
}

/** A move from the pose an actor is "away" in: it arrives from it and leaves to it. */
export function move(away: (actor: Actor, phase: Phase) => Pose, timing: Timing = {}): Move {
	return (actor, phase) => {
		const dur = timing.dur ?? actor.body.tween.dur;
		return phase === "in"
			? actor.from(away(actor, phase), { dur, ease: timing.arrive ?? actor.motion.arrive })
			: actor.to(away(actor, phase), { dur, ease: timing.leave ?? actor.motion.leave });
	};
}

/** Several moves as one. */
export const mix =
	(...moves: Move[]): Move =>
	(actor, phase) =>
		all(...moves.map((m) => m(actor, phase)));

export const fade = (timing?: Timing): Move => move(() => ({ opacity: 0 }), timing);

export type Direction = "up" | "down" | "left" | "right";

const AXIS = { up: ["y", 1], down: ["y", -1], left: ["x", 1], right: ["x", -1] } as const;

/** Travels toward `direction`: in from the opposite side, out the far one. `distance` is in design pixels. */
export const slide = (direction: Direction, { distance = 72, ...timing }: Timing & { distance?: number } = {}): Move =>
	move((actor, phase) => {
		const [axis, sign] = AXIS[direction];
		return { opacity: 0, [axis]: by(actor.stage.px(distance) * sign * (phase === "in" ? 1 : -1)) };
	}, timing);

export const rise = (options?: Timing & { distance?: number }): Move => slide("up", options);

/** Scales up from `from` with a little overshoot. */
export const pop = ({ from = 0.6, ...timing }: Timing & { from?: number } = {}): Move =>
	move(() => ({ opacity: 0, scale: from }), { arrive: "back.out(1.7)", ...timing });
