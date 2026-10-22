/**
 * Styles that put Rin into a new world: her close-up, cut out by on-device
 * vision (the selfie matte, made for a person this close), over a scene drawn
 * in framefields: Memphis shapes, a particle flow field, a paper collage and
 * an aurora sky.
 */
import { Rect } from "@framefields-social/kit";
import { palette, typeface } from "@framefields-social/brand";
import {
	type AnimatableNode,
	type BoxNode,
	Gradient,
	Layer,
	LayerAnimation,
	LayerStyle,
	type MediaNode,
	Modulate,
} from "framefields";
import type { CloseUpOptions, DemoKit, DemoScript } from "../cast/demo.js";
import { box, line, polyline, popIn, shape, text } from "./parts.js";

/** Rin alone: her close-up with everything but her keyed away, plus whatever else `dress` adds. */
const cutout = (
	k: DemoKit,
	name: string,
	rect: Rect = k.box,
	options: CloseUpOptions = {},
	dress: (video: AnimatableNode<MediaNode>) => AnimatableNode<MediaNode> = (v) => v,
): AnimatableNode<BoxNode> => k.closeUp(name, rect, options, (v) => dress(v.withVision({ mode: "matte", matteSource: "selfie" })));

/** Hand-made jitter: everything holds for a few frames, the way paper and Memphis prints move. */
const boil = (seed: number, amount = 3) =>
	LayerAnimation.create()
		.wiggle("x", { frequency: 2, amplitude: amount, seed })
		.wiggle("y", { frequency: 2, amplitude: amount, seed: seed + 1 });

export const memphis: DemoScript = (k) => {
	const rnd = k.random(8);
	const mustard = "#FFC94D";
	const pink = "#FF6FA8";
	const teal = "#2EC4B6";
	const dots = Array.from({ length: 36 }, (_, i) =>
		Layer.shape("circle", { id: k.id(`dot-${i}`), position: "absolute", x: 56 + (i % 6) * 34, y: 70 + Math.floor(i / 6) * 34, width: 13, height: 13, fill: palette.night }),
	);
	const zigzag = polyline(Array.from({ length: 9 }, (_, i) => [70 + i * 52, i % 2 ? 900 : 960] as const));
	const confetti = Array.from({ length: 14 }, (_, i) => {
		const x = 60 + rnd() * 960;
		const y = 60 + rnd() * 940;
		return shape(k, `confetti-${i}`, "rect", new Rect(x, y, 34, 12), {
			fill: [pink, teal, palette.cobalt, mustard][i % 4],
			rotation: rnd() * 180,
		}).animate(popIn(4 + i, 8), LayerAnimation.stepped(2));
	});
	return [
		box(k, "ground", k.box, { background: "#FFF1E6" }),
		box(k, "dots", k.box, { children: dots }).animate(popIn(0, 8), LayerAnimation.stepped(2)),
		shape(k, "sun", "circle", new Rect(210, 250, 660, 660), { fill: mustard }).animate(popIn(2, 12, 0.3), LayerAnimation.stepped(2)),
		line(k, "triangle", polyline([[780, 90], [990, 120], [860, 300]], true), pink, 16).animate(popIn(6, 10), boil(3), LayerAnimation.stepped(2)),
		line(k, "zigzag", zigzag, palette.cobalt, 18).animate(popIn(8, 10), boil(5), LayerAnimation.stepped(2)),
		shape(k, "half", "path", k.box, { d: "M 860 1056 A 150 150 0 0 1 1080 860 L 1080 1056 Z", fill: teal }).animate(popIn(10, 10), LayerAnimation.stepped(2)),
		line(k, "wave", "M 60 470 q 40 -50 80 0 t 80 0 t 80 0", palette.night, 12).animate(popIn(12, 10), boil(9), LayerAnimation.stepped(2)),
		...confetti,
		cutout(k, "rin", k.box, { zoom: 0.8, offset: { y: 60 } }),
	];
};

export const flowField: DemoScript = (k) => [
	box(k, "night", k.box, { background: Gradient.linear([palette.night, palette.navy], 180) }),
	Layer.particles({
		id: k.id("flow"),
		x: 0,
		y: 0,
		width: k.width,
		height: k.height,
		max: 6000,
		seed: 7,
		emitter: { shape: "rect", x: 0, y: 0, width: k.width, height: k.height, rate: 1500 },
		lifetime: [2, 3],
		speed: [0, 20],
		spread: 360,
		noise: { strength: 460, scale: 230, speed: 0.3 },
		drag: 1.2,
		size: [7, 2],
		stretch: 3,
		shape: "spark",
		blend: "add",
		opacity: 0.7,
		color: [palette.sky, palette.signal, palette.cobalt],
		fade: [0.2, 0.4],
		bounds: "wrap",
		prewarm: 3,
	}),
	cutout(k, "rin", k.box, { zoom: 0.95, offset: { y: 30 } }),
];

/** A paper scrap with torn edges: `r` with every side nudged in and out a little. */
function torn(r: Rect, seed: number, k: DemoKit): string {
	const rnd = k.random(seed);
	const step = 26;
	const jag = () => (rnd() - 0.5) * 14;
	const pts: [number, number][] = [];
	for (let x = r.x; x < r.x2; x += step) pts.push([x, r.y + jag()]);
	for (let y = r.y; y < r.y2; y += step) pts.push([r.x2 + jag(), y]);
	for (let x = r.x2; x > r.x; x -= step) pts.push([x, r.y2 + jag()]);
	for (let y = r.y2; y > r.y; y -= step) pts.push([r.x + jag(), y]);
	return polyline(pts, true);
}

export const collage: DemoScript = (k) => {
	const scraps = [
		{ r: new Rect(30, 40, 520, 380), fill: "#F5EEDC", turn: -4 },
		{ r: new Rect(560, 90, 480, 330), fill: palette.cobalt, turn: 3 },
		{ r: new Rect(60, 560, 440, 420), fill: "#F7A8B8", turn: 5 },
		{ r: new Rect(600, 600, 450, 380), fill: "#E8E4DA", turn: -3 },
	];
	// Newsprint: grey lines of "text" on the last scrap.
	const print = Array.from({ length: 9 }, (_, i) =>
		box(k, `print-${i}`, new Rect(640, 650 + i * 34, i % 3 === 2 ? 220 : 360, 12), { background: "#9A968C" }),
	);
	const letters = [
		["S", "#111111", "#FFFFFF", "display"],
		["T", "#E63946", "#F5EEDC", "sans"],
		["Y", "#F5EEDC", "#111111", "mono"],
		["L", palette.cobalt, "#FFFFFF", "display"],
		["E", "#FFC94D", "#111111", "sans"],
	] as const;
	const tape = (name: string, x: number, y: number, turn: number, at: number) =>
		box(k, name, new Rect(x, y, 190, 56), { background: "#FFF6D8B3", rotation: turn }).animate(popIn(at, 6, 0.6), LayerAnimation.stepped(2));
	return [
		box(k, "kraft", k.box, { background: "#D8C3A0" }),
		...scraps.map(({ r, fill, turn }, i) =>
			shape(k, `scrap-${i}`, "path", k.box, { d: torn(r, 20 + i, k), fill, rotation: turn }).animate(popIn(i * 2, 8, 0.8), boil(30 + i, 2), LayerAnimation.stepped(3)),
		),
		...print.map((p, i) => p.animate(popIn(6, 6), boil(40 + i, 2), LayerAnimation.stepped(3))),
		cutout(k, "rin", new Rect(170, 120, 740, 900), { zoom: 1.05, offset: { y: 20 } }, (v) =>
			v.withEffect(
				new LayerStyle({
					stroke: { enabled: true, size: 14, position: "outside", color: "#FFFFFF", opacity: 1 },
					dropShadow: { enabled: true, color: "#000000", opacity: 0.35, distance: 12, size: 18, angle: 120 },
				}),
			),
		).animate(popIn(6, 10, 0.85), LayerAnimation.create().keys("rotation", [[0, -2]]), LayerAnimation.stepped(2)),
		tape("tape-1", 190, 150, -24, 12),
		tape("tape-2", 720, 140, 20, 14),
		...letters.map(([ch, bg, fg, font], i) =>
			box(k, `letter-${i}`, new Rect(250 + i * 120, 900, 104, 120), {
				background: bg,
				rotation: [-8, 6, -4, 9, -6][i],
				children: [text(k, `letter-${i}.ch`, ch, new Rect(0, 0, 104, 120), { font: font as keyof typeof typeface, size: 84, weight: 800, fill: fg, align: "center" })],
			}).animate(popIn(14 + i * 2, 6, 0.4), boil(50 + i, 2), LayerAnimation.stepped(2)),
		),
	];
};

export const aurora: DemoScript = (k) => {
	const rnd = k.random(15);
	const stars = Array.from({ length: 46 }, (_, i) => {
		const s = 2 + rnd() * 4;
		return Layer.shape("circle", {
			id: k.id(`star-${i}`),
			position: "absolute",
			x: rnd() * k.width,
			y: rnd() * k.height * 0.7,
			width: s,
			height: s,
			fill: "#FFFFFF",
		}).animate(LayerAnimation.create().wiggle("opacity", { frequency: 1.5, amplitude: 0.4, seed: i }));
	});
	const sky = Layer.vfx({
		id: k.id("aurora"),
		effectType: "Aurora",
		x: 0,
		y: 0,
		width: k.width,
		height: k.height,
		colorStart: "#2BFF88",
		colorEnd: "#7A3CFF",
		density: 0.8,
		speed: 1,
	});
	sky.blendMode = "screen";
	return [
		box(k, "night", k.box, { background: Gradient.linear(["#020617", palette.navy], 180) }),
		...stars,
		sky,
		cutout(k, "rin", k.box, { zoom: 0.95, offset: { y: 30 } }, (v) =>
			v.withEffects([
				new Modulate({ brightness: 0.85, saturation: 0.9 }),
				new LayerStyle({ outerGlow: { enabled: true, color: "#2BFF88", opacity: 0.35, size: 28 } }),
			]),
		),
	];
};
