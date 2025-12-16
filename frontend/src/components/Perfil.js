import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { FaRegEdit } from 'react-icons/fa';

function Perfil({ cliente, setCliente }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(cliente || {});
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  if (!cliente) {
    navigate('/login');
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMsg('Salvando...');
    const res = await fetch(`http://192.168.3.203:3001/usuarios/${cliente.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg('Dados atualizados!');
      setCliente({ ...cliente, ...form });
      setEditando(false);
    } else {
      setMsg('Erro ao salvar.');
    }
  }

  return (
    <div style={{maxWidth:500,margin:'40px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 12px #0002',padding:32}}>
      <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>Meu Perfil</h2>
      {!editando ? (
        <>
          <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Código:</b> {cliente.id}</div>
          <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Nome:</b> {cliente.nome}</div>
          <div style={{fontSize:'1.08rem',marginBottom:8}}><b>CPF:</b> {cliente.cpf}</div>
          <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Telefone:</b> {cliente.telefone}</div>
          <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Endereço:</b> {cliente.endereco}</div>
          <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Email:</b> {cliente.email}</div>
          {/* Permissão removida para usuário comum */}
          <div style={{display:'flex',justifyContent:'center',marginTop:32}}>
            <button onClick={()=>setEditando(true)} style={{background:'none',border:'none',cursor:'pointer',fontSize:28}} title="Editar dados">
              ✏️
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:14,marginTop:16}}>
          <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
          <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required maxLength={14} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
          <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required maxLength={15} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
          <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
          {/* Campo de permissão removido do formulário */}
          <div style={{display:'flex',gap:12,marginTop:8}}>
            <button type="submit" style={{padding:10,borderRadius:4,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold'}}>Salvar</button>
            <button type="button" onClick={()=>{setEditando(false);setForm(cliente);}} style={{padding:10,borderRadius:4,background:'#b0b8c9',color:'#2d3a4b',border:'none',fontWeight:'bold'}}>Cancelar</button>
          </div>
        </form>
      )}
      {msg && <div style={{marginTop:18,color: msg.includes('sucesso') ? '#2d8a4b' : '#b22',textAlign:'center'}}>{msg}</div>}
    </div>
  );
}

export default Perfil;
