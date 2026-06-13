import { ShapeType } from "@/generated/prisma/enums";
import { ShapesType } from "./game";
import { Circle, Line, Rectangle, Rhombus } from "./coordinate";

// export const callErase=(ids:string[],shapes:ShapesType[])=>{
//         ids.forEach((id)=>{
//             const updatedShapes = shapes.filter(
//             shape => shape.id !== id
//             );
//             shapes=updatedShapes
//         })
//         console.log(`shapes: ${shapes}`)
//        return shapes;
// }

// time complexity km:-
export const callErase = (ids: string[], shapes: ShapesType[]) => {
    const set = new Set(ids);
    return shapes.filter(shape => !set.has(shape.id));
};

export function erasing(x:number,y:number,shapes:ShapesType[]){
    const ids:string[]=[];
    shapes.forEach((s)=>{
        if(s.type===ShapeType.RECT){
            const data=s.data;
           if(Rectangle(x,y,data.startX,data.startY,data.width,data.height))ids.push(s.id);
        }else if(s.type===ShapeType.CIRCLE){
            const data=s.data;
            if(Circle(x,y,data.cx,data.cy,data.radius))ids.push(s.id);
        }else if(s.type===ShapeType.RHOMBUS){
            const cx=s.data.cx, cy=s.data.cy, h=s.data.h, v=s.data.v;
            if(Rhombus(x,y,cx,cy,h,v)){
                ids.push(s.id);
            }
        }else if(s.type===ShapeType.LINE || s.type===ShapeType.ARROW){
        const { fromX, fromY, toX, toY } = s.data;
        if(Line(fromX,fromY,toX,toY,x,y)){
            ids.push(s.id);
        }
        }else if(s.type===ShapeType.PENCIL){
            const points=s.data;
            for(let i=0;i<points.length-1;i++){
                const p1=points[i], p2=points[i+1];
                if(Line(p1.x,p1.y,p2.x,p2.y,x,y)){
                    ids.push(s.id);
                    break;
                }    
            }
        }
    })
    console.log(`ids: ${ids}`)
    return callErase(ids,shapes)
}