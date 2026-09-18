import type { components } from '@/shared/api/generated/schema'

type Schemas = components['schemas']

export type VerspakketSamenvatting = Schemas['VerspakketSummary']
export type Verspakket = Schemas['Verspakket']
export type VerspakketFoto = Schemas['VerspakketFotoResponse']
export type Ingredient = Schemas['Ingredient']
export type Voedingswaarde = Schemas['Voedingswaarde']
export type Beoordeling = Schemas['Beoordeling']
export type Supermarkt = Schemas['Supermarkt']

export type VerspakketAanmaak = Schemas['CreateVerspakketRequest']
export type VerspakketUpdate = Schemas['UpdateVerspakketRequest']
export type BeoordelingAanmaak = Schemas['AddBeoordelingRequest']
export type FotoAanmaak = Schemas['VerspakketFotoRequest']
export type IngredientAanmaak = Schemas['IngredientRequest']
export type VoedingswaardeAanmaak = Schemas['VoedingswaardeRequest']
export type SupermarktAanmaak = Schemas['SupermarktRequest']
export type VerspakketImport = Schemas['ImportVerspakketRequest']
export type ImportResultaat = Schemas['EnqueueImportVerspakketResponse']
export type BackgroundCommand = Schemas['GetBackgroundCommandResponse']
export type ProblemDetails = Schemas['ProblemDetails']
