"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orpc } from "@/lib/orpc-client";

export default function VerificarEmailPage() {
  const [token] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("token") ?? "";
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      setStatus("loading");

      try {
        await orpc.auth.verifyEmail({ token });
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    void verify();
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <div className="w-full space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Verificacao de e-mail</h1>
          <p className="text-sm text-muted-foreground">Estamos validando seu link de confirmacao.</p>
        </header>

        {status === "loading" && <p className="text-sm text-muted-foreground">Validando token...</p>}
        {status === "success" && <p className="text-sm text-emerald-600">Seu e-mail foi confirmado com sucesso.</p>}
        {status === "error" && <p className="text-sm text-destructive">Nao foi possivel validar o token informado.</p>}

        <Link href="/login" className={cn(buttonVariants(), "w-full")}>
          Ir para login
        </Link>
      </div>
    </main>
  );
}
