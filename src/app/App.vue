<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppFooter from '@/shared/components/AppFooter.vue'
import AppHeader from '@/shared/components/AppHeader.vue'
</script>

<template>
  <a class="overslaan" href="#inhoud">Direct naar de inhoud</a>
  <AppHeader />
  <main id="inhoud" class="pagina container" tabindex="-1">
    <RouterView />
  </main>
  <AppFooter />
</template>

<style scoped>
.overslaan {
  position: absolute;
  top: -100px;
  left: var(--ruimte-4);
  z-index: 10;
  padding: var(--ruimte-2) var(--ruimte-4);
  border-radius: var(--straal-klein);
  background-color: var(--kleur-primair);
  color: #ffffff;
  text-decoration: none;
}

.overslaan:focus {
  top: var(--ruimte-3);
}

.pagina {
  padding-block: var(--ruimte-6) var(--ruimte-7);
}
</style>
