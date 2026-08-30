import React from 'react'

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { VaultUnlockAnimation } from './VaultUnlockAnimation'

describe('VaultUnlockAnimation', () => {
  it('renders a brass vault, not PearPass lime', () => {
    const { container } = render(<VaultUnlockAnimation />)
    const svg = container.querySelector('svg')
    expect(screen.getByTestId('vault-unlock-animation')).toBeInTheDocument()
    expect(svg).not.toBeNull()
    expect(/#b08d57|#d4af77/i.test(container.innerHTML)).toBe(true)
    expect(/#B0D944|#BADE5B/i.test(container.innerHTML)).toBe(false)
  })
})
