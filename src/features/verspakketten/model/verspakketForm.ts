import type {
  BeoordelingAanmaak,
  FotoAanmaak,
  IngredientAanmaak,
  VoedingswaardeAanmaak,
} from './verspakket'

/** Everything the create/edit form produces; views map it to the matching API request. */
export interface VerspakketFormUitvoer {
  naam: string
  prijsInCenten: number
  aantalPersonen: number
  supermarktId: string
  /** `null` in edit mode means the photos were left untouched. */
  fotos: FotoAanmaak[] | null
  ingredienten: IngredientAanmaak[]
  voedingswaarden: VoedingswaardeAanmaak[]
  allergenen: number[]
  beoordeling: BeoordelingAanmaak | null
}
