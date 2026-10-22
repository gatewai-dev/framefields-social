# 20 video styles you can make with framefields: production plan

How we get from Rin's character plate to the final reel. The words and shots are in [SCRIPT.md](SCRIPT.md). The spoken lines for the voice take are in [vo.txt](vo.txt).

**Approach:** record and lipsync **one continuous master take** of Rin reading the whole script, in one lipsync call with no length limit. While she counts, the frame splits: her take keeps playing uncut on top and the framefields demos play below. One take keeps her look, lighting and voice the same all the way through. It also means the 20 demos can be built and changed without touching the talking head.

```
vo.txt ──elevenlabs/tts/eleven-v4-turbo──▶ rin-vo.mp3 ──┐
                                                        ├──lipsync──▶ rin-master-768p.mp4 ──▶ top section, uncut ──┐
rin plate (9:16, hands in frame) ───────────────────────┘                                                         │
rin-vo.json (gap times) ──▶ cues.json ──▶ when the split opens, switches, closes ──────────────────────────────────┤
rin B-roll (no talking) ──▶ subject for footage demos ──▶ 20 demo scenes, 1080×1056 ──▶ bottom section ───────────┤
                                                                                                                  ▼
                                                    posts/framefields-styles/src/post.ts
                                                    (hook full frame, split screen × 20, outro full frame, ident)
                                                                                  ▼
                                                    output/framefields-styles/reel.mp4
```

---

## Phase 1: Assets for Rin

| Step | Output | Notes |
|------|--------|-------|
| 1.0 Set ✅ | `assets/sets/framefields-studio.png` (9:16), `framefields-studio-landscape.png` | A friendly creator studio: warm off-white wall, plants, oak shelf, paper lamp, blue accents, and the real framefields sign (mark + Unbounded wordmark, blue backlight) in the upper third so it stays visible above Rin's head. Made with `openai/gpt-image-2.5/sunburst/edit` from the actual wordmark as reference (`pnpm generate:set`, script in `src/generate-set.ts`, prompt and request ID in the `.json` next to each image). The landscape version is for the later `landscape` cut. |
| 1.1 Talking plate ✅ | `assets/character/rin-talk.png` (9:16, 1072×1920) | Rin from `rin.png` sitting at the desk in the studio set: waist-up, facing the lens, mouth closed with a slight smile, both hands in frame at chest height (five fingers each), and the framefields sign readable above her head. She wears a cobalt cropped twill jacket with hand-painted cream and sky-blue brushstrokes over her black top (`--outfit` step). Made with `openai/gpt-image-2.5/sunburst/edit` from the set (first, so the output keeps 9:16) and her character sheet (`pnpm generate:plate`; prompt and request ID in `rin-talk.json`). |
| 1.2 Voice ✅ | `assets/character/rin-voice.json` | **Laura** on `elevenlabs/tts/eleven-v4-turbo` (stability 0.4, similarity 0.78, seed 7), chosen from eight stock voices by transcript accuracy, pitch range and by ear (`pnpm generate:voice`). Reference clip: `assets/character/rin-voice/rin-reference.mp3`. |
| 1.3 VO take ✅ | `assets/audio/framefields-styles/rin-vo.mp3` | The whole of `vo.txt` in one call (`pnpm generate:vo`), ~71 s. Each `[pause]` is spoken as `[long pause]` (the model ignores `<break time>`) and then set to exactly 1.2 s of silence, so all 21 demo gaps are the same length. Their start times are in `rin-vo.json` → `demoGap.at`: those are the cut points. |
| 1.4 Lipsync master ✅ | `assets/video/framefields-styles/rin-master-768p.mp4` | `minimax/h3-max/lip-sync/image-to-video` (`pnpm generate:lipsync --resolution 768P`): the talking plate plus the full 71 s voiceover in one call, 768×1344 at 24 fps, about $6.80. The model takes no prompt; she gestures on her own and rests her hands with her mouth closed in each demo gap. A 5 s 480p test came first (`rin-test-5s-480p.mp4`). |
| 1.5 B-roll | `assets/video/framefields-styles/rin-broll.mp4` | 6–8 s of Rin not talking: a small head turn, a blink, a smile, and her hands moving (a wave, framing her face with her fingers). This is the subject for the filter demos, so her hands show up in those too. Image-to-video from the same plate. |
| 1.6 Gesture clip | `assets/video/framefields-styles/rin-gesture.mp4` | Rin sweeps one hand slowly across the frame, as if drawing in the air, for Light painting (17). The particles follow her tracked wrist. |

All media goes in through Git LFS, the same as the existing character plate.

**Lipsync length:** we start with the whole take in one call and no limit. Splitting is only a fallback if that call is rejected: cut `rin-vo.mp3` at `[pause]` silences into chunks, run each with the same plate, and join them. Every join falls on a pause, which the edit removes.

## Phase 2: Cue list

With the split screen, Rin's master take is never cut: it plays from start to end in the top section. So instead of cutting her into clips, we only need cue times.

1. The 21 demo gaps are already measured: `rin-vo.json` → `demoGap.at` (each 1.2 s long). From them, `posts/framefields-styles/cues.json` gets: the split opening (start of "Number one", 5.98 s), each demo's start (the start of each counting line) and length (to the next line's start, 2.7–3.6 s), and the split closing (start of the outro, 65.74 s). The shot list in SCRIPT.md shows the current numbers.
2. Each demo switch lands 2 frames before her line starts, so the new demo is already there when she says its number.
3. The composition reads `cues.json`; we don't hand-tune timecodes. If the voiceover is re-recorded, the cues are recomputed from its new `rin-vo.json`.

## Phase 3: Demo scenes

Build each demo as its own scene in the post folder, sized for the **bottom section of the split, 1080×1056**, and lasting its window from `cues.json` (2.7–3.6 s). Group the work by technique so similar demos share code:

| Group | Demos | Shared piece |
|-------|-------|--------------|
| A. Filter on B-roll (`Styles.*`) | 2 Topographic, 3 Psychedelic, 4 Watercolour, 5 Teletext, 7 Thermal, 13 Datamosh, 16 Op art, 18 1-bit | One "B-roll + style" scene factory, plus a small extra per demo (reticle, Ceefax header, window frame) |
| B. Cutout + background | 8 Memphis, 9 Flow field, 12 Collage, 15 Aurora | `withVision({ mode: "matte" })` Rin cutout on top of a generated background |
| C. Design and UI scenes | 1 Web 1.0, 6 Origami, 10 Neumorphism, 11 Word art, 19 Skeuomorphic, 20 Retro desktop | Window and card components with `LayerStyle` bevels and shadows |
| D. Procedural drawing | 14 Spirograph, 17 Light painting | Path draw-on (`trimEnd`) and additive particles |

Suggested build order: **A** (fastest, proves the pipeline), then **B**, **D**, and **C** last (the most design work).

Things that can go into `packages/brand` for later posts: `StyleLabel` (number chip + name, sits on the seam), `ProgressBar` (20 segments), `Caption` (word-pop captions from the VO timings), and `SplitScreen` (a host clip on top and a swappable box below, with the open and close moves).

## Phase 4: Assembly

- `posts/framefields-styles/src/post.ts`: one continuous Rin layer (the master take) for the whole post, plus a bottom section that holds the 20 demos in sequence, driven by `cues.json`; then the `intro` ident.
- **Hook (0–5.98 s):** Rin full frame, the title card, and the teaser flashes in the first gap.
- **Split opens at 5.98 s:** over ~0.4 s, Rin's layer moves up (source rows ≈ 260–865 fill the top 1080×864) while the demo section rises into 1080×1056 below a glowing cobalt seam.
- **Counting (5.98–65.74 s):** the demos switch underneath at each cue; Rin is never cut, so there are no jump cuts in her performance.
- **Split closes at 65.74 s:** the reverse move, Rin full frame for the outro, then the ident.
- The style label (on the seam), the progress bar and the hook/outro captions sit above everything, so they stay sharp.
- Music: the 120 BPM bed sits under her voice and lifts a little in each gap.
- Check in the frame grid that the top section keeps the sign and her whole face (chin included) in every frame; nudge the crop if her head moves out of it.

## Phase 5: Review and render

1. `pnpm studio grid framefields-styles` → check one frame from each demo on the contact sheet.
2. `pnpm studio preview framefields-styles` → check the lipsync, the hands (no extra fingers, no warping), cut points and audio ducking.
3. `pnpm studio render framefields-styles --format reel` → `output/framefields-styles/reel.mp4`.
4. Later: `square` and `landscape` versions, with Rin in a side panel and the demos filling the rest.

## Checklist

- [x] 1.0 Set with the framefields sign (portrait + landscape)
- [x] 1.1 9:16 talking plate (looks like Rin, sitting in the set)
- [x] 1.2 Rin's voice on `elevenlabs/tts/eleven-v4-turbo` chosen and saved (Laura)
- [x] 1.3 VO generated in one call, 21 demo gaps of 1.2 s (pronunciation: check by ear)
- [x] 1.4 Lipsync master (`minimax/h3-max/lip-sync/image-to-video`, one call, 768p)
- [ ] 1.5 B-roll generated
- [ ] 1.6 Gesture clip
- [ ] 2 `cues.json` from the VO gaps (split open/close, 20 demo windows)
- [ ] 3A Filter demos (8)
- [ ] 3B Cutout demos (4)
- [ ] 3C Design demos (6)
- [ ] 3D Drawing demos (2)
- [ ] 4 Assembly, label, progress bar, captions, music
- [ ] 5 Grid review → preview → reel render

## Open questions

- **Length:** about 75 s for all 20, ident included. If retention is a concern, we could split it into two posts ("Part 1: 1–10", "Part 2: 11–20"). That needs only one extra hook line each and the same master take.
- **Subject:** the plan uses Rin as the subject of every demo so the styles are easy to compare. The other option is stock or generated scenes (a city, a dancer, a product) for variety.
- **Teaser (shot 0b):** it now fits exactly in the first 1.2 s gap. Keep it, or let that gap breathe before the split opens?
