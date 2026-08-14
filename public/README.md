# Hero photograph

`SiteHeader` paints `/hero.png` behind the headline. The file is optional —
when it is absent the crimson gradient and the drawn route network show
through instead, which is the design the page shipped with.

To change the hero, replace `hero.png` here.

- **Aspect** 21:9 (about 2400x1030); the hero crops with `background-size: cover`
- **Composition** the left 45% must stay dark and empty — the Thai headline
  sits there. A gradient overlay guarantees contrast regardless, but a busy
  left edge still shows through it.
- **Weight** aim for under ~400 KB. A full-size PNG photograph is usually
  several megabytes, which is a poor trade for a background image.

Shrinking a PNG photograph, using tools already on macOS:

```bash
# resize and re-encode as JPEG (usually 10-20x smaller than the PNG)
sips -Z 2400 -s format jpeg -s formatOptions 82 hero.png --out hero.jpg
```

Or drag it into https://squoosh.app and export WebP at quality ~82.

If you switch the file to `.jpg` or `.webp`, update `HERO_PHOTO` in
`src/components/SiteHeader.tsx` to match.
