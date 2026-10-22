/**
 * Casting: while a scene's script runs, it is the scene being cast, and every
 * actor made joins it. That is why a script never "adds" anything: making an
 * actor puts it on stage, in paint order, the first one made at the back.
 */
import type { Effect } from "framefields";
import type { Actor } from "./actor.js";
import type { Motion } from "./look.js";
import type { Stage } from "./stage.js";
import type { Clock, Frames } from "./time.js";

export interface Casting {
	readonly stage: Stage;
	readonly clock: Clock;
	readonly motion: Motion;
	/** Puts `actor` on stage and gives it a unique id built from `role`. */
	join(actor: Actor, role: string): string;
	/** Plays `cue` from `at`, a frame of the scene. */
	sound(cue: SoundCue): void;
}

export interface SoundCue {
	/** Absolute path to the audio file. */
	src: string;
	at: Frames;
	volume: number;
	/** Effects after the master bus: this sound's own finishing. */
	trim: readonly Effect<object>[];
}

let current: Casting | undefined;

export function casting(): Casting {
	if (!current) throw new Error("Actors and sounds belong to a scene: make them inside its script.");
	return current;
}

/** Runs `write` with `scene` as the scene being cast. */
export function castInto<T>(scene: Casting, write: () => T): T {
	const outer = current;
	current = scene;
	try {
		return write();
	} finally {
		current = outer;
	}
}
