"use client";

import { useEffect, useState } from "react";

export default function AssinaturasPage() {
  const [assinaturas, setAssinaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/subscriptions");
        const data = await res.json();

        if (res.ok) {
          // 🔒 Normaliza para garantir email sempre presente
          const safeData = (data ?? []).map((a: any) => ({
            ...a,
            email: a.email ?? "sem-email",
            plan: a.plan ?? "-",
            status_assinatura: a.status_assinatura ?? "indefinido",
            start_date: a.start_date ?? null,
            end_date: a.end_date ?? null,
          }));
          setAssinaturas(safeData);
        } else {
          throw new Error(data.error || "Erro ao carregar assinaturas");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // 🔒 Filtro seguro (nunca quebra se email for null)
  const filtradas = assinaturas.filter((a) =>
    (a.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gerenciamento de Assinaturas</h1>

      <input
        type="text"
        placeholder="Buscar por email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", width: "300px" }}
      />

      <table
        style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}
      >
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Email</th>
            <th>Plano</th>
            <th>Status</th>
            <th>Início</th>
            <th>Vencimento</th>
            <th>Dias Restantes</th>
          </tr>
        </thead>
        <tbody>
          {filtradas.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                Nenhuma assinatura encontrada.
              </td>
            </tr>
          )}
          {filtradas.map((assinatura, idx) => (
            <tr key={idx}>
              <td>{assinatura.email ?? "---"}</td>
              <td>{assinatura.plan}</td>
              <td>{assinatura.status_assinatura}</td>
              <td>
                {assinatura.start_date
                  ? new Date(assinatura.start_date).toLocaleDateString("pt-BR")
                  : "---"}
              </td>
              <td>
                {assinatura.end_date
                  ? new Date(assinatura.end_date).toLocaleDateString("pt-BR")
                  : "---"}
              </td>
              <td>{assinatura.dias_restantes ?? "---"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}