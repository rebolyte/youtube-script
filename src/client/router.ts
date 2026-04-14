import { useState, useEffect } from "react";

export type Route =
  | { page: "projects" }
  | { page: "templates" }
  | { page: "workspace"; projectId: string }
  | { page: "template-editor"; templateId: string | null };

const parseHash = (): Route => {
  const hash = window.location.hash.slice(1) || "/";
  if (hash === "/templates") return { page: "templates" };
  if (hash === "/template/new") return { page: "template-editor", templateId: null };
  const matchTemplate = hash.match(/^\/template\/(.+)$/);
  if (matchTemplate) return { page: "template-editor", templateId: matchTemplate[1] };
  const matchProject = hash.match(/^\/project\/(.+)$/);
  if (matchProject) return { page: "workspace", projectId: matchProject[1] };
  return { page: "projects" };
};

export const navigate = (path: string) => {
  window.location.hash = path;
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return route;
};
