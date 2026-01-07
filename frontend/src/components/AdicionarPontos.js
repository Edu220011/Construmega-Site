import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

function AdicionarPontos() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [pontos, setPontos] = useState('');
  const [msg, setMsg] = useState('');

  async function buscarUsuario() {
    setMsg('');
    setUsuario(null);
    if (!id) return;
    const res = await fetch('/usuarios');
    const lista = await res.json();
    const user = lista.find(u => String(u.id) === String(id));
    if (user) setUsuario(user);
    else setMsg('Usuário não encontrado.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    if (!usuario) return setMsg('Busque um usuário válido.');
    if (!pontos || isNaN(Number(pontos))) return setMsg('Informe a quantidade de pontos.');
    // Atualiza pontos do usuário (mock local, precisa de backend real para produção)
    try {
      const res = await fetch(`/usuarios/${usuario.id}/pontos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontos: Number(pontos) })
      });
      if (!res.ok) throw new Error('Erro ao adicionar pontos');
      const data = await res.json();
      setUsuario({ ...usuario, pontos: data.pontos });
      setMsg('Pontos adicionados com sucesso!');
    } catch {
      setMsg('Erro ao adicionar pontos.');
    }
  }

  return (
    <div style={{maxWidth:420,margin:'40px auto',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px #0001',padding:32}}>
      <button
        onClick={() => navigate('/usuarios')}
        style={{marginBottom:18,background:'#333E8C',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:'bold',fontSize:15,cursor:'pointer',boxShadow:'0 2px 8px #333e8c33'}}
      >
        ← Voltar para Usuários
      </button>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,marginBottom:18,fontSize:28}}>Adicionar Pontos</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
        <label style={{fontWeight:'bold'}}>ID do Usuário:
          <input type="text" value={id} onChange={e=>setId(e.target.value)} onBlur={buscarUsuario} style={{marginLeft:8,padding:8,borderRadius:6,border:'1px solid #ccc',width:'100%'}} required />
        </label>
        {usuario && (
          <div style={{background:'#f6f8fa',padding:12,borderRadius:8,marginBottom:8}}>
            <b>Nome:</b> {usuario.nome}<br/>
            <b>Email:</b> {usuario.email}<br/>
            <b>Pontos atuais:</b> {usuario.pontos ?? 0}
          </div>
        )}
        <label style={{fontWeight:'bold'}}>Adicionar Pontos:
          <input type="number" value={pontos} onChange={e=>setPontos(e.target.value)} style={{marginLeft:8,padding:8,borderRadius:6,border:'1px solid #ccc',width:'100%'}} required />
        </label>
        <button type="submit" style={{padding:'12px 0',borderRadius:8,background:'#333E8C',color:'#fff',border:'none',fontWeight:'bold',fontSize:18,marginTop:8,cursor:'pointer'}}>Salvar</button>
      </form>
      {msg && <div style={{marginTop:16,textAlign:'center',color:msg.includes('sucesso') ? '#2d8a4b' : '#b22',fontWeight:'bold'}}>{msg}</div>}
    </div>
  );
}

export default AdicionarPontos;
