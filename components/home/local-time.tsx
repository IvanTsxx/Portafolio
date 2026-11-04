"use client";

import { useSyncExternalStore } from "react";

const timeZone = "America/Argentina/Tucuman";

const subscribe = (notify: () => void) => {
  const timer = window.setInterval(notify, 15_000);
  return () => window.clearInterval(timer);
};

const readMinute = () => Math.floor(Date.now() / 60_000);
const readServerMinute = () => null;

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZone,
});

export const LocalTime = () => {
  const minute = useSyncExternalStore(subscribe, readMinute, readServerMinute);
  return (
    <span className="tabular-nums">
      {minute === null ? "--:--" : timeFormat.format(new Date(minute * 60_000))}
    </span>
  );
};
