import { ShapeType } from "@/generated/prisma/enums";
import { ShapesType } from "./game";
import { Circle, Line, Rectangle, Rhombus } from "./coordinate";

export const callErase=(ids:string[],shapes:ShapesType[])=>{
        ids.forEach((id)=>{
            const updatedShapes = shapes.filter(
            shape => shape.id !== id
            );
            shapes=updatedShapes
        })
       return shapes;
}

export function erasing(x:number,y:number,shapes:ShapesType[]){
    const ids:string[]=[];
    shapes.forEach((s)=>{
        if(s.type===ShapeType.RECT){
            const data=s.data;
           if(Rectangle(x,y,data.startX,data.startY,data.width,data.height))ids.push(s.id);
        }else if(s.type===ShapeType.CIRCLE){
            const data=s.data;
            if(Circle(x,y,data.centerX,data.centerY,data.radius))ids.push(s.id);
        }else if(s.type===ShapeType.RHOMBUS){
            const cx=s.data.cx, cy=s.data.cy, h=s.data.h, v=s.data.v;
            if(Rhombus(x,y,cx,cy,h,v)){
                ids.push(s.id);
            }
        }else if(s.type===ShapeType.LINE || s.type===ShapeType.ARROW){
            // const fromX=s.data.fromX, fromY=s.data.fromY, toX=s.data.toX, toY=s.data.toY;
            // // A-----P----B
            // // cross product of AP AB
            // const cross=((x-fromX)*(toY-fromY))-((toX-fromX)*(y-fromY));
            // if(Math.abs(cross)>1e-6)return;
            // const dot=((x-fromX)*(toX-fromX))+((toY-fromY)*(y-fromY));

            // if (dot < 0) return;
            // const lenSqd=(toX-fromX)**2 + (toY-fromY)**2;
            // if(dot>lenSqd)return;
            // ids.push(s.id);
        
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
    return callErase(ids,shapes)
}