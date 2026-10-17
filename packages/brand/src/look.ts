/**
 * The framefields look, taken from the brand assets: the banner's night-navy
 * to cobalt sweep, the mark's signal blue, a sky glow for emphasis. Inter
 * speaks, JetBrains Mono writes code. Everything moves at 120 bpm.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Look, Sound } from "@framefields-social/kit";
import { span, type TextSpan } from "framefields";
import introJingle from "../../../assets/audio/intro-jingle.json" with { type: "json" };

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

export const typeface = { sans: "Inter", mono: "JetBrains Mono" } as const;

/** Resolved from this file, so the preview page and the render worker find them too. */
export const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../assets");

export const look: Look = {
	background: palette.night,
	tempo: { fps: 30, bpm: 120 },
	motion: { beats: 1, arrive: "expo.out", leave: "power2.in", travel: "power3.inOut" },
	fonts: [
		{ family: typeface.sans, source: path.join(ASSETS, "fonts/Inter.ttf") },
		{ family: typeface.mono, source: path.join(ASSETS, "fonts/JetBrainsMono.ttf") },
	],
};

/** Sounds, generated with `pnpm studio sound`, listened to, and kept under Git LFS. */
export const sounds = {
	/** Soft felt piano and marimba climbing E4 G4 C5, settling into a warm pad chord that fades: 4 s. */
	intro: new Sound(path.join(ASSETS, "audio/intro-jingle.mp3"), introJingle),
} as const;

/** Words that glow: rich`Video, ${em("written in code.")}` */
export const em = (text: string): TextSpan => span(text, { fill: palette.sky });
