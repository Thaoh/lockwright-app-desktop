import React, { useEffect, useMemo, useRef, useState } from 'react'

import {
  checkPassphraseStrength,
  checkPasswordStrength
} from '@tetherto/pearpass-utils-password-check'
import {
  generatePassphrase,
  generatePassword
} from '@tetherto/pearpass-utils-password-generator'
import {
  Button,
  PasswordIndicator,
  Radio,
  Slider,
  Text,
  Title,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import type { PasswordIndicatorVariant } from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './PasswordGenerator.styles'
import { useTranslation } from '../../hooks/useTranslation'
// @ts-ignore - JS module without type declarations
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.electron'
import { PassType } from '../../shared/types'
import {
  appendHistory,
  clearHistory,
  loadHistory
} from '../../utils/passwordGeneratorHistory'

const PASSWORD_OPTIONS = {
  password: 'password',
  passphrase: 'passphrase'
} as const

type PasswordOption = (typeof PASSWORD_OPTIONS)[keyof typeof PASSWORD_OPTIONS]

const PASSWORD_CHARSET_KEYS = [
  'capitalLetters',
  'lowercaseLetters',
  'numbers',
  'specialCharacters'
] as const

type PasswordCharsetKey = (typeof PASSWORD_CHARSET_KEYS)[number]

type PasswordRules = {
  specialCharacters: boolean
  capitalLetters: boolean
  lowercaseLetters: boolean
  numbers: boolean
  characters: number
}

type PassphraseRules = {
  capitalLetters: boolean
  symbols: boolean
  numbers: boolean
  words: number
}

type HistoryEntry = {
  id: string
  value: string
  createdAt: number
  contextLabel?: string
  contextKind?: 'site' | 'entry'
  usedAt?: number
}

const HISTORY_DISPLAY_LIMIT = 20

const STRENGTH_TO_INDICATOR: Record<string, PasswordIndicatorVariant> = {
  vulnerable: 'vulnerable',
  weak: 'decent',
  safe: 'strong'
}

const renderHighlightedPassword = (
  text: string,
  primaryColor: string,
  secondaryColor: string
) => {
  const parts = text.split(/(\d+|[^a-zA-Z\d\s])/g)

  return parts.map((part, index) => {
    if (!part) return null

    if (/^\d+$/.test(part)) {
      return (
        <span key={`${part}-${index}`} style={{ color: primaryColor }}>
          {part}
        </span>
      )
    }

    if (/[^a-zA-Z\d\s]/.test(part)) {
      return (
        <span key={`${part}-${index}`} style={{ color: secondaryColor }}>
          {part}
        </span>
      )
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

export type PasswordGeneratorProps = {
  onGeneratedChange?: (value: string, type: PassType) => void
}

export const PasswordGenerator = ({
  onGeneratedChange
}: PasswordGeneratorProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { copyToClipboard } = useCopyToClipboard()

  const [selectedOption, setSelectedOption] = useState<PasswordOption>(
    PASSWORD_OPTIONS.password
  )
  const [selectedRules, setSelectedRules] = useState<{
    password: PasswordRules
    passphrase: PassphraseRules
  }>({
    password: {
      specialCharacters: true,
      capitalLetters: true,
      lowercaseLetters: true,
      numbers: true,
      characters: 20
    },
    passphrase: {
      capitalLetters: true,
      symbols: true,
      numbers: true,
      words: 8
    }
  })
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const generatedValue = useMemo(() => {
    if (selectedOption === PASSWORD_OPTIONS.passphrase) {
      return (
        generatePassphrase(
          selectedRules.passphrase.capitalLetters,
          selectedRules.passphrase.symbols,
          selectedRules.passphrase.numbers,
          selectedRules.passphrase.words
        ) as string[]
      ).join('-')
    }

    return generatePassword(selectedRules.password.characters, {
      includeSpecialChars: selectedRules.password.specialCharacters,
      lowerCase: selectedRules.password.lowercaseLetters,
      upperCase: selectedRules.password.capitalLetters,
      numbers: selectedRules.password.numbers
    }) as string
  }, [selectedOption, selectedRules])

  const passType =
    selectedOption === PASSWORD_OPTIONS.passphrase
      ? PassType.PassPhrase
      : PassType.Password

  const onGeneratedChangeRef = useRef(onGeneratedChange)
  onGeneratedChangeRef.current = onGeneratedChange

  useEffect(() => {
    onGeneratedChangeRef.current?.(generatedValue, passType)
  }, [generatedValue, passType])

  useEffect(() => {
    if (!generatedValue) return
    let cancelled = false
    void appendHistory(generatedValue)
      .then((entries) => {
        if (!cancelled) setHistory(entries as HistoryEntry[])
      })
      .catch(() => {
        if (!cancelled) {
          void loadHistory()
            .then((entries) => {
              if (!cancelled) setHistory(entries as HistoryEntry[])
            })
            .catch(() => {
              if (!cancelled) setHistory([])
            })
        }
      })
    return () => {
      cancelled = true
    }
  }, [generatedValue])

  const strength = useMemo(() => {
    if (selectedOption === PASSWORD_OPTIONS.passphrase) {
      return checkPassphraseStrength(generatedValue.split('-'))
    }
    return checkPasswordStrength(generatedValue)
  }, [generatedValue, selectedOption])

  const indicatorVariant: PasswordIndicatorVariant =
    STRENGTH_TO_INDICATOR[(strength as { type: string }).type] ?? 'vulnerable'

  const isAllPassphraseRulesSelected =
    selectedRules.passphrase.capitalLetters &&
    selectedRules.passphrase.symbols &&
    selectedRules.passphrase.numbers

  const handlePasswordRuleChange = (
    key: keyof PasswordRules,
    value: boolean | number
  ) => {
    setSelectedRules((prev) => {
      if (
        value === false &&
        PASSWORD_CHARSET_KEYS.includes(key as PasswordCharsetKey)
      ) {
        const othersOn = PASSWORD_CHARSET_KEYS.some(
          (charsetKey) => charsetKey !== key && prev.password[charsetKey]
        )
        if (!othersOn) return prev
      }

      return {
        ...prev,
        password: { ...prev.password, [key]: value }
      }
    })
  }

  const handlePassphraseRuleChange = (
    key: keyof PassphraseRules,
    value: boolean | number
  ) => {
    setSelectedRules((prev) => ({
      ...prev,
      passphrase: { ...prev.passphrase, [key]: value }
    }))
  }

  const setAllPassphraseToggles = (on: boolean) => {
    setSelectedRules((prev) => ({
      ...prev,
      passphrase: {
        ...prev.passphrase,
        capitalLetters: on,
        symbols: on,
        numbers: on
      }
    }))
  }

  const passwordCharsetRules: {
    key: PasswordCharsetKey
    label: string
    value: boolean
  }[] = [
    {
      key: 'capitalLetters',
      label: t('Capital letters'),
      value: selectedRules.password.capitalLetters
    },
    {
      key: 'lowercaseLetters',
      label: t('Lowercase letters'),
      value: selectedRules.password.lowercaseLetters
    },
    {
      key: 'numbers',
      label: t('Numbers'),
      value: selectedRules.password.numbers
    },
    {
      key: 'specialCharacters',
      label: t('Special character (!&*)'),
      value: selectedRules.password.specialCharacters
    }
  ]

  const passphraseRules: {
    key: 'all' | keyof PassphraseRules
    label: string
    value: boolean
    onChange: (next: boolean) => void
  }[] = [
    {
      key: 'all',
      label: t('Select all'),
      value: isAllPassphraseRulesSelected,
      onChange: setAllPassphraseToggles
    },
    {
      key: 'capitalLetters',
      label: t('Capital letters'),
      value: selectedRules.passphrase.capitalLetters,
      onChange: (next) => handlePassphraseRuleChange('capitalLetters', next)
    },
    {
      key: 'symbols',
      label: t('Symbols'),
      value: selectedRules.passphrase.symbols,
      onChange: (next) => handlePassphraseRuleChange('symbols', next)
    },
    {
      key: 'numbers',
      label: t('Numbers'),
      value: selectedRules.passphrase.numbers,
      onChange: (next) => handlePassphraseRuleChange('numbers', next)
    }
  ]

  const visibleHistory = history.slice(0, HISTORY_DISPLAY_LIMIT)

  const handleClearHistory = () => {
    void clearHistory()
      .then((entries) => setHistory(entries as HistoryEntry[]))
      .catch(() => setHistory([]))
  }

  return (
    <div style={styles.body} data-testid="password-generator">
      <div style={styles.section}>
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t('Generated Password')}
        </Text>

        <div style={styles.groupedCard}>
          <div style={styles.generatedPasswordBlock}>
            <Title as="h3">
              {renderHighlightedPassword(
                generatedValue,
                theme.colors.colorPrimary,
                theme.colors.colorTextSecondary
              )}
            </Title>
            <PasswordIndicator variant={indicatorVariant} />
          </div>

          {[
            {
              key: PASSWORD_OPTIONS.passphrase,
              label: t('Memorable Password'),
              description: t(
                'Memorable password using random words, numbers, and symbols.'
              )
            },
            {
              key: PASSWORD_OPTIONS.password,
              label: t('Random Characters'),
              description: t(
                'A fully random mix of letters, numbers, and symbols.'
              )
            }
          ].map((option, index, options) => (
            <div
              key={option.key}
              onClick={() => setSelectedOption(option.key)}
              style={{
                ...styles.optionRow,
                ...(index < options.length - 1 ? styles.optionRowDivider : {})
              }}
            >
              <Radio
                builtIn
                options={[
                  {
                    value: option.key,
                    label: option.label,
                    description: option.description
                  }
                ]}
                value={selectedOption === option.key ? option.key : undefined}
                onChange={() => setSelectedOption(option.key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t('Password Length')}
        </Text>

        <div style={styles.singleRowCard}>
          <div style={styles.sliderRow}>
            <div style={styles.sliderLabel}>
              <Text variant="labelEmphasized">
                {selectedOption === PASSWORD_OPTIONS.passphrase
                  ? `${selectedRules.passphrase.words} ${t('Words')}`
                  : `${selectedRules.password.characters} ${t('Chars')}`}
              </Text>
            </div>

            <div style={styles.slider}>
              <Slider
                minimumValue={
                  selectedOption === PASSWORD_OPTIONS.passphrase ? 6 : 4
                }
                maximumValue={
                  selectedOption === PASSWORD_OPTIONS.passphrase ? 36 : 50
                }
                step={1}
                value={
                  selectedOption === PASSWORD_OPTIONS.passphrase
                    ? selectedRules.passphrase.words
                    : selectedRules.password.characters
                }
                onValueChange={(value: number) => {
                  if (selectedOption === PASSWORD_OPTIONS.passphrase) {
                    handlePassphraseRuleChange('words', Math.round(value))
                    return
                  }
                  handlePasswordRuleChange('characters', Math.round(value))
                }}
                aria-label={
                  selectedOption === PASSWORD_OPTIONS.passphrase
                    ? t('Password length in words')
                    : t('Password length in characters')
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t('Password settings')}
        </Text>

        <div style={styles.groupedCard}>
          {selectedOption === PASSWORD_OPTIONS.passphrase ? (
            passphraseRules.map((rule, index, rules) => (
              <div
                key={rule.key}
                style={{
                  ...styles.settingRow,
                  ...(index < rules.length - 1 ? styles.optionRowDivider : {})
                }}
              >
                <Text variant="bodyEmphasized">{rule.label}</Text>
                <ToggleSwitch
                  checked={rule.value}
                  onChange={rule.onChange}
                  aria-label={rule.label}
                />
              </div>
            ))
          ) : (
            passwordCharsetRules.map((rule, index, rules) => (
              <div
                key={rule.key}
                style={{
                  ...styles.settingRow,
                  ...(index < rules.length - 1 ? styles.optionRowDivider : {})
                }}
              >
                <Text variant="bodyEmphasized">{rule.label}</Text>
                <ToggleSwitch
                  checked={rule.value}
                  onChange={(next) =>
                    handlePasswordRuleChange(rule.key, next)
                  }
                  aria-label={rule.label}
                  data-testid={`password-generator-setting-${rule.key}`}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.historyHeader}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('History')}
          </Text>
          {history.length > 0 && (
            <Button
              variant="tertiary"
              size="small"
              type="button"
              onClick={handleClearHistory}
              data-testid="password-generator-clear-history"
            >
              {t('Clear history')}
            </Button>
          )}
        </div>

        {visibleHistory.length === 0 ? (
          <Text variant="body" color={theme.colors.colorTextTertiary}>
            {t('No generated passwords yet')}
          </Text>
        ) : (
          <div style={styles.historyList}>
            {visibleHistory.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  ...styles.historyRow,
                  ...(index < visibleHistory.length - 1
                    ? styles.historyRowDivider
                    : {})
                }}
              >
                <div style={styles.historyMeta}>
                  <div style={styles.historyValue}>
                    <Text as="span" variant="bodyEmphasized">
                      {entry.value}
                    </Text>
                  </div>
                  <Text
                    as="span"
                    variant="caption"
                    color={theme.colors.colorTextTertiary}
                  >
                    {new Date(entry.createdAt).toLocaleString()}
                  </Text>
                  {entry.contextLabel ? (
                    <div style={styles.historyContext}>
                      <Text
                        as="span"
                        variant="caption"
                        color={theme.colors.colorTextTertiary}
                      >
                        {entry.contextLabel}
                      </Text>
                    </div>
                  ) : null}
                </div>
                <Button
                  variant="tertiary"
                  size="small"
                  type="button"
                  aria-label={t('Copy password')}
                  iconBefore={<ContentCopy width={16} height={16} />}
                  onClick={() => copyToClipboard(entry.value)}
                  data-testid={`password-generator-history-copy-${entry.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
