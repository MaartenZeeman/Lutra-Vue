<script setup lang="ts">
withDefaults(
  defineProps<{
    soort: 'laden' | 'leeg' | 'fout'
    titel?: string
    bericht?: string
  }>(),
  {
    titel: undefined,
    bericht: undefined,
  },
)

defineEmits<{ opnieuw: [] }>()
</script>

<template>
  <p v-if="soort === 'laden'" class="melding" role="status">Bezig met laden…</p>

  <div v-else-if="soort === 'fout'" class="foutmelding" role="alert">
    <div class="foutmelding__tekst">
      <strong>{{ titel ?? 'Er ging iets mis' }}</strong>
      <p v-if="bericht">{{ bericht }}</p>
    </div>
    <button class="knop knop--klein" type="button" @click="$emit('opnieuw')">
      Opnieuw proberen
    </button>
  </div>

  <p v-else class="melding">{{ bericht ?? 'Er is nog niets om te tonen.' }}</p>
</template>

<style scoped>
.foutmelding__tekst p {
  margin: var(--ruimte-1) 0 0;
}

.foutmelding {
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
}
</style>
