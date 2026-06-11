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

export const lineErase=(fromX:number,fromY:number,toX:number,toY:number,x:number,y:number)=>{
     const dx = toX - fromX;
        const dy = toY - fromY;

        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return;

        let t =
            ((x - fromX) * dx + (y - fromY) * dy) /
            lenSq;

        t = Math.max(0, Math.min(1, t));

        const closestX = fromX + t * dx;
        const closestY = fromY + t * dy;

        const distance = Math.hypot(
            x - closestX,
            y - closestY
        );

        if (distance <= 3) {
           return true;
        }
    
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
        if(lineErase(fromX,fromY,toX,toY,x,y))ids.push(s.id);
        }else if(s.type===ShapeType.PENCIL){
            const points=s.data;
            for(let i=0;i<points.length-1;i++){
                const p1=points[i], p2=points[i+1];
                if(lineErase(p1.x,p1.y,p2.x,p2.y,x,y)){
                    ids.push(s.id);
                    break;
                }    
            }
        }
    })
    return callErase(ids,shapes)
}