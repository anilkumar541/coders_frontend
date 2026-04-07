import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-start justify-center pt-20 px-2 sm:px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
