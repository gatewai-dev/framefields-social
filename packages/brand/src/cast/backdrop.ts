/**
 * The ground every scene stands on: the banner's diagonal sweep from navy to
 * cobalt, with a sky glow over the top right that drifts like a slow light.
 * The "black" tone is a plain black stage, for idents and dramatic beats.
 */
import { Actor } from "@framefields-social/kit";
import { type AnimatableNode, type BoxNode, Gradient, Layer, LayerAnimation } from "framefields";
import { palette } from "../look.js";

export interface BackdropOptions {
	tone?: "brand" | "black";
}

export class Backdrop extends Actor<BoxNode> {
	private readonly glow = this.limb({ opacity: 1 });
	private readonly tone: "brand" | "black";

	constructor({ tone = "brand" }: BackdropOptions = {}) {
		super();
		this.tone = tone;
		const drift = this.stage.px(60);
		this.glow
			.with(LayerAnimation.wiggle("x", { frequency: 0.15, amplitude: drift, seed: 3 }))
			.with(LayerAnimation.wiggle("y", { frequency: 0.12, amplitude: drift, seed: 7 }));
	}

	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		const reach = Math.max(width, height) * 1.1;
		if (this.tone === "black") return Layer.box({ id: this.id, position: "absolute", x, y, width, height, background: palette.black });
		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			overflow: "hidden",
			background: Gradient.linear([palette.navy, `${palette.royal} 60%`, palette.cobalt], 135),
			children: [
				this.glow.bind(
					Layer.shape("circle", {
						id: this.part("glow"),
						position: "absolute",
						x: width * 0.78 - reach / 2,
						y: height * 0.2 - reach / 2,
						width: reach,
						height: reach,
						fill: Gradient.radial([`${palette.sky}40`, `${palette.sky}00`]),
					}),
				),
			],
		});
	}
}
