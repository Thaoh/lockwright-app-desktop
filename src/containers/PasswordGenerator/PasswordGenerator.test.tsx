import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

type HistoryEntry = {
  id: string
  value: string
  createdAt: number
  contextLabel?: string
  contextKind?: string
  usedAt?: number
}

const mockAppendHistory = jest.fn(
  async (_value?: string): Promise<HistoryEntry[]> => []
)
const mockClearHistory = jest.fn(async (): Promise<HistoryEntry[]> => [])
const mockLoadHistory = jest.fn(async (): Promise<HistoryEntry[]> => [])
const mockCopyToClipboard = jest.fn()
const mockMarkHistoryUsed = jest.fn()
const mockGeneratePassword = jest.fn(
  (_length?: number, _rules?: Record<string, boolean>) => 'Abcdef1!'
)

jest.mock('@tetherto/pearpass-utils-password-generator', () => ({
  generatePassword: (length: number, rules?: Record<string, boolean>) =>
    mockGeneratePassword(length, rules),
  generatePassphrase: () => ['word', 'list', 'here']
}))

jest.mock('@tetherto/pearpass-utils-password-check', () => ({
  checkPasswordStrength: () => ({ type: 'safe' }),
  checkPassphraseStrength: () => ({ type: 'safe' })
}))

jest.mock('../../utils/passwordGeneratorHistory', () => ({
  appendHistory: (value: string) => mockAppendHistory(value),
  clearHistory: () => mockClearHistory(),
  loadHistory: () => mockLoadHistory(),
  markHistoryUsed: (value: string, context?: unknown) =>
    mockMarkHistoryUsed(value, context)
}))

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (s: string) => s })
}))

jest.mock('../../hooks/useCopyToClipboard.electron', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: mockCopyToClipboard })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const React = require('react')
  return {
    useTheme: () => ({
      theme: {
        colors: {
          colorTextSecondary: '#888',
          colorTextTertiary: '#666',
          colorPrimary: '#0a0',
          colorBorderPrimary: '#333'
        }
      }
    }),
    rawTokens: new Proxy({}, { get: () => 0 }),
    Button: ({
      children,
      onClick,
      'data-testid': dataTestId,
      'aria-label': ariaLabel
    }: {
      children?: React.ReactNode
      onClick?: () => void
      'data-testid'?: string
      'aria-label'?: string
      [key: string]: unknown
    }) =>
      React.createElement(
        'button',
        {
          type: 'button',
          onClick,
          'data-testid': dataTestId,
          'aria-label': ariaLabel
        },
        children
      ),
    Text: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('span', null, children),
    Title: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('h3', null, children),
    PasswordIndicator: () =>
      React.createElement('div', { 'data-testid': 'password-indicator' }),
    Radio: ({
      options,
      onChange
    }: {
      options: Array<{ value: string; label: string }>
      onChange?: (value: string) => void
    }) =>
      React.createElement(
        'div',
        null,
        options.map((option) =>
          React.createElement(
            'button',
            {
              key: option.value,
              type: 'button',
              onClick: () => onChange?.(option.value)
            },
            option.label
          )
        )
      ),
    Slider: () => React.createElement('input', { type: 'range' }),
    ToggleSwitch: ({
      checked,
      onChange,
      'aria-label': ariaLabel
    }: {
      checked?: boolean
      onChange?: (next: boolean) => void
      'aria-label'?: string
    }) =>
      React.createElement('input', {
        type: 'checkbox',
        'aria-label': ariaLabel,
        checked: !!checked,
        onChange: (e: { target: { checked: boolean } }) =>
          onChange?.(e.target.checked)
      })
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  ContentCopy: () => null
}))

import { PasswordGenerator } from './PasswordGenerator'

describe('PasswordGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAppendHistory.mockResolvedValue([
      { id: 'gen-1', value: 'Abcdef1!', createdAt: 2000 },
      {
        id: 'used-1',
        value: 'old-labeled',
        createdAt: 1000,
        contextLabel: 'example.com',
        contextKind: 'site',
        usedAt: 1500
      },
      { id: 'old-1', value: 'old-unlabeled', createdAt: 500 }
    ])
    mockClearHistory.mockResolvedValue([])
    mockLoadHistory.mockResolvedValue([])
    mockGeneratePassword.mockClear()
    mockGeneratePassword.mockReturnValue('Abcdef1!')
  })

  it('appends the generated password as an unlabeled history entry', async () => {
    render(<PasswordGenerator />)

    await waitFor(() => {
      expect(mockAppendHistory).toHaveBeenCalledWith('Abcdef1!')
    })
    expect(mockMarkHistoryUsed).not.toHaveBeenCalled()
  })

  it('renders history values and shows contextLabel when set', async () => {
    render(<PasswordGenerator />)

    expect(await screen.findByText('old-labeled')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText('old-unlabeled')).toBeInTheDocument()
  })

  it('clears history when Clear history is clicked', async () => {
    render(<PasswordGenerator />)

    expect(await screen.findByText('old-labeled')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('password-generator-clear-history'))

    await waitFor(() => {
      expect(mockClearHistory).toHaveBeenCalledTimes(1)
    })
    expect(await screen.findByText('No generated passwords yet')).toBeInTheDocument()
  })

  it('copies a history row without marking it used', async () => {
    render(<PasswordGenerator />)

    const copyButton = await screen.findByTestId(
      'password-generator-history-copy-used-1'
    )
    fireEvent.click(copyButton)

    expect(mockCopyToClipboard).toHaveBeenCalledWith('old-labeled')
    expect(mockMarkHistoryUsed).not.toHaveBeenCalled()
  })

  it('shows random-mode charset toggles, all on by default', () => {
    render(<PasswordGenerator />)

    expect(screen.getByLabelText('Capital letters')).toBeChecked()
    expect(screen.getByLabelText('Lowercase letters')).toBeChecked()
    expect(screen.getByLabelText('Numbers')).toBeChecked()
    expect(screen.getByLabelText('Special character (!&*)')).toBeChecked()
    expect(mockGeneratePassword).toHaveBeenCalledWith(
      20,
      expect.objectContaining({
        upperCase: true,
        lowerCase: true,
        numbers: true,
        includeSpecialChars: true
      })
    )
  })

  it('passes turned-off capital, lowercase, and numeric sets into generatePassword', () => {
    render(<PasswordGenerator />)
    mockGeneratePassword.mockClear()

    fireEvent.click(screen.getByLabelText('Capital letters'))
    expect(mockGeneratePassword).toHaveBeenLastCalledWith(
      20,
      expect.objectContaining({ upperCase: false, lowerCase: true })
    )

    fireEvent.click(screen.getByLabelText('Lowercase letters'))
    expect(mockGeneratePassword).toHaveBeenLastCalledWith(
      20,
      expect.objectContaining({ lowerCase: false, numbers: true })
    )

    fireEvent.click(screen.getByLabelText('Numbers'))
    expect(mockGeneratePassword).toHaveBeenLastCalledWith(
      20,
      expect.objectContaining({
        upperCase: false,
        lowerCase: false,
        numbers: false,
        includeSpecialChars: true
      })
    )
  })

  it('keeps the last remaining charset on so generation cannot run with an empty set', () => {
    render(<PasswordGenerator />)

    fireEvent.click(screen.getByLabelText('Capital letters'))
    fireEvent.click(screen.getByLabelText('Lowercase letters'))
    fireEvent.click(screen.getByLabelText('Numbers'))
    mockGeneratePassword.mockClear()

    fireEvent.click(screen.getByLabelText('Special character (!&*)'))

    expect(screen.getByLabelText('Special character (!&*)')).toBeChecked()
    expect(mockGeneratePassword).not.toHaveBeenCalled()
  })
})
