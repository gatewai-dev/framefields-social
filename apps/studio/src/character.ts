/**
 * Character generation using the framefields AI gateway.
 *
 * Stored once in assets/character/ under Git LFS so compositions and render
 * workers can reference local high-res plates without calling external services.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "./posts.js";

export const DEFAULT_MODEL = "openai/gpt-image-2.5/sunburst/text-to-image";

export const DEFAULT_CHARACTER_PROMPT =
	"Ultra-realistic professional character sheet of an attractive young female social media creator, model sheet format. " +
	"The composition is prominently dominated by a very large, ultra-sharp, detailed close-up frontal face portrait occupying the primary area of the sheet, " +
	"with secondary 3/4 angle and side profile facial views. " +
	"Ethnic heritage: mix (Eurasian / Hāfu features), stunning harmonious blend of European and East Asian facial aesthetics. " +
	"Facial anatomy: strong well-defined bone structure, high sculpted cheekbones, sharp defined jawline, elegant chin, delicate refined nose bridge. " +
	"Eyes: captivating large eyes with a distinct slightly upturned, slanted almond eye shape, luminous deep amber-brown irises, long natural lashes, direct engaging eye contact. " +
	"Hair: long, silky glossy dark espresso hair with an elegant deep side part, side-swept dramatically to the left side cascading over her left shoulder in soft natural waves. " +
	"Skin & render: ultra-realistic photorealistic skin texture with visible natural micro-pores, natural soft skin luster, subtle freckles, no airbrushed or plastic smoothing. " +
	"Lighting & style: clean minimalist studio softbox lighting, soft neutral gray background, cinematic rim light, Hasselblad 85mm portrait photography, 8k resolution.";

export interface CharacterOptions {
	/** Character asset base name (default: "rin"). */
	name?: string;
	/** Prompt describing the character and composition. */
	prompt?: string;
	/** Model identifier in the gateway (default: openai/gpt-image-2.5/sunburst/text-to-image). */
	model?: string;
	/** Aspect ratio (default: "16:9"). */
	aspectRatio?: string;
	/** Quality tier: "low" | "medium" | "high" | "xhigh" | "max". Default "high". */
	quality?: "low" | "medium" | "high" | "xhigh" | "max";
}

export interface CharacterResult {
	filePath: string;
	metaPath: string;
	url: string;
	requestId: string;
}

export const characterDir = (): string => path.join(ROOT, "assets/character");
export const characterFile = (name: string, ext = "png"): string =>
	path.join(characterDir(), `${name}.${ext}`);

function loadEnv(): void {
	try {
		process.loadEnvFile(path.join(ROOT, ".env"));
	} catch {
		// No .env: the key may already be in the environment.
	}
	if (!process.env.FRAMEFIELDS_API_KEY) {
		throw new Error(
			"Set FRAMEFIELDS_API_KEY in .env to generate character assets. Create a key at https://framefields.dev/dashboard/keys",
		);
	}
}

/**
 * Generate a character sheet via Framefields AI gateway and save it into assets/character/.
 */
export async function generateCharacter(
	options: CharacterOptions = {},
): Promise<CharacterResult> {
	loadEnv();

	const name = options.name ?? "rin";
	const prompt = options.prompt ?? DEFAULT_CHARACTER_PROMPT;
	const model = options.model ?? DEFAULT_MODEL;
	const aspectRatio = options.aspectRatio ?? "16:9";
	const quality = options.quality ?? "high";

	console.log(`[character] Generating "${name}" with model "${model}"...`);
	console.log(`[character] Aspect ratio: ${aspectRatio}, Quality: ${quality}`);

	const { data, requestId } = await ai.subscribe<{
		images: { url: string; content_type?: string }[];
	}>(model, {
		input: {
			prompt,
			aspect_ratio: aspectRatio,
			quality,
			output_format: "png",
		},
		logs: true,
		onQueueUpdate: (update) => {
			if (update.status === "IN_PROGRESS" && update.logs?.length) {
				for (const log of update.logs) {
					console.log(`[character][gateway] ${log.message}`);
				}
			}
		},
	});

	if (!data.images?.length || !data.images[0]?.url) {
		throw new Error(
			`Model ${model} returned no images: ${JSON.stringify(data)}`,
		);
	}

	const imageUrl = data.images[0].url;
	const dir = characterDir();
	await fs.mkdir(dir, { recursive: true });

	const filePath = characterFile(name, "png");
	const metaPath = characterFile(name, "json");

	console.log(`[character] Downloading output from ${imageUrl}...`);
	const response = await fetch(imageUrl);
	if (!response.ok) {
		throw new Error(
			`Failed to download image from ${imageUrl}: HTTP ${response.status} ${response.statusText}`,
		);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(filePath, buffer);

	const metadata = {
		name,
		model,
		aspectRatio,
		quality,
		prompt,
		url: imageUrl,
		requestId,
		generatedAt: new Date().toISOString(),
		sizeBytes: buffer.byteLength,
	};
	await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), "utf8");

	console.log(`[character] Saved ${filePath} (${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
	console.log(`[character] Saved metadata ${metaPath}`);

	return {
		filePath,
		metaPath,
		url: imageUrl,
		requestId,
	};
}
