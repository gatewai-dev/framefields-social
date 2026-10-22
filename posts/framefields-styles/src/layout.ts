/**
 * The split screen, on the reel's 1080×1920: Rin keeps the top 864 px (sign,
 * face, shoulders), a seam sits on the line, and demos get the 1080×1056
 * below. Rin's take covers the full frame in the hook and the outro and only
 * slides up while she counts, so she is one uncut shot throughout.
 */
import { Rect, type Stage } from "@framefields-social/kit";
import { MASTER_SIZE } from "./cues.js";

/** Source rows of Rin's take that sit at the top of the frame while split: just above the sign. */
const SPLIT_TOP_ROW = 260;

export interface Layout {
	/** Rin's take, scaled to cover the frame. */
	readonly host: Rect;
	/** How far she slides up when the frame splits. */
	readonly lift: number;
	/** Where the seam runs. */
	readonly seam: number;
	/** The demo box. */
	readonly demo: Rect;
}

export function layout(stage: Stage): Layout {
	const { width, height } = stage;
	const scale = Math.max(width / MASTER_SIZE.width, height / MASTER_SIZE.height);
	const w = MASTER_SIZE.width * scale;
	const h = MASTER_SIZE.height * scale;
	const host = new Rect((width - w) / 2, (height - h) / 2, w, h);
	const seam = Math.round(height * 0.45);
	return { host, lift: SPLIT_TOP_ROW * scale, seam, demo: new Rect(0, seam, width, height - seam) };
}
