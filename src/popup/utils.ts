import { Action, Pages } from "@/interface";
import { isString } from "@/utils/lang";

export function downloadFile(str: string, filename: string) {
  const blob = new Blob([str]);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.download = filename;
  anchor.href = url;
  anchor.target = "_blank";
  anchor.click();
}

export function downloadJSONFile(data: any, filename: string) {
  const str = JSON.stringify(data);
  downloadFile(str, filename);
};

export function selectFile(accept: string, callback: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const list = Array.from(input.files);
    if (list.length) {
      const file = list[0];
      callback(file);
    }
  };
  input.click();
}

export function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileStr = e.target.result as string;
      resolve(fileStr);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  })
}

export function validatePages(pages: Pages) {
  if (!Array.isArray(pages?.urls)) {
    throw new Error('pages.urls must be an array');
  }

  for (const url of pages.urls) {
    if (isString(url)) continue;

    if (!url?.template) {
      throw new Error('no field template in url');
    }
  }
}

export function validateActions(actions: Action[]) {
  if (!Array.isArray(actions)) {
    throw new Error('actions must be an array');
  }

  for (const action of actions) {
    switch (action?.type) {
      case 'capture':
        if (!action.fields) throw new Error('invalid capture action, no "fields" provided');
        break;
      case 'children':
        if (!action.selector) throw new Error('invalid capture action, no "fields" provided');
        validateActions(action.actions);
        break;
      case 'delay':
        if (!action.ms) throw new Error('invalid delay action, no "ms" provided');
        break;
      case 'event':
        if (!['click', 'focus', 'blur'].includes(action.event)) throw new Error('invalid event action, unknown event');
        if (!action.selector) throw new Error('invalid event action, no "selector" provided');
        break;
      case 'loop':
        if (!action.condition) throw new Error('invalid loop action, no "condition" provided');
        break;
      case 'loop-end':
        break;
      case 'interrupt':
        if (!action.selector) throw new Error('invalid interrupt action, no "selector" provided');
        break;
      default:
        throw new Error(`unknown action type`)
    }
  }
}