import { RunningState } from "@/enum";
import { StorePorta } from "@/utils/porta";

export interface Store {
  runningState: RunningState;
  totalCount: number;
  doneCount: number;
  voidCount: number;
}

export const storePorta = new StorePorta<Store>('runnnig-state', {
  runningState: RunningState.Idle,
  totalCount: 0,
  doneCount: 0,
  voidCount: 0,
});
