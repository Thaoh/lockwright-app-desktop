/**
 * @param {string} url
 * @returns {string}
 */
export const addHttps = (url) => {
  let lowerUrl = url.toLowerCase()
  lowerUrl = lowerUrl.replace(/^(https?:\/\/)((?:android|ios)app:\/\/)/, '$2')

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(lowerUrl)) {
    return lowerUrl
  }

  return `https://${lowerUrl}`
}
