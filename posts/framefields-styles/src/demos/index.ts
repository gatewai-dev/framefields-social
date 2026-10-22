/** The twenty demos, in the order Rin counts them (see STYLES in cues.ts). */
import type { DemoScript } from "../cast/demo.js";
import { aurora, collage, flowField, memphis } from "./cutouts.js";
import { neumorphism, origami, retroDesktop, skeuomorphic, web1, wordArt } from "./design.js";
import { lightPainting, spirograph } from "./drawing.js";
import { datamosh, oneBit, opArt, psychedelic, teletext, thermal, topographic, watercolour } from "./filters.js";

export const DEMOS: readonly DemoScript[] = [
	web1,
	topographic,
	psychedelic,
	watercolour,
	teletext,
	origami,
	thermal,
	memphis,
	flowField,
	neumorphism,
	wordArt,
	collage,
	datamosh,
	spirograph,
	aurora,
	opArt,
	lightPainting,
	oneBit,
	skeuomorphic,
	retroDesktop,
];
