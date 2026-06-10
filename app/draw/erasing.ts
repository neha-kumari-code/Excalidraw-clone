import { ShapeType } from "@/generated/prisma/enums";
import { ShapesType } from "./game";

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
            const left=Math.min(data.startX,data.startX+data.width);
            const right=Math.max(data.startX,data.startX+data.width);
            const top=Math.min(data.startY,data.startY+data.height);
            const bottom=Math.max(data.startY,data.startY+data.height);
            if(x>=left && x<=right && y>=top && y<=bottom){
                ids.push(s.id);
            }
        }else if(s.type===ShapeType.CIRCLE){
            const data=s.data;
            const dx=x-data.centerX,dy=y-data.centerY,r=data.radius;
            if(dx*dx+dy*dy<=r*r){
                ids.push(s.id);
            }
        }else if(s.type===ShapeType.RHOMBUS){
            const cx=s.data.centerX, cy=s.data.centerY, h=s.data.hrizontalDiagLen, v=s.data.verticalDaigLen;
            const part1=Math.abs(x-cx)/(h/2);
            const part2=Math.abs(y-cy)/(v/2);
            if(part1+part2<=1){
                ids.push(s.id);
            }
        }else if(s.type===ShapeType.LINE){
            const fromX=s.data.fromX, fromY=s.data.fromY, toX=s.data.toX, toY=s.data.toY;
            // A-----P----B
            // cross product of AP AB
            const cross=((x-fromX)*(toY-fromY))-((toX-fromX)*(y-fromY));
            if(Math.abs(cross)>1e-6)return;
            const dot=((x-fromX)*(toX-fromX))+((toY-fromY)*(y-fromY));
            if (dot < 0) return;
            const lenSqd=(toX-fromX)**2 + (toY-fromY)**2;
            if(dot>lenSqd)return;
            ids.push(s.id);
        }
    })
    return callErase(ids,shapes)
}