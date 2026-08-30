/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { CardCreateMasterPassword } from './index'

;(globalThis as { React?: typeof React }).React = React

const mockCreateMasterPassword = jest.fn()

jest.mock('../../../context/RouterContext', () => ({
  useRouter: () => ({ navigate: jest.fn() })
}))

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../context/LoadingContext', () => ({
  useGlobalLoading: () => undefined
}))

jest.mock('../../../electron', () => ({
  clearStaleVaultsDir: jest.fn()
}))

jest.mock('../../../utils/logger', () => ({
  logger: { log: jest.fn(), error: jest.fn() }
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useUserData: () => ({
    createMasterPassword: mockCreateMasterPassword,
    logIn: jest.fn()
  }),
  useVaults: () => ({ initVaults: jest.fn() }),
  useVault: () => ({ addDevice: jest.fn() }),
  useCreateVault: () => ({ createVault: jest.fn() })
}))

jest.mock('@tetherto/pearpass-lib-vault/src/utils/buffer', () => ({
  stringToBuffer: jest.fn(),
  clearBuffer: jest.fn()
}))

jest.mock('@tetherto/pear-apps-lib-ui-react-hooks', () => ({
  useForm: () => ({
    register: () => ({ onChange: jest.fn() }),
    handleSubmit:
      (onSubmit: (values: { password: string; passwordConfirm: string }) => void) =>
      () =>
        onSubmit({
          password: 'Qweqweqw12?!',
          passwordConfirm: 'Qweqweqw12?!'
        }),
    setErrors: jest.fn(),
    setValue: jest.fn(),
    values: {
      password: 'Qweqweqw12?!',
      passwordConfirm: 'Qweqweqw12?!'
    },
    errors: {}
  })
}))

jest.mock('@tetherto/pear-apps-utils-validator', () => ({
  Validator: {
    object: () => ({
      validate: () => ({})
    }),
    string: () => ({
      required: () => ({})
    })
  }
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  rawTokens: new Proxy({}, { get: () => 0 }),
  AlertMessage: () => null,
  Button: ({
    children,
    onClick,
    type,
    testID,
    'data-testid': dataTestId
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit'
    testID?: string
    'data-testid'?: string
  }) => (
    <button type={type} data-testid={dataTestId || testID} onClick={onClick}>
      {children}
    </button>
  ),
  Dialog: ({
    open,
    children,
    footer,
    testID
  }: {
    open?: boolean
    children?: React.ReactNode
    footer?: React.ReactNode
    testID?: string
  }) =>
    open ? (
      <div data-testid={testID}>
        {children}
        {footer}
      </div>
    ) : null,
  Form: ({
    children,
    onSubmit
  }: {
    children: React.ReactNode
    onSubmit?: React.FormEventHandler
  }) => <form onSubmit={onSubmit}>{children}</form>,
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  PasswordField: ({ testID }: { testID?: string }) => (
    <input data-testid={testID} />
  ),
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  useTheme: () => ({
    theme: {
      colors: {
        colorSurfacePrimary: '#111',
        colorTextPrimary: '#eee',
        colorTextSecondary: '#aaa',
        colorTextTertiary: '#888',
        colorLinkText: '#b0d944'
      }
    }
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  KeyboardArrowRightFilled: () => null
}))

describe('CardCreateMasterPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ticks accept rules the password already meets', () => {
    render(<CardCreateMasterPassword />)

    expect(screen.getByTestId('password-accept-checklist')).toBeInTheDocument()
    expect(screen.getByTestId('password-accept-rule-minLength')).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByTestId('password-accept-rule-hasSymbols')).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  it('does not create the vault until the lost-password warning is confirmed', () => {
    render(<CardCreateMasterPassword />)

    expect(screen.queryByTestId('lost-password-dialog')).not.toBeInTheDocument()

    fireEvent.submit(
      screen.getByTestId('create-master-password-continue').closest('form')!
    )

    expect(mockCreateMasterPassword).not.toHaveBeenCalled()
    expect(screen.getByTestId('lost-password-dialog')).toBeInTheDocument()
  })
})
