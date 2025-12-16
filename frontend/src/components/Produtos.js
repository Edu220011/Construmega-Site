import React, { useEffect, useState } from 'react';


function Produtos({ admin }) {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ nome: '', preco: '', estoque: '' });

  useEffect(() => {
    fetch('http://192.168.3.203:3001/produtos')
      .then(res => res.json())
      .then(setProdutos);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetch('http://192.168.3.203:3001/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, preco: parseFloat(form.preco), estoque: parseInt(form.estoque) })
    })
      .then(res => res.json())
      .then(produto => setProdutos([...produtos, produto]));
  }

  return (
    <div>
      <h2>Produtos</h2>
      {admin && (
        <form onSubmit={handleSubmit}>
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <input name="preco" placeholder="Preço" value={form.preco} onChange={handleChange} required type="number" step="0.01" />
          <input name="estoque" placeholder="Estoque" value={form.estoque} onChange={handleChange} required type="number" />
          <button type="submit">Adicionar</button>
        </form>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        {produtos.map(p => (
          <div key={p.id} style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            background: '#fafbfc',
            boxShadow: '0 1px 4px #0001',
            textAlign: 'center'
          }}>
            <h3 style={{margin:'8px 0'}}>{p.nome}</h3>
            <p style={{fontWeight:'bold', color:'#2d3a4b'}}>R$ {p.preco}</p>
            <p style={{fontSize:13, color:'#666'}}>Estoque: {p.estoque}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Produtos;
