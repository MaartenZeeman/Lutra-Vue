<script setup lang="ts">
import { computed, ref } from 'vue'

import { fotoDataUrl } from '@/shared/utils/image'

import type { FotoAanmaak } from '../model/verspakket'

const MAX_FOTOS = 10
const MAX_BYTES_PER_FOTO = 5 * 1024 * 1024
const MAX_BYTES_TOTAAL = 20 * 1024 * 1024

const fotos = defineModel<FotoAanmaak[]>({ required: true })

const fout = ref<string | null>(null)

const totaleBytes = computed(() =>
  fotos.value.reduce((totaal, foto) => totaal + bytesVanBase64(foto.base64Data), 0),
)

function bytesVanBase64(base64Data: string): number {
  return Math.floor((base64Data.length * 3) / 4)
}

function leesBestand(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const resultaat = reader.result
      if (typeof resultaat !== 'string') {
        reject(new Error('Het bestand kon niet worden gelezen.'))
        return
      }

      const komma = resultaat.indexOf(',')
      resolve(komma >= 0 ? resultaat.slice(komma + 1) : resultaat)
    }

    reader.onerror = () => reject(new Error('Het bestand kon niet worden gelezen.'))
    reader.readAsDataURL(file)
  })
}

async function toevoegen(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const bestanden = Array.from(input.files ?? [])
  fout.value = null

  for (const bestand of bestanden) {
    if (fotos.value.length >= MAX_FOTOS) {
      fout.value = `Je kunt maximaal ${MAX_FOTOS} foto's toevoegen.`
      break
    }

    if (bestand.size > MAX_BYTES_PER_FOTO) {
      fout.value = `“${bestand.name}” is groter dan 5 MB.`
      continue
    }

    const base64Data = await leesBestand(bestand)
    const nieuweTotaal = totaleBytes.value + bytesVanBase64(base64Data)

    if (nieuweTotaal > MAX_BYTES_TOTAAL) {
      fout.value = "De foto's zijn samen groter dan 20 MB."
      break
    }

    fotos.value = [...fotos.value, { base64Data, isMainImage: fotos.value.length === 0 }]
  }

  input.value = ''
}

function verwijderen(index: number): void {
  const verwijderd = fotos.value[index]
  const overgebleven = fotos.value.filter((_, i) => i !== index)

  if (verwijderd?.isMainImage && overgebleven.length > 0) {
    const eerste = overgebleven[0]
    if (eerste) {
      overgebleven[0] = { ...eerste, isMainImage: true }
    }
  }

  fotos.value = overgebleven
}

function alsHoofdfoto(index: number): void {
  fotos.value = fotos.value.map((foto, i) => ({ ...foto, isMainImage: i === index }))
}
</script>

<template>
  <div class="foto-kiezer">
    <div class="veld">
      <label for="foto-invoer">Foto's</label>
      <input
        id="foto-invoer"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        @change="toevoegen"
      />
      <span class="toelichting">
        Maximaal 10 foto's, 5 MB per foto en 20 MB in totaal. Kies één hoofdfoto.
      </span>
    </div>

    <p v-if="fout" class="foutmelding" role="alert">{{ fout }}</p>

    <ul v-if="fotos.length > 0" class="foto-lijst">
      <li v-for="(foto, index) in fotos" :key="index" class="foto-item">
        <img :src="fotoDataUrl(foto.base64Data)" alt="" />
        <div class="foto-item__acties">
          <label class="foto-item__hoofd">
            <input
              type="radio"
              name="hoofdfoto"
              :checked="foto.isMainImage"
              @change="alsHoofdfoto(index)"
            />
            Hoofdfoto
          </label>
          <button class="knop knop--klein knop--gevaar" type="button" @click="verwijderen(index)">
            Verwijderen
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.foto-kiezer {
  display: grid;
  gap: var(--ruimte-3);
}

.foto-lijst {
  display: grid;
  gap: var(--ruimte-3);
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.foto-item {
  display: grid;
  gap: var(--ruimte-2);
}

.foto-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 1px solid var(--kleur-rand);
  border-radius: var(--straal);
}

.foto-item__acties {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ruimte-2);
  align-items: center;
  justify-content: space-between;
}

.foto-item__hoofd {
  display: inline-flex;
  align-items: center;
  gap: var(--ruimte-1);
  font-size: 0.9rem;
}
</style>
