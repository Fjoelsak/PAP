/*
  Sprung vom Literaturverweis ins Literaturverzeichnis.

  Eine Verzeichnisfolie nennt ihre Einträge im Frontmatter:
    quellen: [Balzert 2009, Boehm 1987]
  und setzt sie als <Quelle id="Balzert 2009">…</Quelle>. Ein <Cite> (und
  damit auch <SourceBadge> und `Card quelle`) sucht den Eintrag, dessen
  Kennung am Anfang seines Textes steht — »Balzert, 2009, S. 4« findet also
  »Balzert 2009« —, springt beim Klick auf dessen Folie und hebt ihn hervor.

  Das Frontmatter und nicht der Folientext ist die Quelle, weil Slidev den
  Text im Build entfernt und Folien erst beim Näherkommen lädt.

  Eine Angabe mit mehreren Quellen, durch Semikolon getrennt —
  »Siedersleben, 2003, S. 63; Pohl und Rupp, 2021« —, hebt alle ihre
  Einträge hervor und springt auf den ersten.
*/
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

/** Kennungen der gerade hervorgehobenen Einträge */
export const aktiveQuellen = ref<string[]>([])
/** Folie, von der aus gesprungen wurde — für den Rückweg */
export const herkunftsFolie = ref<number | null>(null)

/** Klammern und Kommas weg, Leerraum vereinheitlicht, klein geschrieben */
export function normQuelle(text: string): string {
  return text.replace(/[()[\]]/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function useLiteratur() {
  const { $nav } = useSlideContext()

  const verzeichnis = computed(() => {
    const eintraege: { key: string; id: string; no: number }[] = []
    for (const folie of $nav.value.slides) {
      const quellen = folie.meta?.slide?.frontmatter?.quellen
      if (!Array.isArray(quellen)) continue
      for (const id of quellen) eintraege.push({ key: normQuelle(String(id)), id: String(id), no: folie.no })
    }
    // Längste Kennung zuerst, damit »Broc08« nicht an »Broc« hängen bleibt
    return eintraege.sort((a, b) => b.key.length - a.key.length)
  })

  function findeEine(teil: string) {
    const t = normQuelle(teil)
    if (!t) return undefined
    return verzeichnis.value.find(e => t === e.key || t.startsWith(`${e.key} `))
  }

  /** Alle Einträge einer Angabe, je Teil zwischen den Semikolons einer */
  function findeAlle(text: string) {
    const treffer = text.split(';').map(findeEine).filter(e => e !== undefined)
    return treffer.filter((e, i) => treffer.findIndex(f => f.id === e.id) === i)
  }

  /** Erster Eintrag der Angabe — genügt, damit der Verweis klickbar ist */
  function finde(text: string) {
    return findeAlle(text)[0]
  }

  function springe(text: string) {
    const ziele = findeAlle(text)
    if (!ziele.length) return
    const von = $nav.value.currentSlideNo
    // Innerhalb des Verzeichnisses weiterzuspringen soll den Rückweg nicht überschreiben
    if (herkunftsFolie.value === null || !verzeichnis.value.some(e => e.no === von)) herkunftsFolie.value = von
    aktiveQuellen.value = ziele.map(e => e.id)
    $nav.value.go(ziele[0].no)
  }

  /** Steht auf Folie `no` ein hervorgehobener Eintrag? Dann bleibt die Hervorhebung beim Wechsel dorthin. */
  function hatAktive(no: number) {
    return verzeichnis.value.some(e => e.no === no && aktiveQuellen.value.includes(e.id))
  }

  function zurueck() {
    const no = herkunftsFolie.value
    aktiveQuellen.value = []
    herkunftsFolie.value = null
    if (no !== null) $nav.value.go(no)
  }

  return { finde, springe, zurueck, hatAktive }
}
