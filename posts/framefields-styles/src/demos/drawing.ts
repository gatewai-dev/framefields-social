/**
 * Styles drawn as they happen: spirograph curves that trace themselves around
 * Rin, and a ribbon of light painted through the dark in front of her.
 */
import { Rect } from "@framefields-social/kit";
import { palette } from "@framefields-social/brand";
import { Layer, LayerAnimation, Modulate } from "framefields";
import type { DemoScript } from "../cast/demo.js";
import { box, line, polyline } from "./parts.js";

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** A hypotrochoid (the spirograph curve): a pen at `d` in a wheel of radius `r` rolling inside one of radius `R`. */
function hypotrochoid(R: number, r: number, d: number, cx: number, cy: number, radius: number, points = 900): string {
	const turns = r / gcd(R, r);
	const scale = radius / (R - r + d);
	return polyline(
		Array.from({ length: points + 1 }, (_, i) => {
			const t = (i / points) * 2 * Math.PI * turns;
			return [cx + scale * ((R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)), cy + scale * ((R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t))] as const;
		}),
	);
}

export const spirograph: DemoScript = (k) => {
	const cx = k.width / 2;
	const cy = k.height / 2;
	const { length } = k.window;
	const pens = [
		{ R: 7, r: 3, d: 5, radius: 500, color: palette.sky },
		{ R: 8, r: 5, d: 4, radius: 470, color: palette.signal },
		{ R: 9, r: 4, d: 6, radius: 440, color: "#F472B6" },
	];
	const portrait = 380;
	return [
		box(k, "night", k.box, { background: palette.night }),
		...pens.flatMap(({ R, r, d, radius, color }, i) => {
			const path = hypotrochoid(R, r, d, cx, cy, radius);
			const draw = LayerAnimation.create()
				.keys("trimEnd", [[0, 0], [i * 4, 0], [Math.round(length * 0.85), 1, "sine.inOut"]])
				.keys("rotation", [[0, 0], [length, i % 2 ? -18 : 18, "none"]]);
			return [
				line(k, `glow-${i}`, path, `${color}40`, 14).animate(draw),
				line(k, `pen-${i}`, path, color, 3.5).animate(draw),
			];
		}),
		Layer.shape("circle", {
			id: k.id("ring"),
			position: "absolute",
			x: cx - portrait / 2 - 8,
			y: cy - portrait / 2 - 8,
			width: portrait + 16,
			height: portrait + 16,
			fillType: "none",
			strokeColor: palette.paper,
			strokeWidth: 4,
		}),
		k.closeUp("rin", new Rect(cx - portrait / 2, cy - portrait / 2, portrait, portrait), { zoom: 1.5, borderRadius: portrait / 2, offset: { y: -30 } }),
	];
};

export const lightPainting: DemoScript = (k) => {
	const cx = k.width / 2;
	const cy = k.height / 2 + 40;
	// A figure eight that loops every three seconds, so the ribbon reads the same whatever frame the emitter is read on.
	const period = 3 * k.fps;
	const at = (f: number) => (2 * Math.PI * (f % period)) / period;
	return [
		k.closeUp("rin", k.box, { zoom: 0.95, offset: { y: 30 } }, (v) => v.withEffects([new Modulate({ brightness: 0.35, saturation: 0.5, contrast: 1.1 })])),
		// A wide, faint halo following the same path, so the ribbon glows instead of reading as a line.
		Layer.particles({
			id: k.id("halo"),
			x: 0,
			y: 0,
			width: k.width,
			height: k.height,
			max: 6000,
			seed: 18,
			emitter: { shape: "point", x: (f) => cx + 400 * Math.sin(at(f)), y: (f) => cy + 220 * Math.sin(2 * at(f)), rate: 900 },
			lifetime: [1.2, 1.6],
			speed: [0, 4],
			spread: 360,
			drag: 4,
			size: [90, 40],
			shape: "soft",
			blend: "add",
			opacity: 0.18,
			color: [palette.sky, palette.signal, "#F472B6"],
			fade: [0.05, 0.5],
			prewarm: 1.5,
		}),
		Layer.particles({
			id: k.id("light"),
			x: 0,
			y: 0,
			width: k.width,
			height: k.height,
			max: 20000,
			seed: 17,
			emitter: { shape: "point", x: (f) => cx + 400 * Math.sin(at(f)), y: (f) => cy + 220 * Math.sin(2 * at(f)), rate: 3400 },
			lifetime: [1.4, 1.9],
			speed: [0, 6],
			spread: 360,
			drag: 4,
			size: [30, 8],
			shape: "soft",
			blend: "add",
			color: [palette.paper, palette.sky, palette.signal, "#F472B6"],
			fade: [0.05, 0.5],
			prewarm: 1.5,
		}),
	];
};
