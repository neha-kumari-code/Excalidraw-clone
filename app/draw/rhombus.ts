
export function drawRhombus( canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,cx:number,cy:number,h:number,v:number){
    ctx.beginPath();
    ctx.moveTo(cx,cy-v/2);// top vertex
    ctx.lineTo(cx+h/2,cy);// right vertex
    ctx.lineTo(cx,cy+v/2);//bottom vertex
    ctx.lineTo(cx-h/2,cy);//left vertex
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

}