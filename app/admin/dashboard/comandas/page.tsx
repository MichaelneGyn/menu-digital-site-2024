"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  total: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  items: { name: string; quantity: number; price: number }[];
};

export default function ComandasPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Buscar pedidos da API
  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders(); // recarrega pedidos
  };

  useEffect(() => {
    fetchOrders();
    // TODO: integrar realtime depois
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Comandas - Pedidos em Tempo Real</h1>

      {orders.length === 0 ? (
        <p>Nenhum pedido.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-lg shadow-md bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Pedido #{order.id}</h2>
                <span
                  className={`px-3 py-1 rounded text-white text-sm ${
                    order.status === "pending"
                      ? "bg-yellow-500"
                      : order.status === "preparing"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                >
                  {order.status === "pending"
                    ? "⏳ Pendente"
                    : order.status === "preparing"
                    ? "👨‍🍳 Preparando"
                    : "✅ Pronto"}
                </span>
              </div>
              <p><strong>Cliente:</strong> {order.customerName} 📞 {order.customerPhone}</p>
              <p><strong>Endereço:</strong> {order.address}</p>
              <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
              <p><strong>Total:</strong> R$ {order.total?.toFixed(2)}</p>
              <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleString("pt-BR")}</p>

              <div className="mt-3">
                <h3 className="font-semibold">Itens do Pedido:</h3>
                <ul className="list-disc ml-6">
                  {order.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.name} — R$ {item.price}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "preparing")}
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                  >
                    🚀 Iniciar Preparo
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="px-3 py-1 rounded bg-green-600 text-white"
                  >
                    ✅ Marcar como Pronto
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