
export function drawArrow(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,fromX:number,toX:number,fromY:number,toY:number){
    const arrowLen=15;
    const arrowAngle=30;
    const dx=toX-fromX, dy=toY-fromY;
    const angle=Math.atan2(dy,dx);
    // drawing main shaft
    ctx.beginPath();
    ctx.moveTo(fromX,fromY);
    ctx.lineTo(toX,toY);
    ctx.stroke();
    // calculating arrow angles 
    const angle1=angle-(arrowAngle*Math.PI)/180;
    const angle2 = angle+(arrowAngle * Math.PI)/180;
    //Calculate the coordinates for the arrowhead tips
    const topX=  toX-arrowLen*Math.cos(angle1);
    const topY = toY - arrowLen * Math.sin(angle1);
    const botX = toX - arrowLen * Math.cos(angle2);
    const botY = toY - arrowLen * Math.sin(angle2);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(botX, botY);
    ctx.closePath();
}