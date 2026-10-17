/**
 * A limb is one animatable node of an actor: a resting pose, plus every key
 * the script writes onto it. Actions ask a limb where it stands at a frame and
 * key where it goes next, so moves chain without anyone tracking positions.
 */
import { type AnimatableNode, type AnimatableProp, LayerAnimation, type LayoutNode } from "framefields";
import { type Action, action } from "./action.js";
import type { Frames } from "./time.js";

export type Value = number | string;
/** Where a prop goes: a value, or a function of where it is now (see `by`). */
export type Target = Value | ((now: number) => number);
export type Pose = Partial<Record<AnimatableProp, Target>>;
export type RestPose = Partial<Record<AnimatableProp, Value>>;

export interface Tween {
	dur?: Frames;
	ease?: string;
}

/** A relative target: `{ y: by(-40) }` is 40 above wherever the limb is. */
export const by =
	(delta: number) =>
	(now: number): number =>
		now + delta;

type Key = readonly [frame: Frames, value: Value, ease?: string];

export class Limb {
	private readonly tracks = new Map<AnimatableProp, Key[]>();
	private readonly procedures: LayerAnimation[] = [];

	constructor(
		readonly rest: RestPose,
		readonly tween: Required<Tween>,
	) {}

	/** Where `prop` stands at `frame`: the last key at or before it, else the rest pose. */
	at(prop: AnimatableProp, frame: Frames): Value {
		let value = this.rest[prop];
		for (const [f, v] of this.tracks.get(prop) ?? []) {
			if (f > frame) break;
			value = v;
		}
		if (value === undefined) throw new Error(`"${prop}" has no rest value; add it to the limb's rest pose.`);
		return value;
	}

	key(prop: AnimatableProp, frame: Frames, value: Value, ease?: string): this {
		const f = Math.round(frame);
		const keys = this.tracks.get(prop) ?? [];
		const i = keys.findIndex(([k]) => k >= f);
		const key: Key = ease ? [f, value, ease] : [f, value];
		if (i === -1) keys.push(key);
		else keys.splice(i, keys[i][0] === f ? 1 : 0, key);
		this.tracks.set(prop, keys);
		return this;
	}

	/** From wherever the limb is to `pose`. */
	to(pose: Pose, { dur = this.tween.dur, ease = this.tween.ease }: Tween = {}): Action {
		return action(dur, (at) => {
			for (const [prop, target] of entries(pose)) {
				const now = this.at(prop, at);
				this.key(prop, at, now).key(prop, at + dur, resolve(target, now), ease);
			}
		});
	}

	/** From `pose` to wherever the limb is: an arrival. */
	from(pose: Pose, { dur = this.tween.dur, ease = this.tween.ease }: Tween = {}): Action {
		return action(dur, (at) => {
			for (const [prop, target] of entries(pose)) {
				const now = this.at(prop, at);
				this.key(prop, at, resolve(target, now)).key(prop, at + dur, now, ease);
			}
		});
	}

	/** Jumps to `pose` with no motion. */
	set(pose: Pose): Action {
		return action(0, (at) => {
			for (const [prop, target] of entries(pose)) this.key(prop, at, resolve(target, this.at(prop, at)), "hold");
		});
	}

	/** Whether the script ever moves `prop`. */
	moves(prop: AnimatableProp): boolean {
		return this.tracks.has(prop);
	}

	/** Back to the rest pose. */
	settle(tween?: Tween): Action {
		return this.to(this.rest, tween);
	}

	/** Adds a procedural animation (wiggle, spring, signal) that runs under the keys. */
	with(animation: LayerAnimation): this {
		this.procedures.push(animation);
		return this;
	}

	/** Puts everything the script wrote onto `node`. */
	bind<N extends LayoutNode>(node: AnimatableNode<N>): AnimatableNode<N> {
		const keyed = LayerAnimation.create();
		for (const [prop, keys] of this.tracks) {
			// Before its first key the engine shows the node's static value, not the
			// key's: pin frame 0 so whatever waits for an entrance stays hidden.
			const [first] = keys;
			keyed.keys(prop, first[0] > 0 ? [[0, first[1]], ...keys] : keys);
		}
		return node.animate(keyed, ...this.procedures);
	}
}

const entries = (pose: Pose) => Object.entries(pose) as [AnimatableProp, Target][];
const resolve = (target: Target, now: Value): Value => (typeof target === "function" ? target(Number(now)) : target);
