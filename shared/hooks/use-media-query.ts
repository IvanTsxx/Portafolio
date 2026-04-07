import { useSyncExternalStore } from "react";

const getServerSnapshot = () => false;

export function useMediaQuery(query: string) {
  const subscribe = (onStoreChange: () => void) => {
    const matchQueryList = matchMedia(query);
    matchQueryList.addEventListener("change", onStoreChange);
    return () => {
      matchQueryList.removeEventListener("change", onStoreChange);
    };
  };

  const getSnapshot = () => matchMedia(query).matches;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
