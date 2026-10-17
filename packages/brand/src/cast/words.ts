import type { Rect } from "@framefields-social/kit";
import { FontManager, type TextSpan } from "framefields";

/** Plain text, or rich runs from framefields' rich`` and span(). */
export type Words = string | TextSpan[];

export interface TypeStyle {
	fontFamily: string;
	fontWeight?: number;
}

/** The largest size, up to `max`, at which `text` fits in `box`, measured with the real font. */
export function fitText(text: string, style: TypeStyle, box: Rect, max: number): number {
	const probe = 100;
	const { width, height } = FontManager.measure(text, { ...style, fontSize: probe });
	return Math.min(max, (probe * box.width) / width, (probe * box.height) / height);
}
