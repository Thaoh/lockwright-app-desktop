import React, { useEffect, useState } from 'react'

import {
  Button,
  ContextMenu,
  ListItem,
  NavbarListItem,
  PageHeader,
  Text,
  TextArea,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  MoreVert,
  PublicOutlined,
  SwapVert
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { useConnectExtension } from '../../../../hooks/useConnectExtension'
import { useTranslation } from '../../../../hooks/useTranslation'
import { createStyles } from './styles'

const TEST_IDS = {
  root: 'settings-your-devices',
  extensionSection: 'settings-card-browser-extension-connections',
  extensionActionButton: 'settings-browser-extension-action',
  allowlistField: 'settings-chromium-extension-allowlist',
  allowlistApply: 'settings-chromium-extension-allowlist-apply'
} as const

export const YourDevicesContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const {
    isBrowserExtensionEnabled,
    toggleBrowserExtension,
    chromiumExtensionIdsText,
    applyChromiumExtensionAllowlist
  } = useConnectExtension()

  const [allowlistText, setAllowlistText] = useState(chromiumExtensionIdsText)
  const [allowlistError, setAllowlistError] = useState<string | undefined>()
  const [isApplyingAllowlist, setIsApplyingAllowlist] = useState(false)

  useEffect(() => {
    setAllowlistText(chromiumExtensionIdsText)
  }, [chromiumExtensionIdsText])

  const handleApplyAllowlist = async () => {
    setAllowlistError(undefined)
    setIsApplyingAllowlist(true)
    try {
      const ids = await applyChromiumExtensionAllowlist(allowlistText)
      setAllowlistText(ids.join('\n'))
    } catch (error) {
      setAllowlistError(
        error instanceof Error ? error.message : String(error)
      )
    } finally {
      setIsApplyingAllowlist(false)
    }
  }

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        as="h1"
        title={t('Your Devices')}
        subtitle={t(
          'Devices listed here stay in sync. Changes made on one device update across all your vaults on every synced device.'
        )}
      />

      <div style={styles.sectionHeading}>
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t('Browser Extension Connections')}
        </Text>
      </div>

      <div data-testid={TEST_IDS.extensionSection} style={styles.sectionCard}>
        {isBrowserExtensionEnabled ? (
          <div style={styles.list}>
            <div>
              <ListItem
                icon={
                  <div style={styles.iconWrap}>
                    <PublicOutlined
                      width={16}
                      height={16}
                      color={theme.colors.colorTextPrimary}
                    />
                  </div>
                }
                title={'Browser'}
                testID="settings-device-item-browser"
                rightElement={
                  <ContextMenu
                    trigger={
                      <Button
                        variant="tertiary"
                        size="small"
                        iconBefore={
                          <MoreVert
                            width={16}
                            height={16}
                            color={theme.colors.colorTextPrimary}
                          />
                        }
                        data-testid={TEST_IDS.extensionActionButton}
                        aria-label={t('Browser extension actions')}
                      />
                    }
                  >
                    <NavbarListItem
                      label={t('Unpair Browser extension')}
                      variant="destructive"
                      onClick={() => toggleBrowserExtension(false)}
                    />
                  </ContextMenu>
                }
              />
            </div>
          </div>
        ) : (
          <div style={styles.emptyBrowserStateWrap}>
            <div style={styles.emptyStateCaptions}>
              <Text>{t('Browser Extension')}</Text>
              <Text color={theme.colors.colorTextSecondary}>
                {t(
                  'Create a unique pairing code to link your Lockwright extension and enable autofill.'
                )}
              </Text>
            </div>
            <div style={styles.emptyStateFooter}>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => toggleBrowserExtension(true)}
                iconBefore={<SwapVert width={16} height={16} />}
              >
                {t('Generate Pair Code for Browser Extension')}
              </Button>
            </div>
          </div>
        )}

        <div style={styles.allowlistWrap}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t(
              'If Vivaldi/Chrome shows “Access to the specified native messaging host is forbidden”, paste your extension ID from vivaldi://extensions (Developer mode). One ID per line.'
            )}
          </Text>
          <TextArea
            label={t('Approved Chromium extension IDs')}
            value={allowlistText}
            onChange={(value) => {
              setAllowlistText(value)
              if (allowlistError) setAllowlistError(undefined)
            }}
            error={allowlistError}
            testID={TEST_IDS.allowlistField}
          />
          <div style={styles.allowlistActions}>
            <Button
              variant="secondary"
              size="small"
              isLoading={isApplyingAllowlist}
              disabled={isApplyingAllowlist}
              onClick={() => {
                void handleApplyAllowlist()
              }}
              data-testid={TEST_IDS.allowlistApply}
            >
              {t('Apply approved IDs')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
