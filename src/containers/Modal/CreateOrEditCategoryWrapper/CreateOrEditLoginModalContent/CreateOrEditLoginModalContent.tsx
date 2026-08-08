import React, { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
// @ts-ignore - declaration file is incomplete
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import {
  AttachmentField as UiKitAttachmentField,
  Button,
  Dialog,
  Dropdown,
  Form,
  InputField,
  MultiSlotInput,
  NavbarListItem,
  PasswordField,
  Text,
  useTheme,
} from '@tetherto/pearpass-lib-ui-kit'
import { RECORD_TYPES, validateOtpInput } from '@tetherto/pearpass-lib-vault'
import {
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'
import {
  Add,
  Close,
  KeyboardArrowBottom,
  SyncLock,
  TrashOutlined,
  UploadFileFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { html } from 'htm/react'
import { createStyles } from './CreateOrEditLoginModalContent.styles'
import { ATTACHMENTS_FIELD_KEY } from '../../../../constants/formFields'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { useScrollToFirstError } from '../../../../hooks/useScrollToFirstError'
import { useCreateOrEditRecord } from '../../../../hooks/useCreateOrEditRecord'
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import { addHttps } from '../../../../utils/addHttps'
import { formatPasskeyDate } from '../../../../utils/formatPasskeyDate'
import { getFilteredAttachmentsById } from '../../../../utils/getFilteredAttachmentsById'
import { handleFileSelect } from '../../../../utils/handleFileSelect'
import { UploadFilesModalContent } from '../../UploadFilesModalContent'
import { FolderDropdown } from '../../../../components/FolderDropdown/FolderDropdown'
import {
  URI_MATCH_TYPES,
  type UriMatchType
} from '../../../../shared/constants/uriMatch'
import { PassType } from '../../../../shared/types'
import {
  buildLoginUris,
  resolveUriMatchType
} from '../../../../shared/utils/uriMatchSetting'
import { PasswordFieldStrengthIndicator } from '../../../../components/PasswordFieldStrengthIndicator'

type Website = { website?: string; name?: string; matchType?: UriMatchType }

const URI_MATCH_OPTION_VALUES = Object.values(URI_MATCH_TYPES)

export type CreateOrEditLoginModalContentProps = {
  initialRecord?: {
    data: {
      title: string
      username: string
      password: string
      note: string
      websites: string[]
      uris?: Array<{ uri?: string; match?: string }>
      customFields: { type: string; name: string }[]
      attachments: { id: string; name: string }[]
      otpInput?: string
      otp?: { secret?: string }
      credential?: { id: string }
      passkeyCreatedAt?: number
      passwordUpdatedAt?: number
      [key: string]: unknown
    }
    folder?: string
    isFavorite?: boolean
    attachments?: { id: string; name: string }[]
    [key: string]: unknown
  }
  selectedFolder?: string
  isFavorite?: boolean
  onTypeChange: (type: string) => void
}

export const CreateOrEditLoginModalContent = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  onTypeChange: _onTypeChange
}: CreateOrEditLoginModalContentProps) => {
  const { t } = useTranslation()
  const { closeModal, setModal } = useModal()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const [passwordType, setPasswordType] = useState<PassType>(PassType.Password)
  const [openMatchTypeIndex, setOpenMatchTypeIndex] = useState<number | null>(
    null
  )
  const { setToast } = useToast()
  const { theme } = useTheme()
  const styles = createStyles()

  const uriMatchOptionLabels: Record<UriMatchType, string> = {
    [URI_MATCH_TYPES.DOMAIN]: t('Domain'),
    [URI_MATCH_TYPES.HOST]: t('Host'),
    [URI_MATCH_TYPES.STARTS_WITH]: t('Starts with'),
    [URI_MATCH_TYPES.EXACT]: t('Exact')
  }

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      closeModal()
      setToast({ message: t('Record created successfully') })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      closeModal()
      setToast({ message: t('Record updated successfully') })
    }
  })

  const onError = (error: { message: string }) => {
    setToast({ message: error.message })
  }

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    title: Validator.string().required(t('Title is required')),
    username: Validator.string(),
    password: Validator.string(),
    otpSecret: Validator.string().refine(validateOtpInput),
    note: Validator.string(),
    websites: Validator.array().items(
      Validator.object({
        website: Validator.string().website('Wrong format of website'),
        matchType: Validator.string()
      })
    ),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string()
      })
    ),
    folder: Validator.string(),
    attachments: Validator.array().items(
      Validator.object({
        id: Validator.string(),
        name: Validator.string().required()
      })
    ),
    passwordUpdatedAt: Validator.number()
  })

  const { register, handleSubmit, registerArray, values, setValue, errors } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      otpSecret:
        initialRecord?.data?.otpInput ?? initialRecord?.data?.otp?.secret ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites?.length
        ? initialRecord.data.websites.map((website: string) => ({
            website,
            matchType: resolveUriMatchType(initialRecord, website) as UriMatchType
          }))
        : [{ name: 'website', website: '', matchType: URI_MATCH_TYPES.DOMAIN }],
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', name: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? [],
      credential: initialRecord?.data?.credential?.id ?? '',
      passkeyCreatedAt: initialRecord?.data?.passkeyCreatedAt
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

  useScrollToFirstError(errors)

  const {
    value: websitesList,
    addItem: addWebsite,
    registerItem: registerWebsiteItem,
    removeItem: removeWebsite
  } = registerArray('websites')

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  const onSubmit = (formValues: Record<string, unknown>) => {
    const otpInput = (formValues.otpSecret as string)?.trim() || undefined

    const websiteRows = ((formValues.websites as Website[]) ?? []).filter(
      (website) => !!website?.website?.trim().length
    )
    const websites = websiteRows.map((website) => addHttps(website.website!))
    const uris = buildLoginUris(websiteRows)

    const data = {
      type: RECORD_TYPES.LOGIN,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: formValues.title,
        username: formValues.username,
        password: formValues.password,
        note: formValues.note,
        websites,
        uris,
        customFields: (
          (formValues.customFields as Array<{ type: string; note?: string }>) ??
          []
        ).filter((f) => f.note?.trim().length),
        attachments: formValues.attachments,
        passwordUpdatedAt: initialRecord?.data?.passwordUpdatedAt,
        otpInput
      }
    }

    if (initialRecord) {
      updateRecords([{ ...initialRecord, ...data }], onError)
    } else {
      createRecord(data, onError)
    }
  }

  const handleFileLoad = () => {
    setModal(
      html`<${UploadFilesModalContent}
        type=${'file'}
        onFilesSelected=${(files: File[]) =>
          handleFileSelect({
            files: files as unknown as FileList,
            fieldName: ATTACHMENTS_FIELD_KEY,
            setValue,
            values
          })}
      />`
    )
  }

  const isEdit = !!initialRecord

  const titleField = register('title')
  const usernameField = register('username')
  const passwordField = register('password')
  const otpSecretField = register('otpSecret')
  const noteField = register('note')

  return (
    <Dialog
      title={isEdit ? t('Edit Login Item') : t('New Login Item')}
      onClose={closeModal}
      testID='createoredit-login-dialog'
      closeButtonTestID='createoredit-login-close'
      footer={
        <>
          <Button
            variant='secondary'
            size='small'
            type='button'
            onClick={closeModal}
            data-testid='createoredit-button-discard'
          >
            {t('Discard')}
          </Button>
          <Button
            variant='primary'
            size='small'
            type='button'
            disabled={
              isLoading ||
              (!isEdit && !values.title?.trim()) ||
              !!otpSecretField.error
            }
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid='createoredit-button-save'
          >
            {isEdit ? t('Save') : t('Add Item')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID='createoredit-form'
      >
        <InputField
          label={t('Title')}
          placeholder={t('Enter Title')}
          value={titleField.value}
          onChange={(e) => titleField.onChange(e.target.value)}
          error={titleField.error || undefined}
          testID='createoredit-input-title'
        />

        <div style={styles.sectionLabel}>
          <Text variant='caption' color={theme.colors.colorTextSecondary}>
            {t('Credentials')}
          </Text>
        </div>

        <MultiSlotInput
          testID='createoredit-credentials-slot'
          actions={
            <Button
              variant='tertiaryAccent'
              size='small'
              type='button'
              iconBefore={<SyncLock width={16} height={16} />}
              onClick={() =>
                handleCreateOrEditRecord({
                  recordType: 'password',
                  setValue: (value: string, type: PassType) => {
                    setValue('password', value)
                    setPasswordType(
                      type === PassType.PassPhrase
                        ? PassType.PassPhrase
                        : PassType.Password
                    )
                  }
                })
              }
              data-testid='createoredit-button-generatepassword'
            >
              {t('Generate Password')}
            </Button>
          }
        >
          <InputField
            label={t('Email / Username')}
            placeholder={t('Enter Email / Username')}
            value={usernameField.value}
            onChange={(e) => usernameField.onChange(e.target.value)}
            error={usernameField.error || undefined}
            isGrouped
            testID='createoredit-input-username'
          />
          <PasswordFieldStrengthIndicator
            passwordField={passwordField}
            passwordType={passwordType}
            setPasswordType={setPasswordType}
            isGrouped
            testID='createoredit-input-password'
          />
        </MultiSlotInput>

        {AUTHENTICATOR_ENABLED ? (
          <MultiSlotInput
            testID='createoredit-authenticator-slot'
            errorMessage={otpSecretField.error || undefined}
          >
            <PasswordField
              label={t('Authenticator Secret Key')}
              placeholder={t('Enter your key or URI')}
              value={otpSecretField.value}
              onChange={(e) => otpSecretField.onChange(e.target.value)}
              testID='createoredit-input-otpsecret'
              rightSlot={
                isEdit && otpSecretField.value ? (
                  <Button
                    variant='tertiary'
                    size='small'
                    type='button'
                    aria-label={t('Remove Authenticator Code')}
                    iconBefore={
                      <Close
                        width={16}
                        height={16}
                        color={theme.colors.colorTextPrimary}
                      />
                    }
                    onClick={() => setValue('otpSecret', '')}
                    data-testid='createoredit-button-deleteotp'
                  />
                ) : undefined
              }
            />
          </MultiSlotInput>
        ) : null}

        {!!values?.credential ? (
          <InputField
            label={t('Passkey')}
            value={
              formatPasskeyDate(values.passkeyCreatedAt) || t('Passkey Stored')
            }
            placeholder=''
            disabled
            testID='createoredit-input-passkey'
          />
        ) : null}

        <div style={styles.sectionLabel}>
          <Text variant='caption' color={theme.colors.colorTextSecondary}>
            {t('Details')}
          </Text>
        </div>

        <MultiSlotInput
          testID='createoredit-websites-slot'
          actions={
            <Button
              variant='tertiaryAccent'
              size='small'
              type='button'
              iconBefore={<Add width={16} height={16} />}
              onClick={() =>
                addWebsite({
                  name: 'website',
                  website: '',
                  matchType: URI_MATCH_TYPES.DOMAIN
                })
              }
              data-testid='createoredit-button-addwebsite'
            >
              {t('Add Another Website')}
            </Button>
          }
        >
          {websitesList.map((website: { id: string }, index: number) => {
            const websiteField = registerWebsiteItem('website', index)
            const matchTypeField = registerWebsiteItem('matchType', index)
            const selectedMatchType = (matchTypeField.value ||
              URI_MATCH_TYPES.DOMAIN) as UriMatchType
            return (
              <div key={website.id} style={styles.websiteRow}>
                <InputField
                  label={t('Website')}
                  placeholder={t('Enter Website')}
                  value={websiteField.value}
                  onChange={(e) => websiteField.onChange(e.target.value)}
                  error={websiteField.error || undefined}
                  testID={`createoredit-input-website-${index}`}
                  rightSlot={
                    index > 0 ? (
                      <Button
                        variant='tertiary'
                        size='small'
                        type='button'
                        aria-label={t('Remove website')}
                        iconBefore={
                          <TrashOutlined
                            width={16}
                            height={16}
                            color={theme.colors.colorTextPrimary}
                          />
                        }
                        onClick={() => removeWebsite(index)}
                        data-testid={`createoredit-button-removewebsite-${index}`}
                      />
                    ) : undefined
                  }
                />
                <div style={styles.websiteMatchRow}>
                  <Text
                    variant='caption'
                    color={theme.colors.colorTextSecondary}
                  >
                    {t('URI match')}
                  </Text>
                  <Dropdown
                    open={openMatchTypeIndex === index}
                    onOpenChange={(open) =>
                      setOpenMatchTypeIndex(open ? index : null)
                    }
                    trigger={
                      <Button
                        variant='secondary'
                        size='small'
                        type='button'
                        iconAfter={<KeyboardArrowBottom />}
                        data-testid={`createoredit-website-match-${index}`}
                      >
                        {uriMatchOptionLabels[selectedMatchType] ?? t('Domain')}
                      </Button>
                    }
                  >
                    {URI_MATCH_OPTION_VALUES.map((value) => (
                      <NavbarListItem
                        key={value}
                        testID={`createoredit-website-match-${index}-${value}`}
                        label={uriMatchOptionLabels[value]}
                        selected={selectedMatchType === value}
                        onClick={() => {
                          matchTypeField.onChange(value)
                          setOpenMatchTypeIndex(null)
                        }}
                      />
                    ))}
                  </Dropdown>
                </div>
              </div>
            )
          })}
        </MultiSlotInput>

        <div style={styles.sectionLabel}>
          <Text variant='caption' color={theme.colors.colorTextSecondary}>
            {t('Additional')}
          </Text>
        </div>

        <FolderDropdown
          selectedFolder={values?.folder}
          onFolderSelect={(name) =>
            setValue('folder', name === values.folder ? '' : name)
          }
        />

        <MultiSlotInput testID='createoredit-comment-slot'>
          <InputField
            label={t('Comment')}
            placeholder={t('Enter Comment')}
            value={noteField.value}
            onChange={(e) => noteField.onChange(e.target.value)}
            error={noteField.error || undefined}
            testID='createoredit-input-comment'
          />
        </MultiSlotInput>

        <MultiSlotInput
          testID='createoredit-attachments-slot'
          actions={
            <Button
              variant='tertiaryAccent'
              size='small'
              type='button'
              iconBefore={<Add width={16} height={16} />}
              onClick={handleFileLoad}
              data-testid='createoredit-button-addattachment'
            >
              {t('Add Another Attachment')}
            </Button>
          }
        >
          {values.attachments.length > 0
            ? values.attachments.map(
              (
                attachment: {
                  id?: string
                  tempId?: string
                  name: string
                },
                index: number
              ) => (
                <UiKitAttachmentField
                  key={attachment.id || attachment.tempId}
                  label={t('Attachment')}
                  value={attachment.name}
                  testID={`createoredit-attachment-${index}`}
                  rightSlot={
                    <Button
                      variant='tertiary'
                      size='small'
                      type='button'
                      aria-label={t('Delete File')}
                      iconBefore={
                        <TrashOutlined
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() =>
                        setValue(
                          ATTACHMENTS_FIELD_KEY,
                          getFilteredAttachmentsById(
                            values.attachments,
                            attachment
                          )
                        )
                      }
                      data-testid={`createoredit-button-deleteattachment-${index}`}
                    />
                  }
                />
              )
            )
            : null}
          <UiKitAttachmentField
            label={t('Attachment')}
            placeholder={t('Add or Drop File / Photos')}
            onClick={handleFileLoad}
            testID='createoredit-attachment-upload'
            rightSlot={
              <UploadFileFilled
                width={16}
                height={16}
                color={theme.colors.colorTextPrimary}
              />
            }
          />
        </MultiSlotInput>

        <MultiSlotInput
          testID='createoredit-hiddenmessage-slot'
          actions={
            <Button
              variant='tertiaryAccent'
              size='small'
              type='button'
              iconBefore={<Add width={16} height={16} />}
              onClick={() => addCustomField({ type: 'note', name: 'note' })}
              data-testid='createoredit-button-addhiddenmessage'
            >
              {t('Add Another Message')}
            </Button>
          }
        >
          {customFieldsList.map((field: { id: string }, index: number) => {
            const fieldReg = registerCustomFieldItem('note', index)
            const canRemove = customFieldsList.length > 1
            return (
              <PasswordField
                key={field.id}
                label={t('Hidden Message')}
                placeholder={t('Enter Hidden Message')}
                value={fieldReg.value}
                onChange={(e) => fieldReg.onChange(e.target.value)}
                error={fieldReg.error || undefined}
                testID={`createoredit-input-hiddenmessage-${index}`}
                rightSlot={
                  canRemove ? (
                    <Button
                      variant='tertiary'
                      size='small'
                      type='button'
                      aria-label={t('Remove')}
                      iconBefore={
                        <TrashOutlined
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() => removeCustomFieldItem(index)}
                      data-testid={`createoredit-button-removehiddenmessage-${index}`}
                    />
                  ) : undefined
                }
              />
            )
          })}
        </MultiSlotInput>
      </Form>
    </Dialog>
  )
}
