<script setup lang="ts">
import { ALLERGEEN_LABELS, ALLERGENEN, type Allergeen } from '../model/verspakket'

const allergenen = defineModel<number[]>({ required: true })

function wisselen(allergeen: Allergeen, aangevinkt: boolean): void {
  allergenen.value = aangevinkt
    ? [...allergenen.value, allergeen]
    : allergenen.value.filter((waarde) => waarde !== allergeen)
}
</script>

<template>
  <fieldset class="allergenen-kiezer">
    <legend class="zichtbaar-voor-lezer">Allergenen</legend>
    <label v-for="allergeen in ALLERGENEN" :key="allergeen" class="allergeen">
      <input
        type="checkbox"
        :checked="allergenen.includes(allergeen)"
        @change="wisselen(allergeen, ($event.target as HTMLInputElement).checked)"
      />
      {{ ALLERGEEN_LABELS[allergeen] }}
    </label>
  </fieldset>
</template>

<style scoped>
.allergenen-kiezer {
  display: grid;
  gap: var(--ruimte-2);
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  margin: 0;
  padding: var(--ruimte-3);
  border: 1px solid var(--kleur-rand);
  border-radius: var(--straal-klein);
}

.allergeen {
  display: inline-flex;
  align-items: center;
  gap: var(--ruimte-2);
}
</style>
