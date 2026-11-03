<!--
  Zeitstrahl mit abwechselnd links/rechts (bzw. ober-/unterhalb) gesetzten
  Marken (Folien 42 und 45 im Original).

  Verwendung:
    <Timeline :items="[
      { jahr: 1968, pos: 'unten', text: 'NATO sponsort Konferenz zur „Software-Krise“' },
      { jahr: 1968, pos: 'oben',  text: 'Dijkstra schreibt über die Probleme der GOTO-Anweisung' },
    ]" />

  Die Reihenfolge im Array bestimmt die Reihenfolge auf der Achse; die Marken
  werden gleichmäßig verteilt, nicht nach Jahreszahl skaliert — genau wie in
  der Vorlage, sonst überlappen die Beschriftungen.

  `fokus` nimmt die Positionen (ab 0) der Marken, zu denen auf der Folie
  gerade etwas erläutert wird: ihr Punkt wird grün, und ein Stiel wächst von
  der Achse in die freie Hälfte bis an den Rand des Zeitstrahls — dort kann
  eine Karte andocken. Auf der Folie etwa `:fokus="$clicks > 0 ? [1] : []"`.
  Nur für die waagerechte Variante.

  Mit `vertical` läuft die Achse von oben nach unten statt von links nach
  rechts; `pos: oben` rückt dann links von der Achse, `pos: unten` rechts —
  passend für Folien mit vielen Marken, die horizontal zu eng würden.

  `text` und `zusatz` dürfen HTML enthalten — etwa ein Wort, das eine
  Infotafel öffnet: `<span data-info=cleanroom>nachgebaut</span>`
  (siehe `<InfoTafel wort>`).

  Mit `:lauf="$nav.currentPage === $page"` baut sich der Zeitstrahl beim
  Erscheinen der Folie zügig auf: Die Achse wächst in Zeitrichtung, die
  Marken folgen ihr im Takt. Beim Verlassen der Folie setzt er sich zurück;
  im Export, in der Folienübersicht und in der Vorschau der nächsten Folie
  steht der Endzustand.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

interface TimelineItem {
  jahr: number | string
  /** Haupttext; darf HTML enthalten */
  text: string
  pos?: 'oben' | 'unten'
  /** Zusatzzeile unter dem Haupttext, z. B. die Entstehung eines Begriffs */
  zusatz?: string
}

const props = withDefaults(defineProps<{ items: TimelineItem[]; compact?: boolean; vertical?: boolean; fokus?: number[]; lauf?: boolean }>(), {
  lauf: undefined,
})

/* Ohne `lauf` steht der Zeitstrahl fertig da. Mit `lauf` beginnt er leer und
   baut sich auf, sobald die Folie erscheint — zwei Bilder später, damit der
   Aufbau auch beim Hinblättern sichtbar startet. Übersicht und Vorschau
   zeigen die Folie, ohne dass sie die aktuelle ist — dort bliebe er leer. */
const { isPrintMode } = useNav()
const { $renderContext } = useSlideContext()
const bewegt = props.lauf !== undefined && !isPrintMode.value
  && ['slide', 'presenter'].includes($renderContext.value)
const gezeigt = ref(!bewegt)

let bild = 0
function abbrechen() { cancelAnimationFrame(bild) }

function starten() {
  abbrechen()
  gezeigt.value = false
  bild = requestAnimationFrame(() => { bild = requestAnimationFrame(() => { gezeigt.value = true }) })
}

onMounted(() => { if (bewegt && props.lauf) starten() })
onBeforeUnmount(abbrechen)
watch(() => props.lauf, (l) => {
  if (!bewegt) return
  if (l) starten()
  else { abbrechen(); gezeigt.value = false }
})
</script>

<template>
  <div v-if="vertical" class="tlv" :class="bewegt && (gezeigt ? 'laeuft' : 'wartet')" :style="{ '--n': items.length }">
    <div class="tlv-axis" />
    <div v-for="(it, i) in items" :key="i" class="tlv-row" :style="{ '--i': i }">
      <div class="tlv-side left">
        <template v-if="(it.pos ?? (i % 2 === 0 ? 'oben' : 'unten')) === 'oben'">
          <div class="tlv-jahr">{{ it.jahr }}</div>
          <div class="tlv-text">
            <span v-html="it.text" />
            <div v-if="it.zusatz" class="tlv-zusatz" v-html="it.zusatz" />
          </div>
        </template>
      </div>
      <div class="tlv-mid"><div class="tlv-dot" /></div>
      <div class="tlv-side right">
        <template v-if="(it.pos ?? (i % 2 === 0 ? 'oben' : 'unten')) === 'unten'">
          <div class="tlv-jahr">{{ it.jahr }}</div>
          <div class="tlv-text">
            <span v-html="it.text" />
            <div v-if="it.zusatz" class="tlv-zusatz" v-html="it.zusatz" />
          </div>
        </template>
      </div>
    </div>
  </div>

  <div v-else class="tl" :class="[{ compact }, bewegt && (gezeigt ? 'laeuft' : 'wartet')]" :style="{ '--n': items.length }">
    <div class="tl-track">
      <div class="tl-axis" />
      <div
        v-for="(it, i) in items"
        :key="i"
        class="tl-item"
        :class="{ fokus: fokus?.includes(i) }"
        :style="{ left: `${((i + 0.5) / items.length) * 100}%`, width: `${(100 / items.length) * 1.28}%`, '--i': i }"
      >
        <div class="tl-half top">
          <template v-if="(it.pos ?? 'oben') === 'oben'">
            <div class="tl-text">
              <span v-html="it.text" />
              <div v-if="it.zusatz" class="tl-zusatz" v-html="it.zusatz" />
            </div>
            <div class="tl-jahr">{{ it.jahr }}</div>
          </template>
        </div>
        <div class="tl-dot" />
        <div class="tl-stiel" :class="it.pos === 'unten' ? 'hoch' : 'runter'" />
        <div class="tl-half bottom">
          <template v-if="it.pos === 'unten'">
            <div class="tl-jahr">{{ it.jahr }}</div>
            <div class="tl-text">
              <span v-html="it.text" />
              <div v-if="it.zusatz" class="tl-zusatz" v-html="it.zusatz" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl {
  flex: 1;
  /* Nach oben begrenzt und vertikal mittig — ohne Deckel zöge sich der
     Strahl über die ganze Folie und die Beschriftungen drifteten
     weit von der Achse weg. */
  max-height: 15rem;
  margin: auto 0;
  display: flex;
  align-items: stretch;
  min-height: 0;
  font-size: 0.7rem;
}

.tl-track {
  position: relative;
  width: 100%;
  min-height: 0;
}

.tl-axis {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1.5px;
  background: var(--thm-grey-300);
  transform: translateY(-50%);
}

.tl-item {
  position: absolute;
  top: 0;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Zwei gleich hohe Hälften — die Achse liegt exakt dazwischen. */
.tl-half {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28rem;
  width: 100%;
}

.tl-half.top    { justify-content: flex-end;   padding-bottom: 0.3rem; }
.tl-half.bottom { justify-content: flex-start; padding-top: 0.3rem; }

.tl-dot {
  width: 0.5rem;
  height: 0.5rem;
  flex: none;
  border-radius: 50%;
  background: var(--thm-grey-600);
  outline: 2px solid var(--white);
  box-shadow: 0 0 0 3.5px var(--thm-grey-200);
  margin: -0.25rem 0;
  position: relative;
  z-index: 1;
  transition: background 0.3s, box-shadow 0.3s;
}

/* Stiel einer Fokus-Marke: wächst von der Achse in die Hälfte ohne Text */
.tl-item.fokus .tl-dot {
  background: var(--thm-green-500);
  box-shadow: 0 0 0 3.5px var(--thm-green-100);
}

.tl-stiel {
  position: absolute;
  left: 50%;
  width: 2px;
  margin-left: -1px;
  background: var(--thm-green-500);
  transform: scaleY(0);
  transition: transform 0.45s ease;
}

.tl-stiel.runter { top: 50%; bottom: 0; transform-origin: top; }
.tl-stiel.hoch   { top: 0; bottom: 50%; transform-origin: bottom; }
.tl-item.fokus .tl-stiel { transform: scaleY(1); }

.tl-jahr {
  font-weight: var(--fw-bold);
  font-size: 1.02rem;
  color: var(--thm-green-600);
  line-height: 1.05;
}

.tl-text {
  color: var(--text-body);
  line-height: 1.28;
}

.tl-zusatz {
  margin-top: 0.3rem;
  color: var(--thm-grey-500);
}

.tl.compact { font-size: 0.55rem; }
.tl.compact .tl-jahr { font-size: 0.78rem; }
.tl.compact .tl-dot { width: 0.34rem; height: 0.34rem; box-shadow: 0 0 0 2.5px var(--thm-grey-200); }
.tl.compact .tl-item.fokus .tl-dot { box-shadow: 0 0 0 2.5px var(--thm-green-100); }

/* ---- Vertikale Variante ---- */
.tlv {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0.2rem 0;
}

.tlv-axis {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: var(--thm-grey-300);
  transform: translateX(-50%);
}

.tlv-row {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.6rem 1fr;
  align-items: center;
  column-gap: 1.1rem;
}

.tlv-side {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  line-height: 1.28;
}

.tlv-side.left { align-items: flex-end; text-align: right; }
.tlv-side.right { align-items: flex-start; text-align: left; }

.tlv-mid {
  display: flex;
  justify-content: center;
}

.tlv-dot {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 50%;
  background: var(--thm-grey-600);
  outline: 2px solid var(--white);
  box-shadow: 0 0 0 3.5px var(--thm-grey-200);
}

.tlv-jahr {
  font-weight: var(--fw-bold);
  font-size: 1.05rem;
  color: var(--thm-green-600);
  line-height: 1.05;
}

.tlv-text {
  color: var(--text-body);
  font-size: 0.82rem;
}

.tlv-zusatz {
  margin-top: 0.2rem;
  color: var(--thm-grey-500);
}

/* ---- Aufbau beim Erscheinen der Folie (`lauf`) ----
   Die Achse wächst gleichmäßig in Zeitrichtung; jede Marke erscheint in dem
   Augenblick, in dem die Achse sie erreicht. */
.tl, .tlv { --takt: 0.2s; }
/* Am Träger von --i berechnen — weiter oben wäre --i noch nicht gesetzt */
.tl-item, .tlv-row { --ab: calc((var(--i) + 0.5) * var(--takt)); }

.wartet .tl-axis, .wartet .tl-item,
.wartet .tlv-axis, .wartet .tlv-row { opacity: 0; }

.laeuft .tlv-axis {
  transform-origin: top;
  animation: tl-achse-v calc(var(--n) * var(--takt)) linear both;
}
.laeuft .tl-axis {
  transform-origin: left;
  animation: tl-achse-h calc(var(--n) * var(--takt)) linear both;
}

.laeuft .tl-dot, .laeuft .tlv-dot { animation: tl-punkt 0.35s var(--ab) cubic-bezier(0.3, 1.5, 0.5, 1) both; }
.laeuft .tlv-side.left > *  { animation: tl-von-rechts 0.4s var(--ab) ease-out both; }
.laeuft .tlv-side.right > * { animation: tl-von-links 0.4s var(--ab) ease-out both; }
.laeuft .tl-half.top > *    { animation: tl-von-unten 0.4s var(--ab) ease-out both; }
.laeuft .tl-half.bottom > * { animation: tl-von-oben 0.4s var(--ab) ease-out both; }

@keyframes tl-achse-v { from { transform: translateX(-50%) scaleY(0); } to { transform: translateX(-50%) scaleY(1); } }
@keyframes tl-achse-h { from { transform: translateY(-50%) scaleX(0); } to { transform: translateY(-50%) scaleX(1); } }
@keyframes tl-punkt { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
@keyframes tl-von-rechts { from { opacity: 0; transform: translateX(0.8rem); } to { opacity: 1; transform: none; } }
@keyframes tl-von-links  { from { opacity: 0; transform: translateX(-0.8rem); } to { opacity: 1; transform: none; } }
@keyframes tl-von-unten  { from { opacity: 0; transform: translateY(0.5rem); } to { opacity: 1; transform: none; } }
@keyframes tl-von-oben   { from { opacity: 0; transform: translateY(-0.5rem); } to { opacity: 1; transform: none; } }
</style>
