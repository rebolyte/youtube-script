const json = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? res.statusText);
  }
  return res.json();
};

export type Template = {
  id: string;
  name: string;
  description: string | null;
  sections: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  updatedAt: string;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  templateId: string;
  braindump: string;
  script: string;
  createdAt: string;
  updatedAt: string;
};

export const api = {
  templates: {
    list: () => json<Template[]>("/api/templates"),
    get: (id: string) => json<Template>(`/api/templates/${id}`),
    create: (data: { name: string; description?: string; sections: unknown[] }) =>
      json<Template>("/api/templates", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      json<Template>(`/api/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => json(`/api/templates/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: () => json<ProjectSummary[]>("/api/projects"),
    get: (id: string) => json<Project>(`/api/projects/${id}`),
    create: (data: { name: string; templateId: string }) =>
      json<Project>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      json<Project>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => json(`/api/projects/${id}`, { method: "DELETE" }),
    generate: (id: string) => json<string>(`/api/projects/${id}/generate`, { method: "POST" }),
  },
};
