/**
 * Small drawing words the demos share: type, boxes and shapes placed by a
 * Rect, soft shadows for the soft-UI looks, Windows 95 bevels, and readouts
 * that tick from one value to the next.
 */
import type { Rect } from "@framefields-social/kit";
import { typeface } from "@framefields-social/brand";
import {
	type AnimatableNode,
	type BoxNode,
	Layer,
	LayerAnimation,
	type LayoutNode,
	type ShapeNode,
	type TextNode,
	type TextSpan,
} from "framefields";
import type { DemoKit } from "../cast/demo.js";

export interface TypeStyle {
	font?: keyof typeof typeface;
	size: number;
	weight?: number;
	fill?: string;
	align?: "start" | "center" | "end";
	valign?: "top" | "middle" | "bottom";
	letterSpacing?: number;
	lineHeight?: number;
}

export function text(k: DemoKit, name: string, words: string | TextSpan[], r: Rect, style: TypeStyle): AnimatableNode<TextNode> {
	const { font = "sans", size, weight = 700, fill = "#FFFFFF", align = "start", valign = "middle", letterSpacing, lineHeight } = style;
	return Layer.text(words, {
		id: k.id(name),
		position: "absolute",
		x: r.x,
		y: r.y,
		width: r.width,
		height: r.height,
		fontFamily: typeface[font],
		fontSize: size,
		fontWeight: weight,
		fill,
		align,
		verticalAlign: valign,
		...(letterSpacing === undefined ? {} : { letterSpacing }),
		...(lineHeight === undefined ? {} : { lineHeight }),
	});
}

export function box(k: DemoKit, name: string, r: Rect, props: Partial<BoxNode> = {}): AnimatableNode<BoxNode> {
	return Layer.box({ id: k.id(name), position: "absolute", x: r.x, y: r.y, width: r.width, height: r.height, ...props });
}

type ShapeType = "rect" | "circle" | "ellipse" | "polygon" | "star" | "arrow" | "path";

export function shape(k: DemoKit, name: string, type: ShapeType, r: Rect, props: Partial<ShapeNode> & { fill?: string } = {}): AnimatableNode<ShapeNode> {
	return Layer.shape(type, { id: k.id(name), position: "absolute", x: r.x, y: r.y, width: r.width, height: r.height, ...props });
}

/** A stroked path in the demo's own space (the whole box), no fill. */
export function line(k: DemoKit, name: string, d: string, color: string, width: number, props: Partial<ShapeNode> = {}): AnimatableNode<ShapeNode> {
	return shape(k, name, "path", k.box, {
		d,
		fillType: "none",
		strokeColor: color,
		strokeWidth: width,
		strokeLineCap: "round",
		strokeLineJoin: "round",
		...props,
	});
}

/** A path through `points`. */
export const polyline = (points: readonly (readonly [number, number])[], close = false): string =>
	points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + (close ? " Z" : "");

/**
 * A soft shadow under a rounded rect, without a blur: a few growing,
 * nearly transparent copies, offset by `dx`/`dy`. Boxes take no layer
 * styles, so this is how the soft-UI looks get their depth.
 */
export function softShadow(
	k: DemoKit,
	name: string,
	r: Rect,
	radius: number,
	{ color, dx, dy, spread = 30, steps = 6, strength = 0.5 }: { color: string; dx: number; dy: number; spread?: number; steps?: number; strength?: number },
): AnimatableNode<BoxNode> {
	const alpha = Math.round((strength / steps) * 255)
		.toString(16)
		.padStart(2, "0");
	return box(k, name, r, {
		children: Array.from({ length: steps }, (_, i) => {
			const grow = (spread * (i + 1)) / steps;
			return Layer.box({
				id: k.id(`${name}.${i}`),
				position: "absolute",
				x: dx - grow / 2,
				y: dy - grow / 2,
				width: r.width + grow,
				height: r.height + grow,
				borderRadius: radius + grow / 2,
				background: `${color}${alpha}`,
			});
		}),
	});
}

/** Windows 95 grey with its bevel: light on the top and left, dark on the bottom and right (or the other way, pressed in). */
export function bevel(k: DemoKit, name: string, r: Rect, { raised = true, face = "#C0C0C0", children = [] as LayoutNode[] } = {}): AnimatableNode<BoxNode> {
	const [light, dark] = raised ? ["#FFFFFF", "#808080"] : ["#808080", "#FFFFFF"];
	const edge = 3;
	const strip = (id: string, x: number, y: number, w: number, h: number, c: string) =>
		Layer.box({ id: k.id(`${name}.${id}`), position: "absolute", x, y, width: w, height: h, background: c });
	return box(k, name, r, {
		background: face,
		children: [
			strip("top", 0, 0, r.width, edge, light),
			strip("left", 0, 0, edge, r.height, light),
			strip("bottom", 0, r.height - edge, r.width, edge, dark),
			strip("right", r.width - edge, 0, edge, r.height, dark),
			...children,
		],
	});
}

/** Shown from frame `on` until `off` with no fade: a hard switch. */
export const shown = (on: number, off = Number.POSITIVE_INFINITY): LayerAnimation =>
	LayerAnimation.keys("opacity", [[0, 0], [on, 1, "hold"], ...(Number.isFinite(off) ? ([[off, 0, "hold"]] as [number, number, string][]) : [])]);

/** Several readings in turn, each held for `every` frames: a counter, a clock, a thermometer. */
export function ticker(k: DemoKit, name: string, values: readonly string[], every: number, r: Rect, style: TypeStyle): AnimatableNode<TextNode>[] {
	return values.map((value, i) =>
		text(k, `${name}.${i}`, value, r, style).animate(shown(i * every, i === values.length - 1 ? Number.POSITIVE_INFINITY : (i + 1) * every)),
	);
}

/** Blinks on and off every `period` frames. */
export const blink = (period: number, length: number): LayerAnimation =>
	LayerAnimation.keys(
		"opacity",
		Array.from({ length: Math.ceil(length / period) }, (_, i) => [i * period, i % 2 ? 0 : 1, "hold"] as [number, number, string]),
	);

/** Arrives with a pop at `at`, over `dur` frames. */
export const popIn = (at: number, dur = 10, from = 0): LayerAnimation =>
	LayerAnimation.create()
		.keys("scale", [[0, from], [at, from], [at + dur, 1, "back.out(1.7)"]])
		.keys("opacity", [[0, 0], [at, 0], [at + 2, 1]]);

export type Node = LayoutNode;
