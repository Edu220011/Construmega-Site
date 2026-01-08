import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { getApiUrl } from '../config/api';

function Login({ setAdmin, setCliente, setAba }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // Adicionar estilo de animação no head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    setErro(''); // Limpar erro anterior
    logger.log('Tentativa de login');
    
    // Fazer requisição para a nova rota de login
    fetch(getApiUrl('login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail,
        senha: loginSenha
      })
    })
    .then(res => res.json())
    .then(data => {
      logger.log('Login response', { success: data.sucesso });
      if (data.sucesso) {
        // Armazenar token e usuarioId no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuarioId', data.usuario.id);
        logger.log('Token e usuarioId salvos');
        
        if (data.usuario.tipo === 'admin') {
          logger.log('Login como administrador');
          localStorage.setItem('admin', 'true'); // Salvar PRIMEIRO no localStorage
          setAdmin(true); // Depois definir o estado
          setCliente(data.usuario);
        } else {
          logger.log('Login como usuário comum');
          localStorage.removeItem('admin'); // Remover PRIMEIRO
          setAdmin(false); // Depois definir o estado
          setCliente(data.usuario);
        }
        setAba('produtos');
        
        // Se senha padrão, redireciona para alteração de senha
        if (data.usuario.senha === '12345678') {
          navigate('/alterar-senha');
        } else {
          navigate('/');
        }
      } else {
        setAdmin(false);
        setCliente(null);
        setErro(data.erro || 'Credenciais inválidas!');
      }
    })
    .catch(error => {
      logger.error('Erro no login', error);
      setErro('Erro ao fazer login. Verifique sua conexão.');
    });
  }

  // Aplica máscara de CPF permitindo apenas números
  function handleLoginEmailChange(e) {
    let v = e.target.value;
    // Remove tudo que não for número
    let onlyNum = v.replace(/\D/g, '');
    // Limita a 11 dígitos
    if (onlyNum.length > 11) onlyNum = onlyNum.slice(0, 11);
    
    // Aplica máscara de CPF
    if (onlyNum.length > 9) {
      v = onlyNum.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (onlyNum.length > 6) {
      v = onlyNum.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (onlyNum.length > 3) {
      v = onlyNum.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else {
      v = onlyNum;
    }
    
    setLoginEmail(v);
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
        <h2 style={{
          textAlign: 'center',
          color: '#1D2A5A',
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 10,
          fontSize: 28,
        }}>
          Login
        </h2>
        <h3 style={{
          textAlign: 'center',
          color: '#2F4059',
          fontWeight: 600,
          fontSize: 18,
          marginBottom: 24,
          marginTop: 0,
        }}>
          Acesse sua conta
        </h3>
        {/* Mensagem de erro estilizada */}
        {erro && (
          <div style={{
            background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
            color: '#c33',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #fcc',
            fontSize: 14,
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'slideDown 0.3s ease-out'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{erro}</span>
          </div>
        )}
        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:18}}>
          <input
            type="text"
            placeholder="CPF (000.000.000-00)"
            value={loginEmail}
            onChange={handleLoginEmailChange}
            required
            style={{padding:'8px',borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2,width:'100%'}}
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
          />
          <input
            type={showSenha ? "text" : "password"}
            placeholder="Senha"
            value={loginSenha}
            onChange={e => setLoginSenha(e.target.value)}
            required
            style={{padding:'8px',borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2,width:'100%'}}
          />
          <label style={{fontSize:14, color:'#4A4A4A',display:'flex',alignItems:'center',gap:6,marginLeft:2}}>
            <input type="checkbox" style={{accentColor:'#2d3a4b'}} /> Lembrar-me no próximo login
          </label>
          <button 
            type="button" 
            onClick={() => setShowSenha(s => !s)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: '#f6f8fa',
              color: '#333',
              border: '1.5px solid #e9ecf3',
              fontWeight: '500',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              ':hover': {
                background: '#e9ecf3'
              }
            }}
            title={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showSenha ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12C1 12 2.64 8.29 6.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12C23 12 21.36 15.71 17.94 17.94M14.12 14.12A3 3 0 0 1 9.88 9.88M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ocultar senha
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Mostrar senha
              </>
            )}
          </button>
          <button type="submit" style={{
            padding: '12px 0',
            borderRadius: 8,
            background: 'linear-gradient(90deg, #333E8C 0%, #1D2A5A 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            fontSize: 18,
            letterSpacing: 1,
            boxShadow: '0 2px 12px #333E8C44',
            cursor: 'pointer',
            marginTop: 8,
            transition: 'background .2s'
          }}>Entrar</button>
        </form>
        <div style={{marginTop:28,textAlign:'center',fontSize:14,color:'#888',lineHeight:1.7}}>
          <b>Clientes:</b> use o CPF (000.000.000-00) cadastrado<br/>
          <span style={{fontSize:12}}>Se não possui conta, registre-se!</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
