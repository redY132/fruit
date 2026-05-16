import { createBrowserRouter } from "react-router";
import { Menu } from "../pages/Menu";
import { Lobby } from "../pages/Lobby";
import { Room } from "../pages/Room";
import { Game } from "../pages/Game";
import { Results } from "../pages/Results";
import { Settings } from "../pages/Settings";
import { CameraTest } from "../pages/CameraTest";
import { ShopOverlay } from "../components/ShopOverlay";
import React from "react";

export const router = createBrowserRouter([
  { path: "/", Component: Menu },
  { path: "/lobby", Component: Lobby },
  { path: "/room", Component: Room },
  { path: "/settings", Component: Settings },
  { path: "/game", Component: Game },
  { path: "/bomb", Component: () => <Game bombWarning /> },
  { path: "/results", Component: Results },
  { path: "/camera-test", Component: CameraTest },
  {
    path: "/shop",
    Component: () => (
      <div className="relative w-full h-screen">
        <Game />
        <ShopOverlay open onClose={() => {}} points={1200} />
      </div>
    ),
  },
]);
