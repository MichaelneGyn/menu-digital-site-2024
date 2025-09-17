"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customername: string;
  customerphone: string;
  customeraddress: string;
  totalprice: number;
  status: "pending" | "preparing" | "completed";
  created_at: string;
  paymentmethod: string;
  items: { name: string; quantity: number; price: number }[];
};

export default function ComandasPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Carregar pedidos da API
  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    
    // Mapear os dados da API para o formato esperado pelo componente
    const mappedOrders = data.map((order: any) => ({
      id: order.id,
      customername: order.customerName,
      customerphone: order.customerPhone,
      customeraddress: order.address,
      totalprice: order.total,
      status: order.status,
      created_at: order.createdAt,
      paymentmethod: order.paymentMethod,
      items: order.items || []
    }));
    
    setOrders(mappedOrders);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders(); // recarregar lista
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        📋 Comandas - Pedidos em Tempo Real
      </h1>

      {orders.length === 0 ? (
        <p>Sem pedidos no momento.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-lg shadow-md bg-white flex flex-col"
            >
              {/* Cabeçalho do pedido */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">
                  Pedido #{order.id} • {formatDate(order.created_at)}
                </h2>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "preparing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {order.status === "pending" && "⏳ Pendente"}
                  {order.status === "preparing" && "👨‍🍳 Preparando"}
                  {order.status === "completed" && "✅ Pronto"}
                </span>
              </div>

              {/* Dados do cliente */}
              <p>👤 {order.customername}</p>
              <p>📍 {order.customeraddress}</p>
              <p>📞 {order.customerphone}</p>

              {/* Itens do pedido */}
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

              {/* Pagamento e total */}
              <p className="mt-2">💳 Pagamento: {order.paymentmethod}</p>
              <p className="mt-1 font-bold text-green-600 text-lg">
                R$ {order.totalprice.toFixed(2)}
              </p>

              {/* Botões por status */}
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