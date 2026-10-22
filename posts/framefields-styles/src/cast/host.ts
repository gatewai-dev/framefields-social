/**
 * Rin's lipsync take, covering the frame. It never cuts: the script only
 * slides it up while she counts and back down for the outro. Muted, because
 * the voiceover plays through the master bus as a sound cue.
 */
import { Actor, type Rect } from "@framefields-social/kit";
import { type AnimatableNode, Layer, type MediaNode } from "framefields";

export class Host extends Actor<MediaNode> {
	constructor(
		box: Rect,
		private readonly source: string,
	) {
		super(box);
	}

	protected draw(): AnimatableNode<MediaNode> {
		const { x, y, width, height } = this.box;
		return Layer.video(this.source, { id: this.id, position: "absolute", x, y, width, height, fit: "fill", muted: true });
	}
}

/**
 * A few frames of Rin's take, restyled: the teaser flashes styles over her
 * for one gap. It plays the same moment of the take, so it is her, live.
 */
export class Flash extends Actor {
	constructor(
		box: Rect,
		private readonly source: string,
		private readonly at: number,
		private readonly length: number,
		private readonly look: unknown[],
	) {
		super(box);
	}

	protected draw(): AnimatableNode<MediaNode> {
		const { x, y, width, height } = this.box;
		return Layer.video(this.source, {
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			fit: "fill",
			muted: true,
			startFrame: this.at,
			durationFrames: this.length,
			trimStartSec: this.at / this.clock.fps,
		}).withEffects(this.look);
	}
}
