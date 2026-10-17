# framefields-social

The videos behind the [framefields](https://github.com/gatewai-dev/framefields) social accounts, in the open. Every post is a TypeScript composition rendered with framefields on WebGPU in Node.js. No browser, no editor timeline.

Read the source of any post to see exactly how it was made.

## Formats

Each post is written once and renders to every canvas the platforms ask for:

| Format | Size | For |
| --- | --- | --- |
| `reel` | 1080×1920 | Reels, TikTok, Shorts, Stories |
| `portrait` | 1080×1350 | Instagram and LinkedIn feed |
| `square` | 1080×1080 | Feed square, X, Threads |
| `landscape` | 1920×1080 | YouTube, X, LinkedIn |

## Run it

Needs Node.js 22+, pnpm and Git LFS.

```bash
git lfs pull
pnpm install
pnpm grid                                  # contact sheet of the default post as a reel
POST=hello-framefields FORMAT=square pnpm frames 0 90 179
pnpm preview                               # live player with sound at localhost
pnpm render --all                          # MP4s for every format into output/<post>/
```

## Layout

```
src/
  formats.ts      canvas sizes per platform
  theme.ts        brand colors, fonts, frame rate
  posts/          one file per post, each exporting build(format)
  posts/index.ts  the registry of posts by slug
  film.ts         buildFilm() for the preview and the render worker (reads POST and FORMAT)
  render.ts       frames, grid, preview and video export
assets/           fonts and media, tracked in Git LFS
```

To add a post, copy `src/posts/hello-framefields.ts`, give it a new slug, and register it in `src/posts/index.ts`.

## License

Code is Apache-2.0 (see [LICENCE](LICENCE)). Inter and JetBrains Mono are under the SIL Open Font License.
