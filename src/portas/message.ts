import { MessagePorta } from "@/util/porta";

export const postItemMessagePorta = new MessagePorta<{
  search: string;
  desc: string;
}>('item/post');

export const openConsoleMessagePorta = new MessagePorta<void>('console/open');

export const getItemMessagePorta = new MessagePorta<void>('item/get');

export const startTaskMessagePorta = new MessagePorta<void>('task/start');

export const actionsDoneMessagePorta = new MessagePorta<{
  tabId: number;
  result: any;
}>('actions/done');
