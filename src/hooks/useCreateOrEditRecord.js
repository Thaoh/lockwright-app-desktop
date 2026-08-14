import { html } from 'htm/react'

import { CreateOrEditCategoryWrapper } from '../containers/Modal/CreateOrEditCategoryWrapper'
import { GeneratePasswordModalContent } from '../containers/Modal/GeneratePasswordModalContent/GeneratePasswordModalContent'
import { useModal } from '../context/ModalContext'

export const useCreateOrEditRecord = () => {
  const { setModal } = useModal()

  const getModalContentByRecordType = ({
    recordType,
    initialRecord,
    selectedFolder,
    isFavorite
  }) => html`
    <${CreateOrEditCategoryWrapper}
      recordType=${recordType}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
    />
  `

  const getGeneratePasswordV2Content = ({
    setValue,
    contextLabel,
    contextKind
  }) => html`
    <${GeneratePasswordModalContent}
      onPasswordInsert=${setValue}
      contextLabel=${contextLabel}
      contextKind=${contextKind}
    />
  `

  /**
   * @param {{
   *   recordType: string,
   *   initialRecord?: unknown,
   *   selectedFolder?: string,
   *   isFavorite?: boolean,
   *   setValue?: (value: string, type: import('../shared/types').PassType) => void,
   *   contextLabel?: string,
   *   contextKind?: 'site'|'entry'
   * }} options
   */
  const handleCreateOrEditRecord = (options) => {
    const {
      recordType,
      initialRecord,
      selectedFolder,
      isFavorite,
      setValue,
      contextLabel,
      contextKind
    } = options

    if (recordType === 'password') {
      setModal(
        getGeneratePasswordV2Content({ setValue, contextLabel, contextKind })
      )
      return
    }

    setModal(
      getModalContentByRecordType({
        recordType,
        initialRecord,
        selectedFolder,
        isFavorite
      })
    )
  }

  return {
    handleCreateOrEditRecord
  }
}
