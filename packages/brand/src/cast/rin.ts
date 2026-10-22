/**
 * Rin: social media creator actor.
 * Draws the ultra-realistic character plate (generated via GPT Image 2.5 Sunburst)
 * stored in assets/character/ under Git LFS.
 */
import path from "node:path";
import { Actor, type Move, type Rect, rise } from "@framefields-social/kit";
import { type AnimatableNode, Layer, type MediaNode } from "framefields";
import { ASSETS } from "../look.js";

export interface RinOptions {
	/** Asset file name or absolute path. Defaults to assets/character/rin.png */
	source?: string;
	fit?: "cover" | "contain" | "fill";
	borderRadius?: number;
}

export class Rin extends Actor<MediaNode> {
	private readonly source: string;
	private readonly fit: "cover" | "contain" | "fill";
	private readonly borderRadius: number;

	constructor(box: Rect, options: RinOptions = {}) {
		super(box);
		this.source = options.source ?? path.join(ASSETS, "character/rin.png");
		this.fit = options.fit ?? "cover";
		this.borderRadius = options.borderRadius ?? 0;
	}

	protected override get entrance(): Move {
		return rise({ distance: 30 });
	}

	protected draw(): AnimatableNode<MediaNode> {
		const { x, y, width, height } = this.box;
		return Layer.image(this.source, {
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			fit: this.fit,
			borderRadius: this.borderRadius,
		});
	}
}

/** Backwards-compatible alias */
export { Rin as Character, type RinOptions as CharacterActorOptions };
