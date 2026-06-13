
import { ShapesType } from "./game";
import { ShapeType } from "@/generated/prisma/enums";
import { drawRhombus } from "./rhombus";
import { drawArrow } from "./arrow";
import { drawPencil } from "./pencil";
import { drawText } from "./text";

function drawSelection(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const padding = 4;
  const handleSize = 8;

  const left = Math.min(x, x + width);
const right = Math.max(x, x + width);

const top = Math.min(y, y + height);
const bottom = Math.max(y, y + height);

  const sx = left - padding;
const sy = top - padding;
const sw = right - left + padding * 2;
const sh = bottom - top + padding * 2;
  // selection border
  ctx.strokeStyle = "#6965db"; // Excalidraw-like purple
  ctx.lineWidth = 2;
  ctx.strokeRect(sx, sy, sw, sh);

  // corner handles
  const handles = [
    [sx, sy],               // top-left
    [sx + sw, sy],          // top-right
    [sx, sy + sh],          // bottom-left
    [sx + sw, sy + sh],     // bottom-right
  ];

  ctx.fillStyle = "white";
  ctx.strokeStyle = "#6965db";

  handles.forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.rect(
      hx - handleSize / 2,
      hy - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.fill();
    ctx.stroke();
  });
}

function selectionArrowLine( ctx: CanvasRenderingContext2D,fromX:number,fromY:number,toX:number,toY:number){
  ctx.beginPath();
  ctx.strokeStyle="blue"
  ctx.arc(fromX,fromY,3,0,Math.PI*2);
  ctx.stroke();
   ctx.beginPath();
  ctx.arc(toX,toY,3,0,Math.PI*2);
  ctx.stroke();
}

export function clearCanvas(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,shapes: ShapesType[],selectedShape: ShapesType | null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((s) => {
        if (s.type === ShapeType.RECT) {
            const d = s.data;
            ctx.beginPath();
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 1;
            ctx.rect(d.startX,d.startY,d.width,d.height);
            ctx.stroke();
            // draw selection border
            if (selectedShape?.id === s.id) {
                drawSelection(ctx, d.startX, d.startY, d.width, d.height);
            }
        }else if(s.type===ShapeType.RHOMBUS){
          const data=s.data;
          drawRhombus(canvas,ctx,data.cx,data.cy,data.h,data.v);
          if (selectedShape?.id === s.id) {
                const startX=data.cx-data.h/2, startY=data.cy-data.v/2;
                drawSelection(ctx,startX,startY, data.h, data.v);
          }
        }else if(s.type===ShapeType.CIRCLE){
          const data=s.data;
          ctx.beginPath();
          ctx.strokeStyle = "rgb(0, 0, 0)";
          ctx.arc(data.cx,data.cy,data.radius,0,Math.PI*2);
          ctx.stroke();
          if (selectedShape?.id === s.id) {
                const startX=data.cx-data.radius, startY=data.cy-data.radius;
                drawSelection(ctx,startX,startY,data.radius*2, data.radius*2);
          }
        }else if(s.type===ShapeType.ARROW){
          const data=s.data;
          drawArrow(canvas,ctx,data.fromX,data.toX,data.fromY,data.toY);
           if (selectedShape?.id === s.id) {
                selectionArrowLine(ctx,data.fromX,data.fromY,data.toX,data.toY);
          }
        }else if(s.type===ShapeType.LINE){
            ctx.beginPath();
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.moveTo(s.data.fromX,s.data.fromY);
            ctx.lineTo(s.data.toX,s.data.toY);
            ctx.stroke();
            if (selectedShape?.id === s.id) {
                selectionArrowLine(ctx,s.data.fromX,s.data.fromY,s.data.toX,s.data.toY);
          }
        }else if(s.type===ShapeType.PENCIL){
          const points=s.data;
          drawPencil(canvas,ctx,points);
           if (selectedShape?.id === s.id) {
          let leastX=Number.MAX_SAFE_INTEGER, maxX=Number.MIN_SAFE_INTEGER, leastY=Number.MAX_SAFE_INTEGER, maxY=Number.MIN_SAFE_INTEGER;
          points.forEach((p:{x:number,y:number}) => {
            leastX=Math.min(leastX,p.x);
            maxX=Math.max(maxX,p.x);
            leastY=Math.min(leastY,p.y);
            maxY=Math.max(maxY,p.y);
          });
          drawSelection(ctx,leastX,leastY,maxX-leastX, maxY-leastY);
        }
        }else if(s.type===ShapeType.TEXT){
          const data=s.data;
          ctx.font = `${data.font ?? 20}px sans-serif`;
          const metrics=ctx.measureText(data.text);
           const textWidth=metrics.width;
           const textHeight=data.font ?? 20;
          drawText(canvas,ctx,data.text,data.x,data.y,data.font);
           if (selectedShape?.id === s.id) {
                drawSelection(ctx,data.x,data.y,textWidth,textHeight);
          }
        }
    });
}