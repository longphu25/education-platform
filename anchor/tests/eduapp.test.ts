import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchEduapp,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('eduapp', () => {
  let payer: KeyPairSigner
  let eduapp: KeyPairSigner

  beforeAll(async () => {
    eduapp = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize Eduapp', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getInitializeInstruction({ payer: payer, eduapp: eduapp })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSER
    const currentEduapp = await fetchEduapp(rpc, eduapp.address)
    expect(currentEduapp.data.count).toEqual(0)
  })

  it('Increment Eduapp', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({
      eduapp: eduapp.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEduapp(rpc, eduapp.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Increment Eduapp Again', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({ eduapp: eduapp.address })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEduapp(rpc, eduapp.address)
    expect(currentCount.data.count).toEqual(2)
  })

  it('Decrement Eduapp', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getDecrementInstruction({
      eduapp: eduapp.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEduapp(rpc, eduapp.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Set eduapp value', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getSetInstruction({ eduapp: eduapp.address, value: 42 })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEduapp(rpc, eduapp.address)
    expect(currentCount.data.count).toEqual(42)
  })

  it('Set close the eduapp account', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getCloseInstruction({
      payer: payer,
      eduapp: eduapp.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    try {
      await fetchEduapp(rpc, eduapp.address)
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toEqual(`Account not found at address: ${eduapp.address}`)
    }
  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}
