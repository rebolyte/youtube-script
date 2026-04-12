import { useState, useEffect } from "react";

export type Route =
  | { page: "projects" }
  | { page: "templates" }
  | { page: "workspace"; projectId: string };

const parseHash = (): Route => {
  const hash = window.location.hash.slice(1) || "/";
  if (hash === "/templates") return { page: "templates" };
  const match = hash.match(/^\/project\/(.+)$/);
  if (match) return { page: "workspace", projectId: match[1] };
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
