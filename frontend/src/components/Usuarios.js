
import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';

// Hook para buscar dados da empresa (endereço e telefone)
function useEmpresaConfig() {
  const [empresa, setEmpresa] = useState(null);
  useEffect(() => {
    fetch(getApiUrl('configuracoes'))
      .then(res => res.json())
      .then(data => setEmpresa(data));
  }, []);
  return empresa;
}

function Usuarios({ setCliente, setAdmin }) {
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '' });
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const empresaConfig = useEmpresaConfig();

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'cpf') {
      // Remove tudo que não for número
      let v = value.replace(/\D/g, '');
      // Limita a 11 dígitos
      v = v.slice(0, 11);
      // Formata para 000.000.000-00
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      setForm({ ...form, cpf: v });
    } else if (name === 'telefone') {
      // Remove tudo que não for número
      let v = value.replace(/\D/g, '');
      // Limita a 11 dígitos
      v = v.slice(0, 11);
      // Formata para (00) 00000-0000
      if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      setForm({ ...form, telefone: v });
    } else {
      setForm({ ...form, [name]: value });
    }
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

  function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    if (form.senha !== form.senha2) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (!validarCPF(form.cpf)) {
      setErro('CPF inválido.');
      return;
    }
    // Sempre registra como cliente
    const dados = { nome: form.nome, cpf: form.cpf, telefone: form.telefone, endereco: form.endereco, email: form.email, senha: form.senha, tipo: 'cliente' };
    fetch(getApiUrl('usuarios'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao registrar.');
        return res.json();
      })
      .then((novoUsuario) => {
        setSucesso(true);
        setForm({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '' });
        // Atualiza o login global para o novo usuário registrado
        if (setCliente) setCliente(novoUsuario);
        if (setAdmin) setAdmin(false);
      })
      .catch(() => setErro('Não foi possível registrar. Tente outro email ou CPF.'));
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: 0,
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 6px 32px #0001, 0 1.5px 6px #333E8C22',
        padding: 32,
        margin: 24,
        border: '1.5px solid #e9ecf3',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        <div style={{marginBottom:10}}>
          <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,fontSize:28,margin:0}}>CONSTRUMEGA</h2>
        </div>
        <p style={{textAlign:'center',color:'#2F4059',fontSize:18,marginBottom:8}}>
          Seja cliente da <b style={{color:'#333E8C'}}>CONSTRUMEGA</b>!
        </p>
        <p style={{textAlign:'center',color:'#2F4059',fontSize:16,marginBottom:18}}>
          Cadastre-se para visualizar pedidos, promoções e receber novidades.
        </p>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
          <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2}} />
          <input
            name="cpf"
            placeholder="CPF (000.000.000-00)"
            value={form.cpf}
            onChange={handleChange}
            required
            maxLength={14}
            style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2}}
            inputMode="numeric"
            pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
            autoComplete="off"
          />
          <input
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={handleChange}
            required
            maxLength={15}
            style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2}}
            inputMode="numeric"
            pattern="\(\d{2}\) \d{5}-\d{4}"
            autoComplete="off"
          />
          <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} required style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2}} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2}} />
          <input name="senha" placeholder="Senha" value={form.senha} onChange={handleChange} required type="password" style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2}} />
          <input name="senha2" placeholder="Confirme a senha" value={form.senha2} onChange={handleChange} required type="password" style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2}} />
          <button type="submit" style={{
            padding:12,
            borderRadius:8,
            background:'linear-gradient(90deg, #333E8C 0%, #1D2A5A 100%)',
            color:'#fff',
            border:'none',
            fontWeight:'bold',
            fontSize:18,
            letterSpacing:1,
            boxShadow:'0 2px 12px #333E8C44',
            cursor:'pointer',
            marginTop:8,
            transition:'background .2s'
          }}>Registrar</button>
        </form>
        {sucesso && <div style={{marginTop:16,color:'#2d8a4b',textAlign:'center'}}>Cadastro realizado com sucesso! Faça login para acessar sua conta.</div>}
        {erro && <div style={{marginTop:16,color:'#b22',textAlign:'center'}}>{erro}</div>}
        <div style={{marginTop:32,textAlign:'center',fontSize:13,color:'#888'}}>
          <b>Endereço:</b> {empresaConfig?.endereco || 'Endereço não cadastrado'}<br/>
          <b>Telefone:</b> {empresaConfig?.telefoneEmpresa || 'Telefone não cadastrado'}
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
