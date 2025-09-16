"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AssinaturasPage() {
  // 🔒 1. Inicie o state sempre como Array
  const [assinaturas, setAssinaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const supabase = createClientComponentClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();

      if (res.ok) {
        // 🔒 2. Na hora de carregar API, normalize para Array
        // A API retorna { subscriptions: [...] }, então extraímos o array
        const subscriptionsArray = data.subscriptions || data || [];
        const safeData = Array.isArray(subscriptionsArray) ? subscriptionsArray : [];
        
        setAssinaturas(safeData.map((a: any) => ({
          ...a,
          email: a.email ?? "sem-email",
          plan: a.plan ?? "-",
          status_assinatura: a.status_assinatura ?? "indefinido",
          start_date: a.start_date ?? null,
          end_date: a.end_date ?? null,
        })));
      } else {
        throw new Error(data.error || "Erro ao carregar assinaturas");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 🚀 Implementar tempo real com Supabase
    const channel = supabase
      .channel("assinaturas-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        (payload) => {
          console.log("Mudança detectada:", payload);
          // Sempre recarrega os dados quando houver alterações
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Erro: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  // 🔒 Filtro seguro (nunca quebra se email for null)
  const filtradas = (assinaturas ?? []).filter((a) =>
    (a.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Assinaturas</h1>
          <p className="text-gray-600">Visualize e gerencie todas as assinaturas em tempo real</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias Restantes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* 🔒 3. No render, proteja antes do .map */}
                {(filtradas ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">Nenhuma assinatura encontrada</p>
                        <p className="text-sm">Tente ajustar os filtros de busca</p>
                      </div>
                    </td>
                  </tr>
                )}

                {(filtradas ?? []).map((assinatura, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{assinatura.email ?? "---"}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {assinatura.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assinatura.status_assinatura === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : assinatura.status_assinatura === 'trial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assinatura.status_assinatura}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {assinatura.start_date
                        ? new Date(assinatura.start_date).toLocaleDateString("pt-BR")
                        : "---"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {assinatura.end_date
                        ? new Date(assinatura.end_date).toLocaleDateString("pt-BR")
                        : "---"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className={`font-medium ${
                        assinatura.dias_restantes && assinatura.dias_restantes < 7 
                          ? 'text-red-600' 
                          : assinatura.dias_restantes && assinatura.dias_restantes < 30
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {assinatura.dias_restantes ?? "---"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(filtradas ?? []).length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filtradas.length}</span> assinatura(s)
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Atualizações em tempo real ativas</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}