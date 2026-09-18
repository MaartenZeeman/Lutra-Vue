<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ApiError, foutmelding } from '@/shared/api/apiError'
import StatusBlok from '@/shared/components/StatusBlok.vue'

import { backgroundCommandsApi } from '@/features/background-commands/api/backgroundCommandsApi'
import {
  BACKGROUND_COMMAND_STATUS_LABELS,
  BackgroundCommandStatus,
  isTerminaleStatus,
  type BackgroundCommand,
} from '@/features/background-commands/model/backgroundCommand'

import { verspakkettenApi } from '../api/verspakkettenApi'

const POLL_INTERVALO = 3000

const route = useRoute()
const router = useRouter()

const url = ref('')
const bezig = ref(false)
const fout = ref<string | null>(null)
const job = ref<BackgroundCommand | null>(null)
const gestart = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

const statusLabel = computed(() => {
  if (job.value === null) {
    return null
  }

  return (
    BACKGROUND_COMMAND_STATUS_LABELS[job.value.status as BackgroundCommandStatus] ??
    'Onbekende status'
  )
})

const isKlaar = computed(
  () => job.value !== null && job.value.status === BackgroundCommandStatus.Succeeded,
)

const isMislukt = computed(
  () => job.value !== null && job.value.status === BackgroundCommandStatus.Failed,
)

function stopPolling(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

async function poll(id: string): Promise<void> {
  try {
    const resultaat = await backgroundCommandsApi.getById(id)
    job.value = resultaat

    if (isTerminaleStatus(resultaat.status)) {
      stopPolling()
    }
  } catch (foutWaarde) {
    fout.value = foutmelding(foutWaarde)
    stopPolling()
  }
}

function startPolling(id: string): void {
  stopPolling()
  void poll(id)
  timer = setInterval(() => {
    void poll(id)
  }, POLL_INTERVALO)
}

async function importeren(): Promise<void> {
  const waarde = url.value.trim()

  if (waarde.length === 0) {
    fout.value = 'Vul de URL van een productpagina in.'
    return
  }

  bezig.value = true
  fout.value = null
  job.value = null
  gestart.value = true

  try {
    const resultaat = await verspakkettenApi.importFromUrl(waarde)
    await router.replace({ name: 'verspakket-importeren', query: { job: resultaat.id } })
    startPolling(resultaat.id)
  } catch (foutWaarde) {
    if (foutWaarde instanceof ApiError && foutWaarde.status === 429) {
      fout.value = 'Er worden te veel imports aangevraagd. Probeer het over een minuut opnieuw.'
    } else {
      fout.value = foutmelding(foutWaarde)
    }
  } finally {
    bezig.value = false
  }
}

onMounted(() => {
  const jobId = route.query.job

  if (typeof jobId === 'string' && jobId.length > 0) {
    gestart.value = true
    startPolling(jobId)
  }
})

onBeforeUnmount(stopPolling)
</script>

<template>
  <section class="pagina">
    <h1>Verspakket importeren</h1>
    <p class="intro">
      Plak de URL van een productpagina van een supermarkt. Lutra haalt de gegevens op en zet ze om
      in een verspakket. Dit gebeurt op de achtergrond, je kunt het hier volgen.
    </p>

    <form class="kaart import-form" @submit.prevent="importeren">
      <div class="veld">
        <label for="import-url">Product-URL</label>
        <input
          id="import-url"
          v-model="url"
          type="url"
          required
          placeholder="https://www.example.nl/product/…"
        />
      </div>
      <div>
        <button class="knop knop--primair" type="submit" :disabled="bezig">
          {{ bezig ? 'Bezig…' : 'Importeren' }}
        </button>
      </div>
    </form>

    <p v-if="fout" class="foutmelding" role="alert">{{ fout }}</p>

    <div v-if="gestart" class="kaart status" aria-live="polite">
      <h2>Importstatus</h2>

      <StatusBlok v-if="job === null && !fout" soort="laden" />

      <template v-else-if="job">
        <p class="status__regel">
          <span class="badge">{{ statusLabel }}</span>
          <span>Pogingen: {{ job.attemptCount }}</span>
        </p>

        <p v-if="isKlaar && job.resultVerspakketId" class="melding melding--succes">
          Het verspakket is geïmporteerd.
          <RouterLink :to="{ name: 'verspakket-detail', params: { id: job.resultVerspakketId } }">
            Bekijk het resultaat
          </RouterLink>
        </p>

        <p v-else-if="isMislukt" class="foutmelding">
          <span>De import is mislukt.{{ job.lastError ? ` ${job.lastError}` : '' }}</span>
        </p>

        <p v-else-if="!isTerminaleStatus(job.status)" class="melding">
          De import wordt op de achtergrond uitgevoerd. Dit kan even duren.
        </p>
      </template>
    </div>
  </section>
</template>

<style scoped>
.pagina {
  max-width: 46rem;
}

.intro {
  color: var(--kleur-tekst-zacht);
}

.import-form {
  display: grid;
  gap: var(--ruimte-4);
  padding: var(--ruimte-4);
  margin-bottom: var(--ruimte-4);
}

.status {
  display: grid;
  gap: var(--ruimte-3);
  padding: var(--ruimte-4);
}

.status h2 {
  margin: 0;
  font-size: 1.1rem;
}

.status__regel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ruimte-3);
  margin: 0;
  color: var(--kleur-tekst-zacht);
}
</style>
