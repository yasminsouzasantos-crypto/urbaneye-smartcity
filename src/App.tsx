import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
const Index = lazy(() => import('./pages/Index.tsx'));

function Protected({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, ready, isAdmin } = useAuth();
  if (!ready) return <div className="h-[100dvh] w-full bg-background" />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoginRoute() {
  const { user, ready, isAdmin } = useAuth();
  if (!ready) return <div className="h-[100dvh] w-full bg-background" />;
  if (user) return <Navigate to={isAdmin ? "/gestao" : "/"} replace />;
  return <Login />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" offset={72} />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<p role="status" className="p-6">Carregando UrbanEye...</p>}>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route
              path="/"
              element={
                <Protected>
                  <Index />
                </Protected>
              }
            />
            <Route
              path="/gestao"
              element={
                <Protected adminOnly>
                  <Index initialTab="admin" />
                </Protected>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
