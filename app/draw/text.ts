export function drawText(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,text:string,x:number,y:number,font:number){
     ctx.save();                          // ← save current state
    ctx.fillStyle = "rgb(0, 0, 0)"; 
    ctx.font=`${font}px sans-serif`;
    ctx.textBaseline = "top"
    ctx.fillText(text,x,y);
}