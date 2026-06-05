import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, LogIn, KeyRound, UserPlus, Loader2, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sistema de Controle Financeiro" },
      { name: "description", content: "Acesse sua conta para gerenciar suas finanças." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "reset";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ type: "success", text: "Login realizado com sucesso!" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage({ type: "success", text: "Conta criada! Verifique seu email." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage({ type: "success", text: "Email de recuperação enviado." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro inesperado" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 sm:p-10"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-[color:var(--brand-blue)]/10">
            <Wallet className="h-8 w-8" style={{ color: "oklch(0.45 0.15 255)" }} />
          </div>
          <h1
            className="text-2xl font-bold leading-tight sm:text-3xl"
            style={{
              backgroundImage: "var(--gradient-brand)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Sistema de Controle Financeiro
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "reset"
              ? "Informe seu email para recuperar a senha"
              : mode === "signup"
                ? "Crie sua conta gratuita"
                : "Acesse sua conta para continuar"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Mail className="h-4 w-4" style={{ color: "oklch(0.58 0.20 255)" }} />
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-[color:var(--brand-blue)] focus:ring-2 focus:ring-[color:var(--brand-blue)]/20"
            />
          </div>

          {mode !== "reset" && (
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lock className="h-4 w-4" style={{ color: "oklch(0.66 0.17 152)" }} />
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-[color:var(--brand-green)] focus:ring-2 focus:ring-[color:var(--brand-green)]/20"
              />
            </div>
          )}

          {message && (
            <div
              className={`rounded-lg px-4 py-2.5 text-sm ${
                message.type === "error"
                  ? "border border-destructive/30 bg-destructive/10 text-destructive"
                  : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundImage: "var(--gradient-brand)", boxShadow: "var(--shadow-card)" }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {mode === "signin" && "Entrar na Plataforma"}
            {mode === "signup" && "Criar conta"}
            {mode === "reset" && "Enviar email de recuperação"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          {mode !== "signup" && (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage(null);
              }}
              className="inline-flex items-center gap-2 font-medium text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
            >
              <UserPlus className="h-4 w-4" />
              Não tem uma conta? Criar conta gratuita
            </button>
          )}
          {mode === "signin" && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setMessage(null);
                }}
                className="inline-flex items-center gap-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <KeyRound className="h-4 w-4" />
                Esqueceu sua senha?
              </button>
            </div>
          )}
          {mode !== "signin" && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setMessage(null);
                }}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Já tem conta? Entrar
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
