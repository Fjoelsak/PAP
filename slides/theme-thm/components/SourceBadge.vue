<!--
  Quellenangabe einer Folie als Pill in eckigen Klammern (siehe <Cite>).
  Sie sitzt in der Fußzeile rechts vor der Seitenzahl und nimmt dem
  Folieninhalt so keinen Platz weg.

  Verwendung:
    <SourceBadge quelle="(Balzert, 2009)" seite="S. 4" />   → [Balzert, 2009, S. 4]
    <SourceBadge quelle="(Balzert, 2009)" place="inline" />  im Fließtext

  Äußere runde Klammern in `quelle` werden entfernt, damit bestehende
  Angaben nicht doppelt geklammert erscheinen.
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  quelle: string
  seite?: string
  /** `inline` setzt den Verweis in den Fluss; alles andere in die Fußzeile */
  place?: string
}>()

const text = computed(() => {
  const q = props.quelle.trim().replace(/^\((.*)\)$/, '$1')
  return props.seite ? `${q}, ${props.seite}` : q
})
</script>

<template>
  <span class="src-badge" :class="place === 'inline' ? 'inline' : 'footer'">
    <Cite icon>{{ text }}</Cite>
  </span>
</template>

<style scoped>
.src-badge.footer {
  position: absolute;
  right: calc(var(--slide-pad-x) + 1.6rem);
  bottom: 0;
  height: var(--footer-h);
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  z-index: 21;
}

.src-badge.inline { display: inline-flex; }
</style>
