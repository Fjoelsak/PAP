<!--
  Zwei Spalten unter dem Folienkopf. Die Spaltenaufteilung ist über
  `split` steuerbar.

  Frontmatter:
    layout: two-cols
    rubrik: Was ist Softwaretechnik?
    titel: Softwaretechnik als Teilgebiet der Informatik
    split: 2-3            # 1-1 (Voreinstellung) | 2-3 | 3-2 | 1-2 | 2-1

  Markdown:
    ::left::
    … linke Spalte …
    ::right::
    … rechte Spalte …
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  rubrik?: string
  titel?: string
  untertitel?: string
  split?: '1-1' | '2-3' | '3-2' | '1-2' | '2-1'
}>()

const spalten = computed(() => {
  const [a, b] = (props.split ?? '1-1').split('-')
  return `minmax(0, ${a}fr) minmax(0, ${b}fr)`
})
</script>

<template>
  <div class="slidev-layout thm-twocols">
    <ThmLockup />
    <SlideHead :rubrik="rubrik" :titel="titel" :untertitel="untertitel" />
    <div class="tc-grid" :style="{ gridTemplateColumns: spalten }">
      <div class="tc-col"><slot name="left" /></div>
      <div class="tc-col"><slot name="right" /></div>
    </div>
    <SlideFooter />
  </div>
</template>

<style scoped>
.tc-grid {
  display: grid;
  gap: 1.4rem;
  flex: 1;
  min-height: 0;
  /* stretch statt start: nur so bekommt eine Spalte mit eigener
     Höhenaufteilung (etwa zwei gestapelte Abbildungen) einen Bezug.
     Der Inhalt bleibt trotzdem oben, weil .tc-col eine Flex-Spalte ist. */
  align-items: stretch;
}

.tc-col {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tc-col :deep(p:last-child) { margin-bottom: 0; }
</style>
