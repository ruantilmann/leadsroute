"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc-client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await orpc.auth.requestPasswordReset({ email });
      setMessage("Se o e-mail existir, enviaremos instrucoes para redefinir sua senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <div className="w-full space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Esqueci minha senha</h1>
          <p className="text-sm text-muted-foreground">Digite seu email para receber o link de redefinicao.</p>
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

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link"}
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
