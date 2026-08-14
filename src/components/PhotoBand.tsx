import { existsSync } from "node:fs";
import { join } from "node:path";

interface Props {
  /** File name inside `public/`, e.g. "apron.jpg". */
  file: string;
  caption: string;
  sub: string;
}

/**
 * Full-bleed photographic break between sections.
 *
 * Renders nothing at all when the file is absent — checked on the server at
 * render time — so an unfilled slot leaves no empty band behind. Photography
 * is optional throughout this design; the page has to read correctly without
 * any of it.
 *
 * The image is desaturated and multiplied with the wine token so a photograph
 * shot under any light still lands in the crimson palette instead of fighting
 * it. Airport aprons at sunrise are golden, which would otherwise clash badly.
 */
export function PhotoBand({ file, caption, sub }: Props) {
  if (!existsSync(join(process.cwd(), "public", file))) return null;

  return (
    <section aria-label={caption} className="relative isolate h-[300px] overflow-hidden sm:h-[380px]">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center saturate-[.7]"
        style={{ backgroundImage: `url(/${file})` }}
      />
      {/* Pulls any light temperature toward the brand crimson. Kept light
          enough that the subject still reads — the point is to harmonise the
          photograph, not to bury it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 mix-blend-multiply"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(122,20,20,0.62) 0%, rgba(94,10,10,0.5) 55%, rgba(61,10,10,0.68) 100%)",
        }}
      />
      {/* Caption legibility, independent of what the photograph does. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(36,6,6,0.85) 0%, rgba(36,6,6,0) 55%)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-10">
        <p className="text-[19px] font-light tracking-tight text-white sm:text-[22px]">{caption}</p>
        <p className="mt-2 max-w-md text-[13px] font-light leading-relaxed text-white/55">{sub}</p>
      </div>
    </section>
  );
}
