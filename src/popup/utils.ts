export function downloadFile(data: any, fileName: string) {
  const str = JSON.stringify(data);
  const blob = new Blob([str]);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.download = fileName;
  anchor.href = url;
  anchor.target = "_blank";
  anchor.click();
};

export function readJSONFile(callback: (obj: any) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = 'application/json';
  input.onchange = () => {
    const list = Array.from(input.files);
    if (list.length) {
      const file = list[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        const fileStr = e.target.result as string;
        try {
          const fileContent = JSON.parse(fileStr);
          callback(fileContent);
        } catch (e) {
          window.alert((e as Error).message);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}
