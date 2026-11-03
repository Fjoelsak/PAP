<!--
  Icon aus dem Register (icons.ts), wahlweise frei oder im farbigen
  Quadrat — das Quadrat mit weißem Symbol ist das Erkennungszeichen der
  Karten im Design-System.

  Verwendung:
    <ThmIcon name="layers" />                  frei, in Textfarbe
    <ThmIcon name="layers" box />              grünes Quadrat
    <ThmIcon name="layers" box ton="grau" />   graues Quadrat
-->
<script setup lang="ts">
import { computed } from 'vue'
import { icons } from '../icons'

const props = defineProps<{
  name: string
  box?: boolean
  ton?: 'gruen' | 'grau' | 'gelb' | 'cyan' | 'rot' | 'weiss'
  /** Kantenlänge in rem; Voreinstellung 2.1 im Quadrat, 1.2 frei */
  size?: number
}>()

const comp = computed(() => {
  const c = icons[props.name]
  if (!c) console.warn(`[theme-thm] Icon „${props.name}“ fehlt in icons.ts`)
  return c
})
const kante = computed(() => `${props.size ?? (props.box ? 2.1 : 1.2)}rem`)
</script>

<template>
  <span
    class="thm-icon"
    :class="[{ box }, ton ?? 'gruen']"
    :style="{ '--kante': kante }"
    aria-hidden="true"
  >
    <component :is="comp" />
  </span>
</template>

<style scoped>
.thm-icon {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: var(--kante);
  height: var(--kante);
  line-height: 1;
}

.thm-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.thm-icon.box {
  border-radius: var(--radius-icon);
  color: var(--white);
}

.thm-icon.box :deep(svg) {
  width: 56%;
  height: 56%;
}

.thm-icon.box.gruen { background: var(--thm-green-500); }
.thm-icon.box.grau  { background: var(--thm-grey-600); }
.thm-icon.box.gelb  { background: var(--role-ask); }
.thm-icon.box.cyan  { background: var(--role-source); }
.thm-icon.box.rot   { background: var(--thm-red); }
.thm-icon.box.weiss { background: var(--white); color: var(--thm-green-600); }

.thm-icon:not(.box).gruen { color: var(--thm-green-500); }
.thm-icon:not(.box).grau  { color: var(--thm-grey-600); }
.thm-icon:not(.box).weiss { color: var(--white); }
.thm-icon:not(.box).rot   { color: var(--thm-red); }
</style>
