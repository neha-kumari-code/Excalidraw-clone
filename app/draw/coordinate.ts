export const Rectangle=(x:number,y:number,startX:number,startY:number,width:number,height:number)=>{
    const left=Math.min(startX,startX+width);
    const right=Math.max(startX,startX+width);
    const top=Math.min(startY,startY+height);
    const bottom=Math.max(startY,startY+height);
    if(x>=left && x<=right && y>=top && y<=bottom){
        return true;
    }
    return false;
}

export const Circle=(x:number,y:number,centerX:number,centerY:number,radius:number)=>{
    const dx=x-centerX,dy=y-centerY,r=radius;
    console.log("cir")
    if(dx*dx+dy*dy<=r*r){
        console.log("yes")
       return true;
    }
    console.log("no")
    return false;
}

export const Rhombus=(x:number,y:number,cx:number,cy:number,h:number,v:number)=>{
            const part1=Math.abs(x-cx)/(h/2);
            const part2=Math.abs(y-cy)/(v/2);
            if(part1+part2<=1){
                return true;
            }
            return false;
}

export const Line=(fromX:number,fromY:number,toX:number,toY:number,x:number,y:number)=>{
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
        return false;
}
