<script setup lang="ts">
import { computed } from 'vue'

import { formatPersonen, formatPrijs } from '@/shared/utils/format'

import type { VerspakketSamenvatting } from '../model/verspakket'
import FotoWeergave from './FotoWeergave.vue'
import ScoreOverzicht from './ScoreOverzicht.vue'

const props = defineProps<{
  verspakket: VerspakketSamenvatting
}>()

const prijs = computed(() => formatPrijs(props.verspakket.prijsInCenten))
const supermarkt = computed(() => props.verspakket.supermarkt?.naam ?? 'Onbekende supermarkt')
</script>

<template>
  <article class="kaart verspakket">
    <RouterLink
      class="verspakket__link"
      :to="{ name: 'verspakket-detail', params: { id: verspakket.id } }"
    >
      <div class="verspakket__beeld">
        <FotoWeergave :foto="verspakket.foto" :alt="`Foto van ${verspakket.naam}`" />
      </div>
      <div class="verspakket__inhoud">
        <h3 class="verspakket__naam">{{ verspakket.naam }}</h3>
        <p class="verspakket__supermarkt">{{ supermarkt }}</p>
        <p class="verspakket__meta">
          <span>{{ prijs }}</span>
          <span>{{ formatPersonen(verspakket.aantalPersonen) }}</span>
        </p>
        <ScoreOverzicht
          :smaak="verspakket.averageCijferSmaak"
          :bereiden="verspakket.averageCijferBereiden"
        />
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.verspakket {
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.verspakket:hover {
  border-color: var(--kleur-primair);
  box-shadow: var(--schaduw);
}

.verspakket__link {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.verspakket__beeld {
  aspect-ratio: 4 / 3;
  background-color: var(--kleur-oppervlak-zwak);
}

.verspakket__inhoud {
  display: flex;
  flex-direction: column;
  gap: var(--ruimte-1);
  flex: 1;
  padding: var(--ruimte-4);
}

.verspakket__naam {
  margin: 0;
  font-size: 1.05rem;
}

.verspakket__supermarkt {
  margin: 0;
  color: var(--kleur-tekst-zacht);
  font-size: 0.9rem;
}

.verspakket__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ruimte-3);
  margin: auto 0 0;
  padding-top: var(--ruimte-2);
  font-weight: 600;
}
</style>
