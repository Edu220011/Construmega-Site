import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditarUsuario({ tipoUsuarioLogado }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', tipo: '' });
  // Hooks de reset de senha DEVEM ficar no topo
  const [senhaReset, setSenhaReset] = useState('');
  const [novaSenhaGerada, setNovaSenhaGerada] = useState('');

  useEffect(() => {
    // Sempre buscar todos e filtrar pelo ID para garantir compatibilidade
    fetch('http://192.168.3.203:3001/usuarios')
      .then(res => res.json())
      .then(lista => {
        const achado = lista.find(u => String(u.id) === String(id));
        if (!achado) setUsuario(null);
        else {
          setUsuario(achado);
          setForm({
            nome: achado.nome || '',
            cpf: achado.cpf || '',
            telefone: achado.telefone || '',
            endereco: achado.endereco || '',
            email: achado.email || '',
            tipo: achado.tipo || ''
          });
        }
      });
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMsg('Salvando...');
    const res = await fetch(`http://192.168.3.203:3001/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg('Dados atualizados!');
      setTimeout(() => navigate('/usuarios'), 1200);
    } else {
      setMsg('Erro ao salvar.');
    }
  }

  if (usuario === null) return <div style={{textAlign:'center',marginTop:40}}>Usuário não encontrado.</div>;
  if (!usuario) return <div style={{textAlign:'center',marginTop:40}}>Carregando...</div>;

  if (tipoUsuarioLogado !== 'admin' && tipoUsuarioLogado !== 'gerente') {
    return <div style={{color:'#b22',textAlign:'center',marginTop:40}}>Acesso restrito a admins e gerentes.</div>;
  }

  // Função de resetar senha (hooks já declarados no topo)
  // (Removido: declaração duplicada)
  async function handleResetSenha() {
    if (!window.confirm('Deseja realmente resetar a senha deste usuário?')) return;
    setMsg('Resetando senha...');
    // Gera senha aleatória de 8 dígitos
    const novaSenha = senhaReset || Math.random().toString(36).slice(-8);
    const res = await fetch(`http://192.168.3.203:3001/usuarios/${usuario.id}/senha`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: novaSenha })
    });
    if (res.ok) {
      setMsg('Senha resetada com sucesso!');
      setNovaSenhaGerada(novaSenha);
      setSenhaReset('');
      // Salva a senha resetada no localStorage para forçar alteração no próximo login
      localStorage.setItem('senhaResetada', novaSenha);
    } else {
      setMsg('Erro ao resetar senha.');
    }
  }

  return (
    <div style={{maxWidth:600,margin:'40px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 12px #0002',padding:32}}>
      <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>Editar Usuário</h2>
      <div style={{background:'#f6f8fa',borderRadius:10,padding:'18px 22px',marginBottom:28}}>
        <div style={{fontSize:'1.08rem',marginBottom:8}}><b>ID:</b> {usuario.id}</div>
        <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Nome:</b> {usuario.nome}</div>
        <div style={{fontSize:'1.08rem',marginBottom:8}}><b>CPF:</b> {usuario.cpf}</div>
        <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Telefone:</b> {usuario.telefone}</div>
        <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Endereço:</b> {usuario.endereco}</div>
        <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Email:</b> {usuario.email}</div>
        <div style={{fontSize:'1.08rem',marginBottom:8}}><b>Permissão:</b> {usuario.tipo}</div>
      </div>
      <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:16}}>
        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required maxLength={14} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required maxLength={15} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <button type="submit" style={{padding:10,borderRadius:4,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold'}}>Salvar Alterações</button>
          {(tipoUsuarioLogado === 'admin' || tipoUsuarioLogado === 'gerente') && (
            <>
              <input type="text" placeholder="Nova senha (opcional)" value={senhaReset} onChange={e=>setSenhaReset(e.target.value)} style={{padding:8,marginRight:8}} />
              <button type="button" onClick={handleResetSenha} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:'bold',fontSize:'1rem',cursor:'pointer'}}>Resetar Senha</button>
            </>
          )}
        </div>
        {novaSenhaGerada && <div style={{marginTop:12,color:'#2d8a4b',fontWeight:'bold'}}>Nova senha: {novaSenhaGerada}</div>}
      </form>
      <button onClick={()=>navigate('/usuarios')} style={{marginTop:28,padding:'10px 24px',borderRadius:6,background:'#b0b8c9',color:'#2d3a4b',border:'none',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}}>Voltar para painel de usuários</button>
      {msg && <div style={{marginTop:18,color: msg.includes('sucesso') ? '#2d8a4b' : '#b22',textAlign:'center'}}>{msg}</div>}
    </div>
  );
}

export default EditarUsuario;
