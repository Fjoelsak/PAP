<!--
  Moodle-Hinweis. Gelb steht in dieser Vorlesungsreihe für „hier ist
  etwas zu tun“.

  Verwendung:
    <MoodleNote titel="Hinweis Moodle">
      Lesen Sie Kapitel 1 in Balzert (2009).
    </MoodleNote>
-->
<script setup lang="ts">
defineProps<{ titel?: string }>()
</script>

<template>
  <div class="moodle-note">
    <ThmIcon name="graduation-cap" box ton="gelb" :size="2.1" />
    <div class="mn-body">
      <div class="mn-title">{{ titel ?? 'Hinweis Moodle' }}</div>
      <div class="mn-text"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.moodle-note {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  background: var(--role-ask-soft);
  border-left: 0.25rem solid var(--role-ask);
  padding: 0.75rem 0.9rem;
  font-size: 0.8rem;
  text-align: left;
}

.mn-body { flex: 1; min-width: 0; }

.mn-title {
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  margin-bottom: 0.15rem;
}

.mn-text {
  color: var(--text-body);
  line-height: var(--lh-snug);
}

.mn-text :deep(p:last-child) { margin-bottom: 0; }
</style>
