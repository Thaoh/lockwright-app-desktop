import { CHROMIUM_EXTENSION_ID } from '@tetherto/pearpass-lib-constants'

import {
  formatChromiumExtensionIdsText,
  getChromiumExtensionIds,
  isValidChromiumExtensionId,
  parseChromiumExtensionIdsText,
  setChromiumExtensionIds
} from './chromiumExtensionAllowlist'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

const VALID_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const VALID_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

describe('chromiumExtensionAllowlist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('isValidChromiumExtensionId', () => {
    it('accepts 32-char a-p ids', () => {
      expect(isValidChromiumExtensionId(VALID_A)).toBe(true)
      expect(isValidChromiumExtensionId(CHROMIUM_EXTENSION_ID)).toBe(true)
    })

    it('rejects invalid ids', () => {
      expect(isValidChromiumExtensionId('')).toBe(false)
      expect(isValidChromiumExtensionId('short')).toBe(false)
      expect(
        isValidChromiumExtensionId('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
      ).toBe(false)
      expect(isValidChromiumExtensionId(null)).toBe(false)
    })
  })

  describe('parseChromiumExtensionIdsText', () => {
    it('splits on commas, whitespace, and newlines', () => {
      expect(
        parseChromiumExtensionIdsText(`${VALID_A}, ${VALID_B}\n${VALID_A}`)
      ).toEqual([VALID_A, VALID_B, VALID_A])
    })
  })

  describe('getChromiumExtensionIds', () => {
    it('returns the shipped default when nothing is stored', () => {
      expect(getChromiumExtensionIds()).toEqual([CHROMIUM_EXTENSION_ID])
    })

    it('reads the allowlist JSON key', () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CHROMIUM_EXTENSION_ALLOWLIST,
        JSON.stringify([VALID_A, VALID_B])
      )
      expect(getChromiumExtensionIds()).toEqual([VALID_A, VALID_B])
    })

    it('falls back to legacy CHROMIUM_EXTENSION_ID', () => {
      localStorage.setItem('CHROMIUM_EXTENSION_ID', VALID_A)
      expect(getChromiumExtensionIds()).toEqual([VALID_A])
    })
  })

  describe('setChromiumExtensionIds', () => {
    it('persists valid ids and mirrors the first into the legacy key', () => {
      const result = setChromiumExtensionIds([VALID_B, VALID_A, VALID_B])
      expect(result).toEqual({ ok: true, ids: [VALID_B, VALID_A] })
      expect(
        JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.CHROMIUM_EXTENSION_ALLOWLIST)
        )
      ).toEqual([VALID_B, VALID_A])
      expect(localStorage.getItem('CHROMIUM_EXTENSION_ID')).toBe(VALID_B)
      expect(getChromiumExtensionIds()).toEqual([VALID_B, VALID_A])
    })

    it('rejects empty and invalid lists', () => {
      expect(setChromiumExtensionIds([])).toMatchObject({ ok: false })
      expect(setChromiumExtensionIds(['not-an-id'])).toMatchObject({
        ok: false
      })
      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.CHROMIUM_EXTENSION_ALLOWLIST)
      ).toBeNull()
    })
  })

  describe('formatChromiumExtensionIdsText', () => {
    it('joins with newlines', () => {
      expect(formatChromiumExtensionIdsText([VALID_A, VALID_B])).toBe(
        `${VALID_A}\n${VALID_B}`
      )
    })
  })
})
