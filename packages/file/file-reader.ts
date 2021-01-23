/**
 * JS Doc
 * @description 文件转buffer
 * @usage fileToBuffer(file)
 */
export function fileToBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(reader.result as ArrayBuffer);
    reader.onerror = (e) => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(reader.result as string);
    reader.onerror = (e) => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}
