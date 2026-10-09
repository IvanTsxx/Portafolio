"use client";

import { useCallback, useSyncExternalStore } from "react";

const filterChangeEvent = "content-filter-change";

const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener(filterChangeEvent, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(filterChangeEvent, notify);
  };
};

const readServerValue = () => "";

export const useUrlFilter = (param: string) => {
  const readValue = useCallback(
    () => new URLSearchParams(window.location.search).get(param) ?? "",
    [param]
  );
  const value = useSyncExternalStore(subscribe, readValue, readServerValue);

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(window.location.search);
      if (next) {
        params.set(param, next);
      } else {
        params.delete(param);
      }
      const query = params.size > 0 ? `?${params}` : "";
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query}`
      );
      window.dispatchEvent(new Event(filterChangeEvent));
    },
    [param]
  );

  return [value, setValue] as const;
};
