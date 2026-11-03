<!--
  Standardlayout: Rubrik, Titel, optionaler Untertitel, grüner Balken,
  darunter freier Inhalt.

  Frontmatter:
    layout: default
    rubrik: Was ist Software?              # optional, grüne Versalien
    titel: Charakteristika von Software
    untertitel: Die sechs Merkmale        # optional
    neu: true                             # optional, Arbeitsmarke „Neu“
                                          # für Vorschläge, die noch
                                          # abgestimmt werden
-->
<script setup lang="ts">
defineProps<{ rubrik?: string; titel?: string; untertitel?: string; neu?: boolean }>()
</script>

<template>
  <div class="slidev-layout thm-default">
    <ThmLockup />
    <div v-if="neu" class="thm-neu">Neu</div>
    <SlideHead :rubrik="rubrik" :titel="titel" :untertitel="untertitel" />
    <div class="thm-body">
      <slot />
    </div>
    <SlideFooter />
  </div>
</template>
