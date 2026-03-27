"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc-client";

const passwordHelp = "Minimo 8 caracteres com maiuscula, minuscula, numero e simbolo.";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [token] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("token") ?? "";
  });

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!token) {
        setError("Token ausente ou invalido.");
        return;
      }

      await orpc.auth.resetPassword({
        token,
        password,
      });

      setMessage("Senha redefinida com sucesso.");
      setTimeout(() => router.replace("/login"), 1000);
    } catch {
      setError("Nao foi possivel redefinir a senha. Confira o token e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <div className="w-full space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Redefinir senha</h1>
          <p className="text-sm text-muted-foreground">Informe sua nova senha para concluir a redefinicao.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            Nova senha
            <input
              className="h-10 rounded-md border bg-background px-3"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <p className="text-xs text-muted-foreground">{passwordHelp}</p>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>

        <div className="text-sm">
          <Link href="/login" className="text-primary underline-offset-2 hover:underline">
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
