/** A short line on a soft pill, readable over footage: the outro's URL. */
import { Actor, type Move, Rect, rise, type Stage } from "@framefields-social/kit";
import { palette, typeface } from "@framefields-social/brand";
import { type AnimatableNode, type BoxNode, FontManager, Layer } from "framefields";

const SIZE = 36;
const HEIGHT = 80;

export class Pill extends Actor<BoxNode> {
	/** Centered on the stage, its middle at `y`. */
	constructor(
		stage: Stage,
		private readonly words: string,
		y: number,
	) {
		const height = stage.px(HEIGHT);
		const width = FontManager.measure(words, { fontFamily: typeface.sans, fontWeight: 600, fontSize: stage.px(SIZE) }).width + height;
		super(new Rect((stage.width - width) / 2, y - height / 2, width, height));
	}

	protected override get entrance(): Move {
		return rise({ distance: 24 });
	}

	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			borderRadius: height / 2,
			background: `${palette.night}D9`,
			children: [
				Layer.text(this.words, {
					id: this.part("words"),
					position: "absolute",
					x: 0,
					y: 0,
					width,
					height,
					fontFamily: typeface.sans,
					fontWeight: 600,
					fontSize: this.stage.px(SIZE),
					fill: palette.paper,
					align: "center",
					verticalAlign: "middle",
				}),
			],
		});
	}
}
