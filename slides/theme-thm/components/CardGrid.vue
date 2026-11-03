<!--
  Raster für Karten. `cols` bestimmt die Spaltenzahl, `fill` lässt die
  Karten die verfügbare Höhe ausfüllen — so schließt das Raster bündig
  über der Fußzeile ab, statt eine leere Fläche zu hinterlassen.
-->
<script setup lang="ts">
defineProps<{ cols?: number; fill?: boolean }>()
</script>

<template>
  <div class="card-grid" :class="{ fill }" :style="{ '--cols': cols ?? 3 }">
    <slot />
  </div>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: var(--grid-gap);
  min-height: 0;
}

.card-grid.fill {
  flex: 1;
  grid-auto-rows: minmax(0, 1fr);
}
</style>
