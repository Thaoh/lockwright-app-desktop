export function nextBackgroundSize(prev, next) {
  if (
    prev &&
    next &&
    prev.width === next.width &&
    prev.height === next.height
  ) {
    return prev
  }
  return next
}
