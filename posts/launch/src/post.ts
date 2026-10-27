/**
 * The launch film: framefields in fifteen seconds, cut to its own track, white
 * and blue. Each scene shoves the last one off on a beat.
 *
 *   0.0 s  hook     words slam in on the stabs: "What if / video / was just / code?"
 *   2.7 s  build    pushes the hook up: a line of code per beat, the preview does it
 *   6.6 s  montage  whips in: one clip split into many looks at once
 *  10.5 s  breath   zooms in: the music breathes out, a caret on white
 *  11.0 s  outro    irises open on the hit: the mark, the name, the website
 *
 * At most two words on screen in any scene.
 */
import { Glow, Headline, look, Mark, typeface } from "@framefields-social/brand";
import { after, all, lasting, post, scene, Sound, sound } from "@framefields-social/kit";
import { Layer, LayerAnimation, Transition } from "framefields";
import { Ground, ink } from "./cast/ground.js";
import { Shot } from "./cast/shot.js";
import { LENGTH, START, T, TRACK } from "./cues.js";
import { build } from "./shots/build.js";
import { hook } from "./shots/hook.js";
import { montage } from "./shots/montage.js";

const whole = (length: number) => ({ from: 0, to: length });

const opening = scene("hook", ({ stage }) => {
	new Ground();
	new Shot(whole(LENGTH.hook), hook(stage));
	// The track rides 2 dB over the master bus, onto the -14 LUFS target.
	return lasting(LENGTH.hook, sound(new Sound(TRACK, undefined, { gain: 2 })));
});

const coding = scene(
	"build",
	({ stage }) => {
		new Ground();
		new Shot(whole(LENGTH.build), build(stage));
		return lasting(LENGTH.build, all());
	},
	{ transition: Transition.push("up", T.build, "expo.inOut") },
);

const looks = scene(
	"montage",
	({ stage }) => {
		new Ground();
		new Shot(whole(LENGTH.montage), montage(stage));
		return lasting(LENGTH.montage, all());
	},
	{ transition: Transition.whip("left", T.montage) },
);

const breath = scene(
	"breath",
	({ stage }) => {
		new Ground();
		new Shot(whole(LENGTH.breath), (shot) => [
			Layer.box({
				id: shot.name("caret"),
				position: "absolute",
				x: stage.width / 2 - stage.px(14),
				y: stage.height / 2 - stage.px(40),
				width: stage.px(28),
				height: stage.px(80),
				background: ink.cobalt,
			}).animate(LayerAnimation.keys("opacity", [[0, 1], [T.breath + 7, 0, "hold"], [T.breath + 11, 1, "hold"]])),
		]);
		return lasting(LENGTH.breath, all());
	},
	{ transition: Transition.zoom(T.breath, "expo.in") },
);

const outro = scene(
	"outro",
	({ stage }) => {
		new Ground();
		const [top, middle, bottom] = stage.safe.rows(stage.pick({ portrait: 2.6, landscape: 2.2 }), 1.2, 1.2);
		const markBox = top.inset({ top: top.height * 0.12 }).center(Math.min(top.height, stage.px(400)));
		const glow = new Glow(markBox.center(stage.px(1300)), { color: ink.sky, strength: 0.7 });
		const mark = new Mark(markBox, { color: ink.cobalt });
		const name = new Headline("framefields", middle.inset({ left: stage.px(20), right: stage.px(20) }), { align: "center", max: 130, fill: ink.navy });

		// The website, as a blue pill.
		const pillH = stage.px(128);
		const pillW = Math.min(bottom.width, stage.px(760));
		const pill = bottom.top(0.7).center(pillW, pillH);
		const site = new Shot(whole(LENGTH.outro), (shot) => [
			Layer.box({
				id: shot.name("pill"),
				position: "absolute",
				x: pill.x,
				y: pill.y,
				width: pill.width,
				height: pill.height,
				borderRadius: pillH / 2,
				background: `linear-gradient(90deg, ${ink.cobalt}, ${ink.signal})`,
				children: [
					Layer.text("framefields.dev", {
						id: shot.name("url"),
						position: "absolute",
						x: 0,
						y: 0,
						width: pill.width,
						height: pill.height,
						fontFamily: typeface.display,
						fontWeight: 700,
						fontSize: stage.px(54),
						fill: ink.white,
						align: "center",
						verticalAlign: "middle",
					}),
				],
			}),
		]);

		const i = T.outro;
		const fade = LENGTH.outro - 20;
		return lasting(
			LENGTH.outro,
			all(
				glow.from({ opacity: 0, scale: 0.3 }, { dur: i + 6, ease: "expo.out" }),
				mark.frame({ dur: i + 8, ease: "expo.out" }),
				after(i + 2, mark.land(0, { dur: 10, ease: "back.out(2)" })),
				after(i + 4, mark.grow({ dur: 9, ease: "power3.out" })),
				after(i + 8, mark.land(1, { dur: 10, ease: "back.out(2)" })),
				after(i + 10, mark.strike({ dur: 14, ease: "back.out(1.8)" })),
				mark.from({ scale: 1.6, rotation: -12 }, { dur: i + 16, ease: "expo.out" }),
				after(i + 16, mark.to({ scale: 1.06 }, { dur: fade - i - 16, ease: "sine.inOut" })),
				after(i + 8, name.write(0.9)),
				after(i + 8, name.from({ scale: 1.15 }, { dur: 16, ease: "expo.out" })),
				after(i + 24, name.to({ scale: 1.05 }, { dur: fade - i - 24, ease: "sine.inOut" })),
				after(i + 26, site.from({ opacity: 0, y: stage.px(90), scale: 0.6 }, { dur: 14, ease: "back.out(1.7)" })),
				after(i + 40, site.to({ scale: 1.04 }, { dur: fade - i - 40, ease: "sine.inOut" })),
				after(i + 6, glow.to({ scale: 1.25 }, { dur: fade - i - 6, ease: "sine.inOut" })),

				// Out to white with the last of the chord.
				after(fade, all(...[mark, name, site, glow].map((a) => a.to({ opacity: 0 }, { dur: 20, ease: "sine.inOut" })))),
			),
		);
	},
	{ transition: Transition.iris(T.outro, { ease: "expo.out" }) },
);

export default post({
	slug: "launch",
	title: "framefields: video, written in code",
	caption:
		"What if video was just code?\n\nframefields is a TypeScript SDK that renders video on the GPU: layouts, kinetic type, shaders, color grading, audio-reactive motion and AI vision, all written as code and rendered headless to MP4. Every frame of this film, and every cut on the beat, is a few lines of it.\n\nframefields.dev",
	look: { ...look, background: ink.white },
	scenes: [opening, coding, looks, breath, outro],
});
