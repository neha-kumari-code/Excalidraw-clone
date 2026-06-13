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
import { Game, ShapesType } from "../draw/game";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
export default function MainPage() {
  const canvasRef=useRef<HTMLCanvasElement | null>(null)
  const [tool,setTool]=useState("")
  const gameRef=useRef<Game | null>(null)

  const submitShapes=async()=>{
    let shapes:ShapesType[]=[];
    if(gameRef.current){
      shapes=gameRef.current.getShapes();
       const res = await Promise.all(
        shapes.map((s) =>
            axios.post("/api/shapes", {
                type: s.type,
                data: s.data,
            })
        )
    );
     const allSuccess = res.every(r => r.data.success);

    if (allSuccess) {
        console.log("saving sucess")
        // SHOW TOAST HERE
       toast.success("saved successfully!")
       gameRef?.current.resetShapes();
    } else {
        console.log("kuvhh wrong hua")
        toast.error("something went wrong")
    }

    return;
    }
}
  useEffect(()=>{
    if(!canvasRef.current)return;
      canvasRef.current.width=window.innerWidth;
      canvasRef.current.height=window.innerHeight;
      const g = new Game(tool, canvasRef.current, handleToolChange);
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

   const handleToolChange = (t: string) => {
  setTool(t);
  gameRef.current?.setTool(t);
};
  return (
    <div className="bg-slate-100">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center text-gray-700 gap-1 rounded-md border border-slate-600 bg-white px-2 py-2 shadow-lg">
          
          <button onClick={()=>handleToolChange("rect")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="rect"?"text-red-500":""}`}>
            <RectangleHorizontal size={20} />
          </button>

          <button onClick={()=>handleToolChange("rhombus")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="rhombus"?"text-red-500":""}`}>
            <Diamond size={20} />
          </button>

          <button onClick={()=>handleToolChange("circle")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="circle"?"text-red-500":""}`}>
            <Circle size={20} />
          </button>

          <button onClick={()=>handleToolChange("arrow")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="arrow"?"text-red-500":""}`}>
            <ArrowRight size={20} />
          </button>

          <button onClick={()=>handleToolChange("line")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="line"?"text-red-500":""}`}>
            <Minus size={20} />
          </button>

          <button onClick={()=>handleToolChange("pencil")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="pencil"?"text-red-500":""}`}>
            <Pencil size={20} />
          </button>

          <button onClick={()=>handleToolChange("text")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="text"?"text-red-500":""}`}>
            <Type size={20} />
          </button>
          <button onClick={()=>handleToolChange("eraser")} className={`rounded-md p-2 hover:bg-slate-100 transition ${tool==="eraser"?"text-red-500":""}`}>
            <Eraser size={20} />
          </button>
        </div>
      </div>
        <div className="fixed top-4 right-10">
          <button onClick={submitShapes} className=" px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer">Save</button>
        </div>
      <canvas ref={canvasRef} />
      {/* <canvas ref={canvasRef} width="4618" height="1625" className="bg-green-600"/> */}
    </div>
  );
}