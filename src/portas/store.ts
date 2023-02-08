import { RunningState } from "@/enum";
import { StorePorta } from "@/utils/porta";

export interface Store {
  runningState: RunningState;
  doneCount: number;
  voidCount: number;
}

export const storePorta = new StorePorta<Store>('runnnig-state', {
  runningState: RunningState.Idle,
  doneCount: 0,
  voidCount: 0,
});
