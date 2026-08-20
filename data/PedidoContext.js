import { createContext, useContext, useMemo, useState } from "react";

const PedidoContext = createContext(null);

// Contexto compartido entre Mis Insumos y Notificaciones: mantiene la lista
// de productos que el usuario quiere consultarle a su proveedor, para armar
// un solo pedido en vez de mensajes individuales por producto.
export function PedidoProvider({ children }) {
  const [pedido, setPedido] = useState([]);

  function agregarAlPedido({ id, nombre }) {
    setPedido((actuales) => {
      if (actuales.some((item) => item.id === id)) return actuales;
      return [...actuales, { id, nombre }];
    });
  }

  function quitarDelPedido(id) {
    setPedido((actuales) => actuales.filter((item) => item.id !== id));
  }

  function estaEnPedido(id) {
    return pedido.some((item) => item.id === id);
  }

  const value = useMemo(
    () => ({ pedido, agregarAlPedido, quitarDelPedido, estaEnPedido }),
    [pedido]
  );

  return <PedidoContext.Provider value={value}>{children}</PedidoContext.Provider>;
}

export function usePedido() {
  const contexto = useContext(PedidoContext);
  if (!contexto) {
    throw new Error("usePedido debe usarse dentro de <PedidoProvider>");
  }
  return contexto;
}
