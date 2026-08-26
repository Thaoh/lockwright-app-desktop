/* eslint-env jest */

const { formatDisplayVersion } = require('./formatDisplayVersion.cjs')

describe('formatDisplayVersion', () => {
  it('is X.Y.Z plus first 6 hex of that app git sha', () => {
    expect(formatDisplayVersion('0.0.1', 'abcdef1234')).toBe('0.0.1-abcdef')
  })

  it('uses unknown when the sha is missing', () => {
    expect(formatDisplayVersion('0.0.1', '')).toBe('0.0.1-unknown')
  })
})
