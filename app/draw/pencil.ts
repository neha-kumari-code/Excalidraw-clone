
export function drawPencil(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,pencilPoints:{x:number,y:number}[]){
    if(pencilPoints.length<2)return;
    ctx.beginPath();
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.moveTo(pencilPoints[0].x,pencilPoints[0].y);
   for(let i=1;i<pencilPoints.length;i++){
    ctx.lineTo(pencilPoints[i].x,pencilPoints[i].y);
   }
    ctx.stroke();
}