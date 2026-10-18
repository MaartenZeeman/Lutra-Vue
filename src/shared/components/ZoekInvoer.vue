<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    knopLabel?: string
  }>(),
  {
    label: 'Zoek verspakketten',
    placeholder: 'Zoek op naam…',
    knopLabel: 'Zoeken',
  },
)

const emit = defineEmits<{
  'update:modelValue': [waarde: string]
  submit: []
}>()

const veldId = useId()

function bijInvoer(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <form class="zoek" role="search" @submit.prevent="emit('submit')">
    <label class="zichtbaar-voor-lezer" :for="veldId">{{ label }}</label>
    <input
      :id="veldId"
      type="search"
      :placeholder="placeholder"
      :value="modelValue"
      @input="bijInvoer"
    />
    <button class="knop knop--klein zoek__knop" type="submit">{{ knopLabel }}</button>
  </form>
</template>

<style scoped>
.zoek {
  display: flex;
  gap: var(--ruimte-2);
  width: 100%;
}

.zoek input {
  min-width: 0;
  background-color: var(--kleur-achtergrond);
}

.zoek__knop {
  border-color: var(--kleur-primair);
  background-color: var(--kleur-primair-zwak);
  color: var(--kleur-primair-donker);
}

.zoek__knop:hover {
  border-color: var(--kleur-primair-donker);
  background-color: var(--kleur-primair);
  color: #ffffff;
}
</style>
