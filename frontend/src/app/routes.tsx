import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Menu } from "../pages/Menu";
import { Lobby } from "../pages/Lobby";
import { Room } from "../pages/Room";
import { Game } from "../pages/Game";
import { Results } from "../pages/Results";
import { ShopOverlay } from "../components/ShopOverlay";
import React from "react";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Menu },
      { path: "lobby", Component: Lobby },
      { path: "room", Component: Room },
    ],
  },
  {
    path: "/game",
    Component: Game,
  },
  {
    path: "/bomb",
    Component: () => <Game bombWarning />,
  },
  {
    path: "/results",
    Component: Results,
  },
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
