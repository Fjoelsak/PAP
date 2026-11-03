<!--
  Die CD-Lockup „THM | Campus Friedberg | MND“. Sie liegt im Theme,
  nicht im Foliensatz, damit alle Vorlesungen dieselbe Datei nutzen.
  Auf dunklen Flächen (`hell`) erscheint sie einfarbig weiß, wie es das
  CD für farbige Hintergründe vorsieht.
-->
<script setup lang="ts">
import lockup from '../assets/thm-lockup.png'
import lockupWeiss from '../assets/thm-lockup-white.png'

defineProps<{ place?: 'top-right' | 'top-left'; hell?: boolean }>()
</script>

<template>
  <img
    :src="hell ? lockupWeiss : lockup"
    class="thm-lockup"
    :class="place ?? 'top-right'"
    alt="Technische Hochschule Mittelhessen · Campus Friedberg · Fachbereich MND"
  />
</template>
