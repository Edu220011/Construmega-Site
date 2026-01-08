import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch(getApiUrl('pedidos'))
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
