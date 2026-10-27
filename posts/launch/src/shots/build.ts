/**
 * Code to picture, on the drop: an editor types one line per beat and the
 * preview beside it does what the line says, the moment it says it. Eight
 * beats, eight lines, from an empty composition to a rendered MP4. The only
 * words are the code and the preview's own.
 */
import { typeface } from "@framefields-social/brand";
import type { Rect, Stage } from "@framefields-social/kit";
import { FontManager, frameArraySignal, Layer, LayerAnimation, type LayoutNode, RGBSplit, span, type TextSpan, TextAnimator } from "framefields";
import { ink } from "../cast/ground.js";
import type { Shot } from "../cast/shot.js";
import { FPS, LENGTH, local, START } from "../cues.js";

const LINES = [
	"const film = new Composition();",
	'film.add(Layer.text("Hello, LinkedIn"))',
	"  .animate(TextAnimator.waveRise());",
	'film.add(Layer.shape("circle"))',
	'  .animate(LayerAnimation.wiggle("x"));',
	"film.apply(new RGBSplit({ amount: 8 }));",
	'film.add(Layer.audio("track.wav"));',
	"await film.renderVideo();",
] as const;

const SYNTAX = {
	keyword: "#DB2777",
	string: "#0284C7",
	call: ink.cobalt,
	plain: ink.navy,
	punct: "#64748B",
} as const;

/** Frame of line `i`'s beat, in the scene's own frames. */
const on = local(START.build);
const TYPE = 6;

export const build = (stage: Stage) => (shot: Shot): LayoutNode[] => {
	const safe = stage.safe;
	const gap = stage.px(36);
	const [editor, preview] = stage.pick({
		portrait: [safe.top(0.42), safe.bottom(0.58).inset({ top: gap })],
		landscape: safe.cols(1.1, 1).map((r, i) => r.inset(i === 0 ? { right: gap / 2 } : { left: gap / 2 })),
	});
	return [...code(stage, shot, editor), ...picture(stage, shot, preview)];
};

function code(stage: Stage, shot: Shot, box: Rect): LayoutNode[] {
	const pad = stage.px(36);
	const header = stage.px(56);
	const longest = Math.max(...LINES.map((l) => l.length)) + 1.5;
	const size = Math.min(stage.px(36), (box.width - 2 * pad) / (longest * 0.6));
	const step = size * 1.5;
	const top = header + stage.px(10);
	const dots = [ink.cobalt, ink.signal, ink.sky];

	const highlight = Layer.box({
		id: shot.name("editor.highlight"),
		position: "absolute",
		x: 0,
		y: top,
		width: box.width,
		height: step,
		background: `${ink.signal}1F`,
	}).animate(
		LayerAnimation.keys("y", LINES.map((_, i) => [on(i), top + i * step, "expo.out"] as [number, number, string])),
		LayerAnimation.keys("opacity", [[0, 0], [on(0), 1]]),
	);

	const lines = LINES.map((line, i) => {
		const indent = line.length - line.trimStart().length;
		return Layer.text(tokens(line.trimStart()), {
			id: shot.name(`editor.line-${i + 1}`),
			position: "absolute",
			// Layout trims leading spaces, so an indent is an offset of whole mono cells.
			x: pad + indent * size * 0.6,
			y: top + i * step,
			width: box.width - 2 * pad,
			height: step,
			fontFamily: typeface.mono,
			fontSize: size,
			fill: ink.navy,
			verticalAlign: "middle",
			startFrame: on(i),
		}).animate(LayerAnimation.keys("text", [[0, 0], [TYPE, 1, "none"]]));
	});

	// Slams up on the drop; nudges on every beat after.
	const nudge: [number, number, string?][] = [[0, box.y + stage.px(140)], [on(0), box.y, "expo.out"]];
	return [
		Layer.box({
			id: shot.name("editor"),
			position: "absolute",
			x: box.x,
			y: box.y,
			width: box.width,
			height: box.height,
			background: ink.white,
			borderColor: ink.rule,
			borderWidth: stage.px(3),
			borderRadius: stage.px(28),
			overflow: "hidden",
			children: [
				...dots.map((color, i) =>
					Layer.shape("circle", {
						id: shot.name(`editor.dot-${i + 1}`),
						position: "absolute",
						x: pad + i * stage.px(30),
						y: header / 2 - stage.px(9),
						width: stage.px(18),
						height: stage.px(18),
						fill: color,
					}),
				),
				Layer.box({
					id: shot.name("editor.rule"),
					position: "absolute",
					x: 0,
					y: header,
					width: box.width,
					height: stage.px(3),
					background: ink.rule,
				}),
				highlight,
				...lines,
			],
		}).animate(LayerAnimation.keys("y", nudge)),
	];
}

function picture(stage: Stage, shot: Shot, box: Rect): LayoutNode[] {
	const { width, height } = box;
	const cx = width / 2;
	const id = (n: string) => shot.name(`preview.${n}`);
	const length = LENGTH.build;
	// The ring and the words sit a little high, clear of the bars along the bottom.
	const cy = height * 0.44;
	const R = Math.min(width, height) * 0.36;

	// 1: the canvas lights up, blue on the white page, with a faint grid.
	const ground = Layer.box({
		id: id("ground"),
		position: "absolute",
		x: 0,
		y: 0,
		width,
		height,
		background: `linear-gradient(135deg, ${ink.cobalt}, ${ink.signal} 55%, ${ink.sky})`,
		startFrame: on(0),
	}).animate(LayerAnimation.keys("opacity", [[0, 0], [6, 1, "power2.out"]]));
	const cell = width / 8;
	const hair = stage.px(1.5);
	const grid = [
		...Array.from({ length: 7 }, (_, k) => ({ x: (k + 1) * cell, y: 0, w: hair, h: height })),
		...Array.from({ length: Math.floor(height / cell) }, (_, k) => ({ x: 0, y: (k + 1) * cell, w: width, h: hair })),
	].map((l, k) =>
		Layer.box({
			id: id(`grid-${k + 1}`),
			position: "absolute",
			x: l.x,
			y: l.y,
			width: l.w,
			height: l.h,
			background: `${ink.white}1A`,
			startFrame: on(0),
		}),
	);

	// 4: a circle: a faint disc swells and a crisp ring draws itself around the words.
	const disc = Layer.shape("circle", {
		id: id("disc"),
		position: "absolute",
		x: cx - R,
		y: cy - R,
		width: 2 * R,
		height: 2 * R,
		fill: `${ink.white}1F`,
		startFrame: on(3),
	}).animate(LayerAnimation.keys("scale", [[0, 0], [12, 1, "back.out(1.8)"]]));
	const ringLine = Layer.shape("circle", {
		id: id("ring"),
		position: "absolute",
		x: cx - R,
		y: cy - R,
		width: 2 * R,
		height: 2 * R,
		fillType: "none",
		strokeColor: ink.white,
		strokeWidth: stage.px(5),
		startFrame: on(3),
	}).animate(LayerAnimation.keys("trimEnd", [[0, 0], [12, 1, "expo.out"]]), LayerAnimation.keys("rotation", [[0, -90], [12, 0, "expo.out"]]));

	// 5: wiggle: three dots ride the ring, never the words.
	const dots = [0, 1, 2].map((m) => {
		const r = R * (0.075 - m * 0.012);
		const phase = -Math.PI / 2 + (m * 2 * Math.PI) / 3;
		const speed = [2.2, -1.6, 3][m];
		const dur = length - on(4);
		const xs: [number, number, string][] = [];
		const ys: [number, number, string][] = [];
		for (let f = 0; f <= dur; f += 2) {
			const a = phase + (f / FPS) * speed;
			xs.push([f, cx + Math.cos(a) * R - r, "none"]);
			ys.push([f, cy + Math.sin(a) * R - r, "none"]);
		}
		return Layer.shape("circle", {
			id: id(`dot-${m + 1}`),
			position: "absolute",
			x: xs[0][1],
			y: ys[0][1],
			width: 2 * r,
			height: 2 * r,
			fill: m === 1 ? ink.navy : ink.white,
			startFrame: on(4),
		}).animate(LayerAnimation.keys("x", xs), LayerAnimation.keys("y", ys), LayerAnimation.keys("scale", [[0, 0], [8, 1, "back.out(2.5)"]]));
	});

	// 2–3: the words land plain, then rewrite themselves in a wave. Two lines, sized to sit inside the ring.
	const probe = FontManager.measure("LinkedIn", { fontFamily: typeface.display, fontWeight: 700, fontSize: 100 });
	const size = Math.min(stage.px(96), (100 * R * 1.4) / probe.width);
	const words = Layer.text("Hello,\nLinkedIn", {
		id: id("words"),
		position: "absolute",
		x: cx - R,
		y: cy - size * 1.3,
		width: 2 * R,
		height: size * 2.6,
		fontFamily: typeface.display,
		fontWeight: 700,
		fontSize: size,
		lineHeight: 1.1,
		fill: ink.white,
		align: "center",
		verticalAlign: "middle",
		startFrame: on(1),
		animators: [TextAnimator.waveRise({ y: size * 0.7, opacity: 0, blur: 10 })],
	}).animate(
		LayerAnimation.keys("offset", [[0, 1], [on(2) - on(1), -1, "hold"], [on(2) - on(1) + 14, 1, "power2.out"]]),
		LayerAnimation.keys("scale", [[0, 1.2], [8, 1, "expo.out"]]),
	);

	// 7: the bars dance on every beat from here.
	const bars = 18;
	const barW = (width * 0.8) / bars;
	const floor = height * 0.94;
	const eq = Array.from({ length: bars }, (_, b) => {
		const tall = height * 0.11 * (0.45 + 0.55 * Math.abs(Math.sin(b * 1.7 + 0.4)));
		const levels: [number, number, string][] = [[0, 0.08, "none"]];
		for (let n = 6; n < 8; n++) {
			const at = on(n) - on(6);
			levels.push([at + 3, 1, "power4.out"], [at + 7, 0.6 + 0.4 * Math.abs(Math.cos(b * 2.3 + n)), "sine.inOut"], [at + 14, 0.25, "power2.in"]);
		}
		// Grown from the floor: the top edge moves with the height.
		return Layer.box({
			id: id(`bar-${b + 1}`),
			position: "absolute",
			x: width * 0.1 + b * barW + barW * 0.18,
			y: floor - tall,
			width: barW * 0.64,
			height: tall,
			borderRadius: barW * 0.32,
			background: ink.white,
			startFrame: on(6),
		}).animate(
			LayerAnimation.keys("height", levels.map(([f, v, e]) => [f, tall * v, e] as [number, number, string])),
			LayerAnimation.keys("y", levels.map(([f, v, e]) => [f, floor - tall * v, e] as [number, number, string])),
		);
	});

	// 8: render. A bar runs to full, no words needed.
	const track = width * 0.84;
	const barH = stage.px(20);
	const progress = Layer.box({
		id: id("render"),
		position: "absolute",
		x: width * 0.08,
		y: height * 0.07,
		width: track,
		height: barH,
		borderRadius: barH / 2,
		background: `${ink.white}40`,
		overflow: "hidden",
		startFrame: on(7),
		children: [
			Layer.box({
				id: id("render.fill"),
				position: "absolute",
				x: 0,
				y: 0,
				width: track,
				height: barH,
				background: ink.white,
			}).animate(LayerAnimation.keys("width", [[0, 0], [11, track, "power2.inOut"]])),
		],
	});

	// 6: the picture tears on each beat from here and snaps clean between (signals read film frames).
	const tear = Array.from({ length: START.build + length + 1 }, (_, f) => {
		const at = f - START.build;
		if (at < on(5)) return 0;
		const since = Math.min(...[5, 6, 7].map((n) => (at >= on(n) ? at - on(n) : Number.POSITIVE_INFINITY)));
		return since > 6 ? 0 : 28 * Math.exp(-since / 1.8);
	});
	const canvas = Layer.box({
		id: id("canvas"),
		position: "absolute",
		x: 0,
		y: 0,
		width,
		height,
		children: [ground, ...grid, disc, ringLine, ...dots, words, ...eq],
	}).withEffects([new RGBSplit({ amount: frameArraySignal(tear, FPS), angle: 0 })]);

	// The card kicks on every beat, tilting one way then the other.
	const punch: [number, number, string?][] = [[0, 0.9]];
	const tilt: [number, number, string?][] = [[0, 0]];
	LINES.forEach((_, i) => {
		punch.push([on(i), 1.05, "power3.out"], [on(i) + 7, 1, "power2.out"]);
		tilt.push([on(i), i % 2 ? 2.5 : -2.5, "power3.out"], [on(i) + 8, 0, "power2.out"]);
	});

	return [
		Layer.box({
			id: shot.name("preview"),
			position: "absolute",
			x: box.x,
			y: box.y,
			width,
			height,
			background: ink.frost,
			borderColor: ink.rule,
			borderWidth: stage.px(3),
			borderRadius: stage.px(28),
			overflow: "hidden",
			children: [canvas, progress],
		}).animate(LayerAnimation.keys("scale", punch), LayerAnimation.keys("rotation", tilt)),
	];
}

/** A line of TypeScript in editor colors: keywords, strings, calls, the rest. */
function tokens(line: string): TextSpan[] {
	const out: TextSpan[] = [];
	const pattern = /("[^"]*")|\b(const|new|await)\b|([A-Za-z_]\w*)(?=\()|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_"]+)/g;
	for (const m of line.matchAll(pattern)) {
		const [text, str, kw, call, word, space] = m;
		const fill = str ? SYNTAX.string : kw ? SYNTAX.keyword : call ? SYNTAX.call : word || space ? SYNTAX.plain : SYNTAX.punct;
		out.push(span(text, { fill }));
	}
	return out;
}
