
import { ShapesType } from "./game";
import { ShapeType } from "@/generated/prisma/enums";
import { drawRhombus } from "./rhombus";
import { drawArrow } from "./arrow";

function drawSelection(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const padding = 4;
  const handleSize = 8;

  const sx = x - padding;
  const sy = y - padding;
  const sw = width + padding * 2;
  const sh = height + padding * 2;

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

export function clearCanvas(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,shapes: ShapesType[],selectedShape: ShapesType | null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((s) => {
        if (s.type === ShapeType.RECT) {
            const d = s.data;
            ctx.beginPath();
            ctx.strokeStyle = "black";
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
          ctx.arc(data.cx,data.cy,data.radius,0,Math.PI*2);
          ctx.stroke();
          if (selectedShape?.id === s.id) {
                const startX=data.cx-data.radius, startY=data.cy-data.radius;
                drawSelection(ctx,startX,startY,data.radius*2, data.radius*2);
          }
        }else if(s.type===ShapeType.ARROW){
          const data=s.data;
          drawArrow(canvas,ctx,data.fromX,data.toX,data.fromY,data.toY);
        }else if(s.type===ShapeType.LINE){
            ctx.beginPath();
            ctx.moveTo(s.data.fromX,s.data.fromY);
            ctx.lineTo(s.data.toX,s.data.toY);
            ctx.stroke();
        }
    });
}