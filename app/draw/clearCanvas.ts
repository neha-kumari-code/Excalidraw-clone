
import { ShapesType } from "./game";
import { ShapeType } from "@/generated/prisma/enums";

export async function clearCanvas(canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D,shapes:ShapesType[]){
   
    ctx.clearRect(0,0,canvas.width,canvas.height)
   shapes.forEach((s:{id:string,type:ShapeType,data:any}) => {
    ctx.beginPath();
    if(s.type=="RECT"){
        const d=s.data as any;
        ctx.rect(d.startX,d.startY,d.width,d.height)
        ctx.stroke();
    }
   });
}


