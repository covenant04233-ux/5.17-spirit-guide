import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const MOOD_OPTIONS = [
  { key: 'fire', icon: '🔥' },
  { key: 'sea', icon: '🌊' },
  { key: 'fog', icon: '🌫️' },
  { key: 'wind', icon: '💨' },
]

const STYLE_OPTIONS = [
  { key: 'healing', icon: '🕯️' },
  { key: 'critical', icon: '🪞' },
  { key: 'mystical', icon: '🔮' },
  { key: 'direct', icon: '⚡' },
]

/** Mood labels stay on one line: narrow phones scroll horizontally if needed */
function MoodRow({ options, selected, onSelect, title }) {
  const { t } = useTranslation()
  return (
    <section>
      <p className="mb-2 font-sans text-sm text-amber-100/90">{title}</p>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 [-webkit-overflow-scrolling:touch]">
        {options.map((item) => {
          const active = selected === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`min-w-[4.75rem] shrink-0 rounded-xl border px-2 py-2.5 text-center transition sm:min-w-[5.25rem] ${
                active
                  ? 'border-amber-300/70 bg-amber-500/20 text-amber-100'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <div className="text-lg leading-none sm:text-xl">{item.icon}</div>
              <div className="mt-1 whitespace-nowrap font-sans text-[9px] leading-none tracking-tight text-current sm:text-[10px]">
                {t(`ritualPrep.${item.key}`)}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function StyleGrid({ options, selected, onSelect, title }) {
  const { t } = useTranslation()
  return (
    <section>
      <p className="mb-2 font-sans text-sm text-amber-100/90">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((item) => {
          const active = selected === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`rounded-xl border px-2 py-3 text-center transition ${
                active
                  ? 'border-amber-300/70 bg-amber-500/20 text-amber-100'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <div className="mt-1 whitespace-nowrap font-sans text-[10px] leading-tight sm:text-[11px]">
                {t(`ritualPrep.${item.key}`)}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function RitualPreparationModal({
  open,
  profile,
  hasLastProfile,
  onMoodChange,
  onStyleChange,
  onReuseLast,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation()
  const canConfirm = useMemo(
    () => Boolean(profile?.mood && profile?.readingStyle),
    [profile?.mood, profile?.readingStyle],
  )

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="pointer-events-auto fixed inset-0 z-[200] overflow-y-auto bg-black/65 px-3 pt-5 pb-10 backdrop-blur-sm sm:px-4 sm:pt-6 sm:pb-12">
      <div className="mx-auto flex w-full max-w-2xl justify-center sm:pt-1">
        <div className="flex max-h-[min(90dvh,calc(100dvh-2.5rem))] w-full flex-col overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0B0A12]/98 shadow-2xl">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="mb-4">
            <h2 className="font-display text-lg text-amber-100 sm:text-xl">
              {t('ritualPrep.title')}
            </h2>
            <p className="mt-1 font-sans text-[11px] leading-relaxed text-slate-300 sm:text-xs">
              {t('ritualPrep.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <MoodRow
              options={MOOD_OPTIONS}
              selected={profile?.mood || ''}
              onSelect={onMoodChange}
              title={t('ritualPrep.moodQuestion')}
            />
            <StyleGrid
              options={STYLE_OPTIONS}
              selected={profile?.readingStyle || ''}
              onSelect={onStyleChange}
              title={t('ritualPrep.styleQuestion')}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#0a0911]/98 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {hasLastProfile ? (
              <button
                type="button"
                onClick={onReuseLast}
                className="rounded-lg border border-violet-300/35 bg-violet-500/15 px-3 py-2 font-sans text-[11px] text-violet-100 hover:bg-violet-500/25 sm:text-xs"
              >
                {t('ritualPrep.reuseLast')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/15 px-3 py-2 font-sans text-[11px] text-slate-300 hover:bg-white/10 sm:text-xs"
            >
              {t('ritualPrep.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canConfirm}
              className="rounded-lg bg-gradient-to-r from-amber-700/90 to-amber-600/90 px-3 py-2 font-sans text-[11px] font-medium text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
            >
              {t('ritualPrep.confirm')}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
