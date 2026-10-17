/**
 * The canvases every platform asks for. A post is written once against a
 * Format and adapts its layout to the canvas, so one post renders as a reel,
 * a feed square, a portrait card and a landscape cut.
 */
export interface Format {
	width: number;
	height: number;
}

export const FORMATS = {
	/** Instagram Reels, TikTok, YouTube Shorts, Stories. */
	reel: { width: 1080, height: 1920 },
	/** Instagram and LinkedIn feed. */
	portrait: { width: 1080, height: 1350 },
	/** Feed square, X, Threads. */
	square: { width: 1080, height: 1080 },
	/** YouTube, X, LinkedIn landscape video. */
	landscape: { width: 1920, height: 1080 },
} as const satisfies Record<string, Format>;

export type FormatName = keyof typeof FORMATS;

export function isFormatName(name: string): name is FormatName {
	return name in FORMATS;
}
