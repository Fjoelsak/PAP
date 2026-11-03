<!--
  Zwei gegenüberliegende Positionen als Karten mit farbigem Kopfband —
  links Grün, rechts Grau, wie die Gegenüberstellungen im Design-System.

  Frontmatter:
    layout: split
    rubrik: Was ist Software?
    titel: Systemsoftware, Anwendungssoftware
    links: Systemsoftware
    rechts: Anwendungssoftware
    iconLinks: cpu             # optional, aus icons.ts
    iconRechts: app-window

  Markdown:
    ::left::  … ::right:: …
-->
<script setup lang="ts">
defineProps<{
  rubrik?: string
  titel?: string
  untertitel?: string
  links?: string
  rechts?: string
  iconLinks?: string
  iconRechts?: string
}>()
</script>

<template>
  <div class="slidev-layout thm-split">
    <ThmLockup />
    <SlideHead :rubrik="rubrik" :titel="titel" :untertitel="untertitel" />
    <div class="sp-grid">
      <Card band="gruen" :titel="links" :icon="iconLinks" class="sp-half">
        <slot name="left" />
      </Card>
      <Card band="grau" :titel="rechts" :icon="iconRechts" class="sp-half">
        <slot name="right" />
      </Card>
    </div>
    <SlideFooter />
  </div>
</template>

<style scoped>
.sp-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.1rem;
  flex: 1;
  min-height: 0;
}

.sp-half { font-size: 0.95em; }
</style>
