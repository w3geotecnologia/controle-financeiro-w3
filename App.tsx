
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AccountsProvider } from "./contexts/AccountsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AccessControlWrapper } from "./components/AccessControlWrapper";
import Dashboard from "./pages/Dashboard";
import Contas from "./pages/Contas";
import CardAccounts from "./pages/CardAccounts";
import Categorias from "./pages/Categorias";
import Relatorios from "./pages/Relatorios";
import Bancos from "./pages/Bancos";
import Investimentos from "./pages/Investimentos";
import InvestimentosVencidos from "./pages/InvestimentosVencidos";
import Admin from "./pages/Admin";
import AdminReport from "./pages/AdminReport";
import Auth from "./pages/Auth";
import Analise from "./pages/Analise";
import NotFound from "./pages/NotFound";
import CartoesCredito from "./pages/CartoesCredito";
import Install from "./pages/Install";
import ChangePassword from "./pages/ChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AccountsProvider>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/change-password" element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <AccessControlWrapper requiresAccess={false}>
                        <Dashboard />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/contas" element={
                    <ProtectedRoute>
                    <AccessControlWrapper>
                    <Contas />
                    </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/card-accounts" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <CardAccounts />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/categorias" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <Categorias />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/bancos" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <Bancos />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/investimentos" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <Investimentos />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/investimentos-vencidos" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <InvestimentosVencidos />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/cartoes-credito" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <CartoesCredito />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/analise" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <Analise />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/relatorios" element={
                    <ProtectedRoute>
                      <AccessControlWrapper>
                        <Relatorios />
                      </AccessControlWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/relatorio" element={
                    <ProtectedRoute>
                      <AdminReport />
                    </ProtectedRoute>
                  } />
                  <Route path="/install" element={
                    <ProtectedRoute>
                      <Install />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster 
                  duration={2000}
                  closeButton={true}
                />
                <ShadcnToaster />
                <PWAUpdatePrompt />
              </div>
            </AccountsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
