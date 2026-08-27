import { VaultHandlers } from './VaultHandlers.js'

describe('VaultHandlers file commands', () => {
  it('returns base64 file bytes from activeVaultGetFile', async () => {
    const client = {
      activeVaultGetFile: jest.fn().mockResolvedValue(Buffer.from('hi'))
    }
    const handlers = new VaultHandlers(client)

    await expect(
      handlers.activeVaultGetFile({ key: 'record-v2/r/file/f' })
    ).resolves.toEqual({
      encoding: 'base64',
      data: Buffer.from('hi').toString('base64')
    })
    expect(client.activeVaultGetFile).toHaveBeenCalledWith('record-v2/r/file/f')
  })

  it('decodes base64 and calls activeVaultAddFile', async () => {
    const client = {
      activeVaultAddFile: jest.fn().mockResolvedValue(undefined)
    }
    const handlers = new VaultHandlers(client)

    await expect(
      handlers.activeVaultAddFile({
        key: 'record-v2/r/file/f',
        data: {
          encoding: 'base64',
          data: Buffer.from('hi').toString('base64')
        },
        name: 'note.txt'
      })
    ).resolves.toEqual({ success: true })

    expect(client.activeVaultAddFile).toHaveBeenCalledWith(
      'record-v2/r/file/f',
      Buffer.from('hi'),
      'note.txt'
    )
  })
})
