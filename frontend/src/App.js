
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Produtos from './components/Produtos';
import Usuarios from './components/Usuarios';
import ListaUsuarios from './components/ListaUsuarios';
import Pedidos from './components/Pedidos';
import Login from './components/Login';
import EditarUsuario from './components/EditarUsuario';
import ConfigProduto from './components/ConfigProduto';
import Pontuacao from './components/Pontuacao';
import Perfil from './components/Perfil';
import AlterarSenha from './components/AlterarSenha';
import ConfiguracaoGlobal from './components/ConfiguracaoGlobal';


function assinaturaValida() {
  const validade = localStorage.getItem('assinaturaValidade');
  if (!validade) return false;
  return new Date(validade) > new Date();
}

function App() {
  const [aba, setAba] = useState('home');
  const [admin, setAdmin] = useState(() => {
    const adm = localStorage.getItem('admin');
    return adm === 'true';
  });
  const [cliente, setCliente] = useState(() => {
    const cli = localStorage.getItem('cliente');
    return cli ? JSON.parse(cli) : null;
  });

  useEffect(() => {
    localStorage.setItem('admin', admin);
  }, [admin]);

  useEffect(() => {
    if (cliente) {
      localStorage.setItem('cliente', JSON.stringify(cliente));
    } else {
      localStorage.removeItem('cliente');
    }
  }, [cliente]);

  function handleLogout() {
    setAdmin(false);
    setCliente(null);
    setAba('home');
    localStorage.removeItem('admin');
    localStorage.removeItem('cliente');
  }

  const isAssinaturaValida = assinaturaValida();
  return (
    <Router>
      <div className="App">
        <img src={process.env.PUBLIC_URL + '/logo-construmega.png'} alt="Logo ConstruMEGA" className="logo-canto" />
        <h1 className="logo-construmega">ConstruMEGA</h1>
        <nav className="nav-abas">
          <div className="abas-menu">
            <Link to="/configuracao" className="aba" style={{display:'inline-flex',alignItems:'center',gap:6,fontWeight:'bold'}}>
              <span role="img" aria-label="engrenagem">⚙️</span>Configuração
            </Link>
            {isAssinaturaValida && <>
              <Link to="/" className="aba">Início</Link>
              <Link to="/produtos" className="aba">Produtos</Link>
              {admin && <Link to="/usuarios" className="aba">Usuários</Link>}
              {(admin || (cliente && cliente.tipo === 'gerente')) && (
                <>
                  <Link to="/config-produto" className="aba">Configuração Produtos</Link>
                  <Link to="/pontos" className="aba">Pontuação</Link>
                </>
              )}
            </>}
          </div>
          <div className="abas-menu abas-menu-direita">
            {!isAssinaturaValida ? null : <>
              {!admin && !cliente && <Link to="/registrese" className="aba">Registre-se</Link>}
              {!admin && !cliente && <Link to="/login" className="aba">Login</Link>}
              {admin && <span className="aba sair" onClick={handleLogout}>Sair (Admin)</span>}
              {cliente && (
                <>
                  <span style={{color:'#2d3a4b',fontWeight:'bold',marginRight:8,background:'#e9ecf3',padding:'6px 14px',borderRadius:8,fontSize:14,verticalAlign:'middle'}}>Código: {cliente.id}</span>
                  <span style={{color:'#fff',background:'#2d8a4b',fontWeight:'bold',marginRight:16,padding:'6px 14px',borderRadius:8,fontSize:14,verticalAlign:'middle'}}>Pontos: {cliente.pontos ?? 0}</span>
                  <span className="aba" style={{background:'#e9ecf3',color:'#2d3a4b',marginRight:8,cursor:'pointer'}} onClick={()=>window.location.href='/perfil'}>Perfil</span>
                  <span className="aba sair" onClick={handleLogout}>Sair ({cliente.nome})</span>
                </>
              )}
            </>}
          </div>
        </nav>
        <div className="conteudo">
          <Routes>
            <Route path="/configuracao" element={<ConfiguracaoGlobal />} />
            <Route path="/configuracao/gerais" element={<ConfiguracaoGlobal />} />
            <Route path="/configuracao/assinatura" element={<ConfiguracaoGlobal />} />
            {isAssinaturaValida && <>
              <Route path="/" element={<p>Bem-vindo ao hub da loja! Veja amostras, produtos e cadastre-se para comprar.</p>} />
              <Route path="/produtos" element={<Produtos admin={admin} cliente={cliente} />} />
              <Route path="/registrese" element={<Usuarios setCliente={setCliente} setAdmin={setAdmin} />} />
              <Route path="/usuarios" element={admin ? <ListaUsuarios admin={admin} cliente={cliente} setAdmin={setAdmin} setCliente={setCliente} /> : <p style={{color:'#b22',textAlign:'center'}}>Acesso restrito ao admin.</p>} />
              <Route path="/usuario/editar/:id" element={<EditarUsuario tipoUsuarioLogado={admin ? 'admin' : (cliente?.tipo || '')} admin={admin} cliente={cliente} setAdmin={setAdmin} setCliente={setCliente} />} />
              <Route path="/config-produto" element={<ConfigProduto />} />
              <Route path="/pontos" element={<Pontuacao />} />
              <Route path="/login" element={<Login setAdmin={setAdmin} setCliente={setCliente} setAba={setAba} />} />
              <Route path="/alterar-senha" element={<AlterarSenha cliente={cliente} setCliente={setCliente} />} />
              <Route path="/perfil" element={<Perfil cliente={cliente} setCliente={setCliente} />} />
            </>}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
