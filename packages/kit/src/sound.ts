/**
 * Sound. A Sound is an audio file plus what was heard in it (see the studio's
 * listen): its loudness frame by frame and where its notes start. Scripts cue
 * it with sound(), land moves on its notes, and follow() its loudness, so
 * picture and sound are written together instead of lined up afterwards.
 */
import { type AnimatableProp, AudioCompressor } from "framefields";
import { type Action, action } from "./action.js";
import { casting } from "./casting.js";
import type { Limb } from "./limb.js";
import type { Clock, Frames } from "./time.js";

export interface Analysis {
	/** Frames per second the envelope was measured at. */
	fps: number;
	/** Loudness per frame, 0–1. */
	envelope: number[];
	/** Note onsets, in seconds from the start of the file. */
	onsets: number[];
}

export interface SoundOptions {
	/** Level trim in dB, so the sound lands on the loudness target through the master bus. */
	gain?: number;
}

export class Sound {
	readonly gain: number;

	constructor(
		/** Absolute path to the audio file. */
		readonly src: string,
		readonly analysis: Analysis = { fps: 30, envelope: [], onsets: [] },
		{ gain = 0 }: SoundOptions = {},
	) {
		this.gain = gain;
	}

	/** Where each note starts, in frames from the moment the sound is cued. */
	notes(clock: Clock): Frames[] {
		return this.analysis.onsets.map((s) => clock.seconds(s));
	}

	/** Frames from the start of the file to its loudest moment: where a hit lands. */
	peak(clock: Clock): Frames {
		const { fps, envelope } = this.analysis;
		return Math.round((envelope.indexOf(Math.max(...envelope)) * clock.fps) / fps);
	}

	/** Loudness `frames` after the cue, 0–1. */
	loudness(frames: Frames, clock: Clock): number {
		const { fps, envelope } = this.analysis;
		return envelope[Math.round((frames * fps) / clock.fps)] ?? 0;
	}
}

export interface Cueing {
	volume?: number;
	/**
	 * What lands on the frame the action plays at: the file's "start", or its
	 * "peak", so a swoosh that swells for a quarter second still hits on the
	 * motion it belongs to. "peak" needs a Sound with its analysis.
	 */
	on?: "start" | "peak";
}

/** Plays a sound here; it rings on to its own end and takes no time in a sequence. */
export function sound(of: Sound | string, { volume = 1, on = "start" }: Cueing = {}): Action {
	const scene = casting();
	const lead = on === "peak" && typeof of !== "string" ? of.peak(scene.clock) : 0;
	const src = typeof of === "string" ? of : of.src;
	const gain = typeof of === "string" ? 0 : of.gain;
	// Cuts can go on the layer's volume; boosts must come after the master bus,
	// or its compressor takes most of them back. A 1:1 compressor is a clean gain stage.
	const trim = gain > 0 ? [new AudioCompressor({ threshold: 0, ratio: 1, makeupGain: gain })] : [];
	const level = volume * (gain < 0 ? 10 ** (gain / 20) : 1);
	return action(0, (at) => scene.sound({ src, at: Math.max(0, at - lead), volume: level, trim }));
}

/**
 * Lets `prop` ride the sound's loudness from here: silence is `quiet`, the
 * loudest moment `loud`, starting `from` frames into the sound (play it
 * that many frames after the cue), for at most `limit` frames. The envelope
 * is framefields' AudioSignal energy, already smoothed with attack and
 * release; `smooth` averages it further over ±frames if wanted. Keyed every
 * `every` frames rather than bound as a signal, so it moves with the scene
 * wherever the scene is cut in.
 */
export function follow(
	limb: Limb,
	prop: AnimatableProp,
	sound: Sound,
	{
		quiet,
		loud,
		every = 3,
		smooth = 0,
		from = 0,
		limit = Number.POSITIVE_INFINITY,
	}: { quiet: number; loud: number; every?: Frames; smooth?: Frames; from?: Frames; limit?: Frames },
): Action {
	const { clock } = casting();
	const length = Math.min(limit, Math.ceil((sound.analysis.envelope.length * clock.fps) / sound.analysis.fps) - from);
	return action(length, (at) => {
		for (let f = 0; f <= length; f += every) {
			// Averaged over ±smooth frames, so light swells with the music instead of flickering on each transient.
			const window = Array.from({ length: 2 * smooth + 1 }, (_, i) => sound.loudness(Math.max(0, from + f + i - smooth), clock));
			const level = window.reduce((a, b) => a + b, 0) / window.length;
			limb.key(prop, at + f, quiet + (loud - quiet) * level, "sine.inOut");
		}
	});
}
