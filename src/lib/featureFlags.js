/** 公网部署默认关闭；本地开发在 .env.local 设 VITE_ENABLE_SEEDREAM_COMIC=true */
export function isSeedreamComicEnabled() {
  const flag = import.meta.env.VITE_ENABLE_SEEDREAM_COMIC?.trim()
  if (flag === 'false') return false
  if (flag === 'true') {
    return Boolean(import.meta.env.VITE_DOUBAO_API_KEY?.trim())
  }
  return import.meta.env.DEV && Boolean(import.meta.env.VITE_DOUBAO_API_KEY?.trim())
}
