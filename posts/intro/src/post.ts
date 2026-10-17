/**
 * The ident on its own: render it once per format and put it at the head of
 * any video. Inside this repo, start a post with `scenes: [intro, ...]`.
 */
import { intro, look } from "@framefields-social/brand";
import { post } from "@framefields-social/kit";

export default post({
	slug: "intro",
	title: "framefields ident",
	look: { ...look, background: "#000000" },
	scenes: [intro],
});
