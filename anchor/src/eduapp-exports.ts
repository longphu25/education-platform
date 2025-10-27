// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Eduapp, EDUAPP_DISCRIMINATOR, EDUAPP_PROGRAM_ADDRESS, getEduappDecoder } from './client/js'
import EduappIDL from '../target/idl/eduapp.json'

export type EduappAccount = Account<Eduapp, string>

// Re-export the generated IDL and type
export { EduappIDL }

export * from './client/js'

export function getEduappProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getEduappDecoder(),
    filter: getBase58Decoder().decode(EDUAPP_DISCRIMINATOR),
    programAddress: EDUAPP_PROGRAM_ADDRESS,
  })
}
