/**
 * The launch film's ground: white, with two soft blue lights drifting in from
 * opposite corners so the white never sits flat.
 */
import { palette } from "@framefields-social/brand";
import { Actor } from "@framefields-social/kit";
import { type AnimatableNode, type BoxNode, Layer, LayerAnimation } from "framefields";

export const ink = {
	white: "#FFFFFF",
	/** Panels and cards on the white. */
	frost: "#F3F7FF",
	rule: "#D6E2FF",
	navy: palette.navy,
	cobalt: palette.cobalt,
	signal: palette.signal,
	sky: palette.sky,
} as const;

export class Ground extends Actor<BoxNode> {
	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		const reach = Math.max(width, height) * 1.1;
		const light = (n: number, cx: number, cy: number, color: string) =>
			Layer.shape("circle", {
				id: this.part(`light-${n}`),
				position: "absolute",
				x: cx - reach / 2,
				y: cy - reach / 2,
				width: reach,
				height: reach,
				fill: `radial-gradient(${color}38, ${color}00 60%)`,
			}).animate(
				LayerAnimation.wiggle("x", { frequency: 0.2, amplitude: this.stage.px(80), seed: n * 3 }),
				LayerAnimation.wiggle("y", { frequency: 0.17, amplitude: this.stage.px(80), seed: n * 7 }),
			);
		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			overflow: "hidden",
			background: ink.white,
			children: [light(1, width * 0.9, height * 0.08, ink.signal), light(2, width * 0.08, height * 0.95, ink.sky)],
		});
	}
}
