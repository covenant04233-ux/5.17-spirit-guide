import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const MBTI_TYPES = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
]

/** Stored profile uses ISO YYYY-MM-DD; show as YYYY/MM/DD in the field. */
function isoToSlashDisplay(iso) {
  if (!iso || typeof iso !== 'string') return ''
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return ''
  return `${m[1]}/${m[2]}/${m[3]}`
}

/** Accepts YYYY/MM/DD or YYYY-MM-DD; returns ISO YYYY-MM-DD or '' if invalid. */
function parseBirthInputToIso(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const t = raw.trim().replace(/-/g, '/')
  const m = t.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!m) return ''
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (y < 1 || y > 9999 || mo < 1 || mo > 12 || d < 1 || d > 31) return ''
  const dt = new Date(Date.UTC(y, mo - 1, d))
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return ''
  }
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function SeekerWelcomeModal({ open, profile, onConfirm, onClose }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [birthInput, setBirthInput] = useState('')
  const [mbti, setMbti] = useState('')

  useEffect(() => {
    if (!open) return
    setName((profile?.seekerName || '').trim() ? profile.seekerName : '')
    setBirthInput(isoToSlashDisplay(profile?.seekerBirthDate || ''))
    setMbti(profile?.seekerMbti || '')
  }, [open, profile?.seekerName, profile?.seekerBirthDate, profile?.seekerMbti])

  const birthIso = useMemo(() => parseBirthInputToIso(birthInput), [birthInput])

  const canContinue = useMemo(() => {
    const n = name.trim()
    return Boolean(n && birthIso)
  }, [name, birthIso])

  const handleConfirm = () => {
    if (!canContinue) return
    onConfirm({
      seekerName: name.trim(),
      seekerBirthDate: birthIso,
      seekerMbti: mbti.trim(),
    })
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="pointer-events-auto fixed inset-0 z-[200] overflow-y-auto bg-black/70 px-3 pt-5 pb-10 backdrop-blur-sm sm:px-4 sm:pt-6 sm:pb-12">
      <div className="mx-auto flex w-full max-w-lg justify-center sm:pt-1">
        <div className="flex max-h-[min(90dvh,calc(100dvh-2.5rem))] w-full flex-col overflow-hidden rounded-2xl border border-violet-400/35 bg-[#0a0814]/98 shadow-2xl">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="mb-4 text-center">
            <div className="font-display text-2xl text-violet-200/95 sm:text-3xl">✦</div>
            <h2 className="mt-2 font-display text-lg text-amber-100 sm:text-xl">
              {t('seekerWelcome.title')}
            </h2>
          </div>
          <p className="mb-5 font-sans text-[11px] leading-relaxed text-slate-300 sm:text-xs">
            {t('seekerWelcome.greeting')}
          </p>

          <div className="space-y-3.5">
            <label className="block">
              <span className="mb-1 block font-sans text-[11px] text-amber-100/90 sm:text-xs">
                {t('seekerWelcome.nameLabel')}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-white/12 bg-black/45 px-3 py-2.5 font-sans text-sm text-slate-100 outline-none ring-1 ring-white/5 placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-violet-400/25"
                placeholder={t('seekerWelcome.namePlaceholder')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-sans text-[11px] text-amber-100/90 sm:text-xs">
                {t('seekerWelcome.birthLabel')}
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="bday"
                spellCheck={false}
                value={birthInput}
                onChange={(e) => setBirthInput(e.target.value)}
                placeholder={t('seekerWelcome.birthPlaceholder')}
                className="w-full rounded-xl border border-white/12 bg-black/45 px-3 py-2.5 font-mono text-sm tracking-wide text-slate-100 outline-none ring-1 ring-white/5 placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-violet-400/25"
              />
              <p className="mt-1 font-sans text-[10px] text-slate-500 sm:text-[11px]">
                {t('seekerWelcome.birthFormatHint')}
              </p>
            </label>
            <label className="block">
              <span className="mb-1 block font-sans text-[11px] text-amber-100/90 sm:text-xs">
                {t('seekerWelcome.mbtiLabel')}
              </span>
              <select
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-black/45 px-3 py-2.5 font-sans text-sm text-slate-100 outline-none ring-1 ring-white/5 focus:border-violet-400/40 focus:ring-violet-400/25"
              >
                <option value="">{t('seekerWelcome.mbtiUnknown')}</option>
                {MBTI_TYPES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-4 font-sans text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
            {t('seekerWelcome.disclaimer')}
          </p>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#080712]/98 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/15 px-3 py-2 font-sans text-[11px] text-slate-300 hover:bg-white/10 sm:text-xs"
            >
              {t('seekerWelcome.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canContinue}
              className="rounded-lg bg-gradient-to-r from-violet-700/90 to-violet-600/90 px-3 py-2 font-sans text-[11px] font-medium text-violet-50 disabled:cursor-not-allowed disabled:opacity-45 sm:text-xs"
            >
              {t('seekerWelcome.continue')}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
