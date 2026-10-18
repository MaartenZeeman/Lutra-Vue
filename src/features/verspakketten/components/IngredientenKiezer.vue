<script setup lang="ts">
import { EENHEDEN, EENHEID_LABELS, Eenheid, type IngredientAanmaak } from '../model/verspakket'

const ingredienten = defineModel<IngredientAanmaak[]>({ required: true })

function toevoegen(): void {
  ingredienten.value = [
    ...ingredienten.value,
    { naam: '', hoeveelheid: 1, eenheid: Eenheid.Gram, inbegrepen: true },
  ]
}

function verwijderen(index: number): void {
  ingredienten.value = ingredienten.value.filter((_, i) => i !== index)
}

function bijwerken(index: number, veld: keyof IngredientAanmaak, waarde: unknown): void {
  ingredienten.value = ingredienten.value.map((ingredient, i) =>
    i === index ? { ...ingredient, [veld]: waarde } : ingredient,
  )
}
</script>

<template>
  <div class="ingredienten-kiezer">
    <ul v-if="ingredienten.length > 0" class="rijen">
      <li v-for="(ingredient, index) in ingredienten" :key="index" class="rij">
        <div class="veld">
          <label :for="`ingredient-naam-${index}`">Naam</label>
          <input
            :id="`ingredient-naam-${index}`"
            type="text"
            maxlength="100"
            :value="ingredient.naam"
            @input="bijwerken(index, 'naam', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="veld">
          <label :for="`ingredient-hoeveelheid-${index}`">Hoeveelheid</label>
          <input
            :id="`ingredient-hoeveelheid-${index}`"
            type="number"
            min="0.01"
            step="0.01"
            :value="ingredient.hoeveelheid"
            @input="
              bijwerken(index, 'hoeveelheid', Number(($event.target as HTMLInputElement).value))
            "
          />
        </div>
        <div class="veld">
          <label :for="`ingredient-eenheid-${index}`">Eenheid</label>
          <select
            :id="`ingredient-eenheid-${index}`"
            :value="ingredient.eenheid"
            @change="
              bijwerken(index, 'eenheid', Number(($event.target as HTMLSelectElement).value))
            "
          >
            <option v-for="eenheid in EENHEDEN" :key="eenheid" :value="eenheid">
              {{ EENHEID_LABELS[eenheid] }}
            </option>
          </select>
        </div>
        <label class="inbegrepen">
          <input
            type="checkbox"
            :checked="ingredient.inbegrepen"
            @change="bijwerken(index, 'inbegrepen', ($event.target as HTMLInputElement).checked)"
          />
          In het pakket
        </label>
        <button class="knop knop--klein knop--gevaar" type="button" @click="verwijderen(index)">
          Verwijderen
        </button>
      </li>
    </ul>
    <p v-else class="melding">Nog geen ingrediënten toegevoegd.</p>

    <div>
      <button class="knop knop--klein" type="button" @click="toevoegen">
        Ingrediënt toevoegen
      </button>
    </div>
  </div>
</template>

<style scoped>
.ingredienten-kiezer {
  display: grid;
  gap: var(--ruimte-3);
}

.rijen {
  display: grid;
  gap: var(--ruimte-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.rij {
  display: grid;
  gap: var(--ruimte-3);
  align-items: end;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  padding: var(--ruimte-3);
  border: 1px solid var(--kleur-rand);
  border-radius: var(--straal-klein);
  background-color: var(--kleur-oppervlak-zwak);
}

.inbegrepen {
  display: inline-flex;
  align-items: center;
  gap: var(--ruimte-2);
  min-height: 2.5rem;
}
</style>
