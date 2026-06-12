import axios from "axios";
import { clearCanvas } from "./clearCanvas";
import { ShapeType } from "@/generated/prisma/enums";
import {erasing } from "./erasing";
import { drawRhombus } from "./rhombus";
import { drawArrow } from "./arrow";
import { drawPencil } from "./pencil";
import { drawText } from "./text";
import editing from "./editing";
import { getLineResizeHandle, getResizeHandle, lineResizeHandle, ResizeHandle } from "./resize";

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
    private lastMouseX=0;
    private lastMouseY=0;
    private isResizing = false;
    private resizeHandle: ResizeHandle | lineResizeHandle = null;
    private resizeStartFont:number=0;
    private resizeStartX:number=0;
    private resizeStartTextWidth:number=0;
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
    }else if(this.tool===""){
    const previouslySelected = this.selectedShape;
    // First: if something was already selected, check resize handles
    if (previouslySelected?.type === ShapeType.RECT) {
        const handle = getResizeHandle(
            this.startX,
            this.startY,
            previouslySelected.data.startX,
            previouslySelected.data.startY,
            previouslySelected.data.width,
            previouslySelected.data.height
        );
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            // keep selectedShape as is
            return;
        }
    }else if(previouslySelected?.type === ShapeType.RHOMBUS){
         const handle = getResizeHandle(
            this.startX,
            this.startY,
            previouslySelected.data.cx-previouslySelected.data.h/2,
            previouslySelected.data.cy-previouslySelected.data.v/2,
            previouslySelected.data.h,
            previouslySelected.data.v
        );
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            // keep selectedShape as is
            return;
        }
    }else if(previouslySelected?.type === ShapeType.CIRCLE){
         const handle = getResizeHandle(
            this.startX,
            this.startY,
            previouslySelected.data.cx-previouslySelected.data.radius,
            previouslySelected.data.cy-previouslySelected.data.radius,
            previouslySelected.data.radius*2,
            previouslySelected.data.radius*2
        );
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            // keep selectedShape as is
            return;
        }
    }else if(previouslySelected?.type === ShapeType.ARROW || previouslySelected?.type === ShapeType.LINE){
         const handle = getLineResizeHandle(
            this.startX,
            this.startY,
            previouslySelected.data.fromX,
            previouslySelected.data.fromY,
            previouslySelected.data.toX,
            previouslySelected.data.toY
        );
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            // keep selectedShape as is
            return;
        }
    }else if(previouslySelected?.type === ShapeType.PENCIL){
        const points=previouslySelected.data;
        let leastX=Number.MAX_SAFE_INTEGER, maxX=Number.MIN_SAFE_INTEGER, leastY=Number.MAX_SAFE_INTEGER, maxY=Number.MIN_SAFE_INTEGER;
          points.forEach((p:{x:number,y:number}) => {
            leastX=Math.min(leastX,p.x);
            maxX=Math.max(maxX,p.x);
            leastY=Math.min(leastY,p.y);
            maxY=Math.max(maxY,p.y);
          });
         const handle = getResizeHandle(
            this.startX,
            this.startY,
            leastX,
            leastY,
            maxX-leastX,
            maxY-leastY
        );
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            // keep selectedShape as is
            return;
        }
    }else if(previouslySelected?.type === ShapeType.TEXT){
        const data=previouslySelected.data;
        this.ctx.font = `${data.font ?? 20}px sans-serif`;
           const metrics=this.ctx.measureText(data.text);
           const textWidth=metrics.width;
           const textHeight=data.font ?? 20;
         const handle = getResizeHandle(
            this.startX,
            this.startY,
            previouslySelected.data.x,
            previouslySelected.data.y,
            textWidth,
            textHeight
        );
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            this.resizeStartFont = data.font ?? 20;  // ← snapshot
            this.resizeStartX = data.x;  
            this.resizeStartTextWidth=textWidth;
            // keep selectedShape as is
            return;
        }
    }

    // Then: check if clicked a shape
    const clickedShape = editing(this.ctx,this.startX, this.startY, this.shapes);
    this.selectedShape = clickedShape;

    if (!this.selectedShape) {
        clearCanvas(this.canvas, this.ctx, this.shapes, null);
        return;
    }
    // Handle drag setup
    if (this.selectedShape.type === ShapeType.RECT) {
        this.isDraggingShape = true;
        this.dragOffsetX = this.startX - this.selectedShape.data.startX;
        this.dragOffsetY = this.startY - this.selectedShape.data.startY;
    }
    else if(this.selectedShape?.type===ShapeType.TEXT){
            this.dragOffsetX=this.startX-this.selectedShape.data.x;
             this.dragOffsetY=this.startY-this.selectedShape.data.y;
            //  this.isDraggingShape = true;
        }
        else if(this.selectedShape?.type===ShapeType.RHOMBUS){
             this.isDraggingShape = true;
            this.dragOffsetX=this.startX-this.selectedShape.data.cx;
             this.dragOffsetY=this.startY-this.selectedShape.data.cy;
        }else if(this.selectedShape?.type===ShapeType.LINE || this.selectedShape?.type===ShapeType.ARROW){
             this.isDraggingShape = true;
            this.lastMouseX = this.startX;
            this.lastMouseY = this.startY;
        }else if(this.selectedShape?.type===ShapeType.PENCIL){
             this.isDraggingShape = true;
            this.lastMouseX = this.startX;
            this.lastMouseY = this.startY;
        }
    }
    else{ 
        if(this.tool==="pencil"){
          this.pencilPoints = [];
            this.pencilPoints.push({
                x:this.startX,
                y:this.startY
    });
    }
        this.isDrawing=true;
    }
    }
    
    mouseUpHandler=async(e:MouseEvent)=>{
        this.isDraggingShape = false;
        this.isDrawing=false;
       if (this.isResizing) {
    this.isResizing = false;
    this.resizeHandle = null;
    }

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
        //     await axios.post("/api/shapes",{
        //     type:shape.type,
        //     data:shape.data
        // })
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
        //     await axios.post("/api/shapes",{
        //     type:shape.type,
        //     data:shape.data
        // })
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
        //     await axios.post("/api/shapes",{
        //     type:shape.type,
        //     data:shape.data
        // })
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
        //     await axios.post("/api/shapes",{
        //     type:shape.type,
        //     data:shape.data
        // })
            this.shapes.push({...shape});
        }else if(this.tool==="pencil"){
             shape={
                id:crypto.randomUUID(),
                type:ShapeType.PENCIL,
                data:this.pencilPoints
            }
        //     await axios.post("/api/shapes",{
        //     type:shape.type,
        //     data:shape.data
        // })
            this.shapes.push({...shape});
        }
    clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }

    mouseMoveHandler=(e:MouseEvent)=>{
        const worldX =(e.offsetX - this.cameraX)/this.scale;
        const worldY =(e.offsetY - this.cameraY)/this.scale;
    if(this.isResizing && this.selectedShape?.type===ShapeType.RECT){
    const rect = this.selectedShape.data;
    switch (this.resizeHandle) {
        case "se":
            rect.width = worldX - rect.startX;
            rect.height = worldY - rect.startY;
            break;

        case "sw":
            rect.width += rect.startX - worldX;
            rect.startX = worldX;

            rect.height = worldY - rect.startY;
            break;

        case "ne":
            rect.width = worldX - rect.startX;

            rect.height += rect.startY - worldY;
            rect.startY = worldY;
            break;

        case "nw":
            rect.width += rect.startX - worldX;
            rect.height += rect.startY - worldY;

            rect.startX = worldX;
            rect.startY = worldY;
            break;
    }

    clearCanvas(
        this.canvas,
        this.ctx,
        this.shapes,
        this.selectedShape
    );

    return;
    }else if(this.isResizing && this.selectedShape?.type===ShapeType.RHOMBUS){
    const rhom = this.selectedShape.data;
    const initTopLeftX=rhom.cx-rhom.h/2;
    const initTopLeftY=rhom.cy-rhom.v/2;
    const initTopRightX=rhom.cx+rhom.h/2;
    const initTopRightY=initTopLeftY;
    const initBtmLeftX=initTopLeftX;
    const initBtmLeftY=rhom.cy+rhom.v/2;
    const initBtmRightX=initTopRightX;
    const initBtmRightY=initBtmLeftY;
    switch (this.resizeHandle) {
        case "se":
            rhom.h = worldX - initTopLeftX;
            rhom.v = worldY - initTopLeftY;
            rhom.cx=(initTopLeftX+worldX)/2;
            rhom.cy=(initTopLeftY+worldY)/2;
            break;

        case "sw":
            rhom.h =initTopRightX-worldX;
            rhom.v =worldY-initTopRightY;
            rhom.cx=(initTopRightX+worldX)/2;
            rhom.cy=(initTopRightY+worldY)/2;
            break;

        case "ne":
            rhom.h =worldX-initBtmLeftX;
            rhom.v =initBtmLeftY-worldY;
            rhom.cx=(initBtmLeftX+worldX)/2;
            rhom.cy=(initBtmLeftY+worldY)/2;
            break;

        case "nw":
             rhom.h =initBtmRightX-worldX;
            rhom.v =initBtmRightY-worldY;
            rhom.cx=(initBtmRightX+worldX)/2;
            rhom.cy=(initBtmRightY+worldY)/2;
            break;
    }

    clearCanvas(
        this.canvas,
        this.ctx,
        this.shapes,
        this.selectedShape
    );

    return;
    }else if(this.isResizing && this.selectedShape?.type===ShapeType.CIRCLE){
     const cir = this.selectedShape.data;
    const left   = cir.cx - cir.radius;
    const right  = cir.cx + cir.radius;
    const top    = cir.cy - cir.radius;
    const bottom = cir.cy + cir.radius;

    switch (this.resizeHandle) {

        case "se": {
            const size = Math.max(
                worldX - left,
                worldY - top
            );

            cir.radius = size / 2;
            cir.cx = left + size / 2;
            cir.cy = top + size / 2;
            break;
        }

        case "sw": {
            const size = Math.max(
                right - worldX,
                worldY - top
            );

            cir.radius = size / 2;
            cir.cx = right - size / 2;
            cir.cy = top + size / 2;
            break;
        }

        case "ne": {
            const size = Math.max(
                worldX - left,
                bottom - worldY
            );

            cir.radius = size / 2;
            cir.cx = left + size / 2;
            cir.cy = bottom - size / 2;
            break;
        }

        case "nw": {
            const size = Math.max(
                right - worldX,
                bottom - worldY
            );

            cir.radius = size / 2;
            cir.cx = right - size / 2;
            cir.cy = bottom - size / 2;
            break;
        }
    }

    clearCanvas(
        this.canvas,
        this.ctx,
        this.shapes,
        this.selectedShape
    );

    return;
    }else if(this.isResizing && (this.selectedShape?.type===ShapeType.ARROW || this.selectedShape?.type===ShapeType.LINE)){
        const arr=this.selectedShape.data;
        switch (this.resizeHandle) {

        case "s": {
            arr.fromX = worldX;
            arr.fromY = worldY;
            break;
        }

        case "e": {
            arr.toX = worldX;
            arr.toY = worldY;
            break;
        }
    }

    clearCanvas(
        this.canvas,
        this.ctx,
        this.shapes,
        this.selectedShape
    );
    } else if (this.isResizing && this.selectedShape?.type === ShapeType.PENCIL) {
    const points: { x: number; y: number }[] = this.selectedShape.data;

    // Compute bounding box
    let leastX = Infinity, maxX = -Infinity;
    let leastY = Infinity, maxY = -Infinity;
    points.forEach((p) => {
        leastX = Math.min(leastX, p.x);
        maxX   = Math.max(maxX,   p.x);
        leastY = Math.min(leastY, p.y);
        maxY   = Math.max(maxY,   p.y);
    });

    const origW = maxX - leastX;
    const origH = maxY - leastY;
    if (origW === 0 || origH === 0) return;

    // Anchor = the corner OPPOSITE to the handle being dragged
    let anchorX: number, anchorY: number;
    let newW: number, newH: number;

    switch (this.resizeHandle) {
        case "se":
            anchorX = leastX; anchorY = leastY;
            newW = worldX - anchorX;
            newH = worldY - anchorY;
            break;
        case "sw":
            anchorX = maxX;  anchorY = leastY;
            newW = anchorX - worldX;
            newH = worldY - anchorY;
            break;
        case "ne":
            anchorX = leastX; anchorY = maxY;
            newW = worldX - anchorX;
            newH = anchorY - worldY;
            break;
        case "nw":
            anchorX = maxX;  anchorY = maxY;
            newW = anchorX - worldX;
            newH = anchorY - worldY;
            break;
        default:
            return;
    }

    // Prevent collapsing
    if (Math.abs(newW) < 1 || Math.abs(newH) < 1) return;

    const scaleX = newW / origW;
    const scaleY = newH / origH;

    // Scale each point relative to the anchor
    points.forEach((p) => {
        p.x = anchorX + (p.x - anchorX) * scaleX;
        p.y = anchorY + (p.y - anchorY) * scaleY;
    });

    clearCanvas(this.canvas, this.ctx, this.shapes, this.selectedShape);
    return;
}else if(this.isResizing && this.selectedShape?.type===ShapeType.TEXT){
    const txt = this.selectedShape.data;
    switch (this.resizeHandle) {
        case "se":{
            const newWidth = worldX - txt.x;
            const scale = newWidth / this.resizeStartTextWidth;
            txt.font = this.resizeStartFont * scale;
            break;
        }
        case "ne":{
            const newWidth = worldX - txt.x;
            const scale = newWidth / this.resizeStartTextWidth;
            txt.font = this.resizeStartFont * scale;
            txt.y=worldY;
            break;
        }
        case "sw":{
             const newWidth = (this.resizeStartX + this.resizeStartTextWidth) - worldX;
            const scale = newWidth / this.resizeStartTextWidth;
            txt.font =  this.resizeStartFont * scale;
            txt.x = worldX;
            break;
        }
        case "nw":{
           const newWidth = (this.resizeStartX + this.resizeStartTextWidth) - worldX;
            const scale = newWidth / this.resizeStartTextWidth;
            txt.font =  this.resizeStartFont * scale;
            txt.x = worldX;
            break;
        }
    }

    clearCanvas(
        this.canvas,
        this.ctx,
        this.shapes,
        this.selectedShape
    );

    return;
    }
    if(this.isDraggingShape && this.selectedShape && this.selectedShape.type===ShapeType.RECT){
        this.selectedShape.data.startX =worldX - this.dragOffsetX;
        this.selectedShape.data.startY =worldY - this.dragOffsetY;
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }else if(this.isDraggingShape && this.selectedShape && this.selectedShape.type===ShapeType.TEXT){
        this.selectedShape.data.x =worldX - this.dragOffsetX;
        this.selectedShape.data.y =worldY - this.dragOffsetY;
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }
    else if(this.isDraggingShape && this.selectedShape && (this.selectedShape.type===ShapeType.RHOMBUS || this.selectedShape.type===ShapeType.CIRCLE)){
        this.selectedShape.data.cx =worldX - this.dragOffsetX;
        this.selectedShape.data.cy =worldY - this.dragOffsetY;  
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }else if(this.isDraggingShape && this.selectedShape && (this.selectedShape.type===ShapeType.LINE || this.selectedShape.type===ShapeType.ARROW)){
        const dx = worldX - this.lastMouseX;
        const dy = worldY - this.lastMouseY;

        this.selectedShape.data.fromX += dx;
        this.selectedShape.data.fromY += dy;

        this.selectedShape.data.toX += dx;
        this.selectedShape.data.toY += dy;

        this.lastMouseX = worldX;
        this.lastMouseY = worldY;
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
    }else if(this.isDraggingShape && this.selectedShape && this.selectedShape.type===ShapeType.PENCIL){
        const dx = worldX - this.lastMouseX;
        const dy = worldY - this.lastMouseY;
        this.selectedShape.data.forEach((p:{x:number,y:number})=>{
            p.x+=dx;
            p.y+=dy;
        })
        this.lastMouseX = worldX;
        this.lastMouseY = worldY;
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
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

    keyDownHandler=async(e:KeyboardEvent)=>{
        if(!this.isTyping)return;
        if(e.key==='Enter'){
            const shape:ShapesType=({
                id:crypto.randomUUID(),
                type:ShapeType.TEXT,
                data:{
                   x:this.startX,
                   y:this.startY,
                   text:this.currentText,
                   font:20
                }
            })
            this.shapes.push({...shape})
            this.isTyping = false;
            this.currentText = "";
            clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
            return;
        //     await axios.post("/api/shapes",{
        //     type:shape.type,
        //     data:shape.data
        // })
        }else if(e.key==='Backspace'){
            this.currentText=this.currentText.slice(0,-1);
        }else if(e.key.length===1){
            this.currentText+=e.key;
        }
        clearCanvas(this.canvas,this.ctx,this.shapes,this.selectedShape);
        drawText(this.canvas,this.ctx,this.currentText,this.startX,this.startY,20);
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


