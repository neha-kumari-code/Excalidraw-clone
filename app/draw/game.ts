import axios from "axios";
import { clearCanvas } from "./clearCanvas";
import { ShapeType } from "@/generated/prisma/enums";
import { erasing } from "./erasing";
import { drawRhombus } from "./rhombus";
import { drawArrow } from "./arrow";

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
    this.startX = (e.offsetX - this.cameraX)/this.scale;
    this.startY = (e.offsetY - this.cameraY)/this.scale;
    if(this.tool==="eraser"){
        this.shapes=erasing(this.startX,this.startY,this.shapes);
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }else  this.isDrawing=true;
    
    }
    mouseUpHandler=async(e:MouseEvent)=>{
        this.isDraggingShape = false;
        this.isDrawing=false;

        const worldX =(e.offsetX - this.cameraX)/this.scale;
        const worldY =(e.offsetY - this.cameraY)/this.scale;
        const width = worldX - this.startX;
        const height = worldY - this.startY;

        let shape:ShapesType;
        if(this.tool==="rect"){
        shape={
        id:crypto.randomUUID(),
        type:ShapeType.RECT,
        data: {
            startX: this.startX,
            startY: this.startY,
            width,
            height
        }
        }
        // await axios.post("/api/shapes",{
        //     type:shape.type,
        //     data:shape.data
        // })
        this.shapes.push({...shape});
        }else if(this.tool==="rhombus"){
            shape={
                id:crypto.randomUUID(),
                type:ShapeType.RHOMBUS,
                data:{
                    cx:(this.startX+worldX)/2,
                    cy:(this.startY+worldY)/2,
                    h:worldX-this.startX,
                    v:worldY-this.startY
                }
            }
            this.shapes.push({...shape});
        }else if(this.tool==="circle"){
            const cx=(this.startX+worldX)/2, cy=(this.startY+worldY)/2;
            const rad=Math.sqrt((worldX-cx)**2 + (worldY-cy)**2);
            this.ctx.beginPath();
            this.ctx.arc(cx,cy,rad,0,Math.PI*2)
            this.ctx.stroke();
            shape={
                id:crypto.randomUUID(),
                type:ShapeType.CIRCLE,
                data:{
                    cx,cy,radius:rad
                }
            }
            this.shapes.push({...shape})
        }else if(this.tool==="arrow"){
             shape={
                id:crypto.randomUUID(),
                type:ShapeType.ARROW,
                data:{
                    fromX:this.startX,
                    fromY:this.startY,
                    toX:worldX,
                    toY:worldY
                }
            }
            this.shapes.push({...shape});
        }else if(this.tool==="line"){
            shape={
                id:crypto.randomUUID(),
                type:ShapeType.LINE,
                data:{
                    fromX:this.startX,
                    fromY:this.startY,
                    toX:worldX,
                    toY:worldY
                }
            }
            this.shapes.push({...shape});
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
            const width=worldX-this.startX, height=worldY-this.startY;
            this.ctx.beginPath();
            this.ctx.strokeStyle="rgb(0,0,0)";
            this.ctx.rect(this.startX,this.startY,width,height)
            this.ctx.stroke()
            }else if(this.tool==="rhombus"){
                const cx=(this.startX+worldX)/2, cy=(this.startY+worldY)/2;
                const h=worldX-this.startX, v=worldY-this.startY;
                drawRhombus(this.canvas,this.ctx,cx,cy,h,v)
            }else if(this.tool==="circle"){
                const cx=(this.startX+worldX)/2, cy=(this.startY+worldY)/2;
                const rad=Math.sqrt((worldX-cx)**2 + (worldY-cy)**2);
                this.ctx.beginPath();
                this.ctx.arc(cx,cy,rad,0,Math.PI*2)
                this.ctx.stroke();
            }else if(this.tool==="arrow"){
                drawArrow(this.canvas,this.ctx,this.startX,worldX,this.startY,worldY);
            }else if(this.tool==="line"){
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX,this.startY);
                this.ctx.lineTo(worldX,worldY);
                this.ctx.stroke();
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


