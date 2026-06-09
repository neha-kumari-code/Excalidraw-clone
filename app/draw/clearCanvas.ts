
// import { ShapesType } from "./game";
// import { ShapeType } from "@/generated/prisma/enums";

// export async function clearCanvas(canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D,shapes:ShapesType[], selectedShape: ShapesType | null){
   
//     ctx.clearRect(0,0,canvas.width,canvas.height)
//    shapes.forEach((s:{id:string,type:ShapeType,data:any}) => {
//     ctx.beginPath();
//     if(this.selectedShape?.id === shape.id){
//     ctx.strokeStyle = "blue";
//     ctx.lineWidth = 2;

//     ctx.strokeRect(
//         startX,
//         startY,
//         width,
//         height
//     );
// }
//     if(s.type=="RECT"){
//         const d=s.data as any;
//         ctx.rect(d.startX,d.startY,d.width,d.height)
//         ctx.stroke();
//     }
//    });
// }


import { ShapesType } from "./game";
import { ShapeType } from "@/generated/prisma/enums";

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

export function clearCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    shapes: ShapesType[],
    selectedShape: ShapesType | null
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((s) => {
        if (s.type === ShapeType.RECT) {
            const d = s.data;

            // Draw rectangle
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;

            ctx.rect(
                d.startX,
                d.startY,
                d.width,
                d.height
            );

            ctx.stroke();

            // Draw selection border
            if (selectedShape?.id === s.id) {
                drawSelection(ctx, d.startX, d.startY, d.width, d.height);
                // ctx.beginPath();
                // ctx.strokeStyle = "blue";
                // ctx.lineWidth = 2;

                // ctx.strokeRect(
                //     d.startX,
                //     d.startY,
                //     d.width,
                //     d.height
                // );
            }
        }
    });
}