/**
 * Styles that are a look on footage: Rin's close-up, live and in sync with her
 * on top, through a framefields effect stack, plus a little set dressing that
 * sells the look (a map legend, a Ceefax header, a thermal HUD, a Mac window).
 */
import { Rect } from "@framefields-social/kit";
import { palette } from "@framefields-social/brand";
import { Datamosh, Gradient, Kaleidoscope, Layer, LayerAnimation, Modulate, Painterly, RGBSplit, Styles, Trails } from "framefields";
import type { DemoScript } from "../cast/demo.js";
import { blink, box, line, polyline, shown, text, ticker } from "./parts.js";

/** A slow push-in over the whole demo, so a still look never sits dead. */
const pushIn = (length: number, to = 1.06) => LayerAnimation.keys("scale", [[0, 1], [length, to, "sine.inOut"]]);

export const topographic: DemoScript = (k) => {
	const ink = palette.navy;
	return [
		k.closeUp("map", k.box, { zoom: 1.05 }, (v) =>
			v.withEffects(Styles.topographic({ levels: 14, ink, paper: "#F3EEE4" })).animate(pushIn(k.window.length)),
		),
		text(k, "north", "↑ N", new Rect(880, 36, 160, 60), { font: "mono", size: 40, fill: ink, align: "end" }),
		text(k, "legend", "ELEV 1 680 M · CONTOUR 20 M", new Rect(40, 980, 700, 48), { font: "mono", size: 26, weight: 600, fill: ink }),
	];
};

export const psychedelic: DemoScript = (k) => [
	// Framed tight on her face, so every mirrored slice is her and the pattern stays a portrait.
	k.closeUp("trip", k.box, { zoom: 1.7 }, (v) =>
		v.withEffects([
			new Kaleidoscope({ segments: 6, rotation: k.signal((f) => f * 1.5) }),
			new Modulate({ saturation: 2.2, contrast: 1.15, hue: k.signal((f) => ((f * 9) % 360) - 180) }),
			new Trails({ decay: 0.8, hueShift: 20, zoom: 1.02 }),
		]),
	),
];

export const watercolour: DemoScript = (k) => {
	const { width, height } = k;
	// The painted take is revealed from the middle out by a soft round matte, like wet paint spreading.
	const spread = Layer.shape("circle", {
		id: k.id("spread"),
		position: "absolute",
		x: width / 2 - width * 0.75,
		y: height / 2 - width * 0.75,
		width: width * 1.5,
		height: width * 1.5,
		fill: Gradient.radial(["#FFFFFF", "#FFFFFF 55%", "#FFFFFF00"]),
	}).animate(LayerAnimation.keys("scale", [[0, 0.05], [Math.round(k.window.length * 0.55), 1, "sine.out"]]));
	return [
		k.closeUp("sketch", k.box, { zoom: 1 }, (v) => v.withEffects([new Modulate({ saturation: 0.15, brightness: 1.2, contrast: 0.7 })])),
		k.closeUp("paint", k.box, { zoom: 1 }, (v) =>
			v.withEffects([new Painterly({ style: "watercolor", radius: 10, edgeDarkening: 0.35, paper: 0.8, saturation: 1.1 }), new Modulate({ brightness: 1.1, contrast: 0.9 })]),
		).withMatte(spread),
	];
};

export const teletext: DemoScript = (k) => {
	const yellow = "#FFFF00";
	const white = "#FFFFFF";
	const header = new Rect(24, 18, 760, 60);
	const clock = new Rect(800, 18, 256, 60);
	const seconds = Array.from({ length: Math.ceil(k.window.length / k.fps) }, (_, i) => `11:42/${String(7 + i).padStart(2, "0")}`);
	const fastext = [
		["Styles", "#FF3B3B"],
		["Templates", "#3BFF4E"],
		["Rin", yellow],
		["Index", "#3BE8FF"],
	] as const;
	return [
		k.closeUp("page", new Rect(0, 96, k.width, 864), { zoom: 0.95 }, (v) => v.withEffects(Styles.teletext({ pixelSize: 12 }))),
		text(k, "header", "P100  FRAMEFIELDS 100  Thu 22 Oct", header, { font: "mono", size: 32, fill: white }),
		...ticker(k, "clock", seconds, k.fps, clock, { font: "mono", size: 32, fill: yellow, align: "end" }),
		...fastext.map(([label, color], i) =>
			text(k, `fastext-${i}`, label, new Rect(24 + i * 262, 980, 250, 56), { font: "mono", size: 32, fill: color }),
		),
	];
};

export const thermal: DemoScript = (k) => {
	const hud = "#FFFFFF";
	const { width } = k;
	const target = new Rect(width / 2 - 250, 200, 500, 600);
	const arm = 64;
	const corners = [
		[[target.x, target.y + arm], [target.x, target.y], [target.x + arm, target.y]],
		[[target.x2 - arm, target.y], [target.x2, target.y], [target.x2, target.y + arm]],
		[[target.x2, target.y2 - arm], [target.x2, target.y2], [target.x2 - arm, target.y2]],
		[[target.x + arm, target.y2], [target.x, target.y2], [target.x, target.y2 - arm]],
	] as const;
	const lock = LayerAnimation.create()
		.keys("scale", [[0, 1.25], [10, 1, "expo.out"]])
		.keys("opacity", [[0, 0], [4, 1]]);
	const cx = target.cx;
	const cy = target.cy - 40;
	return [
		k.closeUp("camera", k.box, { zoom: 1 }, (v) => v.withEffects(Styles.thermal())),
		...corners.map((pts, i) => line(k, `bracket-${i}`, polyline(pts), hud, 6).animate(lock)),
		line(k, "cross", `M${cx - 22} ${cy} L${cx + 22} ${cy} M${cx} ${cy - 22} L${cx} ${cy + 22}`, hud, 3).animate(lock),
		...ticker(k, "temp", ["36.5°C", "36.6°C", "36.6°C", "36.7°C", "36.6°C"], 18, new Rect(target.x2 - 260, target.y - 64, 260, 56), {
			font: "mono",
			size: 40,
			fill: hud,
			align: "end",
		}),
		Layer.shape("circle", { id: k.id("rec-dot"), position: "absolute", x: 40, y: 44, width: 26, height: 26, fill: "#FF2D2D" }).animate(blink(12, k.window.length)),
		text(k, "rec", "REC", new Rect(80, 30, 160, 56), { font: "mono", size: 34, fill: hud }),
		box(k, "scale", new Rect(width - 70, 260, 30, 520), {
			borderRadius: 6,
			background: Gradient.linear(["#FFFFFF", "#FFE14D", "#FF8A00", "#E0233A", "#7A1FA2", "#1B0A3A"], 180),
		}),
		text(k, "hot", "40°", new Rect(width - 170, 200, 130, 50), { font: "mono", size: 28, fill: hud, align: "end" }),
		text(k, "cold", "20°", new Rect(width - 170, 790, 130, 50), { font: "mono", size: 28, fill: hud, align: "end" }),
	];
};

export const datamosh: DemoScript = (k) => {
	const { length } = k.window;
	// Clean on the first frame, smeared along Rin's own motion, clean again just before the cut; RGB hits on top.
	const hits = [5, 19, 33];
	const split = (f: number) => hits.reduce((sum, h) => sum + (f >= h ? 36 * Math.exp(-(f - h) / 3) : 0), 0);
	return [
		k.closeUp("mosh", k.box, { zoom: 1.1 }, (v) =>
			v.withEffects([new Datamosh({ keyframes: [0, Math.max(1, length - 12)], strength: 4, bleed: 0.01 }), new RGBSplit({ amount: k.signal(split), angle: 0 })]),
		),
	];
};

export const opArt: DemoScript = (k) => [
	k.closeUp("stripes", k.box, { zoom: 1.1 }, (v) => v.withEffects(Styles.opArt({ pattern: "waves", frequency: 44 })).animate(pushIn(k.window.length, 1.08))),
];

export const oneBit: DemoScript = (k) => {
	const win = new Rect(110, 80, 860, 880);
	const bar = 54;
	const ink = "#000000";
	const paper = "#FFFFFF";
	// The classic Mac open: outlines zoom out from the middle, then the window.
	const zoom = [0.15, 0.4, 0.65, 0.9].map((s, i) => {
		const r = new Rect(win.cx - (win.width * s) / 2, win.cy - (win.height * s) / 2, win.width * s, win.height * s);
		return box(k, `zoom-${i}`, r, { borderColor: ink, borderWidth: 3 }).animate(shown(i * 2, i * 2 + 2));
	});
	const open = 8;
	const stripes = Array.from({ length: 6 }, (_, i) =>
		Layer.box({ id: k.id(`stripe-${i}`), position: "absolute", x: 8, y: 10 + i * 6, width: win.width - 16, height: 2, background: ink }),
	);
	return [
		box(k, "desktop", k.box, { background: "#C8C8C8" }),
		...zoom,
		box(k, "shadow", win.shift(10, 10), { background: ink }).animate(shown(open)),
		box(k, "window", win, {
			background: paper,
			borderColor: ink,
			borderWidth: 4,
			overflow: "hidden",
			children: [
				...stripes,
				Layer.box({ id: k.id("close"), position: "absolute", x: 24, y: 14, width: 26, height: 26, background: paper, borderColor: ink, borderWidth: 3 }),
				Layer.box({ id: k.id("title-bg"), position: "absolute", x: win.width / 2 - 120, y: 6, width: 240, height: 42, background: paper }),
				text(k, "title", "rin.pict", new Rect(win.width / 2 - 120, 6, 240, 42), { font: "mono", size: 30, fill: ink, align: "center" }),
				Layer.box({ id: k.id("rule"), position: "absolute", x: 0, y: bar, width: win.width, height: 4, background: ink }),
				k.closeUp("picture", new Rect(4, bar + 4, win.width - 8, win.height - bar - 8), { zoom: 1 }, (v) =>
					v.withEffects(Styles.oneBit({ dark: ink, light: paper, scale: 2 })),
				),
			],
		}).animate(shown(open)),
	];
};
