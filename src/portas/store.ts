import { RunningState } from "@/enum";
import { StorePorta } from "@/util/porta";

export const runningStatePorta = new StorePorta('runnnig-state', RunningState.Idle);
