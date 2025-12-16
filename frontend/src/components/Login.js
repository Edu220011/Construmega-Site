import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setAdmin, setCliente, setAba }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    if (loginEmail === 'admin@admin.com' && loginSenha === 'admin') {
      setAdmin(true);
      setCliente(null);
      setAba('produtos');
      navigate('/');
    } else {
      fetch('http://192.168.3.203:3001/usuarios')
        .then(res => res.json())
        .then(usuarios => {
          const user = usuarios.find(u => (u.cpf === loginEmail || u.email === loginEmail) && u.senha === loginSenha);
          if (user) {
            setCliente(user);
            setAdmin(false);
            setAba('produtos');
            // Se senha padrão, redireciona para alteração de senha
            // Armazena no localStorage a senha resetada para comparar no próximo login
            const senhaResetada = localStorage.getItem('senhaResetada');
            if (user.senha === '12345678' || (senhaResetada && user.senha === senhaResetada)) {
              // Limpa senha resetada após o primeiro login
              localStorage.removeItem('senhaResetada');
              navigate('/alterar-senha');
            } else {
              navigate('/');
            }
          } else {
            setAdmin(false);
            setCliente(null);
            alert('Login inválido!');
          }
        });
    }
  }

  return (
    <div style={{maxWidth:400,margin:'32px auto',background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #0002',padding:24}}>
      <h2 style={{textAlign:'center',color:'#2d3a4b'}}>Login</h2>
      <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input type="text" placeholder="Email ou CPF" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <input type="password" placeholder="Senha" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <label style={{fontSize:14, color:'#555',display:'flex',alignItems:'center',gap:6}}>
          <input type="checkbox" style={{accentColor:'#2d3a4b'}} /> Lembrar-me no próximo login
        </label>
        <button type="submit" style={{padding:10,borderRadius:4,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold'}}>Entrar</button>
      </form>
      <div style={{marginTop:24,textAlign:'center',fontSize:13,color:'#888'}}>
        <b>Admin:</b> admin@admin.com | Senha: admin<br/>
        <b>Clientes:</b> use o email e senha cadastrados<br/>
        <span style={{fontSize:12}}>Se não possui conta, registre-se!</span>
      </div>
    </div>
  );
}

export default Login;
