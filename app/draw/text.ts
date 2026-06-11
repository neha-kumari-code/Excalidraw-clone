export function drawText(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,text:string,x:number,y:number){
    ctx.font="20px Arial";
    ctx.fillText(text,x,y);
}