import { ShapeType } from "@/generated/prisma/enums";
import { ShapesType } from "./game";
import { Circle, Line, Rectangle, Rhombus } from "./coordinate";

export default function editing(x:number,y:number,shapes: ShapesType[]){

    for(let i=shapes.length-1;i>=0;i--){
        const s=shapes[i];

         if(s.type===ShapeType.RECT){
                    const data=s.data;
                   if(Rectangle(x,y,data.startX,data.startY,data.width,data.height))return s;
                }else if(s.type===ShapeType.CIRCLE){
                    const data=s.data;
                    if(Circle(x,y,data.cx,data.cy,data.radius))return s;
                }else if(s.type===ShapeType.RHOMBUS){
                    const cx=s.data.cx, cy=s.data.cy, h=s.data.h, v=s.data.v;
                    if(Rhombus(x,y,cx,cy,h,v)){
                       return s;
                    }
                }else if(s.type===ShapeType.LINE || s.type===ShapeType.ARROW){
                const { fromX, fromY, toX, toY } = s.data;
                if(Line(fromX,fromY,toX,toY,x,y)){
                   return s;
                }
                }else if(s.type===ShapeType.PENCIL){
                    const points=s.data;
                    for(let i=0;i<points.length-1;i++){
                        const p1=points[i], p2=points[i+1];
                        if(Line(p1.x,p1.y,p2.x,p2.y,x,y)){
                           return s;
                        }    
                    }
                }
    }
    return null;
}