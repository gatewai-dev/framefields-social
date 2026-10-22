/**
 * A post is what goes out: its words for the feed, its look, and its scenes in
 * order. It is written once and composed per format, so one post renders as a
 * reel, a portrait, a square and a landscape cut.
 */
import { type AnimatableNode, Composition, FontManager, Layer, type LayoutNode } from "framefields";
import type { Look, Typeface } from "./look.js";
import type { Scene } from "./scene.js";
import { type Format, type FormatName, format as formatNamed, Stage } from "./stage.js";
import { Clock } from "./time.js";

export interface PostDefinition {
	slug: string;
	title: string;
	/** What goes under the video on every platform. */
	caption?: string;
	look: Look;
	scenes: readonly Scene[];
	/** Absolute path to the soundtrack. */
	soundtrack?: string;
}

export class Post {
	constructor(readonly definition: PostDefinition) {
		const names = definition.scenes.map((s) => s.name);
		const twice = names.find((name, i) => names.indexOf(name) !== i);
		if (twice) throw new Error(`${definition.slug}: two scenes are named "${twice}"; scene names become layer ids.`);
	}

	get slug(): string {
		return this.definition.slug;
	}

	/** Performs every scene on a `format` stage and cuts them together. */
	async compose(format: Format | FormatName = "reel"): Promise<Composition> {
		const { look, scenes, soundtrack } = this.definition;
		await register(look.fonts);

		const finish = <N extends LayoutNode>(layer: AnimatableNode<N>) => (look.master ?? []).reduce((l, effect) => l.apply(effect), layer);

		const stage = new Stage(typeof format === "string" ? formatNamed(format) : format);
		const clock = new Clock(look.tempo);
		const takes = scenes.map((s) => s.perform(stage, clock, look.motion));

		const film = Layer.sequence(
			takes.map(({ node, duration, transition }) => ({ scene: node, duration, transition })),
			{ id: this.slug, width: stage.width, height: stage.height },
		);
		const composition = new Composition({
			width: stage.width,
			height: stage.height,
			fps: clock.fps,
			durationFrames: film.totalFrames,
			backgroundColor: look.background,
			fonts: look.fonts.map((f) => f.source),
		});
		composition.add(film);
		takes.forEach((take, i) =>
			take.sounds.forEach(({ src, at, volume, trim }, j) => {
				const start = film.sceneStarts[i] + at;
				composition.add(
					trim.reduce(
						(layer, effect) => layer.apply(effect),
						finish(Layer.audio(src, { id: `${take.name}.sound-${j + 1}`, startFrame: start, durationFrames: film.totalFrames - start, volume })),
					),
				);
			}),
		);
		if (soundtrack) composition.add(finish(Layer.audio(soundtrack, { id: `${this.slug}.soundtrack`, durationFrames: film.totalFrames })));
		return composition;
	}
}

export const post = (definition: PostDefinition): Post => new Post(definition);

const registered = new Set<string>();

async function register(fonts: readonly Typeface[]): Promise<void> {
	for (const { family, source } of fonts) {
		if (registered.has(family)) continue;
		await FontManager.register({ family, source });
		registered.add(family);
	}
}
