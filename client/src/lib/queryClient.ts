import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

import { auth } from "./firebase";

export async function apiRequest(
  method: string,
  url: string,
  body?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {} as Record<string, string>,
  };

  // Attach content type if body exists
  if (body) {
    options.body = JSON.stringify(body);
    (options.headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  // Attach Firebase ID token if user is signed in
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      (options.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    } catch (e) {
      console.warn("Failed to get Firebase token before API request", e);
    }
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
