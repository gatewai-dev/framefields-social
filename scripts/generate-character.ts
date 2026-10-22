#!/usr/bin/env tsx
/**
 * Standalone character generation script for framefields-social.
 * Usage:
 *   pnpm generate:character [name] [custom-prompt]
 */
import { generateCharacter } from "../apps/studio/src/character.js";

const [name = "rin", ...promptParts] = process.argv.slice(2);
const customPrompt = promptParts.length > 0 ? promptParts.join(" ") : undefined;

async function main() {
	try {
		const result = await generateCharacter({
			name,
			prompt: customPrompt,
		});
		console.log(`\nSuccess! Character generated and stored in Git LFS:`);
		console.log(`Image:    ${result.filePath}`);
		console.log(`Metadata: ${result.metaPath}`);
		process.exit(0);
	} catch (err: unknown) {
		console.error(`\nGeneration failed:`, err instanceof Error ? err.message : err);
		process.exit(1);
	}
}

main();
