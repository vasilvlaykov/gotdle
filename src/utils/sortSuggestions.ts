export function sortSuggestions<T>(
  items: T[],
  query: string,
  getName: (item: T) => string
): T[] {
  const q = query.toLowerCase();

  return items
    .filter((item) => getName(item).toLowerCase().includes(q))
    .sort((a, b) => {
      const aName = getName(a).toLowerCase();
      const bName = getName(b).toLowerCase();

      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);

      // Priority 1: startsWith(query)
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Priority 2: alphabetical
      return aName.localeCompare(bName);
    });
}
