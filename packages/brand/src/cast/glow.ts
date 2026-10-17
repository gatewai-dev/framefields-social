/**
 * Light with nowhere to come from: a soft radial bloom that sits behind a
 * character and flares when something lands. Animate it like any actor:
 * glow.from({ opacity: 0, scale: 0.4 }).
 */
import { Actor, type Rect } from "@framefields-social/kit";
import { type AnimatableNode, Gradient, Layer, type ShapeNode } from "framefields";
import { palette } from "../look.js";

export interface GlowOptions {
	color?: string;
	/** Opacity at the center, 0–1. */
	strength?: number;
}

export class Glow extends Actor<ShapeNode> {
	private readonly color: string;
	private readonly strength: number;

	constructor(box: Rect, { color = palette.signal, strength = 0.45 }: GlowOptions = {}) {
		super(box);
		this.color = color;
		this.strength = strength;
	}

	protected draw(): AnimatableNode<ShapeNode> {
		const { x, y, width, height } = this.box;
		const alpha = Math.round(this.strength * 255).toString(16).padStart(2, "0");
		return Layer.shape("ellipse", {
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			fill: Gradient.radial([`${this.color}${alpha}`, `${this.color}00 62%`]),
		});
	}
}
