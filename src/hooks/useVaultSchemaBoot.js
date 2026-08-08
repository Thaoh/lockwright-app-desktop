import { useEffect, useRef, useState } from 'react'

import {
  SCHEMA_V2,
  VAULT_EXT_KEY,
  emitSchemaMigrationWarning,
  useVault
} from '@tetherto/pearpass-lib-vault'
import { pearpassVaultClient } from '@tetherto/pearpass-lib-vault/src/instances'

import { logger } from '../utils/logger'

const POLL_MS = 100
const POLL_TIMEOUT_MS = 60_000

/**
 * After vault open: wait for schema-2 migrate readiness, advertise
 * recordSchema: 2 on this device, and emit SCHEMA_MIGRATION_WARNING once
 * when no other live devices still report schema 1.
 *
 * @returns {{ isMigrationReady: boolean }}
 */
export const useVaultSchemaBoot = () => {
  const { data: activeVault, addDevice } = useVault()
  const vaultId = activeVault?.id
  const [isMigrationReady, setIsMigrationReady] = useState(!vaultId)
  const ranForVaultRef = useRef(null)
  // useVault().addDevice is not referentially stable — keep a ref.
  const addDeviceRef = useRef(addDevice)
  addDeviceRef.current = addDevice

  useEffect(() => {
    if (!vaultId) {
      setIsMigrationReady(true)
      ranForVaultRef.current = null
      return
    }

    if (ranForVaultRef.current === vaultId) {
      setIsMigrationReady(true)
      return
    }

    let cancelled = false
    setIsMigrationReady(false)

    const waitForMigration = async () => {
      const client = pearpassVaultClient
      if (typeof client?.getVaultMigrationStatus !== 'function') {
        // Older worklet / client without RPC — init already awaited migrate.
        return { ready: true, migratedToSchema: SCHEMA_V2 }
      }

      const started = Date.now()
      while (!cancelled) {
        const status = await client.getVaultMigrationStatus()
        if (
          status?.ready === true &&
          Number(status?.migratedToSchema) >= SCHEMA_V2
        ) {
          return status
        }
        if (status?.error && !status?.inProgress) {
          throw new Error(status.error)
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          throw new Error('Timed out waiting for vault schema migration')
        }
        await new Promise((r) => setTimeout(r, POLL_MS))
      }
      return null
    }

    const maybeEmitMigrationWarning = async () => {
      const vaultExt =
        (await pearpassVaultClient.activeVaultGet(VAULT_EXT_KEY)) || {}
      if (vaultExt.blockV1DeleteMirror === true) {
        return
      }

      const devices =
        (await pearpassVaultClient.activeVaultList('device/')) ?? []
      const myWriterKey =
        (await pearpassVaultClient.activeVaultGetWriterKey?.()) ?? null

      const hasOtherV1 = devices.some((device) => {
        if (!device?.id) return false
        if (myWriterKey && device.writerKey === myWriterKey) return false
        // Missing recordSchema ⇒ legacy v1 writer.
        return Number(device.recordSchema ?? 1) < SCHEMA_V2
      })

      if (!hasOtherV1) {
        await emitSchemaMigrationWarning({ vaultId })
      }
    }

    ;(async () => {
      try {
        await waitForMigration()
        if (cancelled) return

        await addDeviceRef.current()
        if (cancelled) return

        await maybeEmitMigrationWarning()
        if (cancelled) return

        ranForVaultRef.current = vaultId
        setIsMigrationReady(true)
      } catch (err) {
        logger.error('useVaultSchemaBoot failed', err)
        // Fail open so unlock/create flows are not permanently stuck.
        if (!cancelled) {
          ranForVaultRef.current = vaultId
          setIsMigrationReady(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [vaultId])

  return { isMigrationReady }
}
