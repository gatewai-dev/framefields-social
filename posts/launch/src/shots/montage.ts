/**
 * One clip, many looks at once. The dancer keeps turning while the frame
 * keeps splitting, each layout shoving the last one off on a beat:
 *
 *   beat 8   full frame, blue contours on white; on 9 a watercolour half pushes it aside
 *   beat 10  a quad slams up from below: one image, four looks; on 11 every
 *            quarter flips over to a new look
 *   beat 12  six bands shove the quad off left, sliding against each other
 *   beat 14  a 3×3 grid pops in on a spiral; on 15 it blows apart into a
 *            full-frame datamosh that runs into the breath
 *
 * No words: the looks are the point.
 */
import type { Stage } from "@framefields-social/kit";
import {
	type AnimatableNode,
	Datamosh,
	frameArraySignal,
	Kaleidoscope,
	Layer,
	LayerAnimation,
	type LayoutNode,
	type MediaNode,
	Modulate,
	Painterly,
	Pixelate,
	RGBSplit,
	Styles,
} from "framefields";
import { ink } from "../cast/ground.js";
import type { Shot } from "../cast/shot.js";
import { DANCER, FPS, LENGTH, local, START } from "../cues.js";

type Video = AnimatableNode<MediaNode>;
type Key = [number, number, string?];

/** A per-frame value for an effect prop; signals read film frames, `f` counts from scene frame `from`. */
const ramp = (from: number, value: (f: number) => number) =>
	frameArraySignal(
		Array.from({ length: START.montage + LENGTH.montage + 1 }, (_, f) => value(Math.max(0, f - START.montage - from))),
		FPS,
	);

/** Every look, by number: dress(video, scene frame it starts). */
const LOOKS: ((v: Video, from: number) => Video)[] = [
	(v) => v.withEffects(Styles.thermal()),
	(v) => v.withEffects([new Painterly({ style: "watercolor", radius: 10, edgeDarkening: 0.35, paper: 0.8, saturation: 1.2 })]),
	(v) => v.withEffects(Styles.teletext({ pixelSize: 12 })),
	(v, from) => v.withEffects([new Kaleidoscope({ segments: 6, rotation: ramp(from, (f) => f * 3) }), new Modulate({ saturation: 1.8, contrast: 1.1 })]),
	(v) => v.withEffects(Styles.topographic({ levels: 14, ink: ink.cobalt, paper: ink.white })),
	(v) => v.withEffects(Styles.oneBit({ dark: ink.navy, light: ink.white, scale: 2 })),
	(v) => v.withEffects(Styles.opArt({ pattern: "waves", frequency: 44 })),
	(v) => v.withEffects([new Modulate({ saturation: 1.4, contrast: 1.1 }), new Pixelate({ size: 16 })]),
	(v) => v.withEffects([new RGBSplit({ amount: 26, angle: 0 }), new Modulate({ saturation: 1.6 })]),
	(v) => v.withEffects([new Kaleidoscope({ segments: 10 }), new Modulate({ hue: 40, saturation: 1.5 })]),
];

const SWING = "expo.inOut";

export const montage = (stage: Stage) => (shot: Shot): LayoutNode[] => {
	const { width: W, height: H } = stage;
	const on = local(START.montage);
	const end = LENGTH.montage;
	const g = stage.px(14);
	const r = stage.px(26);
	/** A move that crosses on beat `n`: starts 6 frames before, lands 2 after. */
	const swing = (n: number): [number, number] => [on(n) - 6, on(n) + 2];

	let count = 0;
	/**
	 * One panel of the clip. `slice` panels show their part of one full-frame
	 * picture, so a grid of them reads as one image cut into looks; otherwise
	 * the panel shows the whole dancer, centered. `keys` move the panel's box.
	 */
	const panel = (o: {
		look: number;
		x: number;
		y: number;
		w: number;
		h: number;
		from: number;
		to: number;
		slice?: boolean;
		round?: number;
		keys?: Partial<Record<"x" | "y" | "width" | "height" | "scale" | "scaleX" | "rotation" | "opacity", Key[]>>;
	}): LayoutNode => {
		count += 1;
		const { x, y, w, h, from, to } = o;
		const local = (k: Key[]): Key[] => k.map(([f, v, e]) => [f - from, v, e] as Key);
		const keys = o.keys ?? {};
		// Centered panels keep the dancer centered while the box resizes.
		const center = (prop: "width" | "height", size: number, full: number): Key[] =>
			keys[prop] ? local(keys[prop]).map(([f, v, e]) => [f, (v - full) / 2, e] as Key) : [[0, (size - full) / 2]];
		const video = LOOKS[o.look % LOOKS.length](
			Layer.video(DANCER, {
				id: shot.name(`panel-${count}.video`),
				position: "absolute",
				x: o.slice ? -x : (w - W) / 2,
				y: o.slice ? -y : (h - H) / 2,
				width: W,
				height: H,
				fit: "cover",
				muted: true,
				// The clip runs on through every cut: only the looks change.
				trimStartSec: 0.4 + from / FPS,
			}),
			from,
		);
		const placed = o.slice ? video : video.animate(LayerAnimation.keys("x", center("width", w, W)), LayerAnimation.keys("y", center("height", h, H)));
		const box = Layer.box({
			id: shot.name(`panel-${count}`),
			position: "absolute",
			x,
			y,
			width: w,
			height: h,
			borderRadius: o.round ?? r,
			overflow: "hidden",
			background: ink.frost,
			startFrame: from,
			durationFrames: to - from,
			children: [placed],
		});
		const tracks = Object.entries(keys).map(([prop, k]) => LayerAnimation.keys(prop as "x", local(k as Key[])));
		return tracks.length ? box.animate(...tracks) : box;
	};

	/** A full-frame layer that only moves its contents: a layout, pushed as one. */
	const stack = (name: string, to: number, children: LayoutNode[], keys: Partial<Record<"x" | "y" | "scale", Key[]>>): LayoutNode =>
		Layer.box({
			id: shot.name(name),
			position: "absolute",
			x: 0,
			y: 0,
			width: W,
			height: H,
			durationFrames: to,
			children,
		}).animate(...Object.entries(keys).map(([prop, k]) => LayerAnimation.keys(prop as "x", k as Key[])));

	// A: full frame, then a second look pushes in from the right and takes half.
	const [s9, e9] = swing(9);
	const half = (W - 3 * g) / 2;
	const [a10, b10] = swing(10);
	const A = stack(
		"split",
		b10,
		[
			panel({
				look: 4,
				x: 0,
				y: 0,
				w: W,
				h: H,
				from: 0,
				to: b10,
				round: 0,
				keys: {
					x: [[s9, 0], [e9, g, SWING]],
					y: [[s9, 0], [e9, g, SWING]],
					width: [[s9, W], [e9, half, SWING]],
					height: [[s9, H], [e9, H - 2 * g, SWING]],
				},
			}),
			panel({ look: 1, x: W, y: g, w: half, h: H - 2 * g, from: s9, to: b10, keys: { x: [[s9, W], [e9, 2 * g + half, SWING]] } }),
		],
		{ y: [[a10, 0], [b10, -H, SWING]] },
	);

	// B: one image in four quarters slams up; on 11 each quarter flips to a new look.
	const qw = (W - 3 * g) / 2;
	const qh = (H - 3 * g) / 2;
	const quads = [0, 1, 2, 3].map((q) => ({ x: g + (q % 2) * (qw + g), y: g + Math.floor(q / 2) * (qh + g) }));
	const flip = on(11);
	const [a12, b12] = swing(12);
	const B = stack(
		"quad",
		b12,
		quads.flatMap(({ x, y }, q) => [
			panel({ look: [2, 3, 0, 5][q], x, y, w: qw, h: qh, from: a10, to: flip, slice: true, keys: { scaleX: [[flip - 4, 1], [flip, 0, "power2.in"]] } }),
			panel({ look: 6 + q, x, y, w: qw, h: qh, from: flip, to: b12, slice: true, keys: { scaleX: [[flip, 0], [flip + 4 + q, 1, "back.out(2)"]] } }),
		]),
		{ y: [[0, H], [a10, H], [b10, 0, SWING]], x: [[a12, 0], [b12, -W, SWING]] },
	);

	// C: six bands of the same picture, each its own look, shove in from the right and slide against each other.
	const bands = 6;
	const bh = (H - (bands + 1) * g) / bands;
	const [a14, b14] = swing(14);
	const C = stack(
		"bands",
		b14 + 6,
		Array.from({ length: bands }, (_, b) => {
			const y = g + b * (bh + g);
			const drift = (b % 2 ? 1 : -1) * W * 0.06;
			return panel({
				look: [0, 4, 8, 2, 6, 5][b],
				x: g,
				y,
				w: W - 2 * g,
				h: bh,
				from: a12,
				to: b14 + 6,
				slice: true,
				round: bh / 2,
				keys: { x: [[b12, g], [on(13), g + drift, "sine.inOut"], [on(14), g - drift, "sine.inOut"]] },
			});
		}),
		{ x: [[0, W], [a12, W], [b12, 0, SWING]], scale: [[a14, 1], [b14 + 6, 0.8, "power2.in"]] },
	);

	// The datamosh waits under the grid and is all that is left when it blows apart.
	const blow = on(15);
	const mosh = Layer.video(DANCER, {
		id: shot.name("mosh"),
		position: "absolute",
		x: 0,
		y: 0,
		width: W,
		height: H,
		fit: "cover",
		muted: true,
		trimStartSec: 0.4 + (blow - 2) / FPS,
		startFrame: blow - 2,
		durationFrames: end - blow + 2,
	})
		.withEffects([
			new Datamosh({ keyframes: [0, Math.max(1, end - blow - 4)], strength: 4, bleed: 0.01 }),
			new RGBSplit({ amount: ramp(blow, (f) => 8 + f * 2.5), angle: 0 }),
		])
		.animate(LayerAnimation.keys("scale", [[0, 1.2], [8, 1, "expo.out"], [end - blow + 2, 1.12, "power2.in"]]));

	// D: a 3×3 grid pops in on a spiral, then blows outward.
	const tw = (W - 4 * g) / 3;
	const th = (H - 4 * g) / 3;
	const spiral = [4, 1, 2, 5, 8, 7, 6, 3, 0];
	const D = Array.from({ length: 9 }, (_, t) => {
		const col = t % 3;
		const row = Math.floor(t / 3);
		const x = g + col * (tw + g);
		const y = g + row * (th + g);
		const at = a14 + spiral.indexOf(t);
		const dx = (col - 1) * W * 0.7 + (t === 4 ? 0 : 0);
		const dy = (row - 1) * H * 0.7;
		return panel({
			look: [3, 0, 5, 9, 1, 7, 6, 2, 4][t],
			x,
			y,
			w: tw,
			h: th,
			from: at,
			to: blow + 9,
			slice: true,
			keys: {
				scale: [[at, 0], [at + 7, 1, "back.out(1.8)"], ...(t === 4 ? ([[blow, 1], [blow + 8, 3.2, "power3.in"]] as Key[]) : [])],
				rotation: [[at, (t % 2 ? 1 : -1) * 20], [at + 8, 0, "expo.out"], [blow, 0], [blow + 9, (t % 2 ? 1 : -1) * 35, "power3.in"]],
				x: [[blow, x], [blow + 9, x + dx, "power3.in"]],
				y: [[blow, y], [blow + 9, y + dy, "power3.in"]],
				opacity: [[blow + 5, 1], [blow + 9, 0]],
			},
		});
	});

	return [A, B, C, mosh, ...D];
};
