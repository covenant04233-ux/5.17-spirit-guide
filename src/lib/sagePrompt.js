import { getRiderWaiteCardLabel } from '../data/riderWaiteDeck'

function positionLabel(i18nLang, index, spread) {
  if (spread === 1) {
    if (i18nLang === 'en') return 'the single draw'
    if (i18nLang === 'zh-TW') return '此牌（單張牌陣）'
    return '此牌（单张牌阵）'
  }
  const labels = {
    en: ['past', 'present', 'future'],
    'zh-TW': ['過去', '現在', '未來'],
    'zh-CN': ['过去', '现在', '未来'],
  }
  const lang = i18nLang === 'en' ? 'en' : i18nLang === 'zh-TW' ? 'zh-TW' : 'zh-CN'
  const arr = labels[lang]
  return arr[index] ?? `#${index + 1}`
}

function orientationLabel(i18nLang, reversed) {
  if (i18nLang === 'en') return reversed ? 'reversed' : 'upright'
  return reversed ? '逆位' : '正位'
}

/**
 * @param {string} normalizedLang 'en' | 'zh-TW' | 'zh-CN'
 * @param {{ seekerName?: string, seekerBirthDate?: string, seekerMbti?: string }} profile
 */
function buildSeekerContextBlock(normalizedLang, profile) {
  const name = (profile?.seekerName || '').trim()
  const birth = (profile?.seekerBirthDate || '').trim()
  const mbti = (profile?.seekerMbti || '').trim()
  if (!name && !birth && !mbti) return ''

  const mbtiDisplay =
    mbti ||
    (normalizedLang === 'en'
      ? 'not given'
      : normalizedLang === 'zh-TW'
        ? '未提供'
        : '未提供')

  if (normalizedLang === 'en') {
    return `Seeker snapshot (optional context — weave subtly into the reading; never imply deterministic fate, medical diagnosis, or supernatural certainty):
- Name / how to address them: ${name || '(not given)'}
- Birth date (YYYY-MM-DD): ${birth || '(not given)'}
- MBTI self-report: ${mbtiDisplay}

Integration guidance: You may gently echo themes from traditional metaphysics (e.g. Chinese four-pillars / elemental seasons as poetic metaphor, Western sun-sign archetypes as symbolic language) and from psychology (MBTI / Jungian polarities as a reflective lens for habits of mind and communication). Clearly treat these as contemplative mirrors, not verdicts. If birth date is missing, skip calendar-based allusions. If MBTI was not given, do not invent one.`
  }

  if (normalizedLang === 'zh-TW') {
    return `求問者資料（可選語境——輕輕織入解讀；唔好暗示宿命定論、醫療診斷或超自然必然）：
- 稱呼／姓名：${name || '（未提供）'}
- 公曆生日（YYYY-MM-DD）：${birth || '（未提供）'}
- MBTI 自報：${mbtiDisplay}

整合指引：可以適度呼應傳統命理意象（例如四柱五行作詩性隱喻、西方太陽星座作象徵語言）同心理學視角（MBTI／榮格內在兩極作為自我觀照嘅鏡）。必須以「反思性比喻」呈現，唔係鐵口直斷。若無生日就唔好推算四柱細節；若無 MBTI 就唔好虛構類型。`
  }

  return `求问者资料（可选语境——轻轻织入解读；不要暗示宿命定论、医疗诊断或超自然必然）：
- 称呼／姓名：${name || '（未提供）'}
- 公历生日（YYYY-MM-DD）：${birth || '（未提供）'}
- MBTI 自报：${mbtiDisplay}

整合指引：可以适度呼应传统命理意象（例如四柱五行作诗性隐喻、西方太阳星座作象征语言）与心理学视角（MBTI／荣格内在两极作为自我观照的镜）。必须以「反思性比喻」呈现，不是铁口直断。若无生日就不要推算四柱细节；若无 MBTI 就不要虚构类型。`
}

export function buildSagePrompt({
  i18nLang,
  userQuestion,
  spread,
  selectedIndices,
  deckOrder,
  slotReversed,
  preReadingProfile,
}) {
  const lines = selectedIndices.map((slot, idx) => {
    const pos = positionLabel(i18nLang, idx, spread)
    const cardId = deckOrder[slot]
    const reversed = slotReversed[slot]
    const name = getRiderWaiteCardLabel(cardId, i18nLang)
    const ori = orientationLabel(i18nLang, reversed)
    return `- Position (${pos}): Rider–Waite–Smith — ${name} (${ori}); deck card #${String(cardId + 1).padStart(2, '0')}/78.`
  })

  const langLine =
    i18nLang === 'en'
      ? 'Write the entire reply in fluent English.'
      : i18nLang === 'zh-TW'
        ? '請用繁體中文書寫全文，語氣深邃優雅，像智者。'
        : '请用简体中文书写全文，语气深邃优雅，像智者。'

  const moodLabelByLang = {
    fire: {
      en: 'restless like fire, eager for answers',
      'zh-TW': '似火咁焦躁，好想即刻有答案',
      'zh-CN': '像火一样焦躁，急于找到答案',
    },
    sea: {
      en: 'calm like the deep sea, waiting for guidance',
      'zh-TW': '似深海咁沉靜，喺平靜入面等指引',
      'zh-CN': '像深海一样沉静，在平静中等待指引',
    },
    fog: {
      en: 'lost in fog, seeking clarity',
      'zh-TW': '似霧中迷路，想釐清方向',
      'zh-CN': '像雾中一样迷茫，需要清理方向',
    },
    wind: {
      en: 'running like fast wind, full of momentum and asking for next steps',
      'zh-TW': '似疾風咁向前衝，充滿動力，只想知下一步',
      'zh-CN': '像疾风一样奔跑，充满动力，只想知道下一步',
    },
  }

  const styleInstructionByLang = {
    healing: {
      en: 'Use a healing tone like spring wind. Focus on emotional support first, then offer grounded guidance.',
      'zh-TW': '用溫柔療癒語氣，似春風咁安定人心。先做情緒疏導，再比實際建議。',
      'zh-CN': '使用温柔治愈语气，如春风般温暖。先做心理疏导，再给出可执行建议。',
    },
    critical: {
      en: 'Use a critical reflective style. Identify painful truths directly and challenge assumptions without sugarcoating.',
      'zh-TW': '用犀利反思語氣，直擊痛點，反向思考，唔好包裝。',
      'zh-CN': '使用犀利反思风格，直击痛点，反向思考，不要粉饰。',
    },
    mystical: {
      en: 'Use a mystical, intuitive narrative voice with symbolic and spiritual framing.',
      'zh-TW': '用靈視指引語氣，帶神祕學同直覺敘事色彩。',
      'zh-CN': '使用灵视指引风格，带有神学与直觉叙事色彩。',
    },
    direct: {
      en: 'Provide concise, actionable advice in bullet points. Avoid flowery language or long-winded introductions.',
      'zh-TW': '用快、狠、準方式解牌：重點式列點，直接比可做嘅建議，唔好兜圈。',
      'zh-CN': '使用简单粗暴风格：用要点列出可执行建议，不要华丽修辞或冗长铺垫。',
    },
  }

  const moodEmpathyOpeningByLang = {
    fire: {
      en: 'Open by acknowledging their urgency and emotional heat before interpretation.',
      'zh-TW': '開場先共情對方嘅急切同焦躁，再進入解讀。',
      'zh-CN': '开场先共情对方的急切与焦躁，再进入解读。',
    },
    sea: {
      en: 'Open by affirming their calm patience and receptive state before interpretation.',
      'zh-TW': '開場先肯定對方沉靜同願意聆聽嘅狀態，再進入解讀。',
      'zh-CN': '开场先肯定对方沉静和愿意聆听的状态，再进入解读。',
    },
    fog: {
      en: 'Open by validating their confusion and need for clarity before interpretation.',
      'zh-TW': '開場先承接對方迷惘同想搵方向嘅感受，再進入解讀。',
      'zh-CN': '开场先承接对方的迷茫与想要厘清方向的感受，再进入解读。',
    },
    wind: {
      en: 'Open by affirming their momentum and desire for immediate next steps before interpretation.',
      'zh-TW': '開場先回應對方強烈動能同想即刻行下一步，再進入解讀。',
      'zh-CN': '开场先回应对方强烈行动力与想立刻知道下一步的需求，再进入解读。',
    },
  }

  const normalizedLang = i18nLang === 'en' ? 'en' : i18nLang === 'zh-TW' ? 'zh-TW' : 'zh-CN'
  const moodLine =
    moodLabelByLang[preReadingProfile?.mood]?.[normalizedLang] ||
    (normalizedLang === 'en'
      ? 'not specified'
      : normalizedLang === 'zh-TW'
        ? '未指定'
        : '未指定')
  const styleLine =
    styleInstructionByLang[preReadingProfile?.readingStyle]?.[normalizedLang] ||
    (normalizedLang === 'en'
      ? 'Use a balanced wise tone with practical clarity and concrete recommendations.'
      : normalizedLang === 'zh-TW'
        ? '請保持平衡而清晰嘅智者語氣，帶出可落地建議。'
        : '请保持平衡清晰的智者语气，并给出可落地建议。')
  const empathyOpeningLine =
    moodEmpathyOpeningByLang[preReadingProfile?.mood]?.[normalizedLang] ||
    (normalizedLang === 'en'
      ? 'Open with a brief empathetic acknowledgment of the seeker state before interpretation.'
      : normalizedLang === 'zh-TW'
        ? '解讀前先用一句共情開場。'
        : '解读前先用一句共情开场。')

  const q = (userQuestion || '').trim() || '(seeker left the question open — offer general guidance)'

  const seekerBlock = buildSeekerContextBlock(normalizedLang, preReadingProfile)
  const seekerSection = seekerBlock ? `${seekerBlock}\n\n` : ''

  return `You are a sage interpreting a gesture-based tarot spread in a ritual web experience.
Seeker's question (may be brief): ${q}
Spread: ${spread} card(s), in selection order (first chosen = first position below).

${lines.join('\n')}

${seekerSection}Respond as flowing prose suitable for on-screen streaming (short paragraphs ok). Tie imagery to the question and to each position's meaning (time / theme). Interpret upright vs reversed meanings when reversed is indicated. Do not mention APIs, models, or technology.
Pre-reading profile (ritual tuning): mood = ${moodLine}
Empathetic opening requirement: ${empathyOpeningLine}
Style instruction: ${styleLine}
${langLine}`
}
