/**
 * The studio: where posts become pictures.
 *
 *   pnpm studio list                          every post
 *   pnpm studio frames <post> <frame...>      PNG stills
 *   pnpm studio grid <post> [frame...]        a contact sheet
 *   pnpm studio preview <post>                a live player at localhost
 *   pnpm studio render <post>                 the MP4, and the caption beside it
 *   pnpm studio sound <name> "<prompt>"       a sound effect from framefields ai into assets/audio/ (--seconds 3), listened to
 *   pnpm studio listen <name>                 (re)writes assets/audio/<name>.json: loudness and note onsets
 *   pnpm studio character [name] [prompt]     generate character sheet via framefields ai (default: rin)
 *   pnpm studio rin [prompt]                  generate Rin via framefields ai (gpt-image-2.5 sunburst) into assets/character/
 *
 * render checks every MP4 with framefields' QA, loudness against -14 LUFS.
 *
 * Each takes --format reel|portrait|square|landscape (default reel); render
 * also takes --format all. Files land in output/<post>/.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { FORMATS, type FormatName, format as formatNamed, type Post } from "@framefields-social/kit";
// Only the look: the sound library imports analyses this command may be about to write.
import { look } from "@framefields-social/brand/look";
import { type Composition, formatQaReport, HeadlessMediaRenderer, startPreview } from "framefields";
import { entryOf, load, ROOT, slugs } from "./posts.js";
import { listen } from "./listen.js";
import { audioFile, generateSound } from "./sound.js";
import { generateCharacter } from "./character.js";

const { positionals, values } = parseArgs({
	allowPositionals: true,
	options: {
		format: { type: "string", short: "f", default: "reel" },
		seconds: { type: "string", short: "s", default: "3" },
	},
});
const [command = "list", slug, ...rest] = positionals;
/** Where Reels, TikTok and YouTube normalize playback. */
const TARGET_LUFS = -14;
const frames = rest.map(Number);

async function main(): Promise<void> {
	if (command === "list") {
		for (const s of slugs()) console.log(s);
		return;
	}
	if (command === "sound") {
		const [prompt] = rest;
		if (!slug || !prompt) throw new Error('pnpm studio sound <name> "<prompt>" --seconds 3');
		const file = await generateSound({ name: slug, prompt, seconds: Number(values.seconds) });
		console.log(`→ ${path.relative(ROOT, file)}
→ ${path.relative(ROOT, await listen(file, look))}`);
		return;
	}
	if (command === "listen") {
		if (!slug) throw new Error("pnpm studio listen <name>");
		console.log(`→ ${path.relative(ROOT, await listen(audioFile(slug), look))}`);
		return;
	}
	if (command === "character" || command === "rin") {
		const name = command === "rin" ? "rin" : (slug ?? "rin");
		const prompt = command === "rin" ? (slug || rest[0]) : rest[0];
		const result = await generateCharacter({
			name,
			prompt: prompt || undefined,
		});
		console.log(`→ ${path.relative(ROOT, result.filePath)}
→ ${path.relative(ROOT, result.metaPath)}`);
		return;
	}
	if (!slug) throw new Error(`Which post? pnpm studio ${command} <post>. Posts: ${slugs().join(", ")}`);
	const post = await load(slug);
	const out = path.join(ROOT, "output", slug);
	await fs.mkdir(out, { recursive: true });

	const formats = values.format === "all" ? (Object.keys(FORMATS) as FormatName[]) : [formatNamed(values.format).name as FormatName];

	switch (command) {
		case "frames": {
			if (!frames.length) throw new Error("Which frames? pnpm studio frames <post> 0 30 60");
			const renderer = new HeadlessMediaRenderer();
			for (const format of formats) {
				const film = await compose(post, format);
				for (const frame of frames) await save(out, `${format}-f${String(frame).padStart(4, "0")}.png`, await film.renderFrame({ frame, renderer }));
			}
			return;
		}
		case "grid":
			for (const format of formats) {
				const film = await compose(post, format);
				const png = await film.renderFrameGrid({ frames: frames.length ? frames : spread(film, 12), columns: 4, cellWidth: 360, showLabels: true });
				await save(out, `${format}-grid.png`, png);
			}
			return;
		case "preview":
			return preview(post, formats[0]);
		case "render":
			for (const format of formats) {
				const result = await (await compose(post, format)).renderVideo({
					outputPath: path.join(out, `${format}.mp4`),
					quality: "high",
					qa: { targetLufs: TARGET_LUFS },
				});
				await result.cleanup?.();
				console.log(`→ ${path.relative(ROOT, result.filePath)}`);
				if (result.qa) console.log(formatQaReport(result.qa));
			}
			if (post.definition.caption) await save(out, "caption.txt", `${post.definition.caption}\n`);
			return;
		default:
			throw new Error(`Unknown command "${command}". Commands: list, frames, grid, preview, render, sound`);
	}
}

/** Composes and prints whatever the linter has to say about it. */
async function compose(post: Post, format: FormatName): Promise<Composition> {
	const film = await post.compose(format);
	for (const { severity, code, message, layerId } of film.lint()) console.warn(`${format} ${severity} ${code}${layerId ? ` [${layerId}]` : ""}: ${message}`);
	return film;
}

/** `count` frames spread evenly from the first to the last. */
function spread(film: Composition, count: number): number[] {
	const last = Math.round(((film.durationMs ?? 0) * film.fps) / 1000) - 1;
	return Array.from({ length: count }, (_, i) => Math.round((last * i) / (count - 1)));
}

async function save(dir: string, name: string, data: Buffer | string): Promise<void> {
	await fs.writeFile(path.join(dir, name), data);
	console.log(`→ ${path.relative(ROOT, path.join(dir, name))}`);
}

/** The preview page runs a module itself and calls its export with no arguments, so give it one per post and format. */
async function preview(post: Post, format: FormatName): Promise<void> {
	const dir = path.join(ROOT, ".framefields/preview");
	const entry = path.join(dir, `${post.slug}.${format}.ts`);
	await fs.mkdir(dir, { recursive: true });
	const source = path.relative(dir, entryOf(post.slug)).split(path.sep).join("/");
	await fs.writeFile(entry, `import post from "${source}";\nexport default () => post.compose("${format}");\n`);
	const session = await startPreview({ entry, export: "default" }, { title: `${post.definition.title} · ${format}`, root: ROOT });
	console.log(`Preview of ${post.slug} (${format}) at ${session.url}`);
	await session.closed;
}

try {
	await main();
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
}
// Native GPU and encoder threads keep Node alive; always exit explicitly.
process.exit();
