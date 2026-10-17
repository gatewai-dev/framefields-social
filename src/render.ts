/**
 * pnpm frames <frame...>   PNGs of single frames
 * pnpm grid [frame...]     a contact sheet
 * pnpm preview             a live player at localhost
 * pnpm render              the MP4 (pass --all for every format)
 *
 * Pick the post and format with POST=<slug> FORMAT=<reel|portrait|square|landscape>.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { HeadlessMediaRenderer, startPreview } from "framefields";
import { buildFilm, DEFAULT_FORMAT, DEFAULT_POST } from "./film.js";
import { FORMATS } from "./formats.js";

const OUT = path.resolve(import.meta.dirname, "../output");
const [mode = "video", ...args] = process.argv.slice(2);
const post = process.env.POST ?? DEFAULT_POST;
const format = process.env.FORMAT ?? DEFAULT_FORMAT;
const dir = path.join(OUT, post);

if (mode === "preview") {
	const session = await startPreview({ entry: new URL("./film.ts", import.meta.url), export: "buildFilm" });
	console.log(`Preview of ${post} (${format}) at ${session.url}`);
	await session.closed;
	process.exit(0);
}

await fs.mkdir(dir, { recursive: true });

if (mode === "frames") {
	const film = await buildFilm(post, format);
	const renderer = new HeadlessMediaRenderer();
	for (const frame of args.map(Number)) {
		const png = await film.renderFrame({ frame, renderer });
		await fs.writeFile(path.join(dir, `${format}-f${String(frame).padStart(4, "0")}.png`), png);
	}
} else if (mode === "grid") {
	const film = await buildFilm(post, format);
	const png = await film.renderFrameGrid({
		frames: args.length ? args.map(Number) : [0, 15, 30, 45, 60, 90, 120, 179],
		columns: 4,
		cellWidth: 360,
		showLabels: true,
	});
	await fs.writeFile(path.join(dir, `${format}-grid.png`), png);
} else {
	const formats = args.includes("--all") ? Object.keys(FORMATS) : [format];
	for (const name of formats) {
		const film = await buildFilm(post, name);
		const result = await film.renderVideo({ outputPath: path.join(dir, `${name}.mp4`), quality: "high" });
		await result.cleanup?.();
		console.log(`Exported ${result.filePath}`);
	}
}

// Native GPU and encoder threads keep Node alive; always exit explicitly.
process.exit(0);
