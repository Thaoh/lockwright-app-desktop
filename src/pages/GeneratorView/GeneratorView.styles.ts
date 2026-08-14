import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  wrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100%',
    width: '100%',
    minHeight: 0,
    overflowY: 'auto' as const,
    padding: `${rawTokens.spacing24}px`,
    gap: `${rawTokens.spacing24}px`,
    boxSizing: 'border-box' as const,
    backgroundColor: colors.colorSurfacePrimary
  },
  actions: {
    display: 'flex' as const,
    justifyContent: 'flex-end' as const
  }
})
