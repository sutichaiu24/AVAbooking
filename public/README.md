# Hero photograph

`SiteHeader` paints `/hero.webp` behind the headline. The file is optional —
when it is absent the crimson gradient and the drawn route network show
through instead, which is the design the page shipped with.

To switch the hero over to photography, drop a file here named `hero.webp`:

- **Aspect** 21:9 (about 2400×1030); the hero crops with `background-size: cover`
- **Weight** keep it under ~300 KB, the whole page's JS is only ~90 KB
- **Composition** the left 45% must stay dark and empty — the Thai headline
  sits there. A gradient overlay guarantees contrast regardless, but a busy
  left edge still shows through it.

Convert with either of:

```bash
cwebp -q 82 -resize 2400 0 source.jpg -o hero.webp
# or
magick source.jpg -resize 2400x -quality 82 hero.webp
```
