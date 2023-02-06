import { PageResult, TaskCreation } from "@/interface";
import { MessagePorta } from "@/utils/porta";

export const openConsoleMessagePorta = new MessagePorta<void>('console/open');

export const startTaskMessagePorta = new MessagePorta<TaskCreation>('task/start');

export const cancelTaskMessagePorta = new MessagePorta<void>('task/cancel');

export const actionsDoneMessagePorta = new MessagePorta<{
  tabId: number;
  result: any;
}>('actions/done');

export const requestTaskResultsMessagePorta = new MessagePorta<void>('task/request-results');

export const taskResultsMessagePorta = new MessagePorta<PageResult[]>('task/results');
