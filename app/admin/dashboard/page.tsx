"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Painel Administrativo</h1>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="font-semibold">🍕 Total de Itens</h2>
          <p>1 item no cardápio</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="font-semibold">📂 Categorias</h2>
          <p>3 categorias ativas</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="font-semibold">🎉 Promoções</h2>
          <p>1 item em promoção</p>
        </div>
      </div>

      {/* Ações rápidas */}
      <h2 className="text-xl font-semibold mb-4">⚡ Ações Rápidas</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Link
          href="/admin/itens/novo"
          className="p-4 bg-purple-600 text-white rounded text-center"
        >
          ➕ Adicionar Item
        </Link>

        <Link
          href="/admin/categorias/novo"
          className="p-4 bg-yellow-500 text-white rounded text-center"
        >
          📂 Nova Categoria
        </Link>

        <Link
          href="/admin/importar"
          className="p-4 bg-green-500 text-white rounded text-center"
        >
          📥 Importar do iFood
        </Link>

        <Link
          href="/admin/promocoes"
          className="p-4 bg-pink-500 text-white rounded text-center"
        >
          🎉 Promoções
        </Link>

        <Link
          href="/admin/personalizar"
          className="p-4 bg-blue-500 text-white rounded text-center"
        >
          🎨 Personalizar
        </Link>

        <Link
          href="/admin/relatorios"
          className="p-4 bg-indigo-500 text-white rounded text-center"
        >
          📑 Relatórios
        </Link>

        {/* AQUI ESTÁ O IMPORTANTE */}
        <Link
          href="/admin/comandas"
          className="p-4 bg-red-500 text-white rounded text-center"
        >
          📋 Comandas
        </Link>
      </div>

      {/* Infos do restaurante */}
      <h2 className="text-xl font-semibold mb-4">ℹ️ Informações</h2>
      <div className="p-4 border rounded bg-white shadow">
        <p><strong>Nome:</strong> Gomerlandia</p>
        <p><strong>URL:</strong> /gomerlandia</p>
        <p><strong>Telefone:</strong> 6299999999</p>
        <Link
          href="/admin/restaurante/editar"
          className="mt-2 inline-block px-4 py-2 bg-gray-600 text-white rounded"
        >
          ✏️ Editar Informações
        </Link>
      </div>
    </div>
  );
}