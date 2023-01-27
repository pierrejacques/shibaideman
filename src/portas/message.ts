import { MessagePorta } from "@/util/porta";

export const postItemMessagePorta = new MessagePorta<{
  search: string;
  desc: string;
}>('item/post');

export const openConsoleMessagePorta = new MessagePorta<void>('console/open');

export const getItemMessagePorta = new MessagePorta<void>('item/get');

export const responseItemMessagePorta = new MessagePorta<Record<number, string>>('item/response');

export const startTaskMessagePorta = new MessagePorta<[number, string][]>('task/start');