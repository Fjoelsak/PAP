<!--
  Schlussfolie im Aufbau der Titelfolie: dunkle Rasterfläche, der Dank
  links, das Foto rechts.

  Frontmatter:
    layout: end
    bild: /campus-friedberg.jpg
-->
<script setup lang="ts">
import { assetUrl } from '../composables/asset'

defineProps<{ bild?: string; rubrik?: string }>()
</script>

<template>
  <div class="slidev-layout thm-end thm-dark">
    <ThmLockup place="top-left" hell />
    <div class="cv-text">
      <div v-if="rubrik" class="thm-eyebrow">{{ rubrik }}</div>
      <slot />
      <div class="thm-bar end-bar" />
    </div>
    <div class="cv-photo" :style="bild ? { backgroundImage: `url(${assetUrl(bild)})` } : undefined" />
    <span class="cv-quad" aria-hidden="true" />
    <SlideFooter dunkel />
  </div>
</template>

<style scoped>
.thm-end {
  padding: 0;
  overflow: hidden;
}

.cv-text {
  position: absolute;
  left: var(--slide-pad-x);
  top: 0;
  bottom: 0;
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cv-text :deep(h1) {
  color: var(--white);
  font-size: 2.4rem;
  line-height: 1.12;
  margin: 0.2rem 0 0;
}

.cv-text :deep(p) {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 1rem 0 0;
}

.end-bar {
  width: 5.2rem;
  margin-top: 1.5rem;
}

.cv-photo {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 38%;
  background-size: cover;
  background-position: center 60%;
  background-color: var(--thm-grey-500);
}

.cv-quad {
  position: absolute;
  width: 3.2rem;
  height: 3.2rem;
  right: calc(38% - 1.6rem);
  top: 5.2rem;
  background: var(--thm-green-500);
}
</style>
