import { readFileSync } from 'fs'
import path from 'path'

test('in-app wordmark is the hatch plate, not PearPass lime', () => {
  const src = readFileSync(path.join(__dirname, 'index.js'), 'utf8')
  expect(src).toContain('#b08d57')
  expect(src).toContain('Lockwright')
  expect(src).not.toMatch(/#B0D944|#BADE5B/i)
})
