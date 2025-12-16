import React, { useEffect, useState } from 'react';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch('http://192.168.3.203:3001/pedidos')
      .then(res => res.json())
      .then(setPedidos);
  }, []);

  return (
    <div>
      <h2>Pedidos</h2>
      <ul>
        {pedidos.map(p => (
          <li key={p.id}>Pedido #{p.id} - Usuário: {p.usuario_id} - Data: {p.data}</li>
        ))}
      </ul>
    </div>
  );
}

export default Pedidos;
