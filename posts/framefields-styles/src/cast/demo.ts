/**
 * The demo box under the seam. The panel is its navy ground; each Demo is one
 * style, drawn by a script in its own 1080×1056 space and its own frames
 * (0 = the frame it lands), shown only during its window. The actor itself
 * stays in scene frames, so the first and last demos ride the panel in and out.
 */
import { Actor, Rect, type Rect as RectType } from "@framefields-social/kit";
import { palette } from "@framefields-social/brand";
import {
	type AnimatableNode,
	type BoxNode,
	type FrameSignal,
	frameArraySignal,
	Layer,
	type LayoutNode,
	type MediaNode,
} from "framefields";
import { MASTER, MASTER_SIZE, type Window } from "../cues.js";

/** Rounded top corners; the box runs past the bottom edge so its lower corners never show. */
const RADIUS = 40;
const BLEED = 80;

/** Where Rin's face is in her take, in source px: close-ups frame around it. */
const FACE = { x: 384, y: 540 } as const;
/** How much of the take a close-up shows across at zoom 1: head and shoulders. */
const CLOSE_UP_WIDTH = 560;

export interface CloseUpOptions {
	/** Above 1 frames tighter. */
	zoom?: number;
	borderRadius?: number;
	/** Shifts the framing, in source px. */
	offset?: { x?: number; y?: number };
}

/** What a demo script is handed. */
export interface DemoKit {
	readonly width: number;
	readonly height: number;
	/** The whole demo box, in its own space. */
	readonly box: RectType;
	readonly window: Window;
	readonly fps: number;
	/** A unique layer id for one of this demo's parts. */
	id(name: string): string;
	/**
	 * Rin from the same take, in sync with her on top, framed on her head and
	 * shoulders to fill `rect`. `dress` gets the video to add effects or vision;
	 * the result is clipped to `rect`.
	 */
	closeUp(
		name: string,
		rect?: RectType,
		options?: CloseUpOptions,
		dress?: (video: AnimatableNode<MediaNode>) => AnimatableNode<MediaNode>,
	): AnimatableNode<BoxNode>;
	/** A per-frame value (0 = the demo's first frame) as a signal, for effect props. */
	signal(value: (frame: number) => number): FrameSignal<number>;
	/** A seeded random source, so every render draws the same scene. */
	random(seed: number): () => number;
}

export type DemoScript = (kit: DemoKit) => LayoutNode[];

export class Panel extends Actor<BoxNode> {
	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height: height + BLEED,
			borderRadius: RADIUS,
			background: palette.night,
		});
	}
}

export class Demo extends Actor<BoxNode> {
	constructor(
		box: RectType,
		readonly window: Window,
		private readonly script: DemoScript,
	) {
		super(box);
	}

	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		const { from, length } = this.window;
		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height: height + BLEED,
			borderRadius: RADIUS,
			overflow: "hidden",
			children: [
				Layer.box({
					id: this.part("take"),
					position: "absolute",
					x: 0,
					y: 0,
					width,
					height,
					startFrame: from,
					durationFrames: length,
					overflow: "hidden",
					background: palette.night,
					children: this.script(this.kit()),
				}),
			],
		});
	}

	private kit(): DemoKit {
		const { width, height } = this.box;
		const { fps } = this.clock;
		const { from, length } = this.window;
		const id = (name: string) => this.part(name);
		return {
			width,
			height,
			box: new Rect(0, 0, width, height),
			window: this.window,
			fps,
			id,
			closeUp: (name, rect = new Rect(0, 0, width, height), { zoom = 1, borderRadius = 0, offset = {} } = {}, dress = (v) => v) => {
				const across = CLOSE_UP_WIDTH / zoom;
				const s = rect.width / across;
				const cx = FACE.x + (offset.x ?? 0);
				const cy = FACE.y + (offset.y ?? 0);
				const video = Layer.video(MASTER, {
					id: id(`${name}.video`),
					position: "absolute",
					x: rect.width / 2 - cx * s,
					y: rect.height / 2 - cy * s,
					width: MASTER_SIZE.width * s,
					height: MASTER_SIZE.height * s,
					fit: "fill",
					muted: true,
					trimStartSec: from / fps,
				});
				return Layer.box({
					id: id(name),
					position: "absolute",
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height,
					borderRadius,
					overflow: "hidden",
					children: [dress(video)],
				});
			},
			signal: (value) => {
				// Effect signals are read on the composition clock; the styles scene opens the film, so its frames are the film's.
				const samples = Array.from({ length: from + length + 1 }, (_, f) => value(Math.max(0, f - from)));
				return frameArraySignal(samples, fps);
			},
			random: (seed) => {
				let a = seed >>> 0;
				return () => {
					a = (a + 0x6d2b79f5) >>> 0;
					let t = a;
					t = Math.imul(t ^ (t >>> 15), t | 1);
					t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
					return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
				};
			},
		};
	}
}
