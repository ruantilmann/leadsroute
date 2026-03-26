"use client";

import { FormEvent, useEffect, useState } from "react";
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
  const [leads, setLeads] = useState<
    Array<{
      id: string;
      nomeEmpresa: string;
      telefone: string | null;
      enderecoCompleto: string;
      cidade: string;
      estado: string | null;
    }>
  >([]);
  const [listLoading, setListLoading] = useState(false);
  const [hasPhoneFilter, setHasPhoneFilter] = useState<"all" | "yes" | "no">("all");

  const loadLeads = async () => {
    setListLoading(true);

    try {
      const data = await orpc.lead.list({
        page: 1,
        pageSize: 20,
        hasPhone: hasPhoneFilter === "all" ? undefined : hasPhoneFilter === "yes",
      });

      setLeads(data.items);
    } catch {
      setError("Nao foi possivel carregar a listagem de leads.");
    } finally {
      setListLoading(false);
    }
  };

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
      await loadLeads();
    } catch {
      setError("Nao foi possivel importar leads. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLeads();
  }, [hasPhoneFilter]);

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

      <section className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Leads importados</h2>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="hasPhoneFilter">
              Telefone
            </label>
            <select
              id="hasPhoneFilter"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={hasPhoneFilter}
              onChange={(event) =>
                setHasPhoneFilter(event.target.value as "all" | "yes" | "no")
              }
            >
              <option value="all">Todos</option>
              <option value="yes">Somente com telefone</option>
              <option value="no">Somente sem telefone</option>
            </select>

            <Button type="button" variant="outline" onClick={() => void loadLeads()} disabled={listLoading}>
              {listLoading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Empresa</th>
                <th className="px-3 py-2 text-left font-medium">Telefone</th>
                <th className="px-3 py-2 text-left font-medium">Endereco</th>
                <th className="px-3 py-2 text-left font-medium">Cidade/UF</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                    Nenhum lead encontrado para o filtro atual.
                  </td>
                </tr>
              )}

              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-3 py-2">{lead.nomeEmpresa}</td>
                  <td className="px-3 py-2">
                    {lead.telefone ? (
                      lead.telefone
                    ) : (
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                        Sem telefone
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{lead.enderecoCompleto}</td>
                  <td className="px-3 py-2">{lead.cidade}{lead.estado ? `/${lead.estado}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
