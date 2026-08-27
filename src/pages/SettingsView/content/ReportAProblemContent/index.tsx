import React from 'react'

import { PEARPASS_WEBSITE } from '@tetherto/pearpass-lib-constants'
import { Button, PageHeader } from '@tetherto/pearpass-lib-ui-kit'
import { Send } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useTranslation } from '../../../../hooks/useTranslation'
import { createStyles } from './styles'

const FEEDBACK_URL = `${PEARPASS_WEBSITE}/contact/`

const TEST_IDS = {
  root: 'settings-card-report',
  open: 'settings-report-open-button'
} as const

type ReportAProblemContentProps = {
  currentVersion?: string
}

export const ReportAProblemContent = (_props?: ReportAProblemContentProps) => {
  const { t } = useTranslation()
  const styles = createStyles()

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        title={t('Report a problem')}
        subtitle={t(
          'Opens the Lockwright contact form. Leave an email if you want a reply.'
        )}
      />
      <div style={styles.actions}>
        <Button
          data-testid={TEST_IDS.open}
          variant="primary"
          size="small"
          onClick={() => {
            void window.electronAPI?.openExternal(FEEDBACK_URL)
          }}
          iconBefore={<Send />}
        >
          {t('Open contact form')}
        </Button>
      </div>
    </div>
  )
}
