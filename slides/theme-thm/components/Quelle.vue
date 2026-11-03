<!--
  Eintrag im Literaturverzeichnis (innerhalb von <ul class="thm-refs">).
  Ein Klick auf einen passenden <Cite> springt hierher und hebt den Eintrag
  hervor; die Schaltfläche »Zurück zu Folie n« an seiner oberen Kante führt
  auf die Ausgangsfolie. Nennt der Verweis mehrere Quellen, sind alle
  hervorgehoben; die Schaltfläche trägt nur der erste je Folie.

  Verwendung:
    <Quelle id="Balzert 2009">…Vollzitat…</Quelle>

  Die Kennung muss zusätzlich im Frontmatter der Folie stehen
  (`quellen: [Balzert 2009, …]`), siehe composables/literatur.ts. Welcher
  Eintrag als erster gilt, bestimmt die Reihenfolge dieser Liste; sie folgt
  deshalb der Reihenfolge der Einträge auf der Folie.
-->
<script setup lang="ts">
import { computed, provide } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import { aktiveQuellen, herkunftsFolie, useLiteratur } from '../composables/literatur'

const props = defineProps<{ id: string }>()

const { zurueck, hatAktive } = useLiteratur()
const { $frontmatter } = useSlideContext()

const aktiv = computed(() => aktiveQuellen.value.includes(props.id))
const quellenDerFolie = computed(() => ($frontmatter?.quellen ?? []).map(String))
// Die Schaltfläche »Zurück« nur einmal je Folie, am ersten hervorgehobenen Eintrag
const mitZurueck = computed(() => aktiv.value && quellenDerFolie.value.find(q => aktiveQuellen.value.includes(q)) === props.id)

// Verweise im Verzeichnis selbst sollen nicht auf sich selbst springen
provide('thm-im-verzeichnis', true)

if (import.meta.env.DEV && !quellenDerFolie.value.includes(props.id))
  console.warn(`[Quelle] »${props.id}« fehlt im Frontmatter-Feld »quellen« der Folie — Verweise finden den Eintrag nicht.`)

// Wer zur anderen Verzeichnisfolie mit weiteren hervorgehobenen Einträgen
// blättert, behält die Hervorhebung; sonst endet sie beim Verlassen.
onSlideLeave((to) => {
  if (aktiv.value && !hatAktive(to)) {
    aktiveQuellen.value = []
    herkunftsFolie.value = null
  }
})
</script>

<template>
  <li class="quelle" :class="{ 'quelle-aktiv': aktiv }">
    <slot />
    <button
      v-if="mitZurueck && herkunftsFolie !== null"
      class="quelle-zurueck"
      @click.stop="zurueck"
    >
      <ThmIcon name="arrow-left" :size="0.8" />
      Zurück zu Folie {{ herkunftsFolie }}
    </button>
  </li>
</template>
