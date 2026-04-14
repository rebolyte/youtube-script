import { useRoute } from "./router.ts";
import { ProjectList } from "./components/project-list.tsx";
import { TemplateList } from "./components/template-list.tsx";
import { ScriptWorkspace } from "./components/script-workspace.tsx";

export const App = () => {
  const route = useRoute();

  return (
    <div className="min-h-screen bg-gray-100">
      {route.page === "projects" && <ProjectList />}
      {route.page === "templates" && <TemplateList />}
      {route.page === "workspace" && <ScriptWorkspace projectId={route.projectId} />}
    </div>
  );
};
