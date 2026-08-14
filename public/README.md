# Images

Every image here is optional. The page is designed to read correctly with none
of them present, so an empty slot never leaves a gap or a broken element.

| File | Where it appears | If missing |
| --- | --- | --- |
| `hero.png` | Behind the headline, full-bleed | Crimson gradient plus the drawn route network |
| `logo.png` | Masthead, beside the wordmark | The text lockup identifies the brand on its own |
| `apron.jpg` | Full-width band between the booking flow and the architecture section | The band is not rendered at all |

## hero.png

- **Aspect** 21:9 (about 2400x1030); crops with `background-size: cover`
- **Composition** the left 45% must stay dark and empty — the Thai headline
  sits there. A gradient overlay guarantees contrast regardless, but a busy
  left edge still shows through it.

## logo.png

The airline's official mark. Square, transparent background, 256px is plenty.
Trademarks are only ever rendered from a supplied asset — never redrawn.

## apron.jpg

Any wide photograph; 1600px is plenty. It is desaturated and multiplied with
the wine token so a golden apron shot still lands in the crimson palette
instead of fighting it, and a bottom gradient keeps the caption legible
whatever the photograph does there.

## Weight

Aim for under ~400 KB each. A full-size PNG photograph is usually several
megabytes, which is a poor trade for a background image. Using tools already
on macOS:

```bash
sips -Z 2400 -s format jpeg -s formatOptions 82 big.png --out hero.jpg
```

Or drag it into https://squoosh.app and export WebP at quality ~82. If you
change a file's extension, update the matching constant — `HERO_PHOTO` in
`src/components/SiteHeader.tsx`, `LOGO` in `ExecutiveValueBanner.tsx`, or the
`file` prop on `<PhotoBand>` in `src/app/page.tsx`.

## Rights

Photographs of real aircraft and airports are usually someone's copyrighted
work. Confirm you have a licence before using one in anything that leaves the
building.
