"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Order = {
  id: string;
  customername: string;
  customerphone: string;
  customeraddress: string;
  totalprice: number;
  status: "pending" | "preparing" | "completed" | "delivered";
  created_at: string;
  paymentmethod: string;
  items: { name: string; quantity: number; price: number }[];
};

export default function ComandasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const supabase = createClientComponentClient();

  // 🚀 Buscar pedidos via API
  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  };

  // 🚀 Atualizar status do pedido
  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  useEffect(() => {
    fetchOrders();

    // 🔥 Realtime Supabase
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order" },
        (payload) => {
          console.log("Evento Realtime:", payload);

          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === payload.new.id ? (payload.new as Order) : o
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("pt-BR");

  const badge = (status: string) => {
    if (status === "pending")
      return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">⏳ Pendente</span>;
    if (status === "preparing")
      return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">👨‍🍳 Preparando</span>;
    if (status === "completed")
      return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">✅ Pronto</span>;
    if (status === "delivered")
      return <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">📦 Entregue</span>;
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        📋 Comandas - Pedidos em Tempo Real
      </h1>
      <p className="mb-6 text-gray-600">
        Gerencie todos os pedidos ordenados por data e hora de chegada.
      </p>

      {orders.length === 0 ? (
        <p>Sem pedidos no momento.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">
                  Pedido #{order.id} • {formatDate(order.created_at)}
                </h2>
                {badge(order.status)}
              </div>

              <p>👤 {order.customername}</p>
              <p>📍 {order.customeraddress}</p>
              <p>📞 {order.customerphone}</p>

              <div className="mt-3">
                <h3 className="font-semibold">Itens do Pedido:</h3>
                <ul className="ml-6 list-disc">
                  {order.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.name} — R$ {item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-2">💳 Pagamento: {order.paymentmethod}</p>
              <p className="mt-1 font-bold text-green-600 text-lg">
                R$ {order.totalprice.toFixed(2)}
              </p>

              <div className="mt-3">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "preparing")}
                    className="px-4 py-2 rounded bg-blue-600 text-white font-medium"
                  >
                    🚀 Iniciar Preparo
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="px-4 py-2 rounded bg-green-600 text-white font-medium"
                  >
                    ✅ Marcar como Pronto
                  </button>
                )}
                {order.status === "completed" && (
                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    className="px-4 py-2 rounded bg-gray-600 text-white font-medium"
                  >
                    📦 Marcar como Entregue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}