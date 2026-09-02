const { nextBackgroundSize } = require('./backgroundSize')

describe('nextBackgroundSize', () => {
  it('keeps the previous object when width and height did not change', () => {
    const prev = { width: 1440, height: 1024 }
    expect(nextBackgroundSize(prev, { width: 1440, height: 1024 })).toBe(prev)
  })

  it('returns the next size when the viewport actually changed', () => {
    const prev = { width: 1440, height: 1024 }
    const next = { width: 1280, height: 800 }
    expect(nextBackgroundSize(prev, next)).toEqual(next)
  })
})
