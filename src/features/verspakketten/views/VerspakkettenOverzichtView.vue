<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { foutmelding } from '@/shared/api/apiError'
import StatusBlok from '@/shared/components/StatusBlok.vue'
import ZoekInvoer from '@/shared/components/ZoekInvoer.vue'

import { verspakkettenApi } from '../api/verspakkettenApi'
import VerspakketKaart from '../components/VerspakketKaart.vue'
import {
  SORTEEROPTIES,
  STANDAARD_SORTERING,
  sorteeroptieSleutel,
  type Sorteeroptie,
  type VerspakketSamenvatting,
} from '../model/verspakket'

const PAGINA_GROOTTE = 12
const ZOEK_VERTRAGING = 300

const route = useRoute()
const router = useRouter()

const zoekterm = ref(typeof route.query.q === 'string' ? route.query.q : '')
const sorteerSleutel = ref(
  sorteeroptieSleutel(
    Number(route.query.veld ?? STANDAARD_SORTERING.veld),
    Number(route.query.richting ?? STANDAARD_SORTERING.richting),
  ),
)
const verspakketten = ref<VerspakketSamenvatting[]>([])
const bezig = ref(false)
const fout = ref<string | null>(null)
const heeftMeer = ref(false)

let controller: AbortController | null = null
let zoekTimer: ReturnType<typeof setTimeout> | null = null

const resultaatTekst = computed(() => {
  const aantal = verspakketten.value.length
  const term = zoekterm.value.trim()

  if (term.length > 0) {
    return aantal === 1
      ? `1 resultaat geladen voor “${term}”`
      : `${aantal} resultaten geladen voor “${term}”`
  }

  return aantal === 1 ? '1 verspakket geladen' : `${aantal} verspakketten geladen`
})

function huidigeOptie(): Sorteeroptie {
  return (
    SORTEEROPTIES.find(
      (optie) => sorteeroptieSleutel(optie.veld, optie.richting) === sorteerSleutel.value,
    ) ?? STANDAARD_SORTERING
  )
}

async function laden(reset: boolean): Promise<void> {
  controller?.abort()
  const huidigeController = new AbortController()
  controller = huidigeController

  bezig.value = true
  fout.value = null

  const optie = huidigeOptie()
  const term = zoekterm.value.trim()

  try {
    const resultaat = await verspakkettenApi.list({
      skip: reset ? 0 : verspakketten.value.length,
      take: PAGINA_GROOTTE,
      search: term.length > 0 ? term : undefined,
      sortField: optie.veld,
      sortDirection: optie.richting,
      signal: huidigeController.signal,
    })

    verspakketten.value = reset
      ? resultaat.verspakketten
      : [...verspakketten.value, ...resultaat.verspakketten]
    heeftMeer.value = resultaat.verspakketten.length === PAGINA_GROOTTE
  } catch (foutWaarde) {
    if ((foutWaarde as { name?: string }).name === 'AbortError') {
      return
    }
    fout.value = foutmelding(foutWaarde)
  } finally {
    if (controller === huidigeController) {
      bezig.value = false
    }
  }
}

function synchroniseerRoute(): void {
  const query: Record<string, string> = {}
  const term = zoekterm.value.trim()

  if (term.length > 0) {
    query.q = term
  }

  const optie = huidigeOptie()
  if (optie.veld !== STANDAARD_SORTERING.veld || optie.richting !== STANDAARD_SORTERING.richting) {
    query.veld = String(optie.veld)
    query.richting = String(optie.richting)
  }

  void router.replace({ name: 'verspakketten', query })
}

watch(sorteerSleutel, () => {
  synchroniseerRoute()
  void laden(true)
})

watch(zoekterm, () => {
  if (zoekTimer !== null) {
    clearTimeout(zoekTimer)
  }

  zoekTimer = setTimeout(() => {
    synchroniseerRoute()
    void laden(true)
  }, ZOEK_VERTRAGING)
})

watch(
  () => route.query.q,
  (waarde) => {
    const term = typeof waarde === 'string' ? waarde : ''
    if (term !== zoekterm.value) {
      zoekterm.value = term
    }
  },
)

onMounted(() => {
  void laden(true)
})

onBeforeUnmount(() => {
  controller?.abort()
  if (zoekTimer !== null) {
    clearTimeout(zoekTimer)
  }
})
</script>

<template>
  <section>
    <h1>Verspakketten</h1>

    <div class="filters kaart">
      <ZoekInvoer v-model="zoekterm" @submit="() => void laden(true)" />
      <div class="veld">
        <label for="overzicht-sortering">Sorteren op</label>
        <select id="overzicht-sortering" v-model="sorteerSleutel">
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

    <p class="resultaat" aria-live="polite">{{ resultaatTekst }}</p>

    <StatusBlok v-if="fout" soort="fout" :bericht="fout" @opnieuw="() => void laden(true)" />
    <StatusBlok v-else-if="bezig && verspakketten.length === 0" soort="laden" />
    <StatusBlok
      v-else-if="verspakketten.length === 0"
      soort="leeg"
      :bericht="
        zoekterm.trim().length > 0
          ? `Geen verspakketten gevonden voor “${zoekterm.trim()}”.`
          : 'Er zijn nog geen verspakketten toegevoegd.'
      "
    />
    <template v-else>
      <div class="raster">
        <VerspakketKaart
          v-for="verspakket in verspakketten"
          :key="verspakket.id"
          :verspakket="verspakket"
        />
      </div>

      <div v-if="heeftMeer" class="meer">
        <button class="knop" type="button" :disabled="bezig" @click="() => void laden(false)">
          {{ bezig ? 'Bezig…' : 'Meer laden' }}
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.filters {
  display: grid;
  gap: var(--ruimte-4);
  grid-template-columns: 1fr;
  padding: var(--ruimte-4);
  margin-bottom: var(--ruimte-4);
  border-color: var(--kleur-rand-sterk);
  background-color: rgba(255, 255, 255, 0.82);
}

.resultaat {
  color: var(--kleur-tekst-zacht);
  font-size: 0.92rem;
}

.raster {
  display: grid;
  gap: var(--ruimte-4);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
}

.meer {
  display: flex;
  justify-content: center;
  margin-top: var(--ruimte-6);
}

@media (min-width: 640px) {
  .filters {
    grid-template-columns: 2fr 1fr;
    align-items: end;
  }
}
</style>
