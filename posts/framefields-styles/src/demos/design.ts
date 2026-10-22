/**
 * Styles that are design, not a filter: a whole interface or a paper craft
 * built from boxes, shapes and type, with Rin's live close-up inside it (a
 * 1998 homepage, folded paper, soft UI, WordArt, a glossy app, Windows 95).
 */
import { Rect } from "@framefields-social/kit";
import { palette, typeface } from "@framefields-social/brand";
import { Color, FontManager, Gradient, Layer, LayerAnimation, Modulate, Pixelate, span } from "framefields";
import type { DemoScript } from "../cast/demo.js";
import { bevel, blink, box, line, type Node, polyline, popIn, shape, shown, softShadow, text, ticker } from "./parts.js";

export const web1: DemoScript = (k) => {
	const rnd = k.random(1);
	const { width } = k;
	const { length } = k.window;
	const marquee = "*** Welcome to Rin's Homepage!!! *** Sign my guestbook *** Best viewed in Netscape Navigator 4.0 ***";
	const marqueeWidth = FontManager.measure(marquee, { fontFamily: typeface.sans, fontWeight: 700, fontSize: 34 }).width + 40;
	const rainbow = ["#FF00FF", "#00FFFF", "#00FF00", "#FFFF00"];
	const title = [..."~*~ RiN's CoRnEr ~*~"].map((ch, i) => span(ch, { fill: rainbow[i % rainbow.length] }));
	const cell = new Rect(170, 200, 740, 560);
	const visitors = Array.from({ length: 6 }, (_, i) => String(271 + i).padStart(6, "0"));
	const stripes = Array.from({ length: 22 }, (_, i) =>
		Layer.box({ id: k.id(`stripe-${i}`), position: "absolute", x: i * 70 - 60, y: -60, width: 34, height: 220, rotation: 45, background: "#111111" }),
	);
	return [
		box(k, "space", k.box, { background: "#000033" }),
		...Array.from({ length: 70 }, (_, i) => {
			const s = 2 + rnd() * 3;
			return shape(k, `star-${i}`, "circle", new Rect(rnd() * width, rnd() * k.height, s, s), { fill: "#FFFFFF" });
		}),
		box(k, "marquee-band", new Rect(0, 18, width, 56), {
			background: "#000000",
			borderColor: "#808080",
			borderWidth: 2,
			overflow: "hidden",
			children: [
				text(k, "marquee", marquee, new Rect(0, 0, marqueeWidth, 56), { size: 34, fill: "#FFFF00" }).animate(
					LayerAnimation.keys("x", [[0, width], [length, width - length * 9, "none"]]),
					LayerAnimation.stepped(2),
				),
			],
		}),
		text(k, "title", title, new Rect(0, 92, width, 96), { size: 64, weight: 900, align: "center" }),
		text(k, "new", "NEW!", new Rect(880, 160, 170, 60), { size: 44, weight: 900, fill: "#FF0000", align: "center" }).animate(
			LayerAnimation.keys("rotation", [[0, -14]]),
			blink(8, length),
		),
		bevel(k, "cell", cell, {
			children: [
				bevel(k, "cell-inner", new Rect(14, 14, cell.width - 28, cell.height - 28), {
					raised: false,
					children: [
						k.closeUp("webcam", new Rect(3, 3, cell.width - 34, cell.height - 34), { zoom: 0.9 }, (v) =>
							v.withEffects([new Modulate({ saturation: 1.35, contrast: 1.15 }), new Pixelate({ size: 5 })]),
						),
					],
				}),
			],
		}),
		text(k, "caption", "↑ me on my webcam!!", new Rect(0, 770, width, 50), { size: 30, weight: 600, fill: "#00FFFF", align: "center" }),
		text(k, "visitors", "You are visitor #", new Rect(150, 834, 450, 56), { size: 30, weight: 600, fill: "#FFFFFF", align: "end" }),
		box(k, "counter", new Rect(616, 834, 230, 56), { background: "#000000", borderColor: "#808080", borderWidth: 3 }),
		...ticker(k, "count", visitors, Math.ceil(length / visitors.length), new Rect(616, 834, 230, 56), { font: "mono", size: 40, fill: "#00FF00", align: "center" }),
		box(k, "construction", new Rect(0, 930, width, 96), {
			background: "#FFD400",
			overflow: "hidden",
			children: [
				box(k, "construction-stripes", new Rect(0, 0, width + 140, 96), { children: stripes }).animate(
					LayerAnimation.keys("x", [[0, 0], [length, -140, "none"]]),
					LayerAnimation.stepped(2),
				),
				box(k, "construction-label", new Rect(260, 18, 560, 60), {
					background: "#111111",
					children: [text(k, "construction-text", "UNDER CONSTRUCTION", new Rect(0, 0, 560, 60), { size: 34, weight: 900, fill: "#FFD400", align: "center" })],
				}),
			],
		}),
	];
};

export const origami: DemoScript = (k) => {
	const cx = k.width / 2;
	const cy = k.height / 2;
	const wedges = 16;
	const reach = 900;
	const fan = Array.from({ length: wedges }, (_, i) => {
		const a = (i / wedges) * 2 * Math.PI;
		const b = ((i + 1) / wedges) * 2 * Math.PI;
		const d = polyline([[cx, cy], [cx + reach * Math.cos(a), cy + reach * Math.sin(a)], [cx + reach * Math.cos(b), cy + reach * Math.sin(b)]], true);
		return shape(k, `fold-${i}`, "path", k.box, { d, fill: i % 2 ? "#E2D5BE" : "#EFE6D4" }).animate(popIn(Math.floor(i / 2), 8, 0), LayerAnimation.stepped(2));
	});
	const frame = new Rect(240, 160, 600, 736);
	const arm = 150;
	const corners = [
		{ pts: [[frame.x - 24, frame.y - 24], [frame.x + arm, frame.y - 24], [frame.x - 24, frame.y + arm]], color: palette.cobalt },
		{ pts: [[frame.x2 + 24, frame.y - 24], [frame.x2 + 24, frame.y + arm], [frame.x2 - arm, frame.y - 24]], color: "#FF7A59" },
		{ pts: [[frame.x2 + 24, frame.y2 + 24], [frame.x2 - arm, frame.y2 + 24], [frame.x2 + 24, frame.y2 - arm]], color: palette.sky },
		{ pts: [[frame.x - 24, frame.y2 + 24], [frame.x - 24, frame.y2 - arm], [frame.x + arm, frame.y2 + 24]], color: "#FFC94D" },
	] as const;
	const fold = (at: number) => LayerAnimation.create().keys("opacity", [[0, 0], [at, 0], [at + 2, 0.6, "hold"], [at + 4, 1, "hold"]]);
	return [
		box(k, "paper", k.box, { background: "#F3EDE2" }),
		...fan,
		box(k, "photo-shadow", frame.shift(10, 16), { background: "#0000002E" }).animate(popIn(8, 10, 0.8), LayerAnimation.stepped(2)),
		box(k, "photo", frame, {
			background: "#FFFFFF",
			children: [k.closeUp("rin", new Rect(26, 26, frame.width - 52, frame.height - 52), { zoom: 1 })],
		}).animate(popIn(8, 10, 0.8), LayerAnimation.stepped(2)),
		...corners.flatMap(({ pts, color }, i) => [
			shape(k, `corner-shadow-${i}`, "path", k.box, { d: polyline(pts.map(([x, y]) => [x + 5, y + 7] as const), true), fill: "#00000033" }).animate(fold(18 + i * 4)),
			shape(k, `corner-${i}`, "path", k.box, { d: polyline(pts, true), fill: color }).animate(fold(18 + i * 4)),
			line(k, `crease-${i}`, polyline([pts[1], pts[2]]), "#FFFFFF66", 3).animate(fold(18 + i * 4)),
		]),
	];
};

export const neumorphism: DemoScript = (k) => {
	const ground = "#E6EBF2";
	const dark = "#A3B1C6";
	const light = "#FFFFFF";
	const ink = "#5B6B82";
	const muted = "#8A97AB";
	const { length } = k.window;
	// Soft UI is one light from the top left: raised things cast a dark shadow down-right and a light one up-left; sunken things catch the same light inside their edge.
	const raised = (name: string, r: Rect, radius: number, depth = 14) => [
		softShadow(k, `${name}-dark`, r, radius, { color: dark, dx: depth, dy: depth, spread: depth * 3, strength: 0.7 }),
		softShadow(k, `${name}-light`, r, radius, { color: light, dx: -depth, dy: -depth, spread: depth * 3, strength: 1 }),
	];
	const sunken = (name: string, r: Rect, radius: number, children: Node[] = []) =>
		box(k, name, r, {
			borderRadius: radius,
			background: ground,
			overflow: "hidden",
			children: [
				box(k, `${name}.shade`, new Rect(0, 0, r.width, r.height), { borderRadius: radius, background: Gradient.linear([`${dark}AA`, `${dark}00 22%`], 135) }),
				box(k, `${name}.catch`, new Rect(0, 0, r.width, r.height), { borderRadius: radius, background: Gradient.linear([`${light}00 78%`, `${light}E6`], 135) }),
				...children,
			],
		});
	const at = (keys: [number, number, string?][]) => keys as [number, number, string][];

	const screen = new Rect(80, 46, 920, 540);
	const groove = new Rect(100, 690, 880, 26);
	const knob = 60;
	const along = (share: number) => groove.x + groove.width * share - knob / 2;
	const slide = (x0: number) => LayerAnimation.keys("x", at([[0, x0], [length, x0 + along(0.72) - along(0.3), "none"]]));
	const fill = LayerAnimation.keys("x", at([[0, groove.width * (0.3 - 1)], [length, groove.width * (0.72 - 1), "none"]]));

	const press = 20;
	const play = { cx: 540, cy: 880, d: 180 };
	const side = (cx: number) => ({ cx, cy: 880, d: 128 });
	const round = ({ cx, cy, d }: { cx: number; cy: number; d: number }) => new Rect(cx - d / 2, cy - d / 2, d, d);
	const pushed = (from: number, to: number) => LayerAnimation.keys("opacity", at([[0, from], [press, from], [press + 5, to, "power2.out"]]));
	const { cx, cy } = play;
	// One closed outline per shape: icons are lists of them.
	const icon = (name: string, outlines: (readonly (readonly [number, number])[])[], color: string, anim: LayerAnimation = LayerAnimation.create()) =>
		outlines.map((pts, i) => shape(k, `${name}-${i}`, "path", k.box, { d: polyline(pts, true), fill: color }).animate(anim));
	const bar = (x: number, w: number, h: number) => [[x, cy - h], [x + w, cy - h], [x + w, cy + h], [x, cy + h]] as const;
	const skip = (x: number, dir: 1 | -1) => [
		[[x - 14 * dir, cy - 22], [x + 14 * dir, cy], [x - 14 * dir, cy + 22]] as const,
		bar(dir > 0 ? x + 18 : x - 24, 6, 22),
	];

	return [
		box(k, "ground", k.box, { background: ground }),
		...raised("screen", screen, 56, 16),
		sunken("screen", screen, 56, [k.closeUp("video", new Rect(20, 20, screen.width - 40, screen.height - 40), { zoom: 1, borderRadius: 40 })]),
		Layer.shape("circle", { id: k.id("live"), position: "absolute", x: 104, y: 630, width: 16, height: 16, fill: palette.cobalt }).animate(blink(15, length)),
		text(k, "title", "Rin · live from the studio", new Rect(132, 612, 640, 54), { size: 34, weight: 600, fill: ink }),
		text(k, "time", "00:42", new Rect(780, 612, 196, 54), { font: "mono", size: 28, weight: 600, fill: muted, align: "end" }),
		sunken("groove", groove, 13, [
			box(k, "groove-fill", new Rect(0, 0, groove.width, groove.height), { borderRadius: 13, background: Gradient.linear([palette.cobalt, palette.sky], 90) }).animate(fill),
		]),
		...raised("seek", new Rect(along(0.3), groove.cy - knob / 2, knob, knob), knob / 2, 8).map((s) => s.animate(slide(s.x as number))),
		box(k, "seek", new Rect(along(0.3), groove.cy - knob / 2, knob, knob), { borderRadius: knob / 2, background: ground }).animate(slide(along(0.3))),
		// Previous and next: raised. Play: raised, then pressed in as the video starts, its icon turning to a lit pause.
		...[side(260), side(820)].flatMap((b, i) => [...raised(`skip-${i}`, round(b), b.d / 2, 12), box(k, `skip-${i}`, round(b), { borderRadius: b.d / 2, background: ground })]),
		...icon("prev", skip(260, -1), muted),
		...icon("next", skip(820, 1), muted),
		...raised("play", round(play), play.d / 2, 16).map((s) => s.animate(pushed(1, 0.1))),
		box(k, "play", round(play), { borderRadius: play.d / 2, background: ground }).animate(LayerAnimation.keys("scale", at([[0, 1], [press, 1], [press + 5, 0.97, "power2.out"]]))),
		sunken("play-in", round(play), play.d / 2).animate(pushed(0, 1)),
		...icon("play-icon", [[[cx - 20, cy - 34], [cx + 34, cy], [cx - 20, cy + 34]]], muted, LayerAnimation.keys("opacity", at([[0, 1], [press + 2, 0, "hold"]]))),
		...icon("pause-icon", [bar(cx - 26, 18, 30), bar(cx + 8, 18, 30)], palette.cobalt, LayerAnimation.keys("opacity", at([[0, 0], [press + 2, 1, "hold"]]))),
	];
};

export const wordArt: DemoScript = (k) => {
	const word = "Rin's Vlog!";
	const size = 140;
	const rainbow = ["#FF2D55", "#FF9500", "#FFCC00", "#34C759", "#00C7BE", "#007AFF", "#AF52DE"];
	// High in the frame and fully readable: Rin, cut out, stands below it in front of a 1998 clip-art sky.
	const art = new Rect(30, 30, 1020, 260);
	const depth = 14;
	const look = { font: "sans" as const, size, weight: 900, align: "center" as const };
	const swoop = LayerAnimation.create()
		.keys("scale", [[0, 0.1], [18, 1, "back.out(1.6)"]])
		.keys("rotation", [[0, -30], [18, -4, "back.out(1.6)"]])
		.keys("opacity", [[0, 0], [3, 1]])
		.wiggle("y", { frequency: 0.8, amplitude: 8, seed: 4 });
	const rnd = k.random(11);
	const clouds = Array.from({ length: 6 }, (_, i) => {
		const w = 220 + rnd() * 200;
		return Layer.shape("ellipse", {
			id: k.id(`cloud-${i}`),
			position: "absolute",
			x: rnd() * (k.width - w),
			y: 320 + rnd() * 600,
			width: w,
			height: w * 0.42,
			fill: "#FFFFFFD9",
		}).animate(LayerAnimation.keys("x", [[0, 0], [k.window.length, 0]]).wiggle("x", { frequency: 0.2, amplitude: 30, seed: i }));
	});
	const sparkles = [
		[90, 40],
		[960, 70],
		[60, 250],
		[990, 270],
		[520, 10],
	].map(([x, y], i) =>
		Layer.shape("star", {
			id: k.id(`sparkle-${i}`),
			position: "absolute",
			x,
			y,
			width: 54,
			height: 54,
			starPoints: 4,
			starInnerRadiusRatio: 0.3,
			fill: i % 2 ? "#FFFFFF" : "#FFE14D",
		}).animate(popIn(10 + i * 3, 8), LayerAnimation.create().wiggle("scale", { frequency: 2.5, amplitude: 0.25, seed: i })),
	);
	return [
		box(k, "sky", k.box, { background: Gradient.linear(["#2F80ED", "#7CC4FA", "#D7F0FF"], 180) }),
		...clouds,
		box(k, "art", art, {
			children: [
				...Array.from({ length: depth }, (_, i) => {
					const d = depth - i;
					return text(k, `extrude-${i}`, word, new Rect(d * 1.5, d * 2.5, art.width, art.height), { ...look, fill: i < 3 ? "#12062E" : Color.mix("#12062E", "#6D28D9", i / depth) });
				}),
				Layer.text(
					[...word].map((ch, i) => span(ch, { fill: rainbow[i % rainbow.length] })),
					{
						id: k.id("face"),
						position: "absolute",
						x: 0,
						y: 0,
						width: art.width,
						height: art.height,
						fontFamily: typeface.sans,
						fontSize: size,
						fontWeight: 900,
						align: "center",
						verticalAlign: "middle",
						stroke: "#12062E",
						strokeWidth: 4,
					},
				),
			],
		}).animate(swoop),
		...sparkles,
		k.closeUp("rin", k.box, { zoom: 1.05, offset: { y: -90 } }, (v) => v.withVision({ mode: "matte", matteSource: "selfie" })),
	];
};

export const skeuomorphic: DemoScript = (k) => {
	const cx = k.width / 2;
	const icon = new Rect(cx - 130, 330, 260, 260);
	const open = 24;
	const lens = 170;
	const iconOut = LayerAnimation.create()
		.keys("scale", [[0, 0.3], [12, 1, "back.out(1.7)"], [open - 6, 1], [open - 3, 0.92, "power2.out"], [open, 1], [open + 8, 3, "power2.in"]])
		.keys("opacity", [[0, 0], [2, 1], [open + 4, 1], [open + 8, 0]]);
	// An iPhone 4 on linen: steel band, black glass, an iOS 6 camera app with a glossy nav bar and a silver shutter.
	const phone = new Rect(cx - 270, 18, 540, 1020);
	const glass = new Rect(12, 12, phone.width - 24, phone.height - 24);
	const screen = new Rect(36, 150, glass.width - 72, 700);
	const status = 34;
	const nav = 76;
	const toolbar = 110;
	const phoneIn = LayerAnimation.create()
		.keys("scale", [[0, 0.4], [open + 2, 0.4], [open + 14, 1, "back.out(1.3)"]])
		.keys("opacity", [[0, 0], [open + 2, 0], [open + 6, 1]]);
	const linen = Array.from({ length: 70 }, (_, i) =>
		Layer.box({ id: k.id(`thread-${i}`), position: "absolute", x: 0, y: i * 15, width: k.width, height: 2, background: i % 2 ? "#FFFFFF0D" : "#0000000F" }),
	);
	const embossed = [{ color: "#00000080", offset: { x: 0, y: -1 }, blurRadius: 0 }];
	const glossy = (top: string, bottom: string) => Gradient.linear([top, `${Color.mix(top, bottom, 0.5)} 50%`, `${bottom} 50%`, bottom], 180);
	return [
		box(k, "linen", k.box, { background: Gradient.radial(["#6B7A99", "#3A4560"]), children: linen }),
		box(k, "icon", k.box, {
			children: [
				box(k, "icon-shadow", icon.shift(0, 16), { borderRadius: 58, background: "#00000066" }),
				box(k, "icon-face", icon, {
					borderRadius: 58,
					overflow: "hidden",
					background: Gradient.linear(["#6E97FF", palette.cobalt, palette.navy], 180),
					children: [
						Layer.shape("circle", { id: k.id("lens-ring"), position: "absolute", x: 45, y: 45, width: lens, height: lens, fill: Gradient.linear(["#F2F4F7", "#9AA3B2", "#E5E8EE"], 135) }),
						Layer.shape("circle", { id: k.id("lens-glass"), position: "absolute", x: 70, y: 70, width: lens - 50, height: lens - 50, fill: Gradient.radial(["#3B5BDB", "#0B1020"]) }),
						Layer.shape("circle", { id: k.id("lens-glint"), position: "absolute", x: 96, y: 92, width: 26, height: 26, fill: "#FFFFFFCC" }),
						Layer.shape("ellipse", { id: k.id("gloss"), position: "absolute", x: -40, y: -110, width: 340, height: 230, fill: "#FFFFFF40" }),
					],
				}),
				text(k, "icon-label", "Rin Cam", new Rect(icon.x - 60, icon.y2 + 26, icon.width + 120, 50), { size: 34, weight: 700, fill: "#FFFFFF", align: "center", shadows: embossed }),
			],
		}).animate(iconOut),
		box(k, "phone-shadow", phone.shift(0, 18), { borderRadius: 86, background: "#00000059" }).animate(phoneIn),
		box(k, "phone", phone, {
			borderRadius: 86,
			background: Gradient.linear(["#F3F4F6", "#9CA3AF", "#E5E7EB", "#6B7280", "#D1D5DB"], 90),
			children: [
				box(k, "glass", glass, {
					borderRadius: 76,
					background: Gradient.linear(["#1F2937", "#050608"], 180),
					overflow: "hidden",
					children: [
						box(k, "speaker", new Rect(glass.width / 2 - 50, 70, 100, 12), { borderRadius: 6, background: "#2A2F38", borderColor: "#11151B", borderWidth: 2 }),
						Layer.shape("circle", { id: k.id("front-camera"), position: "absolute", x: glass.width / 2 - 8, y: 40, width: 16, height: 16, fill: "#1E3A8A" }),
						box(k, "screen", screen, {
							background: "#000000",
							overflow: "hidden",
							children: [
								box(k, "status", new Rect(0, 0, screen.width, status), {
									background: Gradient.linear(["#3A3A3A", "#000000"], 180),
									children: [
										text(k, "carrier", "Carrier", new Rect(12, 0, 160, status), { size: 20, weight: 600, fill: "#FFFFFF" }),
										text(k, "clock", "11:42", new Rect(0, 0, screen.width, status), { size: 20, weight: 700, fill: "#FFFFFF", align: "center" }),
										box(k, "battery", new Rect(screen.width - 60, 9, 42, 16), { borderRadius: 3, borderColor: "#FFFFFF", borderWidth: 2, children: [box(k, "battery-level", new Rect(3, 3, 28, 10), { background: "#FFFFFF" })] }),
									],
								}),
								box(k, "nav", new Rect(0, status, screen.width, nav), {
									background: glossy("#B2BFD0", "#6D84A2"),
									borderColor: "#2D3642",
									borderWidth: 1,
									children: [
										text(k, "nav-title", "Rin Cam", new Rect(0, 0, screen.width, nav), { size: 32, weight: 700, fill: "#FFFFFF", align: "center", shadows: embossed }),
										box(k, "done", new Rect(screen.width - 112, 16, 96, 44), {
											borderRadius: 8,
											background: glossy("#6A9BF2", "#1F5BD8"),
											borderColor: "#1E3A6E",
											borderWidth: 1,
											children: [text(k, "done-text", "Done", new Rect(0, 0, 96, 44), { size: 22, weight: 700, fill: "#FFFFFF", align: "center", shadows: embossed })],
										}),
									],
								}),
								k.closeUp("viewfinder", new Rect(0, status + nav, screen.width, screen.height - status - nav - toolbar), { zoom: 1 }),
								box(k, "toolbar", new Rect(0, screen.height - toolbar, screen.width, toolbar), {
									background: glossy("#5B5B5B", "#1A1A1A"),
									children: [
										box(k, "shutter", new Rect(screen.width / 2 - 70, 18, 140, 74), {
											borderRadius: 37,
											background: glossy("#F9FAFB", "#9CA3AF"),
											borderColor: "#4B5563",
											borderWidth: 2,
											children: [
												Layer.shape("circle", { id: k.id("shutter-lens"), position: "absolute", x: 48, y: 15, width: 44, height: 44, fill: Gradient.radial(["#4B5563", "#111827"]) }),
											],
										}),
									],
								}),
								Layer.shape("path", {
									id: k.id("glare"),
									position: "absolute",
									x: 0,
									y: 0,
									width: screen.width,
									height: screen.height,
									d: `M 0 0 L ${screen.width * 0.75} 0 L 0 ${screen.height * 0.5} Z`,
									fill: "#FFFFFF14",
								}),
							],
						}),
						Layer.shape("circle", {
							id: k.id("home"),
							position: "absolute",
							x: glass.width / 2 - 42,
							y: glass.height - 128,
							width: 84,
							height: 84,
							fill: Gradient.linear(["#111318", "#2B2F36"], 180),
							strokeColor: "#3A3F47",
							strokeWidth: 3,
						}),
						box(k, "home-glyph", new Rect(glass.width / 2 - 16, glass.height - 102, 32, 32), { borderRadius: 7, borderColor: "#8B93A1", borderWidth: 3 }),
					],
				}),
			],
		}).animate(phoneIn),
	];
};

export const retroDesktop: DemoScript = (k) => {
	const win = new Rect(150, 40, 880, 700);
	const navyBar = Gradient.linear(["#000080", "#1084D0"], 90);
	const titleBar = (name: string, w: number, title: string) =>
		box(k, name, new Rect(6, 6, w - 12, 40), {
			background: navyBar,
			children: [
				text(k, `${name}.text`, title, new Rect(12, 0, w - 160, 40), { size: 24, weight: 700, fill: "#FFFFFF" }),
				bevel(k, `${name}.close`, new Rect(w - 12 - 40, 6, 34, 28), {
					children: [text(k, `${name}.x`, "×", new Rect(0, 0, 34, 28), { font: "mono", size: 26, weight: 700, fill: "#000000", align: "center" })],
				}),
			],
		});
	const desktopIcon = (name: string, label: string, y: number) => [
		bevel(k, `${name}-icon`, new Rect(42, y, 66, 54), { face: "#D4D0C8", children: [box(k, `${name}-screen`, new Rect(8, 8, 50, 30), { background: "#00A0A0" })] }),
		text(k, `${name}-label`, label, new Rect(0, y + 60, 150, 56), { size: 20, weight: 600, fill: "#FFFFFF", align: "center", lineHeight: 1.1 }),
	];
	const dialog = new Rect(0, 0, 470, 200);
	const popups = Array.from({ length: 5 }, (_, i) => {
		const at = 16 + i * 6;
		return bevel(k, `error-${i}`, dialog.shift(240 + i * 36, 250 + i * 36), {
			children: [
				titleBar(`error-${i}.bar`, dialog.width, "framefields.exe"),
				Layer.shape("circle", { id: k.id(`error-${i}.icon`), position: "absolute", x: 24, y: 70, width: 56, height: 56, fill: "#E00000" }),
				text(k, `error-${i}.icon-x`, "×", new Rect(24, 70, 56, 56), { font: "mono", size: 44, weight: 700, fill: "#FFFFFF", align: "center" }),
				text(k, `error-${i}.message`, "This video is too good.", new Rect(100, 64, 350, 68), { size: 26, weight: 500, fill: "#000000" }),
				bevel(k, `error-${i}.ok`, new Rect(180, 140, 110, 44), {
					children: [text(k, `error-${i}.ok-text`, "OK", new Rect(0, 0, 110, 44), { size: 24, weight: 600, fill: "#000000", align: "center" })],
				}),
			],
		}).animate(shown(at));
	});
	return [
		box(k, "teal", k.box, { background: "#008080" }),
		...desktopIcon("computer", "My Computer", 70),
		...desktopIcon("bin", "Recycle Bin", 240),
		bevel(k, "player", win, {
			children: [
				titleBar("player-bar", win.width, "rin.avi - Media Player"),
				bevel(k, "player-screen", new Rect(8, 54, win.width - 16, 560), {
					raised: false,
					children: [k.closeUp("rin", new Rect(3, 3, win.width - 22, 554), { zoom: 0.95 })],
				}),
				bevel(k, "play", new Rect(14, 628, 64, 56), {
					children: [Layer.shape("path", { id: k.id("play-icon"), position: "absolute", x: 0, y: 0, width: 64, height: 56, d: "M 25 16 L 43 28 L 25 40 Z", fill: "#000000" })],
				}),
				bevel(k, "stop", new Rect(86, 628, 64, 56), { children: [box(k, "stop-icon", new Rect(22, 18, 20, 20), { background: "#000000" })] }),
				bevel(k, "seek", new Rect(166, 646, win.width - 186, 20), { raised: false, face: "#FFFFFF" }),
			],
		}),
		...popups,
		bevel(k, "taskbar", new Rect(0, k.height - 70, k.width, 70), {
			children: [
				bevel(k, "start", new Rect(8, 9, 150, 52), {
					children: [
						box(k, "logo", new Rect(12, 14, 26, 24), {
							children: (["#F25022", "#7FBA00", "#00A4EF", "#FFB900"] as const).map((c, i) =>
								Layer.box({ id: k.id(`logo-${i}`), position: "absolute", x: (i % 2) * 13, y: Math.floor(i / 2) * 12, width: 12, height: 11, background: c }),
							),
						}),
						text(k, "start-text", "Start", new Rect(46, 0, 100, 52), { size: 26, weight: 800, fill: "#000000" }),
					],
				}),
				bevel(k, "clock", new Rect(k.width - 180, 9, 172, 52), {
					raised: false,
					children: [text(k, "clock-text", "11:42 AM", new Rect(0, 0, 172, 52), { size: 24, weight: 500, fill: "#000000", align: "center" })],
				}),
			],
		}),
	];
};
