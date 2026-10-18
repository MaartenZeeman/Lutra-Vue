<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { foutmelding } from '@/shared/api/apiError'
import StatusBlok from '@/shared/components/StatusBlok.vue'

import { verspakkettenApi } from '../api/verspakkettenApi'
import VerspakketKaart from '../components/VerspakketKaart.vue'
import {
  SORTEEROPTIES,
  STANDAARD_SORTERING,
  sorteeroptieSleutel,
  type Sorteeroptie,
  type VerspakketSamenvatting,
} from '../model/verspakket'

const AANTAL = 10

const verspakketten = ref<VerspakketSamenvatting[]>([])
const bezig = ref(true)
const fout = ref<string | null>(null)
const sorteerSleutel = ref(
  sorteeroptieSleutel(STANDAARD_SORTERING.veld, STANDAARD_SORTERING.richting),
)

let controller: AbortController | null = null

function huidigeOptie(): Sorteeroptie {
  return (
    SORTEEROPTIES.find(
      (optie) => sorteeroptieSleutel(optie.veld, optie.richting) === sorteerSleutel.value,
    ) ?? STANDAARD_SORTERING
  )
}

async function laden(): Promise<void> {
  controller?.abort()
  controller = new AbortController()
  bezig.value = true
  fout.value = null

  const optie = huidigeOptie()

  try {
    const resultaat = await verspakkettenApi.list({
      take: AANTAL,
      sortField: optie.veld,
      sortDirection: optie.richting,
      signal: controller.signal,
    })
    verspakketten.value = resultaat.verspakketten
  } catch (foutWaarde) {
    if ((foutWaarde as { name?: string }).name === 'AbortError') {
      return
    }
    fout.value = foutmelding(foutWaarde)
  } finally {
    bezig.value = false
  }
}

onMounted(() => {
  void laden()
})

watch(sorteerSleutel, () => {
  void laden()
})
</script>

<template>
  <section>
    <div class="kop">
      <div>
        <h1>Top 10 verspakketten</h1>
        <p class="kop__tekst">Bekijk tien verspakketten en kies zelf hoe je ze sorteert.</p>
      </div>

      <div class="veld kop__sortering">
        <label for="home-sortering">Sorteren op</label>
        <select id="home-sortering" v-model="sorteerSleutel">
          <option
            v-for="optie in SORTEEROPTIES"
            :key="sorteeroptieSleutel(optie.veld, optie.richting)"
            :value="sorteeroptieSleutel(optie.veld, optie.richting)"
          >
            {{ optie.label }}
          </option>
        </select>
      </div>
    </div>

    <StatusBlok v-if="fout" soort="fout" :bericht="fout" @opnieuw="() => void laden()" />
    <StatusBlok v-else-if="bezig" soort="laden" />
    <StatusBlok
      v-else-if="verspakketten.length === 0"
      soort="leeg"
      bericht="Er zijn nog geen verspakketten toegevoegd."
    />
    <div v-else class="raster">
      <VerspakketKaart
        v-for="verspakket in verspakketten"
        :key="verspakket.id"
        :verspakket="verspakket"
      />
    </div>

    <div v-if="!bezig && !fout" class="meer">
      <RouterLink class="knop knop--primair" :to="{ name: 'verspakketten' }">
        Meer verspakketten
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.kop {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--ruimte-4);
  margin-bottom: var(--ruimte-5);
  padding-bottom: var(--ruimte-4);
  border-bottom: 1px solid var(--kleur-rand);
}

.kop__tekst {
  margin: 0;
  max-width: 42rem;
  color: var(--kleur-tekst-zacht);
}

.kop__sortering {
  min-width: 14rem;
}

.raster {
  display: grid;
  gap: var(--ruimte-4);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 14.5rem), 1fr));
}

.meer {
  display: flex;
  justify-content: center;
  margin-top: var(--ruimte-6);
}
</style>
