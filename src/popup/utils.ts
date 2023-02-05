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

export function readFile(accept: string, callback: (fileStr: string, filename: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const list = Array.from(input.files);
    if (list.length) {
      const file = list[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        const fileStr = e.target.result as string;
        callback(fileStr, file.name);
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

export function readJSONFile(callback: (obj: any, filename: string) => void) {
  readFile('application/json', (str, filename) => {
    try {
      const fileContent = JSON.parse(str);
      callback(fileContent, filename);
    } catch (e) {
      window.alert((e as Error).message);
    }
  });
}
