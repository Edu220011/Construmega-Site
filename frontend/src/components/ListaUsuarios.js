import React, { useState, useEffect } from 'react';

function ListaUsuarios({ tipoUsuarioLogado = 'admin' }) {
    const [novoModal, setNovoModal] = useState(false);
    const [novoForm, setNovoForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '', tipo: 'gerente' });
    const [novoMsg, setNovoMsg] = useState('');

    function handleNovoChange(e) {
      setNovoForm({ ...novoForm, [e.target.name]: e.target.value });
    }

    function validarCPF(cpf) {
      cpf = cpf.replace(/\D/g, '');
      if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
      let soma = 0, resto;
      for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i-1]) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9])) return false;
      soma = 0;
      for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i-1]) * (12 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[10])) return false;
      return true;
    }

    async function handleNovoSubmit(e) {
      e.preventDefault();
      setNovoMsg('');
      if (novoForm.senha !== novoForm.senha2) {
        setNovoMsg('As senhas não coincidem.');
        return;
      }
      if (!validarCPF(novoForm.cpf)) {
        setNovoMsg('CPF inválido.');
        return;
      }
      const dados = { nome: novoForm.nome, cpf: novoForm.cpf, telefone: novoForm.telefone, endereco: novoForm.endereco, email: novoForm.email, senha: novoForm.senha, tipo: novoForm.tipo };
      const res = await fetch('http://192.168.3.203:3001/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      if (res.ok) {
        setNovoMsg('Usuário cadastrado com sucesso!');
        setNovoForm({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '', tipo: 'gerente' });
        setTimeout(()=>{ setNovoModal(false); setNovoMsg(''); }, 1200);
        fetch('http://192.168.3.203:3001/usuarios').then(res=>res.json()).then(setUsuarios);
      } else {
        setNovoMsg('Erro ao cadastrar. Tente outro email ou CPF.');
      }
    }
  const [usuarios, setUsuarios] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('nome');
  const [filtro, setFiltro] = useState('');
  // Estados para edição e senha do usuário selecionado
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', tipo: 'gerente' });
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');

  // Atualiza o form sempre que o usuário selecionado mudar
  useEffect(() => {
    if (detalhe) {
      const u = usuarios.find(x => x.id === detalhe);
      if (u) setForm({
        nome: u.nome || '',
        cpf: u.cpf || '',
        telefone: u.telefone || '',
        endereco: u.endereco || '',
        email: u.email || '',
        tipo: u.tipo || 'gerente',
        id: u.id
      });
    }
  }, [detalhe, usuarios]);

  useEffect(() => {
    fetch('http://192.168.3.203:3001/usuarios')
      .then(res => res.json())
      .then(setUsuarios);
  }, []);

  const usuariosFiltrados = usuarios.filter(u => {
    if (!filtro) return true;
    const valor = (u[tipoFiltro] || '').toString().toLowerCase();
    return valor.includes(filtro.toLowerCase());
  });

  return (
    <div style={{maxWidth:1100,minHeight:600,margin:'32px auto',background:'#fff',borderRadius:20,boxShadow:'0 4px 24px #0002',padding:'40px 48px',position:'relative'}}>
      <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:32}}>
        <button onClick={()=>setNovoModal(true)} style={{background:'#2d3a4b',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:'bold',fontSize:'1.08rem',cursor:'pointer'}}>+ Novo Usuário</button>
        <h2 style={{color:'#2d3a4b',fontSize:'2.1rem',margin:0}}>Usuários Cadastrados</h2>
      </div>
            {novoModal && (
              <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,54,74,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{background:'#fff',borderRadius:20,padding:'32px 36px',minWidth:400,boxShadow:'0 4px 24px #0003',maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',position:'relative',display:'flex',flexDirection:'column',gap:20}}>
                  <button onClick={()=>{setNovoModal(false);setNovoMsg('');}} style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:28,color:'#2d3a4b',cursor:'pointer',fontWeight:'bold'}} title="Fechar">×</button>
                  <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>Novo Usuário</h2>
                  <form onSubmit={handleNovoSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
                    <input name="nome" placeholder="Nome completo" value={novoForm.nome} onChange={handleNovoChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
                    <input name="cpf" placeholder="CPF" value={novoForm.cpf} onChange={handleNovoChange} required maxLength={14} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
                    <input name="telefone" placeholder="Telefone" value={novoForm.telefone} onChange={handleNovoChange} required maxLength={15} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
                    <input name="endereco" placeholder="Endereço" value={novoForm.endereco} onChange={handleNovoChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
                    <input name="email" placeholder="Email" value={novoForm.email} onChange={handleNovoChange} required type="email" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
                    <input name="senha" placeholder="Senha" value={novoForm.senha} onChange={handleNovoChange} required type="password" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
                    <input name="senha2" placeholder="Confirme a senha" value={novoForm.senha2} onChange={handleNovoChange} required type="password" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
                    <label style={{fontWeight:'bold',marginTop:8}}>Permissão:
                      <select name="tipo" value={novoForm.tipo} onChange={handleNovoChange} style={{marginLeft:8,padding:6,borderRadius:6}}>
                        <option value="admin">Admin</option>
                        <option value="gerente">Gerente</option>
                        <option value="cliente">Cliente</option>
                      </select>
                    </label>
                    <button type="submit" style={{padding:10,borderRadius:4,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold',marginTop:10}}>Cadastrar</button>
                  </form>
                  {novoMsg && <div style={{marginTop:16,color: novoMsg.includes('sucesso') ? '#2d8a4b' : '#b22',textAlign:'center'}}>{novoMsg}</div>}
                </div>
              </div>
            )}
      {/* Barra de pesquisa com lupa e filtros */}
      <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',marginBottom:32}}>
        <button
          onClick={()=>setMostrarBusca(f=>!f)}
          style={{background:'none',border:'none',cursor:'pointer',fontSize:26,marginRight:8}}
          title="Pesquisar usuários"
        >🔍</button>
        {mostrarBusca && (
          <div style={{background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #0002',padding:'16px 20px',display:'flex',alignItems:'center',gap:12,width:'100%',maxWidth:'100%'}}>
            <select value={tipoFiltro} onChange={e=>setTipoFiltro(e.target.value)} style={{padding:6,borderRadius:6}}>
              <option value="nome">Nome</option>
              <option value="cpf">CPF</option>
              <option value="telefone">Telefone</option>
              <option value="endereco">Endereço</option>
              <option value="email">Email</option>
              <option value="tipo">Permissão</option>
            </select>
            <input
              type="text"
              placeholder={`Pesquisar por ${tipoFiltro}...`}
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              style={{flex:1,minWidth:0,padding:'10px 14px',borderRadius:6,border:'1px solid #b0b8c9',fontSize:'1.05rem'}}
              autoFocus
            />
          </div>
        )}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:'24px',filter: detalhe ? 'blur(2px)' : 'none', pointerEvents: detalhe ? 'none' : 'auto'}}>
        {usuariosFiltrados.length === 0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',color:'#888',fontSize:'1.1rem'}}>Nenhum usuário encontrado.</div>
        )}
        {usuariosFiltrados.map(u => (
          <div key={u.id} style={{background:'#e9ecf3',borderRadius:12,padding:'22px 28px',boxShadow:'0 1px 6px #3a4a7a22',display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:'1.18rem',fontWeight:'bold',color:'#3a4a7a'}}>{u.nome}</span>
              <span style={{fontSize:'1rem',color:'#555',background:'#fff',borderRadius:6,padding:'2px 10px',marginLeft:4}}>ID: {u.id}</span>
              <a href={`/usuario/editar/${u.id}`} style={{marginLeft:4,background:'#2d3a4b',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',fontWeight:'bold',fontSize:'0.98rem',cursor:'pointer',textDecoration:'none',display:'inline-block'}}>Editar</a>
            </div>
          </div>
        ))}
      </div>
      {detalhe && (() => {
        const u = usuarios.find(x => x.id === detalhe);
        if (!u || !form) return null;
        const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
        const handleSave = async e => {
          e.preventDefault();
          setMsg('Salvando...');
          const usuarioAtual = usuarios.find(x => x.id === u.id);
          const payload = { ...form, tipo: (form.tipo || usuarioAtual?.tipo || 'gerente') };
          const res = await fetch(`http://192.168.3.203:3001/usuarios/${u.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            setMsg('Dados atualizados!');
            setEdit(false);
            // Atualiza lista e mantém painel aberto
            fetch('http://192.168.3.203:3001/usuarios')
              .then(res => res.json())
              .then(novosUsuarios => {
                setUsuarios(novosUsuarios);
                // Mantém o detalhe aberto para o mesmo usuário atualizado
                setDetalhe(u.id);
              });
          } else {
            setMsg('Erro ao salvar.');
          }
        };
        const handleResetSenha = async () => {
          if (!window.confirm('Deseja realmente resetar a senha deste usuário?')) return;
          setMsg('Resetando senha...');
          // Gera senha aleatória de 8 dígitos
          const novaSenha = senha || Math.random().toString(36).slice(-8);
          const res = await fetch(`http://192.168.3.203:3001/usuarios/${u.id}/senha`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: novaSenha })
          });
          if (res.ok) {
            setMsg(`Senha resetada! Nova senha: ${novaSenha}`);
            setSenha('');
          } else {
            setMsg('Erro ao resetar senha.');
          }
        };
        return (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,54,74,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#fff',borderRadius:20,padding:'32px 36px',minWidth:400,boxShadow:'0 4px 24px #0003',maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',position:'relative',display:'flex',flexDirection:'column',gap:20}}>
              <button onClick={()=>{setDetalhe(null);setEdit(false);setMsg('');}} style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:28,color:'#2d3a4b',cursor:'pointer',fontWeight:'bold'}} title="Fechar">×</button>
              <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:32}}>Usuário</h2>
              {edit ? null : (
                <>
                  <div style={{fontSize:'1.18rem',marginBottom:16}}><b>Nome:</b> {u.nome}</div>
                  <div style={{fontSize:'1.18rem',marginBottom:16}}><b>CPF:</b> {u.cpf}</div>
                  <div style={{fontSize:'1.18rem',marginBottom:16}}><b>Telefone:</b> {u.telefone}</div>
                  <div style={{fontSize:'1.18rem',marginBottom:16}}><b>Endereço:</b> {u.endereco}</div>
                  <div style={{fontSize:'1.18rem',marginBottom:16}}><b>Email:</b> {u.email}</div>
                  {/* Botão de editar removido: edição só pelo botão da lista */}
                  {tipoUsuarioLogado === 'admin' && (
                    <div style={{marginTop:32}}>
                      <input type="text" placeholder="Nova senha (opcional)" value={senha} onChange={e=>setSenha(e.target.value)} style={{padding:8,marginRight:8}} />
                      <button onClick={handleResetSenha} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:'bold',fontSize:'1rem',cursor:'pointer'}}>Resetar Senha</button>
                    </div>
                  )}
                </>
              )}
              {msg && <div style={{marginTop:18,color:'#2d3a4b',fontWeight:'bold'}}>{msg}</div>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default ListaUsuarios;