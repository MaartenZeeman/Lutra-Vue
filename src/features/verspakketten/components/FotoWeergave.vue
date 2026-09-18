<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { FOTO_PLAATSHOUDER, fotoDataUrl } from '@/shared/utils/image'

import type { VerspakketFoto } from '../model/verspakket'

const props = defineProps<{
  foto?: VerspakketFoto | null
  alt: string
}>()

const mislukt = ref(false)

const bron = computed(() =>
  mislukt.value ? FOTO_PLAATSHOUDER : fotoDataUrl(props.foto?.base64Data),
)

watch(
  () => props.foto?.id,
  () => {
    mislukt.value = false
  },
)
</script>

<template>
  <img class="foto" :src="bron" :alt="alt" loading="lazy" @error="mislukt = true" />
</template>

<style scoped>
.foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: var(--kleur-oppervlak-zwak);
}
</style>
