import axios from "axios";
import { clearCanvas } from "./clearCanvas";
import { ShapeType } from "@/generated/prisma/enums";
import { callErase, erasing } from "./erasing";
import { drawRhombus } from "./rhombus";
import { drawArrow } from "./arrow";
import { drawPencil } from "./pencil";
import { drawText } from "./text";

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
    private scale = 1;
    private selectedShape: ShapesType | null = null;
    private isDraggingShape = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;
    private isErasing:boolean=false;
    private pencilPoints:{x:number,y:number}[]=[];
    private currentText="";
    private isTyping=false;
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
        window.addEventListener("keydown",this.keyDownHandler);
        this.cleanUp= ()=>{
            this.canvas.removeEventListener("mousedown",this.mouseDownHandler);
            this.canvas.removeEventListener("mouseup",this.mouseUpHandler);
            this.canvas.removeEventListener("mousemove",this.mouseMoveHandler)
            this.canvas.removeEventListener("wheel", this.wheelHandler);
            window.removeEventListener("keydown",this.keyDownHandler);
        }
    }

    mouseDownHandler=(e:MouseEvent)=>{
    this.startX = (e.offsetX - this.cameraX)/this.scale;
    this.startY = (e.offsetY - this.cameraY)/this.scale;
    if(this.tool==="eraser"){
        this.isErasing=true;
    }else if(this.tool==="text"){
        this.currentText="";
        this.isTyping=true;
    }
    else{ 
        this.isDrawing=true;
        this.pencilPoints.push({x:this.startX,y:this.startY});
    }
    }
    
    mouseUpHandler=async(e:MouseEvent)=>{
        this.isDraggingShape = false;
        this.isDrawing=false;
      
        const worldX =(e.offsetX - this.cameraX)/this.scale;
        const worldY =(e.offsetY - this.cameraY)/this.scale;
        const width = worldX - this.startX;
        const height = worldY - this.startY;
        if(this.isErasing){
            this.shapes=erasing(worldX,worldY,this.shapes)
            this.isErasing=false;
        }
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
        }else if(this.tool==="pencil"){
            this.pencilPoints.push({x:worldX,y:worldY});
             shape={
                id:crypto.randomUUID(),
                type:ShapeType.PENCIL,
                data:this.pencilPoints
            }
            this.shapes.push({...shape});
            this.pencilPoints=[];
        }else if(this.tool==="text" && this.currentText!==""){
            console.log("B")
             this.shapes.push({
                id:crypto.randomUUID(),
                type:ShapeType.TEXT,
                data:{
                   x:this.startX,
                   y:this.startY,
                   text:this.currentText
                }
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

        if(this.isErasing){
                this.shapes=erasing(worldX,worldY,this.shapes)
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
            }else if(this.tool==="pencil"){
                this.pencilPoints.push({x:worldX,y:worldY});
                drawPencil(this.canvas,this.ctx,this.pencilPoints);
            }
        }
    }

    keyDownHandler=(e:KeyboardEvent)=>{
        if(!this.isTyping)return;
        if(e.key==='Enter'){
            this.shapes.push({
                id:crypto.randomUUID(),
                type:ShapeType.TEXT,
                data:{
                   x:this.startX,
                   y:this.startY,
                   text:this.currentText
                }
            })
           
        }else if(e.key==='Backspace'){
            console.log("before:", this.currentText);
            this.currentText=this.currentText.slice(0,-1);
            console.log("after:", this.currentText);
        }else if(e.key.length===1){
            this.currentText+=e.key;
        }
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
        drawText(this.canvas,this.ctx,this.currentText,this.startX,this.startY);
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

    clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }
    setTool(tool:string){
        this.tool=tool
    }
    destroy(){
        this.cleanUp?.();
    }
}


