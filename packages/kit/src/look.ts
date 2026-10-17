/**
 * A look is everything a brand decides once for every post: the ground the
 * scenes stand on, the tempo they move to, how motion feels, and the fonts.
 */
import type { Tempo } from "./time.js";

export interface Motion {
	/** How long a move takes when nobody says, in beats. */
	beats: number;
	/** Ease into a rest pose: arrivals. */
	arrive: string;
	/** Ease out of it: departures. */
	leave: string;
	/** Ease from one pose to another. */
	travel: string;
}

export interface Typeface {
	family: string;
	/** Absolute path to the font file. */
	source: string;
}

export interface Look {
	background: string;
	tempo: Tempo;
	motion: Motion;
	fonts: readonly Typeface[];
}
