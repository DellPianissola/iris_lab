import { isLocale, LOCALES, useI18n } from '../i18n'
import { LanguageIcon } from './icons'

export function LocalePicker() {
  const { locale, setLocale, t } = useI18n()

  return (
    <label className="locale-picker">
      <LanguageIcon className="icon" aria-hidden="true" />
      <span className="sr-only">{t.locale.label}</span>
      <select
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) setLocale(event.target.value)
        }}
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {t.locale.names[option]}
          </option>
        ))}
      </select>
    </label>
  )
}
