// Codama configuration for academic_chain program
import { createCodamaConfig } from './src/create-codama-config.js'

export default createCodamaConfig({
  clientJs: 'anchor/src/client/js/academic-chain',
  idl: 'target/idl/academic_chain.json',
})
