export const fullWidthClassName = "@3xl:col-span-2";

export const fullWidthFlags = (isWide: readonly boolean[]) => {
  const flags = isWide.map((wide) => wide);
  let filled = 0;
  for (const [index, wide] of isWide.entries()) {
    if (wide) {
      if (filled === 1) {
        flags[index - 1] = true;
      }
      filled = 0;
    } else {
      filled = filled === 0 ? 1 : 0;
    }
  }
  if (filled === 1) {
    flags[flags.length - 1] = true;
  }
  return flags;
};
