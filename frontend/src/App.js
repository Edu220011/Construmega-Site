
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import logger from './utils/logger';
import './App.css';
import './components/BotoesPadrao.css';
import Produtos from './components/Produtos';
import PerfilDropdown from './components/PerfilDropdown';
import HomePromocoes from './components/HomePromocoes';
import LojaPontuacao from './components/LojaPontuacao';
import EditarProduto from './components/EditarProduto';
import Usuarios from './components/Usuarios';
import ListaUsuarios from './components/ListaUsuarios';
import Pedidos from './components/Pedidos';
import Login from './components/Login';
import EditarUsuario from './components/EditarUsuario';
import ConfigProduto from './components/ConfigProduto';
import Pontuacao from './components/Pontuacao';
import Perfil from './components/Perfil';
import ConfiguracaoGlobal from './components/ConfiguracaoGlobal';
import PagamentoCallback from './components/PagamentoCallback';
import Estoque from './components/Estoque';
import MeusResgates from './components/MeusResgates';
import ResgatesAdmin from './components/ResgatesAdmin';
import ProdutoPontos from './components/ProdutoPontos';
import ProdutoVenda from './components/ProdutoVenda';
import AdicionarPontos from './components/AdicionarPontos';
import AdicionarPontosForm from './components/AdicionarPontosForm';
import Carrinho from './components/Carrinho';

// Hook para buscar dados da empresa
function useEmpresaConfig() {
  const [empresa, setEmpresa] = useState(null);
  useEffect(() => {
    fetch('/configuracoes')
      .then(res => res.json())
      .then(data => setEmpresa(data));
  }, []);
  return empresa;
}

// Hook para calcular quantidade total de itens no carrinho
function useCarrinhoCount(cliente) {
  const [carrinhoCount, setCarrinhoCount] = useState(0);

  const calcularCarrinhoCount = useCallback(() => {
    if (cliente && cliente.id) {
      // Carregar carrinho do usuário logado
      const carrinhoSalvo = localStorage.getItem(`carrinho_usuario_${cliente.id}`);
      if (carrinhoSalvo) {
        const carrinho = JSON.parse(carrinhoSalvo);
        const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
        setCarrinhoCount(totalItens);
      } else {
        setCarrinhoCount(0);
      }
    } else {
      // Carregar carrinho global (usuário não logado)
      const carrinhoSalvo = localStorage.getItem('carrinho');
      if (carrinhoSalvo) {
        const carrinho = JSON.parse(carrinhoSalvo);
        const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
        setCarrinhoCount(totalItens);
      } else {
        setCarrinhoCount(0);
      }
    }
  }, [cliente]);

  useEffect(() => {
    calcularCarrinhoCount();
  }, [calcularCarrinhoCount]);

  useEffect(() => {
    // Listener para mudanças no localStorage
    const handleStorageChange = (e) => {
      if (e.key && (e.key.startsWith('carrinho_usuario_') || e.key === 'carrinho')) {
        calcularCarrinhoCount();
      }
    };

    // Listener para mudanças customizadas (quando adicionamos/removemos itens)
    const handleCarrinhoChange = () => {
      calcularCarrinhoCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('carrinhoChanged', handleCarrinhoChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('carrinhoChanged', handleCarrinhoChange);
    };
  }, [cliente]);

  return { carrinhoCount };
}


function assinaturaValida() {
  const validade = localStorage.getItem('assinaturaValidade');
  if (!validade) return false;
  return new Date(validade) > new Date();
}

function App() {
  const [aba, setAba] = useState('home');
  const [menuAberto, setMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [admin, setAdmin] = useState(() => {
    const adm = localStorage.getItem('admin');
    logger.log('Inicializando admin', { isAdmin: adm === 'true' });
    return adm === 'true';
  });
  const [cliente, setCliente] = useState(() => {
    const cli = localStorage.getItem('cliente');
    return cli ? JSON.parse(cli) : null;
  });

  // Hook para contador do carrinho
  const { carrinhoCount } = useCarrinhoCount(cliente);

  useEffect(() => {
    // Verificar persistência dos dados ao carregar a aplicação
    const adminStored = localStorage.getItem('admin');
    const clienteStored = localStorage.getItem('cliente');
    logger.log('Verificando localStorage', { hasAdmin: !!adminStored, hasCliente: !!clienteStored });
    
    if (adminStored === 'true' && !admin) {
      logger.log('Restaurando admin do localStorage');
      setAdmin(true);
    }
    
    if (clienteStored && !cliente) {
      try {
        const clienteObj = JSON.parse(clienteStored);
        logger.log('Restaurando cliente do localStorage');
        setCliente(clienteObj);
      } catch (e) {
        logger.error('Erro ao parsear cliente', e);
        localStorage.removeItem('cliente');
      }
    }
  }, []); // Executar apenas uma vez ao montar o componente

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (cliente) {
      localStorage.setItem('cliente', JSON.stringify(cliente));
    } else {
      localStorage.removeItem('cliente');
    }
  }, [cliente]);

  useEffect(() => {
    logger.log('useEffect admin disparado', { admin });
    if (admin) {
      localStorage.setItem('admin', 'true');
    } else {
      localStorage.removeItem('admin');
    }
  }, [admin]);

  const handleLogout = useCallback(() => {
    setAdmin(false);
    setCliente(null);
    setAba('home');
    localStorage.removeItem('admin');
    localStorage.removeItem('cliente');
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('ultimaAtividade');
  }, []);

  // Sistema de logout automático por inatividade (60 minutos)
  useEffect(() => {
    const TEMPO_INATIVIDADE = 60 * 60 * 1000; // 60 minutos em milissegundos
    let timeoutId;

    // Função para atualizar o timestamp da última atividade
    const atualizarAtividade = () => {
      if (cliente || admin) {
        localStorage.setItem('ultimaAtividade', Date.now().toString());
      }
    };

    // Função para verificar inatividade
    const verificarInatividade = () => {
      const ultimaAtividade = localStorage.getItem('ultimaAtividade');
      if (ultimaAtividade && (cliente || admin)) {
        const tempoDecorrido = Date.now() - parseInt(ultimaAtividade);
        if (tempoDecorrido >= TEMPO_INATIVIDADE) {
          logger.warn('Sessão expirada por inatividade');
          alert('Sua sessão expirou por inatividade (60 minutos). Faça login novamente.');
          handleLogout();
        }
      }
    };

    // Eventos que resetam o timer de inatividade - Reduzido para mobile
    const eventosAtividade = isMobile 
      ? ['touchstart', 'touchmove', 'click'] // Apenas eventos touch no mobile
      : ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleAtividade = () => {
      atualizarAtividade();
      // Limpar timeout anterior e criar novo
      clearTimeout(timeoutId);
      timeoutId = setTimeout(verificarInatividade, TEMPO_INATIVIDADE);
    };

    if (cliente || admin) {
      // Inicializar última atividade
      atualizarAtividade();
      
      // Adicionar listeners para eventos de atividade
      eventosAtividade.forEach(evento => {
        window.addEventListener(evento, handleAtividade, { passive: true });
      });

      // Iniciar verificação periódica (a cada 5 minutos)
      const intervaloVerificacao = setInterval(verificarInatividade, 5 * 60 * 1000);

      // Iniciar timer de inatividade
      timeoutId = setTimeout(verificarInatividade, TEMPO_INATIVIDADE);

      // Cleanup
      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervaloVerificacao);
        eventosAtividade.forEach(evento => {
          window.removeEventListener(evento, handleAtividade);
        });
      };
    }
  }, [cliente, admin]);

  // Assinatura sempre considerada válida
  const isAssinaturaValida = true;
  const empresaConfig = useEmpresaConfig();

  const [whatsappCopiado, setWhatsappCopiado] = useState(false);

  const copiarWhatsApp = async (event) => {
    if (empresaConfig && empresaConfig.whatsappEmpresa) {
      // Verifica se é um link de compartilhamento ou número
      if (empresaConfig.tipoWhatsapp === 'link') {
        // Se for link, redireciona para o WhatsApp
        window.open(empresaConfig.whatsappEmpresa, '_blank');
      } else {
        // Se for número, copia para a área de transferência
        try {
          await navigator.clipboard.writeText(empresaConfig.whatsappEmpresa);
          setWhatsappCopiado(true);
          setTimeout(() => setWhatsappCopiado(false), 2000);
        } catch (err) {
          // Fallback para navegadores antigos
          const textArea = document.createElement('textarea');
          textArea.value = empresaConfig.whatsappEmpresa;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setWhatsappCopiado(true);
          setTimeout(() => setWhatsappCopiado(false), 2000);
        }
      }
    }
  };

  return (
    <Router>
      <div className="App" style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <div style={{
          display:'flex', 
          flexDirection:'column', 
          alignItems:'center', 
          padding:'30px 20px', 
          background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          position: 'relative',
          overflow: 'hidden',
          borderRadius:'0 0 30px 30px',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
        }}>
          {/* Efeito de brilho animado */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            animation: 'shine 3s ease-in-out infinite'
          }} />
          
          <h1 className="logo-construmega" style={{
            margin:'0 0 20px 0',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: '2.2rem',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>
              {empresaConfig && empresaConfig.nomeEmpresa ? empresaConfig.nomeEmpresa : 'Construmega'}
            </span>
          </h1>

          {empresaConfig && empresaConfig.whatsappEmpresa && (
            <div
              onClick={copiarWhatsApp}
              style={{
                display:'flex',
                alignItems:'center',
                gap: isMobile ? '12px' : '16px',
                padding: isMobile ? '16px 24px' : '20px 32px',
                background: whatsappCopiado
                  ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                  : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                borderRadius:'30px',
                cursor:'pointer',
                boxShadow: whatsappCopiado
                  ? '0 10px 30px rgba(76, 175, 80, 0.4)'
                  : '0 10px 30px rgba(37, 211, 102, 0.4)',
                transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border:'3px solid rgba(255,255,255,0.3)',
                marginBottom:'20px',
                transform: whatsappCopiado ? 'scale(1.05) translateY(-3px)' : 'scale(1)',
                backdropFilter: 'blur(15px)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: isMobile ? '60px' : '70px'
              }}
              onMouseEnter={(e) => {
                if (!whatsappCopiado) {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 211, 102, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!whatsappCopiado) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 211, 102, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
                }
              }}
              title={empresaConfig.tipoWhatsapp === 'link' ? "Clique para abrir o WhatsApp" : "Clique para copiar o WhatsApp"}
            >
              {/* Efeito de brilho no hover */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.6s ease'
              }} className="shine-effect" />

              {/* Logo da Empresa */}
              {empresaConfig.logo && (
                <div style={{
                  width: isMobile ? '50px' : '60px',
                  height: isMobile ? '50px' : '60px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  flexShrink: 0
                }}>
                  <img
                    src={empresaConfig.logo}
                    alt="Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Conteúdo do WhatsApp */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                flex: 1,
                minWidth: 0
              }}>
                {/* Status/Mensagem */}
                <div style={{
                  fontSize: isMobile ? '15px' : '16px',
                  fontWeight: '600',
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  letterSpacing: '0.5px',
                  lineHeight: 1.3
                }}>
                  {empresaConfig.tipoWhatsapp === 'link'
                    ? 'Conversar no WhatsApp'
                    : (whatsappCopiado ? 'Número copiado!' : `WhatsApp: ${empresaConfig.whatsappEmpresa}`)
                  }
                </div>
              </div>

              {/* Ícone */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '40px' : '45px',
                height: isMobile ? '40px' : '45px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: isMobile ? '18px' : '20px',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}>
                  {empresaConfig.tipoWhatsapp === 'link' ? '💬' : (whatsappCopiado ? '✅' : '📱')}
                </span>
              </div>
            </div>
          )}
        </div>

        <nav className="nav-abas">
          <div className="menu-hamburger" onClick={() => setMenuAberto(!menuAberto)}>
            ☰
          </div>
          <div className={`abas-menu ${menuAberto ? 'menu-aberto' : ''}`}>
            
            {/* Exibe a aba Configuração apenas para administradores */}
            {admin && (
              <Link to="/configuracao" className="aba" onClick={() => setMenuAberto(false)} style={{display:'inline-flex',alignItems:'center',gap:6,fontWeight:'bold'}}>
                <span role="img" aria-label="engrenagem">⚙️</span>Configuração
              </Link>
            )}
            <>
              {/* Ocultar Início e Loja no mobile quando cliente logado (já estão no painel roxo) */}
              {(!isMobile || !cliente || cliente.tipo === 'admin') && (
                <>
                  <Link to="/" className="aba" onClick={() => setMenuAberto(false)}>Início</Link>
                  <Link to="/produtos" className="aba" onClick={() => setMenuAberto(false)}>Loja</Link>
                </>
              )}
              {admin && <Link to="/usuarios" className="aba" onClick={() => setMenuAberto(false)}>Usuários</Link>}
              {admin && (
                <>
                  <Link to="/config-produto" className="aba" onClick={() => setMenuAberto(false)}>Configuração Produtos</Link>
                  <Link to="/resgates" className="aba" onClick={() => setMenuAberto(false)} style={{background:'#2d8a4b',color:'#fff',fontWeight:'bold',marginLeft:8}}>Resgates</Link>
                </>
              )}
            </>
          </div>
          <div className={`abas-menu abas-menu-direita ${menuAberto ? 'menu-aberto' : ''}`}>
            <>
              {!admin && !cliente && <Link to="/registrese" className="aba" onClick={() => setMenuAberto(false)}>Registre-se</Link>}
              {!admin && !cliente && <Link to="/login" className="aba" onClick={() => setMenuAberto(false)}>Login</Link>}
              {/* {admin && <span className="aba sair" onClick={handleLogout}>Sair (Admin)</span>} */}
              {cliente && (
                <>
                  {/* Painel mobile modernizado */}
                  {isMobile && cliente.tipo !== 'admin' && (
                    <div style={{
                      width: '100%',
                      maxWidth: '420px',
                      margin: '12px auto',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '20px',
                      padding: '24px 20px',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {/* Header com código e pontos */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '20px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          padding: '12px 20px',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '2px solid rgba(102, 126, 234, 0.2)'
                        }}>
                          <span style={{fontSize: '20px'}}>🎫</span>
                          <div>
                            <div style={{fontSize: '11px', color: '#718096', fontWeight: '600'}}>Código</div>
                            <div style={{fontSize: '18px', fontWeight: '800', color: '#2d3748'}}>{cliente.id}</div>
                          </div>
                        </div>
                        
                        <div style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          padding: '12px 20px',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          <span style={{fontSize: '20px'}}>⭐</span>
                          <div>
                            <div style={{fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600'}}>Pontos</div>
                            <div style={{fontSize: '18px', fontWeight: '800', color: '#ffffff'}}>{cliente.pontos ?? 0}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Grid de botões de ação */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <Link
                          to="/"
                          onClick={() => setMenuAberto(false)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '18px 12px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{fontSize: '28px'}}>🏠</span>
                          <span style={{fontSize: '14px', fontWeight: '700', color: '#2d3748'}}>Início</span>
                        </Link>
                        
                        <Link
                          to="/produtos"
                          onClick={() => setMenuAberto(false)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '18px 12px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{fontSize: '28px'}}>🛍️</span>
                          <span style={{fontSize: '14px', fontWeight: '700', color: '#2d3748'}}>Loja</span>
                        </Link>
                        
                        <Link
                          to="/perfil"
                          onClick={() => setMenuAberto(false)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '18px 12px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{fontSize: '28px'}}>👤</span>
                          <span style={{fontSize: '14px', fontWeight: '700', color: '#2d3748'}}>Perfil</span>
                        </Link>
                        
                        <Link
                          to="/carrinho"
                          onClick={() => setMenuAberto(false)}
                          style={{
                            background: 'linear-gradient(135deg, #FF6B35 0%, #f44336 100%)',
                            padding: '18px 12px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            position: 'relative'
                          }}
                        >
                          <span style={{fontSize: '28px'}}>🛒</span>
                          <span style={{fontSize: '14px', fontWeight: '700', color: '#ffffff'}}>Carrinho</span>
                          {carrinhoCount > 0 && (
                            <span style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#e53e3e',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '800',
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}>
                              {carrinhoCount > 99 ? '99+' : carrinhoCount}
                            </span>
                          )}
                        </Link>
                      </div>
                      
                      {/* Botão Meus Pedidos full width */}
                      <Link
                        to="/meus-pedidos"
                        onClick={() => setMenuAberto(false)}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          padding: '18px 16px',
                          borderRadius: '16px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          fontWeight: '700',
                          fontSize: '15px',
                          color: '#ffffff'
                        }}
                      >
                        <span style={{fontSize: '24px'}}>📦</span>
                        Meus Pedidos
                      </Link>
                      
                      {/* Botão Sair da Conta */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuAberto(false);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          padding: '18px 16px',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          fontWeight: '700',
                          fontSize: '15px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          marginTop: '8px'
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <span style={{fontSize: '24px'}}>🚪</span>
                        Sair da Conta
                      </button>
                    </div>
                  )}
                  
                  {/* Versão desktop mantém original */}
                  {!isMobile && cliente.tipo !== 'admin' && (
                    <>
                      <span style={{color:'#2d3a4b',fontWeight:'bold',marginRight:8,background:'#e9ecf3',padding:'6px 14px',borderRadius:8,fontSize:14,verticalAlign:'middle'}}>Código: {cliente.id}</span>
                      <span style={{color:'#fff',background:'#2d8a4b',fontWeight:'bold',marginRight:16,padding:'6px 14px',borderRadius:8,fontSize:14,verticalAlign:'middle'}}>Pontos: {cliente.pontos ?? 0}</span>
                    </>
                  )}
                  {/* PerfilDropdown apenas no desktop ou para admin */}
                  {(!isMobile || cliente.tipo === 'admin') && (
                    <div style={{display:'inline-block',marginRight:8}}>
                      <PerfilDropdown onLogout={handleLogout} />
                    </div>
                  )}
                  {!isMobile && cliente.tipo !== 'admin' && (
                    <>
                      <Link to="/carrinho" className="aba aba-carrinho" onClick={() => setMenuAberto(false)} style={{background:'#FF6B35',color:'#fff',marginRight:8,fontWeight:'bold',boxShadow:'0 2px 8px #ff6b3533',border:'2px solid #FF6B35', position: 'relative'}}>
                        🛒 Carrinho
                        {carrinhoCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            background: '#e53e3e',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 10
                          }}>
                            {carrinhoCount > 99 ? '99+' : carrinhoCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/meus-pedidos" className="aba aba-resgates" onClick={() => setMenuAberto(false)} style={{background:'#333E8C',color:'#fff',marginRight:8,fontWeight:'bold',boxShadow:'0 2px 8px #333e8c33',border:'2px solid #333E8C'}}>
                        Meus Pedidos
                      </Link>
                    </>
                  )}
                </>
              )}
            </>
          </div>
        </nav>
        <div className="linha-menu-destaque"></div>
        <div className="conteudo" style={{flex:1}}>
          <Routes>
            {/* Protege a rota de configuração: só acessível para administradores */}
            {admin && <Route path="/configuracao" element={<ConfiguracaoGlobal admin={admin} cliente={cliente} />} />}
            {admin && <Route path="/configuracao/gerais" element={<ConfiguracaoGlobal admin={admin} cliente={cliente} />} />}
            {/* <Route path="/configuracao/assinatura" element={<ConfiguracaoGlobal />} /> */}
            <Route path="/" element={<HomePromocoes empresaConfig={empresaConfig} />} />
            <Route path="/produtos" element={<Produtos admin={admin} cliente={cliente} />} />
            <Route path="/loja-pontuacao" element={<LojaPontuacao />} />
            <Route path="/registrese" element={<Usuarios setCliente={setCliente} setAdmin={setAdmin} />} />
            <Route path="/usuarios" element={admin ? <ListaUsuarios admin={admin} cliente={cliente} setAdmin={setAdmin} setCliente={setCliente} /> : <Navigate to="/" replace />} />
            <Route path="/usuario/editar/:id" element={admin ? <EditarUsuario tipoUsuarioLogado={admin ? 'admin' : (cliente?.tipo || '')} admin={admin} cliente={cliente} setAdmin={setAdmin} setCliente={setCliente} /> : <Navigate to="/" replace />} />
            <Route path="/adicionar-pontos" element={admin ? <AdicionarPontosForm /> : <Navigate to="/" replace />} />
            <Route path="/config-produto" element={admin ? <ConfigProduto /> : <Navigate to="/" replace />} />
            <Route path="/config-produto/criar" element={admin ? <ConfigProduto /> : <Navigate to="/" replace />} />
            <Route path="/config-produto/produtos" element={admin ? <ConfigProduto /> : <Navigate to="/" replace />} />
            <Route path="/config-produto/produtos/:id" element={admin ? <EditarProduto /> : <Navigate to="/" replace />} />
            <Route path="/config-produto/estoque" element={admin ? <Estoque /> : <Navigate to="/" replace />} />
            <Route path="/pontos" element={admin ? <Pontuacao /> : <Navigate to="/" replace />} />
            <Route path="/login" element={<Login setAdmin={setAdmin} setCliente={setCliente} setAba={setAba} />} />
            <Route path="/perfil" element={<Perfil cliente={cliente} setCliente={setCliente} />} />
            {/* Rota dinâmica para página de pedidos por ID */}
            <Route path="/meus-pedidos/:id" element={<MeusResgates empresaConfig={empresaConfig} />} />
            {/* Rota antiga para compatibilidade, pode ser removida depois */}
            {cliente && cliente.tipo !== 'admin' && (
              <Route path="/meus-pedidos" element={<MeusResgates cliente={cliente} empresaConfig={empresaConfig} />} />
            )}
            {/* Rota para meus-resgates (alias de meus-pedidos) */}
            {cliente && cliente.tipo !== 'admin' && (
              <Route path="/meus-resgates" element={<MeusResgates cliente={cliente} empresaConfig={empresaConfig} />} />
            )}
            {admin && (
              <Route path="/resgates" element={<ResgatesAdmin />} />
            )}
            <Route path="/produto-pontos/:id" element={<ProdutoPontos cliente={cliente} setCliente={setCliente} />} />
            <Route path="/produto-venda/:id" element={<ProdutoVenda cliente={cliente} setCliente={setCliente} />} />
            <Route path="/pagamento/sucesso" element={<PagamentoCallback tipo="sucesso" />} />
            <Route path="/pagamento/falha" element={<PagamentoCallback tipo="falha" />} />
            <Route path="/pagamento/pendente" element={<PagamentoCallback tipo="pendente" />} />
            <Route path="/carrinho" element={<Carrinho cliente={cliente} />} />
          </Routes>
        </div>
        {/* Rodapé moderno com informações da empresa */}
        <footer style={{
          textAlign:'center',
          fontSize:14,
          marginTop:0,
          color:'#4a5568',
          position:'relative',
          zIndex:1
        }}>
          {empresaConfig && (
            <div className="footer-content">
              {/* Horário de funcionamento - esquerda no desktop */}
              <div className="footer-section footer-horarios">
                {empresaConfig.horarios && (
                  <div style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    fontWeight: '600',
                    color: '#667eea',
                    display: 'inline-block'
                  }}>
                    🕒 Horários: {empresaConfig.horarios}
                  </div>
                )}
              </div>
              
              {/* Telefones - meio no desktop */}
              <div className="footer-section footer-telefones">
                {empresaConfig.telefoneEmpresa && (
                  <div>📞 {empresaConfig.telefoneEmpresa}</div>
                )}
                {empresaConfig.whatsappEmpresa && (
                  <div>📱 {empresaConfig.whatsappEmpresa}</div>
                )}
              </div>
              
              {/* CNPJ e Endereço - direita no desktop */}
              <div className="footer-section footer-cnpj-endereco">
                {empresaConfig.cnpj && <div>🏢 CNPJ: {empresaConfig.cnpj}</div>}
                {empresaConfig.endereco && <div>📍 {empresaConfig.endereco}</div>}
              </div>
            </div>
          )}
        </footer>
      </div>
    </Router>
  );
}

export default App;
