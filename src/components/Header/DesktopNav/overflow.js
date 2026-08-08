export function getVisibleNavigationCount({ availableWidth, gap, itemWidths, moreWidth }) {
  for (let count = itemWidths.length; count >= 0; count -= 1) {
    const visibleWidth = itemWidths.slice(0, count).reduce((total, width) => total + width, 0)
    const itemGaps = Math.max(count - 1, 0) * gap
    const hasOverflow = count < itemWidths.length
    const moreTriggerWidth = hasOverflow ? moreWidth + (count > 0 ? gap : 0) : 0

    if (visibleWidth + itemGaps + moreTriggerWidth <= availableWidth) {
      return count
    }
  }

  return 0
}
