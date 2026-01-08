import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

function AdicionarPontosForm() {
    const navigate = useNavigate();
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [pontos, setPontos] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(false);

  // Verifica o ID e busca o nome do usuário
  const verificarId = async (idBusca) => {
    setNome('');
    setMsg('');
    if (!idBusca) return;
    setVerificando(true);
    try {
      const res = await fetch(getApiUrl('usuarios'));
      if (res.ok) {
        const lista = await res.json();
        const usuario = lista.find(u => u.id === idBusca);
        if (usuario) {
          setNome(usuario.nome);
        } else {
          setNome('');
          setMsg('ID não encontrado!');
        }
      } else {
        setMsg('Erro ao buscar usuários.');
      }
    } catch {
      setMsg('Erro de conexão com o servidor.');
    }
    setVerificando(false);
  };

  const handleIdBlur = () => {
    if (id) verificarId(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!id || !pontos || isNaN(Number(pontos))) {
      setMsg('Preencha um ID válido e uma quantidade numérica de pontos.');
      return;
    }
    if (!nome) {
      setMsg('ID não encontrado!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/usuarios/${id}/pontos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontos: Number(pontos) })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(`Pontos adicionados! Total: ${data.pontos ?? 'atualizado'}`);
        setId('');
        setNome('');
        setPontos('');
      } else {
        setMsg('Erro ao adicionar pontos. Verifique o ID.');
      }
    } catch {
      setMsg('Erro de conexão com o servidor.');
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:400,margin:'48px auto',background:'#fff',borderRadius:16,boxShadow:'0 4px 24px #0002',padding:32}}>
      <button className="btn-padrao" onClick={()=>navigate('/usuarios')} style={{marginBottom:18}}>← Voltar para Usuários</button>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,fontSize:26,marginBottom:24}}>Adicionar Pontos</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
        <input
          type="text"
          placeholder="ID do usuário"
          value={id}
          onChange={e => { setId(e.target.value); setNome(''); setMsg(''); }}
          onBlur={handleIdBlur}
          required
          style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16}}
        />
        {verificando && <span style={{color:'#888',fontSize:13}}>Verificando ID...</span>}
        {nome && <span style={{color:'#2d8a4b',fontWeight:'bold',fontSize:15}}>Usuário: {nome}</span>}
        <input
          type="number"
          placeholder="Quantidade de pontos"
          value={pontos}
          onChange={e => setPontos(e.target.value)}
          required
          min={1}
          style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16}}
        />
        <button className="btn-padrao" type="submit" disabled={loading} style={{fontSize:18}}>
          {loading ? 'Adicionando...' : 'Adicionar Pontos'}
        </button>
      </form>
      {msg && <div style={{marginTop:18,textAlign:'center',color:msg.startsWith('Pontos')?'#2d8a4b':'#b22',fontWeight:'bold'}}>{msg}</div>}
    </div>
  );
}

export default AdicionarPontosForm;
