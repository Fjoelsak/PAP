<!--
  Infotafel, die sich über die Folie legt — für eine Begriffserklärung, die
  nicht dauerhaft auf der Folie stehen soll. Geöffnet wird sie entweder über
  ein Wort im Folientext oder über eine eigene Schaltfläche.

  Verwendung — ein Wort als Auslöser (Vorzug: Die Erklärung hängt am Begriff):
    … Adobe-Suite in Tagen <span data-info="cleanroom">nachgebaut</span>

    <InfoTafel wort="cleanroom" titel="Clean-Room-Implementierung">

    Text der Tafel.

    </InfoTafel>

  Verwendung — eigene Schaltfläche oben rechts unter dem Lockup:
    <InfoTafel knopf="Clean Room?" titel="Clean-Room-Implementierung">…</InfoTafel>

  Verwendung — eingebettet in eine Abbildung, die ihre eigene Schaltfläche
  mitbringt (so in `<IterationenSchema>`):
    <InfoTafel v-model:offen="tafel" eingebettet titel="Einordnung">…</InfoTafel>
  Die Tafel legt sich dann über das nächste positionierte Element statt über
  die Folie und lässt unten dessen Bedienzeile frei.

  Ein Klick auf den Auslöser öffnet die Tafel, ein Klick auf die Tafel oder
  erneut auf den Auslöser schließt sie; beim Verlassen der Folie schließt
  sie von selbst. Die Folie scheint blass durch. Im Export erscheint die
  Tafel nicht, und das Auslösewort steht dort als gewöhnlicher Text — der
  Inhalt gehört deshalb auch in die Foliennotiz.

  Das Aussehen des Auslöseworts (`.info-wort`) steht in `styles/slides.css`,
  weil es auch in per `v-html` gesetztem Text greifen muss.

  Die Komponente hat bewusst kein umschließendes Element: Schaltfläche und
  Tafel richten sich wie der SourceBadge am Folienlayout aus.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onSlideLeave, useNav } from '@slidev/client'

const props = withDefaults(defineProps<{ titel: string; knopf?: string; wort?: string; eingebettet?: boolean }>(), {
  knopf: undefined,
  wort: undefined,
})

const { isPrintMode } = useNav()
const offen = defineModel<boolean>('offen', { default: false })
const anker = ref<HTMLElement>()

onSlideLeave(() => { offen.value = false })

/* Auslösewörter derselben Folie — in der Referentenansicht steht die Folie
   mehrfach im Dokument, jede Tafel hört nur auf ihre eigene. */
const folie = () => anker.value?.closest('.slidev-layout')
const woerter = () => [...(folie()?.querySelectorAll<HTMLElement>(`[data-info="${props.wort}"]`) ?? [])]

function aufKlick(e: MouseEvent) {
  const ziel = (e.target as HTMLElement).closest?.(`[data-info="${props.wort}"]`)
  if (!ziel || ziel.closest('.slidev-layout') !== folie()) return
  e.stopPropagation()
  offen.value = !offen.value
}

/* Das Wort gehört einer anderen Komponente (etwa per `v-html` im Zeitstrahl).
   Setzt sie ihren Inhalt neu, ist die Auszeichnung fort — der Beobachter
   trägt sie nach, auch wenn das Wort erst nach der Tafel erscheint. */
function auszeichnen() {
  woerter().forEach((w) => {
    w.classList.add('info-wort')
    w.classList.toggle('aktiv', offen.value)
    w.title = props.titel
  })
}
const beobachter = new MutationObserver(auszeichnen)

onMounted(() => {
  if (!props.wort || isPrintMode.value) return
  auszeichnen()
  const f = folie()
  if (f) beobachter.observe(f, { childList: true, subtree: true })
  document.addEventListener('click', aufKlick, true)
})
onBeforeUnmount(() => {
  beobachter.disconnect()
  document.removeEventListener('click', aufKlick, true)
})
watch(offen, () => { if (props.wort) auszeichnen() })
</script>

<template>
  <span ref="anker" hidden />
  <div v-if="!isPrintMode && offen" class="info-tafel" :class="{ eingebettet }" @click.stop="offen = false">
    <div class="info-tafel-blatt">
      <div class="info-tafel-kopf">
        <ThmIcon name="info" box :size="1.7" />{{ titel }}<ThmIcon name="x" ton="grau" :size="1.1" class="info-tafel-zu" />
      </div>
      <slot />
    </div>
  </div>
  <button v-if="!isPrintMode && !wort && !eingebettet" class="thm-knopf info-tafel-knopf" :class="{ aktiv: offen, quadrat: !knopf }"
          :title="titel" :aria-label="titel" @click.stop="offen = !offen; ($event.currentTarget as HTMLElement).blur()">
    <ThmIcon name="info" :size="1.05" />{{ knopf }}
  </button>
</template>

<style scoped>
/* Oben rechts unter dem Lockup. Nicht in der Fußzeile: Dort liegt im
   Vollbild die Bedienleiste von Slidev und fängt die Klicks ab. */
.info-tafel-knopf {
  position: absolute;
  top: 3.7rem;
  right: var(--slide-pad-x);
  z-index: 22;
}

/* Liegt über der Folie, die blass durchscheint; die Fußzeile bleibt frei */
.info-tafel {
  position: absolute;
  inset: 0 0 var(--footer-h) 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--white) 78%, transparent);
  cursor: pointer;
  z-index: 20;
}

/* Eingebettet: über der Abbildung, deren Bedienzeile frei bleibt */
.info-tafel.eingebettet { inset: 0 0 2.2rem 0; z-index: auto; }
.info-tafel.eingebettet .info-tafel-blatt { width: 74%; }

.info-tafel-blatt {
  width: 66%;
  padding: 1.1rem 1.4rem 1.2rem;
  background: var(--white);
  border-left: 0.3rem solid var(--thm-green-500);
  box-shadow: 0 0.5rem 2rem color-mix(in srgb, var(--thm-grey-900) 22%, transparent);
  color: var(--text-body);
  font-size: 0.98rem;
  line-height: var(--lh-snug);
}

.info-tafel-blatt :deep(p) { margin: 0 0 0.7rem; }
.info-tafel-blatt :deep(p:last-child) { margin-bottom: 0; }

.info-tafel-kopf {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
  color: var(--text-strong);
  font-size: 1.15rem;
  font-weight: var(--fw-bold);
}

.info-tafel-zu { margin-left: auto; }
</style>
