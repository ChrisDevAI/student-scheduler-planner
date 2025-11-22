import React from "react";
import { ReactComponent as CampusLogo } from "../assets/campus.svg";

export default function AppHeader() {
  return (
    <header className="w-full flex items-center justify-center py-6 bg-white">
      <div className="flex items-center space-x-4">
        <CampusLogo className="w-14 h-14" />
        <h1 className="text-3xl font-semibold text-gray-800 tracking-wide">
          Student Schedule Planner
        </h1>
      </div>
    </header>
  );
}
