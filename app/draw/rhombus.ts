
export function drawRhombus( canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,cx:number,cy:number,h:number,v:number){
    ctx.beginPath();
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.moveTo(cx,cy-v/2);// top vertex
    ctx.lineTo(cx+h/2,cy);// right vertex
    ctx.lineTo(cx,cy+v/2);//bottom vertex
    ctx.lineTo(cx-h/2,cy);//left vertex
    ctx.closePath();
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.lineWidth = 1;
    ctx.stroke();

}