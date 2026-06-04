import axios from "axios";
import { clearCanvas } from "./clearCanvas";
import { ShapeType } from "@/generated/prisma/enums";

export type ShapesType={
    id:string,
    type:ShapeType,
    data:any
} 
export class Game{
    private tool:string;
    private canvas:HTMLCanvasElement;
    private startX:number;
    private startY:number;
    private ctx:CanvasRenderingContext2D;
    private isDrawing:boolean;
    private cleanUp:(()=>void) | null=null
    private shapes:ShapesType[];
    private cameraX = 0;
private cameraY = 0;
private isPanning = false;
private lastX = 0;
private lastY = 0;
    constructor(tool:string,canvas:HTMLCanvasElement){
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d")!
        this.tool=tool;
        this.canvas=canvas;
        this.isDrawing=false;
        this.startX=0;
        this.startY=0;
        this.shapes=[];
        this.init();
    }
    init=async()=>{
         const {data}=await axios.get("/api/shapes")
        if(!data.success)return;
        this.shapes=data.shapes;
        clearCanvas(this.canvas,this.ctx,this.shapes)
        this.mouseHandler();
    }
    mouseHandler(){
        this.canvas.addEventListener("mousedown",this.mouseDownHandler);
        this.canvas.addEventListener("mouseup",this.mouseUpHandler);
        this.canvas.addEventListener("mousemove",this.mouseMoveHandler)

        this.cleanUp= ()=>{
            this.canvas.removeEventListener("mousedown",this.mouseDownHandler);
            this.canvas.removeEventListener("mouseup",this.mouseUpHandler);
            this.canvas.removeEventListener("mousemove",this.mouseMoveHandler)
        }
    }

    mouseDownHandler=(e:MouseEvent)=>{
        if (e.button === 1) { // middle mouse
        this.isPanning = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        return;
    }
         this.isDrawing=true;
        this.startX = e.offsetX - this.cameraX;
this.startY = e.offsetY - this.cameraY;
    }
    mouseUpHandler=async(e:MouseEvent)=>{
        
        this.isDrawing=false;
         this.isPanning = false;
        const width = (e.offsetX - this.cameraX) - this.startX;
const height = (e.offsetY - this.cameraY) - this.startY;
        if(this.tool==="rect"){
        const shape={
        type:ShapeType.RECT,
        data: {
            startX: this.startX,
            startY: this.startY,
            width,
            height
        }
        }
        await axios.post("/api/shapes",{
            type:shape.type,
            data:shape.data
        })
        this.shapes.push({
             id:crypto.randomUUID(),
             ...shape
        })
    }
    clearCanvas(this.canvas,this.ctx,this.shapes)
    }
    mouseMoveHandler=(e:MouseEvent)=>{
          if (this.isPanning) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;

        this.cameraX += dx;
        this.cameraY += dy;

        this.lastX = e.clientX;
        this.lastY = e.clientY;

        this.redraw();
        return;
    }
        if(this.isDrawing){
             this.redraw();
        clearCanvas(this.canvas,this.ctx,this.shapes)
        if(this.tool==="rect"){
           
            const width=e.offsetX-this.startX;
            const height=e.offsetY-this.startY;
            this.ctx.beginPath();
            this.ctx.strokeStyle="rgb(0,0,0)";
            this.ctx.rect(this.startX,this.startY,width,height)
            this.ctx.stroke()
        }
    }
    }

    redraw() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // apply camera transform
    this.ctx.setTransform(1, 0, 0, 1, this.cameraX, this.cameraY);

    clearCanvas(this.canvas, this.ctx, this.shapes);
}
    setTool(tool:string){
        this.tool=tool
    }
    destroy(){
        this.cleanUp?.();
    }
}


