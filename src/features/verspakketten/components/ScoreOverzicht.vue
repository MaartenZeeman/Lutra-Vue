<script setup lang="ts">
import { computed } from 'vue'

import { formatScore } from '@/shared/utils/format'

const props = defineProps<{
  smaak?: number | null
  bereiden?: number | null
}>()

const smaak = computed(() => formatScore(props.smaak))
const bereiden = computed(() => formatScore(props.bereiden))
const heeftScores = computed(() => smaak.value !== null || bereiden.value !== null)
</script>

<template>
  <p v-if="!heeftScores" class="scores scores--leeg">Nog geen beoordelingen</p>
  <p v-else class="scores">
    <span v-if="smaak !== null"
      >Smaak <strong>{{ smaak }}</strong></span
    >
    <span v-if="bereiden !== null"
      >Bereiden <strong>{{ bereiden }}</strong></span
    >
  </p>
</template>

<style scoped>
.scores {
  margin: 0;
}

.scores--leeg {
  font-style: italic;
}
</style>
