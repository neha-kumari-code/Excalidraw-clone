
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
                ctx.beginPath();
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;

                ctx.strokeRect(
                    d.startX,
                    d.startY,
                    d.width,
                    d.height
                );
            }
        }
    });
}