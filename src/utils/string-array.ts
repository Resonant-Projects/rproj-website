export const toStringArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
};
