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

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div
        className="text-sm font-bold uppercase tracking-wider mb-1"
        style={{ color: BROWN }}
      >
        {title}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: `${BROWN}CC` }}>
        {body}
      </p>
    </div>
  );
}

export function Menu() {
  const navigate = useNavigate();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

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
            onClick={() => setHowToPlayOpen(true)}
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

      {/* How to play dialog */}
      <Dialog open={howToPlayOpen} onOpenChange={setHowToPlayOpen}>
        <DialogContent
          style={{
            fontFamily: FONT_BODY,
            maxWidth: "560px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: FONT_TITLE, color: BROWN, fontSize: "2rem" }}
            >
              How to Play
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5 mt-2" style={{ color: BROWN }}>
            <Rule
              title="Objective"
              body="Stay alive as long as possible. If multiple players survive to the end, the highest score wins."
            />
            <Rule
              title="Slicing"
              body="Sweep your hand across fruits to slice them and earn points. Letting a fruit fall off-screen costs you a life. Slicing a bomb also costs a life — avoid them!"
            />
            <Rule
              title="Combos"
              body="Slice multiple fruits in one continuous sweep to build a combo multiplier. The longer your streak, the more points each fruit is worth."
            />
            <Rule
              title="Sabotage — Coming Soon"
              body="Spend points to inject bombs directly into an opponent's fruit stream. Still in development."
            />
          </div>
        </DialogContent>
      </Dialog>

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
