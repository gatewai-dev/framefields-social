/**
 * Display type. A headline sizes itself to its box with the font's real
 * metrics, and arrives by writing itself: glyphs rise in a wave, left to right.
 */
import { type Action, Actor, action, type Frames, type Move, type Rect, rise } from "@framefields-social/kit";
import { type AnimatableNode, Layer, normalizeTextSpans, TextAnimator, type TextNode } from "framefields";
import { palette, typeface } from "../look.js";
import { fitText, type Words } from "./words.js";

export interface HeadlineOptions {
	/** The largest size, in design pixels; the headline shrinks to fit its box. */
	max?: number;
	align?: "start" | "center" | "end";
	fill?: string;
}

export class Headline extends Actor<TextNode> {
	readonly fontSize: number;
	private readonly align: "start" | "center" | "end";
	private readonly fill: string;
	private readonly style = { fontFamily: typeface.sans, fontWeight: 700 };

	constructor(
		readonly words: Words,
		box: Rect,
		{ max = 150, align = "start", fill = palette.paper }: HeadlineOptions = {},
	) {
		// offset drives the glyph wave: -1 is every glyph waiting, 1 every glyph home.
		super(box, { offset: 1 });
		this.align = align;
		this.fill = fill;
		this.fontSize = fitText(normalizeTextSpans(words).text, this.style, box, this.stage.px(max));
	}

	/** Glyphs rise into place in one wave, over `beats`. */
	write(beats = 1.5, ease = "power2.out"): Action {
		return this.body.from({ offset: -1 }, { dur: this.clock.beats(beats), ease });
	}

	/** Writes itself in steps, one landing on each of `notes` (frames from now): type that keeps time. */
	spell(notes: readonly Frames[], ease = "power3.out"): Action {
		return action(Math.max(0, ...notes), (at) => {
			this.body.key("offset", at, -1);
			notes.forEach((note, i) => this.body.key("offset", at + note, -1 + (2 * (i + 1)) / notes.length, ease));
		});
	}

	protected override get entrance(): Move {
		// framefields 2.2 drops span colors under a glyph animator, so colored words arrive as one line.
		if (this.colored) return rise();
		return (actor, phase) => (phase === "in" ? this.write() : rise()(actor, phase));
	}

	private get colored(): boolean {
		return Array.isArray(this.words) && this.words.some((run) => run.fill !== undefined);
	}

	protected draw(): AnimatableNode<TextNode> {
		const { x, y, width, height } = this.box;
		return Layer.text(this.words, {
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			...this.style,
			fontSize: this.fontSize,
			fill: this.fill,
			align: this.align,
			verticalAlign: "middle",
			animators: this.body.moves("offset")
				? [TextAnimator.waveRise({ y: this.fontSize * 0.5, opacity: 0, blur: 8 })]
				: [],
		});
	}
}
