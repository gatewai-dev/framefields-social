/**
 * Styles that are design, not a filter: a whole interface or a paper craft
 * built from boxes, shapes and type, with Rin's live close-up inside it (a
 * 1998 homepage, folded paper, soft UI, WordArt, a glossy app, Windows 95).
 */
import { Rect } from "@framefields-social/kit";
import { palette, typeface } from "@framefields-social/brand";
import { FontManager, Gradient, Layer, LayerAnimation, Modulate, Pixelate, span } from "framefields";
import type { DemoScript } from "../cast/demo.js";
import { bevel, blink, box, line, polyline, popIn, shape, shown, softShadow, text, ticker } from "./parts.js";

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
	const ground = "#E4E8EF";
	const dark = "#A3B1C6";
	const light = "#FFFFFF";
	const raise = (name: string, r: Rect, radius: number, depth = 16) => [
		softShadow(k, `${name}-dark`, r, radius, { color: dark, dx: depth, dy: depth, spread: depth * 2.2, strength: 0.55 }),
		softShadow(k, `${name}-light`, r, radius, { color: light, dx: -depth, dy: -depth, spread: depth * 2.2, strength: 0.9 }),
	];
	const card = new Rect(110, 70, 860, 560);
	const button = new Rect(150, 730, 200, 200);
	const track = new Rect(430, 775, 260, 110);
	const knob = 90;
	const slider = new Rect(760, 815, 220, 30);
	const press = 24;
	const flip = 30;
	const play = polyline([[button.cx - 22, button.cy - 34], [button.cx + 36, button.cy], [button.cx - 22, button.cy + 34]], true);
	return [
		box(k, "ground", k.box, { background: ground }),
		...raise("card", card, 56, 18),
		box(k, "card", card, {
			background: ground,
			borderRadius: 56,
			children: [k.closeUp("screen", new Rect(40, 40, card.width - 80, card.height - 80), { zoom: 1, borderRadius: 36 })],
		}),
		// The play button: raised, then pressed in, its icon lighting up.
		...raise("button", button, 100, 14).map((s) => s.animate(LayerAnimation.keys("opacity", [[0, 1], [press, 1], [press + 4, 0.15, "power2.out"]]))),
		box(k, "button", button, { background: ground, borderRadius: 100 }).animate(LayerAnimation.keys("scale", [[0, 1], [press, 1], [press + 4, 0.96, "power2.out"]])),
		shape(k, "play", "path", k.box, { d: play, fill: "#9AA5B8" }).animate(shown(0, press + 2)),
		shape(k, "play-on", "path", k.box, { d: play, fill: palette.cobalt }).animate(shown(press + 2)),
		// The toggle: a sunken track, its knob sliding across as it turns on.
		...raise("track", track, 55, -6),
		box(k, "track", track, { background: "#DCE1EA", borderRadius: 55 }),
		box(k, "track-on", track, { background: palette.cobalt, borderRadius: 55 }).animate(LayerAnimation.keys("opacity", [[0, 0], [flip, 0], [flip + 8, 0.9, "power2.out"]])),
		...raise("knob", new Rect(track.x + 10, track.y + 10, knob, knob), knob / 2, 8).map((s) =>
			s.animate(LayerAnimation.keys("x", [[0, track.x + 10], [flip, track.x + 10], [flip + 10, track.x2 - 10 - knob, "back.out(1.4)"]])),
		),
		box(k, "knob", new Rect(track.x + 10, track.y + 10, knob, knob), { background: ground, borderRadius: knob / 2 }).animate(
			LayerAnimation.keys("x", [[0, track.x + 10], [flip, track.x + 10], [flip + 10, track.x2 - 10 - knob, "back.out(1.4)"]]),
		),
		// The slider: a groove, a knob gliding along it.
		...raise("groove", slider, 15, -4),
		box(k, "groove", slider, { background: "#D5DBE5", borderRadius: 15 }),
		box(k, "slider-knob", new Rect(slider.x - 20, slider.cy - 34, 68, 68), { background: ground, borderRadius: 34, borderColor: light, borderWidth: 3 }).animate(
			LayerAnimation.keys("x", [[0, slider.x - 20], [8, slider.x - 20], [k.window.length, slider.x2 - 48, "sine.inOut"]]),
		),
	];
};

export const wordArt: DemoScript = (k) => {
	const word = "Rin's Vlog!";
	const size = 120;
	const rainbow = ["#FF2D55", "#FF9500", "#FFCC00", "#34C759", "#00C7BE", "#007AFF", "#AF52DE"];
	// Just over the top of her head, under the wall sign, so her hair cuts in front of it.
	const art = new Rect(40, 110, 1000, 200);
	const depth = 10;
	const look = { font: "sans" as const, size, weight: 900, align: "center" as const };
	const swoop = LayerAnimation.create()
		.keys("scale", [[0, 0.15], [16, 1, "back.out(1.6)"]])
		.keys("rotation", [[0, -28], [16, -7, "back.out(1.6)"]])
		.keys("opacity", [[0, 0], [3, 1]])
		.wiggle("y", { frequency: 0.8, amplitude: 10, seed: 4 });
	return [
		k.closeUp("room", k.box, { zoom: 0.95, offset: { y: 30 } }),
		box(k, "art", art, {
			rotateY: -14,
			rotateX: 10,
			perspective: 900,
			children: [
				...Array.from({ length: depth }, (_, i) =>
					text(k, `extrude-${i}`, word, new Rect(depth - i, depth - i + 0, art.width, art.height), { ...look, fill: i < 2 ? "#1B0B4B" : "#4C1D95" }),
				),
				text(k, "face", [...word].map((ch, i) => span(ch, { fill: rainbow[i % rainbow.length] })), new Rect(0, 0, art.width, art.height), look),
			],
		}).animate(swoop),
		k.closeUp("rin", k.box, { zoom: 0.95, offset: { y: 30 } }, (v) => v.withVision({ mode: "matte", matteSource: "selfie" })),
	];
};

export const skeuomorphic: DemoScript = (k) => {
	const cx = k.width / 2;
	const icon = new Rect(cx - 130, 330, 260, 260);
	const open = 26;
	const lens = 170;
	const iconOut = LayerAnimation.create()
		.keys("scale", [[0, 0.3], [12, 1, "back.out(1.7)"], [open, 1], [open + 10, 3.2, "power2.in"]])
		.keys("opacity", [[0, 0], [2, 1], [open + 6, 1], [open + 10, 0]]);
	const device = new Rect(150, 50, 780, 920);
	const deviceIn = LayerAnimation.create()
		.keys("scale", [[0, 0.6], [open + 2, 0.6], [open + 14, 1, "back.out(1.3)"]])
		.keys("opacity", [[0, 0], [open + 2, 0], [open + 6, 1]]);
	const stitch = (name: string, y: number) =>
		line(k, name, `M 0 ${y} L ${k.width} ${y}`, "#E8C9A0", 4, { strokeDashArray: "16 10", strokeLineCap: "butt" });
	return [
		box(k, "linen", k.box, { background: Gradient.linear(["#5A6B8C", "#3E4B66"], 180) }),
		box(k, "leather", new Rect(0, 840, k.width, 216), { background: Gradient.linear(["#8B5A2B", "#5C3A1A"], 180) }),
		stitch("stitch-top", 866),
		stitch("stitch-bottom", 1030),
		// The app icon, glossy, then it opens.
		box(k, "icon", new Rect(0, 0, k.width, k.height), {
			children: [
				box(k, "icon-shadow", icon.shift(0, 16), { borderRadius: 58, background: "#00000059" }),
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
				text(k, "icon-label", "Rin Cam", new Rect(icon.x - 60, icon.y2 + 26, icon.width + 120, 50), { size: 34, weight: 700, fill: "#FFFFFF", align: "center" }),
			],
		}).animate(iconOut),
		// It opens into a brushed-metal device with a glass screen.
		box(k, "device", device, {
			borderRadius: 72,
			background: Gradient.linear(["#E5E7EB", "#9CA3AF", "#E5E7EB", "#8B93A1"], 90),
			children: [
				box(k, "bezel", new Rect(22, 22, device.width - 44, device.height - 44), {
					borderRadius: 54,
					background: "#0B0B0F",
					children: [
						k.closeUp("screen", new Rect(36, 70, device.width - 116, device.height - 230), { zoom: 1, borderRadius: 10 }),
						Layer.shape("path", {
							id: k.id("glare"),
							position: "absolute",
							x: 36,
							y: 70,
							width: device.width - 116,
							height: device.height - 230,
							d: `M 0 0 L ${(device.width - 116) * 0.7} 0 L 0 ${(device.height - 230) * 0.55} Z`,
							fill: "#FFFFFF1F",
						}),
						Layer.shape("circle", { id: k.id("home"), position: "absolute", x: (device.width - 44) / 2 - 34, y: device.height - 44 - 120, width: 68, height: 68, fill: "#1F2937", strokeColor: "#4B5563", strokeWidth: 4 }),
					],
				}),
			],
		}).animate(deviceIn),
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
