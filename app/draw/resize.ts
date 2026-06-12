export type ResizeHandle =
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | null;


export function getResizeHandle(
  x: number,
  y: number,
  startX: number,
  startY: number,
  width: number,
  height: number
): ResizeHandle {
  const padding = 4;
  const handleSize = 8;
  const left = Math.min(startX, startX + width);
const right = Math.max(startX, startX + width);

const top = Math.min(startY, startY + height);
const bottom = Math.max(startY, startY + height);

  const sx = left - padding;
const sy = top - padding;
const sw = right - left + padding * 2;
const sh = bottom - top + padding * 2;
  const handles = [
    { type: "nw", x: sx,  y: sy },
    { type: "ne", x: sx+sw, y:sy },
    { type: "sw", x: sx,  y: sy+sh },
    { type: "se", x: sx+sw, y: sy+sh },
  ];
  for (const h of handles) {
    if (
      x >= h.x - handleSize / 2 &&
      x <= h.x + handleSize / 2 &&
      y >= h.y - handleSize / 2 &&
      y <= h.y + handleSize / 2
    ) {
      return h.type as ResizeHandle;
    }
  }

  return null;
}


export type lineResizeHandle =
  | "s"
  | "e"
  |null
  
  export function getLineResizeHandle(
  x: number,
  y: number,
  fromX: number,
  fromY: number,
  toX: number,
  toY:number
): lineResizeHandle {
  const padding = 2;
  const handles = [
    { type: "s", cx: fromX,  cy: fromY,rad:2 },
     { type: "e", cx: toX,  cy: toY,rad:2 },
  ];
  for (const h of handles) {
    if ((h.cx-x)*(h.cx-x)+(h.cy-y)*(h.cy-y)<=h.rad*h.rad) {
      return h.type as lineResizeHandle;
    }
  }

  return null;
}
