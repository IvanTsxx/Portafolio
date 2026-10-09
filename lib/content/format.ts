const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export const formatPostDate = (date: string) =>
  dateFormatter.format(new Date(`${date}T00:00:00Z`));
