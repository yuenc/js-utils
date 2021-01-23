
/**
 * JS Doc
 * @description 文件下载器
 * @usge 
 * downloadFile("sun.png", "http://sun.org/sun.png");
 * downloadBlob("sun.png", blob);
 * @see http://www.zhangxinxu.com/wordpress/2017/07/js-text-string-download-as-html-json-file/
 * browser
 */
export function downloadFile(fileName: string, href: string) {
  const eleLink = document.createElement('a');
  eleLink.download = fileName;
  eleLink.style.display = 'none';
  eleLink.href = href;
  eleLink.click();
}

export function forceDownloadFile(fileName: string, href: string) {
  fetch(href).then(r => r.blob()).then(blob => {
    downloadBlob(fileName, blob);
  });
}

export function downloadBlob(fileName: string, content: BlobPart, blobOptions = {}) {
  // blobOptions = {
  //     type: 'text/csv',
  //     endings: 'native' // or transparent
  // };

  const blob = new Blob([content], blobOptions);
  const a = document.createElement('a');
  a.innerHTML = fileName;
  a.download = fileName;
  a.href = URL.createObjectURL(blob);

  document.body.appendChild(a);

  const evt = document.createEvent("MouseEvents");
  evt.initEvent("click", false, false);

  a.dispatchEvent(evt);

  document.body.removeChild(a);
}
