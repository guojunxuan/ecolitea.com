export const getNextFooterAccordionItem = (currentItem, requestedItem) =>
  currentItem === requestedItem ? null : requestedItem;
