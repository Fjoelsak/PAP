<!--
  Eine Kennzahl groß auf leerem Grund — trägt eine Aussage schneller als
  ein Fließtext. Vor allem in der kompakten Fassung der Vorlesung.

  Verwendung:
    <BigStat wert="385.000" einheit="Softwareentwickler">
      geschätzter Bedarf in Deutschland, Stand 2002
    </BigStat>
-->
<script setup lang="ts">
defineProps<{
  wert: string
  einheit?: string
  /** Farbe der Zahl — grün ist die Voreinstellung, grau für Nebenwerte */
  ton?: 'gruen' | 'grau' | 'rot'
}>()
</script>

<template>
  <div class="stat" :class="ton ?? 'gruen'">
    <div class="stat-wert">{{ wert }}</div>
    <div v-if="einheit" class="stat-einheit">{{ einheit }}</div>
    <div class="stat-text"><slot /></div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-wert {
  font-size: 4.6rem;
  font-weight: var(--fw-bold);
  line-height: 0.95;
  letter-spacing: -0.02em;
}

.stat.gruen .stat-wert { color: var(--thm-green-500); }
.stat.grau  .stat-wert { color: var(--thm-grey-500); }
.stat.rot   .stat-wert { color: var(--thm-red); }

.stat-einheit {
  margin-top: 0.5rem;
  font-size: 1.15rem;
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
  line-height: var(--lh-snug);
}

.stat-text {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: var(--lh-snug);
  max-width: 22rem;
}

.stat-text :deep(p:last-child) { margin-bottom: 0; }
</style>
