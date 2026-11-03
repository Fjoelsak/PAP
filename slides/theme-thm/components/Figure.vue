<!--
  Abbildung mit Bildunterschrift. Für die aus dem Buch übernommenen
  Diagramme (Balzert 2009, Boehm 1987), die als Bild zitiert werden.

  Verwendung:
    <Figure src="/chart-marktvolumen.png"
            caption="Marktvolumen von Software im Automobilbereich …" />
-->
<script setup lang="ts">
import { assetUrl } from '../composables/asset'

defineProps<{
  src: string
  caption?: string
  alt?: string
  /** Rahmen und weißer Grund — nützlich, wenn die Abbildung auf Foto liegt */
  boxed?: boolean
}>()
</script>

<template>
  <figure class="thm-figure" :class="{ boxed }">
    <img :src="assetUrl(src)" :alt="alt ?? caption ?? ''" />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.thm-figure {
  margin: 0;
  flex: 1;
}

.thm-figure.boxed img {
  background: var(--white);
  padding: 0.5rem;
}
</style>
