/**
 * @file src\core\routes\RootLayout.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { Outlet } from "react-router";
import { MobileNav } from "../components/MobileNav";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
      <MobileNav />
    </div>
  );
}


