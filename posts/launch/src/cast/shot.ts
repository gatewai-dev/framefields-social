/**
 * A shot: a stretch of the film drawn straight in framefields nodes, shown
 * only from `from` to `to` (scene frames). Its parts key in their own frames,
 * 0 being the frame the shot opens on.
 */
import { Actor, type Rect } from "@framefields-social/kit";
import { type AnimatableNode, type BoxNode, Layer, type LayoutNode } from "framefields";

export interface Window {
	from: number;
	to: number;
}

export type Draw = (shot: Shot) => LayoutNode[];

export class Shot extends Actor<BoxNode> {
	constructor(
		readonly window: Window,
		private readonly paint: Draw,
		box?: Rect,
	) {
		super(box);
	}

	get length(): number {
		return this.window.to - this.window.from;
	}

	/** A unique id for one of this shot's nodes. */
	name(part: string): string {
		return this.part(part);
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
			overflow: "hidden",
			startFrame: this.window.from,
			durationFrames: this.length,
			children: this.paint(this),
		});
	}
}
