import axios from "axios";
import { clearCanvas } from "./clearCanvas";
import { ShapeType } from "@/generated/prisma/enums";
import { erasing } from "./erasing";

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
    // private isPanning = false;
    // private lastX = 0;
    // private lastY = 0;
    private scale = 1;
    private selectedShape: ShapesType | null = null;
    private isDraggingShape = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;
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
    const {data}=await axios.get("/api/shapes");
    if(!data.success)return;
    this.shapes=data.shapes;
    clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    this.mouseHandler();
    }

    mouseHandler(){
        this.canvas.addEventListener("mousedown",this.mouseDownHandler);
        this.canvas.addEventListener("mouseup",this.mouseUpHandler);
        this.canvas.addEventListener("mousemove",this.mouseMoveHandler)
        this.canvas.addEventListener("wheel", this.wheelHandler);
        this.cleanUp= ()=>{
            this.canvas.removeEventListener("mousedown",this.mouseDownHandler);
            this.canvas.removeEventListener("mouseup",this.mouseUpHandler);
            this.canvas.removeEventListener("mousemove",this.mouseMoveHandler)
            this.canvas.removeEventListener("wheel", this.wheelHandler);
        }
    }

    mouseDownHandler=(e:MouseEvent)=>{
    
    if(this.tool==="eraser"){
        const worldX =(e.offsetX-this.cameraX)/this.scale;
        const worldY =(e.offsetY-this.cameraY)/this.scale;
        this.shapes=erasing(worldX,worldY,this.shapes);
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
        return;
    }

    this.isDrawing=true;
    this.startX = (e.offsetX - this.cameraX)/this.scale;
    this.startY = (e.offsetY - this.cameraY)/this.scale;
    }
    mouseUpHandler=async(e:MouseEvent)=>{
        this.isDraggingShape = false;
        this.isDrawing=false;
        const worldX =(e.offsetX - this.cameraX)/this.scale;
        const worldY =(e.offsetY - this.cameraY)/this.scale;
        const width = worldX - this.startX;
        const height = worldY - this.startY;
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
   
    clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }


    mouseMoveHandler=(e:MouseEvent)=>{
        const worldX =(e.offsetX - this.cameraX)/this.scale;
        const worldY =(e.offsetY - this.cameraY)/this.scale;
        
      if(this.isDraggingShape && this.selectedShape){
        this.selectedShape.data.startX =
        worldX - this.dragOffsetX;

        this.selectedShape.data.startY =
        worldY - this.dragOffsetY;

        this.redraw();
        return;
        }

        if(this.isDrawing){
            this.redraw();
            if(this.tool==="rect"){
            const width=worldX-this.startX;
            const height=worldY-this.startY;
            this.ctx.beginPath();
            this.ctx.strokeStyle="rgb(0,0,0)";
            this.ctx.rect(this.startX,this.startY,width,height)
            this.ctx.stroke()
            }
        }
    }

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const worldX = (mouseX -this.cameraX) / this.scale;
    const worldY = (mouseY-this.cameraY ) / this.scale;
    const zoomFactor = e.deltaY > 0 ? 0.98 : 1.02;

    this.scale *= zoomFactor;
    

    this.cameraX = mouseX - worldX * this.scale;
    this.cameraY = mouseY - worldY * this.scale;

    this.redraw();
}
    redraw() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // apply camera transform
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.cameraX, this.cameraY);

    clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape
    );
    }
    setTool(tool:string){
        this.tool=tool
    }
    destroy(){
        this.cleanUp?.();
    }
}


