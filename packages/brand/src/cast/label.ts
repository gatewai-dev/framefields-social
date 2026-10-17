/**
 * A line of small type: kickers, URLs, credits. Sans in mist by default; mono
 * when it is something you would type.
 */
import { Actor, type Move, type Rect, rise } from "@framefields-social/kit";
import { type AnimatableNode, Layer, type TextNode } from "framefields";
import { palette, typeface } from "../look.js";
import type { Words } from "./words.js";

export interface LabelOptions {
	/** Size in design pixels. */
	size?: number;
	mono?: boolean;
	align?: "start" | "center" | "end";
	fill?: string;
}

export class Label extends Actor<TextNode> {
	private readonly options: Required<LabelOptions>;

	constructor(
		readonly words: Words,
		box: Rect,
		{ size = 36, mono = false, align = "start", fill = palette.mist }: LabelOptions = {},
	) {
		super(box);
		this.options = { size, mono, align, fill };
	}

	protected override get entrance(): Move {
		return rise({ distance: 24 });
	}

	protected draw(): AnimatableNode<TextNode> {
		const { x, y, width, height } = this.box;
		const { size, mono, align, fill } = this.options;
		return Layer.text(this.words, {
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			fontFamily: mono ? typeface.mono : typeface.sans,
			fontWeight: mono ? 400 : 500,
			fontSize: this.stage.px(size),
			fill,
			align,
			verticalAlign: "middle",
		});
	}
}
