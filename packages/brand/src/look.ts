/**
 * The framefields look, taken from the brand assets: the banner's night-navy
 * to cobalt sweep, the mark's signal blue, a sky glow for emphasis. Unbounded
 * headlines (it sets the wordmark), Inter speaks, JetBrains Mono writes code. Everything moves at 120 bpm.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Look } from "@framefields-social/kit";
import { AudioCompressor, AudioFade, AudioParametricEq, AudioReverb, span, type TextSpan } from "framefields";

export const palette = {
	black: "#000000",
	night: "#081638",
	navy: "#0B1E4D",
	royal: "#123A9C",
	cobalt: "#1D4ED8",
	/** The mark's blue. */
	signal: "#3B82F6",
	/** Emphasis and glow. */
	sky: "#7DD3FC",
	paper: "#FFFFFF",
	/** Secondary words on navy. */
	mist: "#A8B9E4",
	/** Hairlines and glass on navy. */
	line: "#FFFFFF26",
	glass: "#FFFFFF0F",
} as const;

export const typeface = { display: "Unbounded", sans: "Inter", mono: "JetBrains Mono" } as const;

/** Resolved from this file, so the preview page and the render worker find them too. */
export const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../assets");

export const look: Look = {
	background: palette.night,
	tempo: { fps: 30, bpm: 120 },
	motion: { beats: 1, arrive: "expo.out", leave: "power2.in", travel: "power3.inOut" },
	fonts: [
		{ family: typeface.display, source: path.join(ASSETS, "fonts/Unbounded.ttf") },
		{ family: typeface.sans, source: path.join(ASSETS, "fonts/Inter.ttf") },
		{ family: typeface.mono, source: path.join(ASSETS, "fonts/JetBrainsMono.ttf") },
	],
	// Easy on the ear, on phone speakers too: rumble cut, a little warmth, the
	// 2.5–6 kHz band where harshness lives dipped, the top shelved off, a small
	// soft room to round the attacks, then a gentle compressor to sit the level
	// near -14 LUFS without touching full scale, and a soft tail.
	master: [
		new AudioParametricEq({ type: "highPass", frequency: 40, q: 0.7 }),
		new AudioParametricEq({ type: "lowShelf", frequency: 180, gain: 1.5, q: 0.7 }),
		new AudioParametricEq({ type: "peak", frequency: 3500, gain: -3, q: 1.2 }),
		new AudioParametricEq({ type: "highShelf", frequency: 7000, gain: -4, q: 0.7 }),
		new AudioReverb({ roomSize: 0.35, damping: 0.7, wet: 0.12, dry: 1 }),
		new AudioCompressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.25, knee: 6, makeupGain: 3.5 }),
		new AudioFade({ fadeOutDuration: 0.5, fadeOutCurve: "scurve" }),
	],
};

/** Words that glow: rich`Video, ${em("written in code.")}` */
export const em = (text: string): TextSpan => span(text, { fill: palette.sky });
