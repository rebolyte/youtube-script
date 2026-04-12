import { navigate } from "../router.ts";

export const Nav = ({ current }: { current: "projects" | "templates" }) => (
  <nav className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3">
    <span className="text-lg font-semibold mr-4">ScriptTool</span>
    <button
      className={`text-sm ${current === "projects" ? "font-bold text-neutral-900" : "text-neutral-500 hover:text-neutral-700"}`}
      onClick={() => navigate("/")}
    >
      Projects
    </button>
    <button
      className={`text-sm ${current === "templates" ? "font-bold text-neutral-900" : "text-neutral-500 hover:text-neutral-700"}`}
      onClick={() => navigate("/templates")}
    >
      Templates
    </button>
  </nav>
);
