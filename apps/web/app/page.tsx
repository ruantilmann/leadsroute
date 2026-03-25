"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadMessage = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/hello`);

      if (!response.ok) {
        throw new Error("Falha ao consultar a API");
      }

      const data = (await response.json()) as { message: string };
      setMessage(data.message);
    } catch {
      setError("Nao foi possivel carregar a mensagem do backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessage();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">LeadsRoute Web</h1>

      {loading && <p className="text-muted-foreground">Carregando mensagem...</p>}

      {!loading && error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
        <p className="rounded-lg border bg-card px-6 py-4 text-lg text-card-foreground shadow-sm">
          {message}
        </p>
      )}

      <Button onClick={() => void loadMessage()}>Atualizar mensagem</Button>
    </main>
  );
}
