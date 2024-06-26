import { ResultCode } from "./enum";

export type LoopCondition = {
  forCount: number;
} | {
  whileSelector: string;
} | {
  tillSelector: string;
};

export type TargetQuery = string | {
  selector: string;
  attr?: string;
  flag?: string;
}

export type Action = {
  type: 'delay'; // delay for ms
  ms: number;
} | {
  type: 'capture'; // capture fields
  fields: Record<string, TargetQuery | TargetQuery[]>;
} | {
  type: 'event'; // trigger an event on the page
  event: 'click' | 'focus' | 'blur';
  selector: string; // selector within the 
} | {
  type: 'loop';
  condition: LoopCondition;
} | {
  type: 'loop-end';
} | {
  type: 'children';
  selector: string;
  field?: string;
  actions: Action[];
} | {
  type: 'interrupt';
  selector: string;
}

export type UrlScheme = string | {
  template: string;
  source: Record<string, string[]>;
};

export interface Pages {
  urls: UrlScheme[];
}

export interface ActionScheme {
  flag?: TargetQuery; // if target is present, run task
  actions: Action[];
}

export interface Task {
  pages: Pages;
  scheme: ActionScheme;
}

export interface ExecutionConfig {
  parallel: number;
  intervalMs: number;
}

export interface TaskCreation {
  pages: Pages;
  actionScheme: ActionScheme;
  executionConfig: ExecutionConfig;
}

export interface UrlInfo {
  url: string;
  query?: Record<string, string>;
};

export interface PageData {
  [field: string]: string | PageData;
}

export interface PageResult {
  page: UrlInfo;
  data: PageData;
  code: ResultCode;
}

export type MaybeResult = Omit<PageResult, 'page'> | {
  error: string;
};

export type ConvertableFormat = 'json' | 'csv';

export interface ConvertConfig {
  from: ConvertableFormat;
  to: ConvertableFormat;
  mapping: Record<string, string>;
}
