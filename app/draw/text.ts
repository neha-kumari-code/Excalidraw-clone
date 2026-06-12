export function drawText(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,text:string,x:number,y:number,font:number){
    ctx.font=`${font}px sans-serif`;
    ctx.textBaseline = "top"
    ctx.fillText(text,x,y);
}