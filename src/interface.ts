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
}

export type Action = {
  type: 'delay'; // delay for ms
  ms: number;
} | {
  type: 'capture'; // capture fields
  fields: Record<string, TargetQuery>;
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
}

export type UrlScheme = string | {
  template: string;
  source: Record<string, string[]>;
};

export interface Pages {
  urls: UrlScheme[];
}

export interface ActionScheme {
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
}
