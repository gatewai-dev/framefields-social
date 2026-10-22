/**
 * Twenty video styles you can make with framefields, presented by Rin: she
 * names each one from the office while it plays under her, then the ident.
 */
import { intro, look } from "@framefields-social/brand";
import { post } from "@framefields-social/kit";
import { styles } from "./scene.js";

export default post({
	slug: "framefields-styles",
	title: "20 video styles you can make with framefields",
	caption:
		"20 video styles, all made with framefields: Web 1.0, topographic, psychedelic, watercolour, teletext, origami, thermal, Memphis, flow field, neumorphism, word art, collage, datamosh, spirograph, aurora, op art, light painting, 1-bit dither, skeuomorphic and retro desktop. Which one are you making first?",
	look,
	scenes: [styles, intro],
});
