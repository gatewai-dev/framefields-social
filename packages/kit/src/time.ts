/**
 * Time. The engine counts whole frames; people count beats and seconds. A
 * Clock turns one into the other, so every length in a post is musical and
 * survives a change of tempo or frame rate.
 */

/** A whole number of frames. Every keyframe, start and length is one. */
export type Frames = number;

export interface Tempo {
	fps: number;
	bpm: number;
}

export class Clock implements Tempo {
	readonly fps: number;
	readonly bpm: number;

	constructor({ fps, bpm }: Tempo) {
		this.fps = fps;
		this.bpm = bpm;
	}

	/** Frames in one beat, unrounded: scale it first, round once. */
	get beat(): number {
		return (this.fps * 60) / this.bpm;
	}

	// Arrow properties, so a script can destructure them: ({ clock: { beats } }).
	readonly beats = (n: number): Frames => Math.round(n * this.beat);
	readonly bars = (n: number): Frames => this.beats(n * 4);
	readonly seconds = (s: number): Frames => Math.round(s * this.fps);
}
