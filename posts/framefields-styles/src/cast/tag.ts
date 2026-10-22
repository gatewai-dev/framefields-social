/**
 * A style's name on the seam: a sky chip with its number and the name in
 * Unbounded, on a navy pill with a sky hairline. Sized to its words with the
 * real font and centered on the seam.
 */
import { Actor, type Move, pop, Rect, type Stage } from "@framefields-social/kit";
import { palette, typeface } from "@framefields-social/brand";
import { type AnimatableNode, type BoxNode, FontManager, Layer } from "framefields";

export interface TagOptions {
	stage: Stage;
	/** The seam's y. */
	seam: number;
	number: number;
	name: string;
}

/** Design pixels. */
const SIZE = 40;
const HEIGHT = 84;
const PAD = 8;

export class Tag extends Actor<BoxNode> {
	private readonly number: string;
	private readonly name: string;

	constructor({ stage, seam, number, name }: TagOptions) {
		const label = name.toUpperCase();
		const height = stage.px(HEIGHT);
		const words = FontManager.measure(label, { fontFamily: typeface.display, fontWeight: 700, fontSize: stage.px(SIZE) }).width;
		const width = stage.px(PAD) * 4 + (height - stage.px(PAD) * 2) + words;
		super(new Rect((stage.width - width) / 2, seam - height / 2, width, height));
		this.number = String(number).padStart(2, "0");
		this.name = label;
	}

	protected override get entrance(): Move {
		return pop({ from: 0.7, dur: this.clock.beats(0.5) });
	}

	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		const pad = this.stage.px(PAD);
		const chip = height - pad * 2;
		const size = this.stage.px(SIZE);
		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			borderRadius: height / 2,
			background: palette.night,
			borderColor: palette.sky,
			borderWidth: this.stage.px(2),
			children: [
				Layer.box({
					id: this.part("chip"),
					position: "absolute",
					x: pad,
					y: pad,
					width: chip,
					height: chip,
					borderRadius: chip / 2,
					background: palette.sky,
					children: [
						Layer.text(this.number, {
							id: this.part("number"),
							position: "absolute",
							x: 0,
							y: 0,
							width: chip,
							height: chip,
							fontFamily: typeface.mono,
							fontWeight: 700,
							fontSize: size * 0.8,
							fill: palette.night,
							align: "center",
							verticalAlign: "middle",
						}),
					],
				}),
				Layer.text(this.name, {
					id: this.part("name"),
					position: "absolute",
					x: pad * 2 + chip,
					y: 0,
					width: width - pad * 3 - chip,
					height,
					fontFamily: typeface.display,
					fontWeight: 700,
					fontSize: size,
					fill: palette.paper,
					verticalAlign: "middle",
				}),
			],
		});
	}
}
