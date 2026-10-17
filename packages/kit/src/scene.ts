/**
 * A scene is a script: a function that casts actors on a stage and returns
 * the one Action that is the scene. Scenes don't know their length or their
 * canvas ahead of time; both come from performing the script on a stage.
 */
import { type AnimatableNode, type BoxNode, Layer, type TransitionSpec } from "framefields";
import type { Action } from "./action.js";
import type { Actor } from "./actor.js";
import { castInto, type SoundCue } from "./casting.js";
import type { Motion } from "./look.js";
import type { Stage } from "./stage.js";
import type { Clock, Frames } from "./time.js";

export interface Cue {
	stage: Stage;
	clock: Clock;
}

export type Script = (cue: Cue) => Action;

type Timed<T> = T | ((clock: Clock) => T);

export interface SceneOptions {
	/** How this scene arrives from the one before it (default: a cut). */
	transition?: Timed<TransitionSpec>;
	/** Frames to hold once the script is done. */
	hold?: Timed<Frames>;
}

/** One performance of a scene: a full-frame layer and how long it runs. */
export interface Take {
	readonly name: string;
	readonly node: AnimatableNode<BoxNode>;
	readonly duration: Frames;
	readonly transition?: TransitionSpec;
	/** Sounds the script cued, at scene frames. */
	readonly sounds: readonly SoundCue[];
}

export class Scene {
	constructor(
		readonly name: string,
		private readonly script: Script,
		private readonly options: SceneOptions = {},
	) {}

	perform(stage: Stage, clock: Clock, motion: Motion): Take {
		const cast: Actor[] = [];
		const roles = new Map<string, number>();
		const join = (actor: Actor, role: string) => {
			const n = (roles.get(role) ?? 0) + 1;
			roles.set(role, n);
			cast.push(actor);
			return `${this.name}.${role}${n > 1 ? `-${n}` : ""}`;
		};

		const sounds: SoundCue[] = [];
		const action = castInto({ stage, clock, motion, join, sound: (cue) => sounds.push(cue) }, () => {
			const action = this.script({ stage, clock });
			action.play(0);
			return action;
		});

		const transition = timed(this.options.transition, clock);
		const hold = timed(this.options.hold, clock) ?? 0;
		const duration = Math.max(1, action.duration + hold, transition?.frames ?? 0);

		const node = Layer.box({
			id: this.name,
			position: "absolute",
			x: 0,
			y: 0,
			width: stage.width,
			height: stage.height,
			children: cast.map((actor) => actor.render({ duration })),
		});
		return { name: this.name, node, duration, transition, sounds };
	}
}

export const scene = (name: string, script: Script, options?: SceneOptions): Scene => new Scene(name, script, options);

const timed = <T>(value: Timed<T> | undefined, clock: Clock): T | undefined =>
	typeof value === "function" ? (value as (clock: Clock) => T)(clock) : value;
