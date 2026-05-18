import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import CustomWebcam from "../components/Webcam";

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = "#564A4A";
const SHADOW = "0 4px 14px rgba(86,74,74,0.35)";

export function Menu() {
  const navigate = useNavigate();
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="flex flex-col items-center z-10 mb-8">
        <h1
          className="text-[96px] leading-none"
          style={{ fontFamily: FONT_TITLE, color: BROWN }}
        >
          Food Ninja
        </h1>
        <p
          className="text-lg mb-10 tracking-widest"
          style={{ fontFamily: FONT_BODY, color: `${BROWN}99` }}
        >
          食べ物ニンジャ
        </p>

        <div
          className="flex flex-col gap-3 w-[280px]"
          style={{ fontFamily: FONT_BODY }}
        >
          <button
            onClick={() => navigate("/lobby")}
            className="w-full py-4 rounded-full font-bold text-lg transition-colors active:scale-95 border-2"
            style={{
              backgroundColor: "#EDE8E8",
              borderColor: BROWN,
              color: BROWN,
              boxShadow: SHADOW,
            }}
          >
            Play
          </button>

          <button
            className="w-full py-3 rounded-full font-semibold text-sm text-white transition-colors active:scale-95"
            style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
          >
            How to play
          </button>

          <button
            onClick={() => setCameraOpen(true)}
            className="w-full py-3 rounded-full font-semibold text-sm text-white transition-colors active:scale-95"
            style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
          >
            WebCam Test
          </button>
        </div>

        <img
          src="/assets/backdrop.png"
          alt=""
          className="w-[800px] mt-4 pointer-events-none select-none"
        />
      </div>

      {/* Webcam test dialog */}
      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent style={{ width: "fit-content", maxWidth: "90vw" }}>
          <DialogHeader>
            <DialogTitle>Camera Test</DialogTitle>
          </DialogHeader>
          <CustomWebcam
            width={Math.round(window.innerWidth * 0.6)}
            height={Math.round(window.innerHeight * 0.6)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
