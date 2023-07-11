
export function getUid() {
  return Math.random().toString(36).substring(2, 9);
}


export function isHtmlVideoElement(
  element:
    | HTMLVideoElement
    | HTMLImageElement
    | HTMLCanvasElement
    | null
    | HTMLElement
): element is HTMLVideoElement {
  if (!element) return false;
  return element.tagName === "VIDEO";
}
export function isHtmlImageElement(
  element:
    | HTMLVideoElement
    | HTMLImageElement
    | HTMLCanvasElement
    | null
    | HTMLElement
): element is HTMLImageElement {
  if (!element) return false;
  return element.tagName === "IMG";
}


export function formatTimeToMinSec(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  if(minutes === 0 && seconds === 0) return "0:00";
  if(minutes === 0) return `${seconds < 10 ? "0" + seconds : seconds} sec`;
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}