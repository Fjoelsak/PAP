<!--
  Fußzeile jeder Folie: Veranstaltung und Dozent links, Seitenzahl
  rechts — eine ruhige Textzeile statt des früheren Grau-Balkens.
  Die Titelfolie trägt keine Seitenzahl.

  Die Inhalte kommen aus dem Frontmatter der jeweiligen slides.md:
    veranstaltung: Softwaretechnik
    dozent: Prof. Dr. Carsten Lucke
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

defineProps<{ dunkel?: boolean }>()

const { $slidev, $page } = useSlideContext()

const config = computed(() => ($slidev?.configs ?? {}) as Record<string, unknown>)
const zeile = computed(() =>
  [config.value.veranstaltung, config.value.dozent].filter(Boolean).join(' · '),
)
const zeigeSeite = computed(() => ($page?.value ?? 1) > 1)
</script>

<template>
  <footer class="thm-footer" :class="{ dark: dunkel }">
    <span>{{ zeile }}</span>
    <span v-if="zeigeSeite">{{ $page }}</span>
  </footer>
</template>
