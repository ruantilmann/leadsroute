"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await orpc.auth.login({ email, password });
      router.replace("/");
    } catch {
      setError("Credenciais invalidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <div className="w-full space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-sm text-muted-foreground">Acesse sua conta LeadsRoute.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input
              className="h-10 rounded-md border bg-background px-3"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Senha
            <input
              className="h-10 rounded-md border bg-background px-3"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <Link href="/cadastro" className="text-primary underline-offset-2 hover:underline">
            Criar conta
          </Link>
          <Link href="/esqueci-senha" className="text-primary underline-offset-2 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </main>
  );
}
