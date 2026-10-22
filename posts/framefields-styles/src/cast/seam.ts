/**
 * The line between Rin and the demos: a cobalt glow, a hairline, and a sky
 * fill that grows one twentieth per style, so the seam doubles as progress.
 */
import { Actor, type Action, type Rect } from "@framefields-social/kit";
import { palette } from "@framefields-social/brand";
import { type AnimatableNode, type BoxNode, Gradient, Layer } from "framefields";

const LINE = 6;
const GLOW = 56;

export class Seam extends Actor<BoxNode> {
	private readonly fill = this.limb({ x: -this.box.width });

	/** `box` is the full-width band the seam sits in; the line runs through its middle. */
	constructor(box: Rect) {
		super(box);
	}

	/** Fills the line up to `done` of `of` styles. */
	progress(done: number, of: number): Action {
		return this.fill.to({ x: -this.box.width + (this.box.width * done) / of }, { dur: this.clock.beats(0.5), ease: "power3.out" });
	}

	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		const mid = height / 2;
		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			children: [
				Layer.box({
					id: this.part("glow"),
					position: "absolute",
					x: 0,
					y: mid - GLOW / 2,
					width,
					height: GLOW,
					background: Gradient.linear([`${palette.cobalt}00`, `${palette.signal}66`, `${palette.cobalt}00`], 180),
				}),
				Layer.box({
					id: this.part("line"),
					position: "absolute",
					x: 0,
					y: mid - LINE / 2,
					width,
					height: LINE,
					overflow: "hidden",
					background: palette.line,
					children: [
						this.fill.bind(
							Layer.box({ id: this.part("fill"), position: "absolute", x: -width, y: 0, width, height: LINE, background: palette.sky }),
						),
					],
				}),
			],
		});
	}
}
