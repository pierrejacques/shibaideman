import { MaybeResult, PageResult, Pages, TaskCreation } from "@/interface";
import { MessagePorta } from "@/utils/porta";

export const openConsoleMessagePorta = new MessagePorta<void>('console/open');

export const startTaskMessagePorta = new MessagePorta<TaskCreation>('task/start');

export const cancelTaskMessagePorta = new MessagePorta<void>('task/cancel');

export const actionsDoneMessagePorta = new MessagePorta<{
  tabId: number;
  result: MaybeResult;
}>('actions/done');

export const requestTaskResultsMessagePorta = new MessagePorta<void>('task/request-results');

export const requestRemainingPagesMessagePorta = new MessagePorta<void>('task/request-remaining-pages');

export const taskResultsMessagePorta = new MessagePorta<PageResult[]>('task/results');

export const remainingPagesMessagePorta = new MessagePorta<Pages>('task/remaining-pages');
