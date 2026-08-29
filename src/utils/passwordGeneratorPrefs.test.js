import {
  DEFAULT_CHARACTER_COUNT,
  PASSWORD_GENERATOR_CHARACTERS_KEY,
  loadLastCharacterCount,
  saveLastCharacterCount
} from './passwordGeneratorPrefs'

describe('passwordGeneratorPrefs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the default when nothing is stored', () => {
    expect(loadLastCharacterCount()).toBe(DEFAULT_CHARACTER_COUNT)
    expect(DEFAULT_CHARACTER_COUNT).toBe(20)
  })

  it('round-trips a saved character count on this device', () => {
    saveLastCharacterCount(36)
    expect(localStorage.getItem(PASSWORD_GENERATOR_CHARACTERS_KEY)).toBe('36')
    expect(loadLastCharacterCount()).toBe(36)
  })

  it('clamps stored junk, underflow, and overflow', () => {
    localStorage.setItem(PASSWORD_GENERATOR_CHARACTERS_KEY, 'nope')
    expect(loadLastCharacterCount()).toBe(20)

    saveLastCharacterCount(2)
    expect(loadLastCharacterCount()).toBe(4)

    saveLastCharacterCount(99999)
    expect(loadLastCharacterCount()).toBe(4096)
  })
})
