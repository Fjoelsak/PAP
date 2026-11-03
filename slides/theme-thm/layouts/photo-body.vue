<!--
  Folienkopf auf Weiß, Inhalt über einem Foto.

  Frontmatter:
    layout: photo-body
    rubrik: Warum ist Software so schwer zu entwickeln?
    titel: Zunehmende Bedeutung
    bild: /bleistifte.jpg
-->
<script setup lang="ts">
import { assetUrl } from '../composables/asset'

defineProps<{ rubrik?: string; titel?: string; untertitel?: string; bild?: string }>()
</script>

<template>
  <div class="slidev-layout thm-photobody">
    <ThmLockup />
    <SlideHead :rubrik="rubrik" :titel="titel" :untertitel="untertitel" />
    <div class="pb-photo" :style="bild ? { backgroundImage: `url(${assetUrl(bild)})` } : undefined">
      <div class="pb-inner"><slot /></div>
    </div>
    <SlideFooter />
  </div>
</template>

<style scoped>
.pb-photo {
  flex: 1;
  min-height: 0;
  background-size: cover;
  background-position: center;
  background-color: var(--role-ask);
  padding: 1.1rem 1.3rem;
  display: flex;
  flex-direction: column;
}

.pb-inner {
  flex: 1;
  min-height: 0;
  color: var(--white);
  font-size: 0.8rem;
  line-height: var(--lh-snug);
  display: flex;
  flex-direction: column;
}

.pb-inner :deep(strong) { color: var(--white); }
.pb-inner :deep(ul > li::before) { background: rgba(255, 255, 255, 0.8); }
.pb-inner :deep(p:last-child) { margin-bottom: 0; }
</style>
