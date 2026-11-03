<!--
  Merksatz- oder Hinweisband über die volle Breite, mit Icon links —
  schließt eine Folie ab oder hebt den Kern einer Aussage heraus.

  Verwendung:
    <Callout>Die Softwareprodukte von heute sind die Altlasten von morgen.</Callout>
    <Callout ton="grau" icon="info">…</Callout>

  ton: gruen (Voreinstellung) | grau | hell
-->
<script setup lang="ts">
defineProps<{ icon?: string; ton?: 'gruen' | 'grau' | 'hell' }>()
</script>

<template>
  <div class="callout" :class="ton ?? 'gruen'">
    <ThmIcon :name="icon ?? 'lightbulb'" :ton="ton === 'hell' ? 'gruen' : 'weiss'" :size="1.35" />
    <div class="co-text"><slot /></div>
  </div>
</template>

<style scoped>
.callout {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.75rem 1.1rem;
  font-size: 0.9em;
  line-height: var(--lh-snug);
}

.callout.gruen { background: var(--thm-green-500); color: var(--white); }
.callout.grau  { background: var(--thm-grey-600); color: var(--white); }
.callout.hell  { background: var(--thm-green-50); color: var(--text-strong); border-left: 0.25rem solid var(--thm-green-500); }

.callout.gruen :deep(strong),
.callout.grau :deep(strong) { color: inherit; }

.co-text { flex: 1; min-width: 0; }
.co-text :deep(p:last-child) { margin-bottom: 0; }
</style>
