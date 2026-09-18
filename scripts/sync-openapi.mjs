import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destination = resolve(projectRoot, 'openapi/lutra-v1.json')
const source =
  process.env.LUTRA_OPENAPI_SOURCE ??
  resolve(projectRoot, '../lutra-API/Lutra/Lutra.API/OpenApi/lutra-v1.json')

if (!existsSync(source)) {
  console.error(`OpenAPI contract niet gevonden op ${source}.`)
  console.error(
    'Bouw eerst de API (dotnet build Lutra.API/Lutra.API.csproj) of stel LUTRA_OPENAPI_SOURCE in.',
  )
  process.exit(1)
}

mkdirSync(dirname(destination), { recursive: true })
copyFileSync(source, destination)
console.log(`OpenAPI-contract gesynchroniseerd naar openapi/lutra-v1.json`)
