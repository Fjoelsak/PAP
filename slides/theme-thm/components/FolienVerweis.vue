<!--
  Verweis auf eine andere Folie desselben Foliensatzes, als kantige Pill
  mit Pfeil: „Folie 24 · Arten von Anforderungen“. Die Nummer wird aus
  dem `routeAlias` der Zielfolie ermittelt und stimmt deshalb auch dann
  noch, wenn davor Folien hinzukommen. Ein Klick springt auf die Folie.

  Verwendung:
    Zielfolie im Frontmatter:  routeAlias: arten-von-anforderungen
    Verweis:                   <FolienVerweis ziel="arten-von-anforderungen">Arten von Anforderungen</FolienVerweis>

  Grün statt Cyan: Cyan steht für Herkunft aus der Literatur, der Verweis
  führt nur innerhalb der Vorlesung zurück.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const props = defineProps<{ ziel: string }>()

const { slides, go } = useNav()
const nr = computed(() => slides.value.find(s => s.meta.slide?.frontmatter.routeAlias === props.ziel)?.no)
const springe = () => { if (nr.value) go(nr.value) }

if (import.meta.env.DEV && !nr.value)
  console.warn(`[FolienVerweis] Keine Folie mit »routeAlias: ${props.ziel}« — der Verweis führt ins Leere.`)
</script>

<template>
  <span
    class="folien-verweis"
    role="link"
    tabindex="0"
    title="Zur Folie springen"
    @click.stop="springe"
    @keydown.enter="springe"
  >
    <ThmIcon name="corner-up-left" :size="0.95" class="fv-icon" />
    <span v-if="nr" class="fv-nr">Folie {{ nr }}</span>
    <span class="fv-text"><slot /></span>
  </span>
</template>

<style scoped>
.folien-verweis {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  padding: 0.12em 0.65em;
  background: var(--thm-green-50);
  border: 1px solid color-mix(in srgb, var(--thm-green-500) 55%, transparent);
  color: var(--thm-grey-700);
  font-size: 0.82em;
  font-weight: var(--fw-semibold);
  line-height: 1.35;
  white-space: nowrap;
  cursor: pointer;
}

.folien-verweis:hover,
.folien-verweis:focus-visible {
  border-color: var(--thm-green-500);
  outline: none;
}

.fv-icon { color: var(--thm-green-600); }
.fv-nr { color: var(--thm-green-700); font-weight: var(--fw-bold); }
.fv-nr::after { content: '·'; margin-left: 0.45em; color: var(--thm-grey-400); }
</style>
