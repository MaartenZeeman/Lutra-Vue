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

.melding[role='status'] {
  display: flex;
  align-items: center;
  gap: var(--ruimte-2);
}

.melding[role='status']::before {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background-color: var(--kleur-primair);
  content: '';
  animation: laden 1.2s ease-in-out infinite alternate;
}

@keyframes laden {
  from {
    opacity: 0.35;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
