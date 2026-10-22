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
	HalftoneScreen,
	Layer,
	LayerAnimation,
	LayerStyle,
	type MediaNode,
	Modulate,
} from "framefields";
import type { CloseUpOptions, DemoKit, DemoScript } from "../cast/demo.js";
import { box, line, type Node, polyline, popIn, shape, text } from "./parts.js";

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

/** A torn paper edge around a `width` × `height` sheet, in the sheet's own space (`pad` in from its box). */
function torn(width: number, height: number, pad: number, seed: number, k: DemoKit): string {
	const rnd = k.random(seed);
	const step = 22;
	const jag = () => (rnd() - 0.5) * 12;
	const [x0, y0, x1, y1] = [pad, pad, pad + width, pad + height];
	const pts: [number, number][] = [];
	for (let x = x0; x < x1; x += step) pts.push([x, y0 + jag()]);
	for (let y = y0; y < y1; y += step) pts.push([x1 + jag(), y]);
	for (let x = x1; x > x0; x -= step) pts.push([x, y1 + jag()]);
	for (let y = y1; y > y0; y -= step) pts.push([x0 + jag(), y]);
	return polyline(pts, true);
}

/** Lands like a hand slapping it onto the page: a little big, then flat, held on threes. */
const slap = (at: number) =>
	LayerAnimation.create()
		.keys("scale", [[0, 1.18], [at, 1.18], [at + 4, 1, "power3.out"]])
		.keys("opacity", [[0, 0], [at, 0], [at + 1, 1, "hold"]]);

export const collage: DemoScript = (k) => {
	const ink = "#1A1A1A";
	const marker = "#E63946";
	const pad = 10;
	/** A torn scrap of paper with a soft shadow, turned `turn` degrees about its middle; `children` sit on the paper. */
	const scrap = (name: string, r: Rect, fill: string, turn: number, at: number, seed: number, children: Node[] = []) =>
		box(k, name, r.inset(-pad), {
			rotation: turn,
			children: [
				shape(k, `${name}.shadow`, "path", new Rect(6, 9, r.width + pad * 2, r.height + pad * 2), { d: torn(r.width, r.height, pad, seed, k), fill: "#00000038" }),
				shape(k, `${name}.paper`, "path", new Rect(0, 0, r.width + pad * 2, r.height + pad * 2), { d: torn(r.width, r.height, pad, seed, k), fill }),
				box(k, `${name}.content`, new Rect(pad, pad, r.width, r.height), { overflow: "hidden", children }),
			],
		}).animate(slap(at), boil(seed, 1.5), LayerAnimation.stepped(3));
	const tape = (name: string, x: number, y: number, turn: number, at: number) =>
		box(k, name, new Rect(x, y, 170, 50), { background: "#F4EBD0C8", rotation: turn }).animate(slap(at), LayerAnimation.stepped(3));

	// Newsprint: a headline and columns of grey "text".
	const columns = Array.from({ length: 2 }, (_, c) =>
		Array.from({ length: 8 }, (_, i) =>
			box(k, `news.col-${c}-${i}`, new Rect(24 + c * 215, 150 + i * 26, i === 7 ? 120 : 195, 10), { background: "#8E8A80" }),
		),
	).flat();
	// Halftone dots on blue sugar paper.
	const dots = Array.from({ length: 9 * 7 }, (_, i) => {
		const s = 10 + ((i * 7) % 5) * 3;
		return Layer.shape("circle", { id: k.id(`blue.dot-${i}`), position: "absolute", x: 20 + (i % 9) * 46, y: 22 + Math.floor(i / 9) * 42, width: s, height: s, fill: "#7DD3FC99" });
	});
	// Graph paper.
	const grid = [
		...Array.from({ length: 14 }, (_, i) => box(k, `grid.v-${i}`, new Rect(i * 30, 0, 2, 420), { background: "#3B82F633" })),
		...Array.from({ length: 14 }, (_, i) => box(k, `grid.h-${i}`, new Rect(0, i * 30, 420, 2), { background: "#3B82F633" })),
	];
	const letters = [
		["C", ink, "#FFFFFF", "display", -7],
		["O", "#E63946", "#F5EEDC", "sans", 5],
		["L", "#F5EEDC", ink, "mono", -3],
		["L", palette.cobalt, "#FFFFFF", "display", 8],
		["A", "#FFC94D", ink, "sans", -5],
		["G", ink, "#FFC94D", "mono", 4],
		["E", "#F7A8B8", ink, "display", -8],
	] as const;
	const photo = new Rect(700, 540, 290, 340);
	const drawOn = (at: number, dur = 10) => LayerAnimation.keys("trimEnd", [[0, 0], [at, 0], [at + dur, 1, "power2.out"]]);
	// Rin, cut out of her own take like a figure from a magazine.
	const sticker = new Rect(170, 90, 720, 900);
	return [
		box(k, "kraft", k.box, {
			background: Gradient.linear(["#D9C29C", "#CFB68C"], 135),
			children: Array.from({ length: 40 }, (_, i) => {
				const rnd = k.random(200 + i);
				return Layer.box({ id: k.id(`fibre-${i}`), position: "absolute", x: rnd() * k.width, y: rnd() * k.height, width: 30 + rnd() * 90, height: 2, rotation: rnd() * 180, background: "#8B6B3D26" });
			}),
		}),
		scrap("news", new Rect(36, 40, 460, 380), "#F2EEE4", -4, 0, 21, [
			text(k, "news.head", "THE STYLE ISSUE", new Rect(20, 18, 420, 70), { font: "display", size: 40, weight: 800, fill: ink }),
			box(k, "news.rule", new Rect(20, 92, 420, 4), { background: ink }),
			text(k, "news.kicker", "No. 12 · framefields", new Rect(20, 100, 420, 40), { font: "mono", size: 22, weight: 600, fill: "#5A564E" }),
			...columns,
		]),
		scrap("blue", new Rect(600, 50, 430, 300), palette.cobalt, 5, 2, 22, dots),
		scrap("grid", new Rect(40, 560, 420, 420), "#F8F6F0", 3, 4, 23, grid),
		scrap("pink", new Rect(630, 520, 420, 470), "#F7A8B8", -5, 6, 24),
		// A photocopy of her, halftoned, taped onto the pink.
		box(k, "photo", photo, {
			background: "#FFFFFF",
			rotation: 7,
			children: [
				k.closeUp("photo.rin", new Rect(16, 16, photo.width - 32, photo.height - 70), { zoom: 0.95 }, (v) =>
					v.withEffects([new Modulate({ saturation: 0, contrast: 1.3, brightness: 1.1 }), new HalftoneScreen({ mode: "Monochrome", frequency: 70, contrast: 1.2 })]),
				),
				text(k, "photo.caption", "me, 2026", new Rect(16, photo.height - 52, photo.width - 32, 40), { font: "mono", size: 24, weight: 600, fill: ink, align: "center" }),
			],
		}).animate(slap(9), LayerAnimation.stepped(3)),
		tape("photo.tape", photo.x + 70, photo.y - 22, -6, 11),
		cutout(k, "rin", sticker, { zoom: 1.02, offset: { y: 20 } }).animate(slap(12), LayerAnimation.stepped(3)),
		tape("tape-1", 10, 30, -32, 15),
		tape("tape-2", 900, 30, 30, 16),
		// Red marker: an arrow at her and a star, drawn on.
		line(k, "arrow", "M 1010 420 C 960 380 920 360 860 370", marker, 8).animate(drawOn(18)),
		line(k, "arrow-head", "M 880 340 L 856 371 L 892 392", marker, 8).animate(drawOn(26, 4)),
		line(k, "star", polyline(Array.from({ length: 11 }, (_, i) => {
			const r = i % 2 ? 22 : 52;
			const a = -Math.PI / 2 + (i * Math.PI) / 5;
			return [110 + r * Math.cos(a), 470 + r * Math.sin(a)] as const;
		})), marker, 7).animate(drawOn(20, 12)),
		...letters.map(([ch, bg, fg, font, turn], i) =>
			box(k, `letter-${i}`, new Rect(150 + i * 112, 920, 100, 112), {
				background: bg,
				rotation: turn,
				children: [text(k, `letter-${i}.ch`, ch, new Rect(0, 0, 100, 112), { font, size: 78, weight: 800, fill: fg, align: "center" })],
			}).animate(slap(22 + i * 2), boil(50 + i, 1.5), LayerAnimation.stepped(3)),
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
