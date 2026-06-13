
import { ShapesType } from "./game";
import { ShapeType } from "@/generated/prisma/enums";
import { drawRhombus } from "./rhombus";
import { drawArrow } from "./arrow";
import { drawPencil } from "./pencil";
import { drawText } from "./text";

export function printShapes(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,databaseShapes: ShapesType[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    databaseShapes.forEach((s) => {
        if (s.type === ShapeType.RECT) {
            const d = s.data;
            ctx.beginPath();
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 1;
            ctx.rect(d.startX,d.startY,d.width,d.height);
            ctx.stroke();
           
        }else if(s.type===ShapeType.RHOMBUS){
          const data=s.data;
          drawRhombus(canvas,ctx,data.cx,data.cy,data.h,data.v);
        }else if(s.type===ShapeType.CIRCLE){
          const data=s.data;
          ctx.beginPath();
          ctx.arc(data.cx,data.cy,data.radius,0,Math.PI*2);
          ctx.stroke();
         
        }else if(s.type===ShapeType.ARROW){
          const data=s.data;
          drawArrow(canvas,ctx,data.fromX,data.toX,data.fromY,data.toY);
          
        }else if(s.type===ShapeType.LINE){
            ctx.beginPath();
            ctx.moveTo(s.data.fromX,s.data.fromY);
            ctx.lineTo(s.data.toX,s.data.toY);
            ctx.stroke();
           
        }else if(s.type===ShapeType.PENCIL){
          const points=s.data;
          drawPencil(canvas,ctx,points);
          
        }else if(s.type===ShapeType.TEXT){
          const data=s.data;
          ctx.font = `${data.font ?? 20}px sans-serif`;
          const metrics=ctx.measureText(data.text);
          drawText(canvas,ctx,data.text,data.x,data.y,data.font);
          
        }
    });
}