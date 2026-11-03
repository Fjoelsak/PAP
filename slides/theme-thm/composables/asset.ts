/*
  Pfad einer Datei aus `public/` unter dem Basispfad des Builds.

  Im Frontmatter und in Props stehen Bilder mit führendem `/`
  (`bild: /campus-friedberg.jpg`). Das stimmt nur, solange der Foliensatz an
  der Wurzel des Servers liegt. Auf GitHub Pages liegt er in einem
  Unterverzeichnis (`slidev build --base /repo/v01-einfuehrung/`); Vite
  schreibt aber nur statische Pfade um, keine gebundenen. Deshalb hier von
  Hand: Aus `/bild.jpg` wird `<base>bild.jpg`, alles andere bleibt, wie es ist.
*/
import { resolveAssetUrl } from '@slidev/client/layoutHelper.ts'

// Slidev bringt die Umrechnung mit; hier nur der Schutz für leere und
// protokollrelative Pfade (`//cdn…`), die unverändert bleiben sollen.
export function assetUrl(pfad?: string): string | undefined {
  if (!pfad || pfad.startsWith('//')) return pfad
  return resolveAssetUrl(pfad)
}
