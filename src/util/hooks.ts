import { useCallback, useEffect, useState } from "react";
import { Mutator, StorePorta } from "./porta";

export const useStorePorta = <T>(porta: StorePorta<T>) => {
  const [state, setState] = useState(() => porta.getValue());

  useEffect(() => {
    return porta.subscribe(value => setState(value));
  }, []);

  const setStateWithPorta = useCallback((value: Mutator<T>) => {
    porta.push(value);
  }, []);

  return [state, setStateWithPorta] as const;
};
