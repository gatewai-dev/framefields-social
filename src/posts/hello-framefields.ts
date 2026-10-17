/**
 * Hello, framefields: the account's first post. A headline that rises in, a
 * line of code under it, and the URL. Six seconds, any format.
 */
import { Composition, Layer, LayerAnimation } from "framefields";
import type { Format } from "../formats.js";
import { ACCENT, BG, FG, FPS, MONO, MUTED, registerFonts, SANS } from "../theme.js";

const DURATION = 6 * FPS;

export async function build({ width: W, height: H }: Format): Promise<Composition> {
	await registerFonts();

	// Scale type from the short side so every format reads at the same weight.
	const unit = Math.min(W, H) / 1080;
	const margin = 96 * unit;
	// "written in code." runs about 7 ems wide; keep it on one line on narrow canvases.
	const headline = Math.min(128 * unit, (W - margin * 2) / 7.5);
	const code = 40 * unit;
	const mid = H / 2;

	const post = new Composition({
		width: W,
		height: H,
		fps: FPS,
		durationMs: (DURATION / FPS) * 1000,
		backgroundColor: BG,
	});

	post.add(
		Layer.text("Video,\nwritten in code.", {
			id: "headline",
			position: "absolute",
			x: margin,
			y: mid - headline * 1.6,
			width: W - margin * 2,
			height: headline * 2.4,
			fontFamily: SANS,
			fontSize: headline,
			fontWeight: 700,
			fill: FG,
		}).animate(
			LayerAnimation.create()
				.fadeIn(0, 18, "power2.out")
				.fromTo("y", mid - headline * 1.2, mid - headline * 1.6, { start: 0, end: 30, ease: "expo.out" }),
		),
	);

	post.add(
		Layer.text("npm install framefields", {
			id: "install",
			position: "absolute",
			x: margin,
			y: mid + headline * 1.1,
			width: W - margin * 2,
			height: code * 1.6,
			fontFamily: MONO,
			fontSize: code,
			fill: ACCENT,
		}).animate(LayerAnimation.create().fadeIn(36, 54, "power2.out")),
	);

	post.add(
		Layer.text("framefields.dev", {
			id: "url",
			position: "absolute",
			x: margin,
			y: H - margin - code * 1.4,
			width: W - margin * 2,
			height: code * 1.6,
			fontFamily: SANS,
			fontSize: code,
			fontWeight: 500,
			fill: MUTED,
		}).animate(LayerAnimation.create().fadeIn(60, 78, "power2.out")),
	);

	return post;
}
