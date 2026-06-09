"use client"
import {
  RectangleHorizontal,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Eraser,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Game } from "../draw/game";

export default function MainPage() {
  const canvasRef=useRef<HTMLCanvasElement | null>(null)
  const [tool,setTool]=useState("")
  const gameRef=useRef<Game | null>(null)
  useEffect(()=>{
    if(!canvasRef.current)return;
      canvasRef.current.width=window.innerWidth;
      canvasRef.current.height=window.innerHeight;
      const g=new Game(tool,canvasRef.current)
      gameRef.current=g
      return ()=>{
        g.destroy()
      }
  
  },[])
  useEffect(()=>{
    const resize=()=>{
      if(!canvasRef.current)return;
       canvasRef.current.width=window.innerWidth;
      canvasRef.current.height=window.innerHeight;
    }
    resize();
    window.addEventListener("resize",resize)
    return window.removeEventListener("resize",resize)
  },[])
  useEffect(()=>{
    if(gameRef.current){
      gameRef.current.setTool(tool)
    }
  },[tool,gameRef])
  return (
    <div className="bg-slate-100">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center text-gray-700 gap-1 rounded-md border border-slate-600 bg-white px-2 py-2 shadow-lg">
          
          <button onClick={()=>setTool("rect")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="rect"?"text-red-500":""}`}>
            <RectangleHorizontal size={20} />
          </button>

          <button onClick={()=>setTool("rhombus")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="rhombus"?"text-red-500":""}`}>
            <Diamond size={20} />
          </button>

          <button onClick={()=>setTool("circle")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="circle"?"text-red-500":""}`}>
            <Circle size={20} />
          </button>

          <button onClick={()=>setTool("arrow")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="arrow"?"text-red-500":""}`}>
            <ArrowRight size={20} />
          </button>

          <button onClick={()=>setTool("line")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="line"?"text-red-500":""}`}>
            <Minus size={20} />
          </button>

          <button onClick={()=>setTool("pencil")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="pencil"?"text-red-500":""}`}>
            <Pencil size={20} />
          </button>

          <button onClick={()=>setTool("text")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="text"?"text-red-500":""}`}>
            <Type size={20} />
          </button>
          <button onClick={()=>setTool("eraser")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="eraser"?"text-red-500":""}`}>
            <Eraser size={20} />
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} />
      {/* <canvas ref={canvasRef} width="4618" height="1625" className="bg-green-600"/> */}
    </div>
  );
}