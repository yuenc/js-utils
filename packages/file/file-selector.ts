/**
 * JS Doc
 * @description 文件选择器
 * @usage fileSelector() // Promise<File[]>
 * @version 0.0.1
 */
export function fileSelector(accept?: "image/*", multiple?: boolean): Promise<File[]> {
  return new Promise<File[]>((resolve, reject) => {
    const input = document.createElement('input');
    input.type = "file";
    input.style.width = "0";
    input.style.height = "0";
    input.multiple = !!multiple;
    if (accept) {
      input.accept = accept;
    }

    const clear = () => document.body.removeChild(input);
    input.onchange = (e: any) => {
      const files: FileList = e.target.files;
      resolve(Array.from(files));
      clear();
    };
    input.oncancel = () => {
      reject('canceled');
      clear();
    };
    document.body.appendChild(input);
    input.click();
  });
}
