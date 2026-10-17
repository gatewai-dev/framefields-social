/**
 * The framefields brand for social: a paper-white world, ink for type, one
 * cobalt accent; Inter for the voice, JetBrains Mono for code. Every post
 * takes its colors, fonts and frame rate from here.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FontManager } from "framefields";

export const FPS = 30;

export const BG = "#F4F2ED";
export const FG = "#121216";
export const MUTED = "#7C786F";
export const ACCENT = "#2B44FF";

export const SANS = "Inter";
export const MONO = "JetBrains Mono";

/** Asset paths resolve from this file, so the preview and the render worker find them too. */
export const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets");

let fontsRegistered = false;

export async function registerFonts(): Promise<void> {
	if (fontsRegistered) return;
	await FontManager.register({ family: SANS, source: path.join(ASSETS, "fonts/Inter.ttf") });
	await FontManager.register({ family: MONO, source: path.join(ASSETS, "fonts/JetBrainsMono.ttf") });
	fontsRegistered = true;
}
