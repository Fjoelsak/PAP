<!--
  Kopf einer Inhaltsfolie: Rubrik in grünen Versalien, Titel, optionaler
  Untertitel und der kurze grüne Balken. Wird von den Layouts gesetzt,
  nicht von Hand in die Folie.
-->
<script setup lang="ts">
defineProps<{ rubrik?: string; titel?: string; untertitel?: string }>()
</script>

<template>
  <header v-if="titel || rubrik" class="thm-head">
    <div v-if="rubrik" class="thm-eyebrow">{{ rubrik }}</div>
    <h1 v-if="titel">{{ titel }}</h1>
    <div v-if="untertitel" class="slide-subtitle">{{ untertitel }}</div>
    <div class="thm-bar" />
  </header>
</template>
