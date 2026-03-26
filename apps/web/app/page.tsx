"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc-client";

export default function Home() {
  const [termo, setTermo] = useState("");
  const [cidade, setCidade] = useState("");
  const [limite, setLimite] = useState("20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<{
    importedWithPhone: number;
    importedWithoutPhone: number;
    updated: number;
    skipped: number;
    totalProcessed: number;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const parsedLimite = Number(limite);
      const data = await orpc.lead.importBySearch({
        termo,
        cidade,
        limite: Number.isFinite(parsedLimite) ? parsedLimite : 20,
      });
      setResult(data);
    } catch {
      setError("Nao foi possivel importar leads. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">LeadsRoute Web</h1>
        <p className="text-muted-foreground">
          Importe leads por termo e cidade usando a integracao com Google Places.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
        <label className="grid gap-2 text-sm font-medium">
          Termo de busca
          <input
            className="h-10 rounded-md border bg-background px-3"
            placeholder="Ex.: Restaurante"
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Cidade
          <input
            className="h-10 rounded-md border bg-background px-3"
            placeholder="Ex.: Campinas"
            value={cidade}
            onChange={(event) => setCidade(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Limite (opcional)
          <input
            className="h-10 rounded-md border bg-background px-3"
            type="number"
            min={1}
            max={100}
            value={limite}
            onChange={(event) => setLimite(event.target.value)}
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? "Importando..." : "Importar leads"}
        </Button>
      </form>

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {result && (
        <section className="grid gap-2 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Resumo da importacao</h2>
          <p>Importados com telefone: {result.importedWithPhone}</p>
          <p>Importados sem telefone: {result.importedWithoutPhone}</p>
          <p>Atualizados: {result.updated}</p>
          <p>Ignorados: {result.skipped}</p>
          <p>Total processado: {result.totalProcessed}</p>
        </section>
      )}
    </main>
  );
}
