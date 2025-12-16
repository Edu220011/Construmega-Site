
import React, { useEffect, useState } from 'react';

function Usuarios({ setCliente, setAdmin }) {
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '' });
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    // Envia apenas os campos necessários para o backend
    const dados = { nome: form.nome, cpf: form.cpf, telefone: form.telefone, endereco: form.endereco, email: form.email, senha: form.senha };
    fetch('http://192.168.3.203:3001/usuarios', {
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
    <div style={{maxWidth:400,margin:'32px auto',background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #0002',padding:24}}>
      <h2 style={{textAlign:'center',color:'#2d3a4b'}}>Crie sua conta</h2>
      <p style={{textAlign:'center',color:'#555',fontSize:15,marginBottom:16}}>
        Seja cliente da <b>Loja de Materiais de Construção</b>!<br/>
        Cadastre-se para visualizar pedidos, promoções e receber novidades.
      </p>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required maxLength={14} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required maxLength={15} style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="senha" placeholder="Senha" value={form.senha} onChange={handleChange} required type="password" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input name="senha2" placeholder="Confirme a senha" value={form.senha2} onChange={handleChange} required type="password" style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <button type="submit" style={{padding:10,borderRadius:4,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold'}}>Registrar</button>
      </form>
      {sucesso && <div style={{marginTop:16,color:'#2d8a4b',textAlign:'center'}}>Cadastro realizado com sucesso! Faça login para acessar sua conta.</div>}
      {erro && <div style={{marginTop:16,color:'#b22',textAlign:'center'}}>{erro}</div>}
      <div style={{marginTop:32,textAlign:'center',fontSize:13,color:'#888'}}>
        <b>Endereço:</b> Av. Central, 1234 - Centro<br/>
        <b>Telefone:</b> (11) 99999-9999<br/>
        <b>Horário:</b> Seg a Sex, 8h às 18h
      </div>
    </div>
  );
}

export default Usuarios;
