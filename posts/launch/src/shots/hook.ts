/**
 * The hook, on white over the riser: a caret blinks, then one word slams in on
 * each stab, "What if / video / was just / code?", each one shoving the last
 * up and out. The last word starts to tear apart as the riser peaks.
 */
import { typeface } from "@framefields-social/brand";
import type { Stage } from "@framefields-social/kit";
import { frameArraySignal, Layer, LayerAnimation, type LayoutNode, RGBSplit } from "framefields";
import { ink } from "../cast/ground.js";
import type { Shot } from "../cast/shot.js";
import { FPS, LENGTH, RISE, STABS } from "../cues.js";

const WORDS = ["What if", "video", "was just", "code?"] as const;
/** How long a word takes to be shoved out by the next. */
const SHOVE = 6;

export const hook = (stage: Stage) => (shot: Shot): LayoutNode[] => {
	const { width, height } = stage;
	const size = stage.px(stage.pick({ portrait: 168, landscape: 150 }));
	const line = size * 1.3;
	const y = height / 2 - line / 2;
	const last = WORDS.length - 1;
	const end = LENGTH.hook;
	const caretY = height / 2 - size * 0.5;

	const caret = Layer.box({
		id: shot.name("caret"),
		position: "absolute",
		x: width / 2 - size * 0.18,
		y: caretY,
		width: size * 0.36,
		height: size,
		background: ink.cobalt,
		durationFrames: STABS[0] + SHOVE,
	}).animate(
		LayerAnimation.keys("opacity", [[0, 1], [9, 0, "hold"], [12, 1, "hold"]]),
		LayerAnimation.keys("y", [[STABS[0], caretY], [STABS[0] + SHOVE, caretY - line * 1.2, "power3.in"]]),
	);

	const words = WORDS.map((word, i) => {
		const from = STABS[i];
		const code = i === last;
		const next = STABS[i + 1];
		const to = next === undefined ? end : next + SHOVE;
		const out = next === undefined ? undefined : next - from;
		const tilt = i % 2 ? 7 : -7;
		const node = Layer.text(word, {
			id: shot.name(`word-${i + 1}`),
			position: "absolute",
			x: 0,
			y,
			width,
			height: line,
			fontFamily: code ? typeface.mono : typeface.display,
			fontWeight: 700,
			fontSize: code ? size * 1.15 : size,
			fill: code ? ink.cobalt : ink.navy,
			align: "center",
			verticalAlign: "middle",
			startFrame: from,
			durationFrames: to - from,
		}).animate(
			// In from below, overshooting and tilted; out the top when the next word shoves.
			LayerAnimation.keys("y", [
				[0, y + line * 1.1],
				[7, y, "back.out(1.6)"],
				...(out === undefined ? [] : ([[out, y], [out + SHOVE, y - line * 1.3, "power3.in"]] as [number, number, string?][])),
			]),
			LayerAnimation.keys("rotation", [[0, tilt], [8, 0, "expo.out"]]),
			LayerAnimation.keys("scale", [
				[0, 1.3],
				[7, 1, "expo.out"],
				...(code ? ([[RISE - from, 1], [end - from, 2.1, "power3.in"]] as [number, number, string?][]) : []),
			]),
			LayerAnimation.keys("opacity", [[0, 0], [2, 1], ...(out === undefined ? [] : ([[out + 2, 1], [out + SHOVE, 0]] as [number, number][]))]),
		);
		if (!code) return node;
		// The riser tears the word apart: the split widens to the drop.
		const split = Array.from({ length: end + 1 }, (_, f) => (f < RISE ? 0 : 4 + ((f - RISE) / (end - RISE)) ** 2 * 70));
		return node.withEffects([new RGBSplit({ amount: frameArraySignal(split, FPS), angle: 0 })]);
	});

	// A pale blue light behind the words, swelling as the riser climbs.
	const glow = Layer.shape("ellipse", {
		id: shot.name("glow"),
		position: "absolute",
		x: width / 2 - width * 0.7,
		y: height / 2 - width * 0.7,
		width: width * 1.4,
		height: width * 1.4,
		fill: `radial-gradient(${ink.sky}99, ${ink.sky}00 62%)`,
	}).animate(
		LayerAnimation.keys("opacity", [[0, 0.8], [STABS[0], 0.35, "sine.inOut"], [STABS[last], 0.5, "sine.inOut"], [end, 1, "power2.in"]]),
		LayerAnimation.keys("scale", [[0, 0.5], [STABS[last], 0.6, "sine.inOut"], [end, 1.4, "power2.in"]]),
	);

	return [glow, caret, ...words];
};
