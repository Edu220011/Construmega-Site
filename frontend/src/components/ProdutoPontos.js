import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PainelCompraProduto from './PainelCompraProduto';
import { getApiUrl } from '../config/api';

// Hook para buscar dados da empresa (endereço)
function useEmpresaConfig() {
  const [empresa, setEmpresa] = useState(null);
  useEffect(() => {
    fetch(getApiUrl('configuracoes'))
      .then(res => res.json())
      .then(data => setEmpresa(data));
  }, []);
  return empresa;
}

function ProdutoPontos({ cliente }) {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [erro, setErro] = useState('');
  const [mostrarPainelSucesso, setMostrarPainelSucesso] = useState(false);
  const navigate = useNavigate();

  const empresaConfig = useEmpresaConfig();

  useEffect(() => {
    fetch(getApiUrl('api/produtos'))
      .then(res => res.json())
      .then(produtos => {
        const prod = produtos.find(p => String(p.id) === String(id) && String(p.moeda).toLowerCase() === 'pontos');
        if (!prod) setErro('Produto não encontrado ou não é por pontos.');
        else setProduto(prod);
      });
  }, [id]);

  async function handleTrocar(quantidade = 1) {
    if (!produto || !cliente) return;
    try {
      // Buscar produto atualizado do backend
      const produtosAtualizados = await fetch(getApiUrl('api/produtos')).then(r => r.json());
      const produtoAtual = produtosAtualizados.find(p => String(p.id) === String(produto.id));
      if (!produtoAtual) {
        alert('Produto não encontrado.');
        return;
      }
      if ((produtoAtual.estoque ?? 0) < quantidade) {
        alert(`Estoque insuficiente. Disponível: ${produtoAtual.estoque ?? 0} unidades.`);
        return;
      }
      
      const res = await fetch(getApiUrl('pedidos'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId: cliente.id,
          produtoId: produtoAtual.id,
          produtoNome: produtoAtual.nome,
          pontos: Number(produtoAtual.preco),
          quantidade: quantidade
        })
      });
      
      if (!res.ok) {
        const erro = await res.json();
        alert(erro.erro || 'Erro ao solicitar resgate.');
        return;
      }
      
      const pedido = await res.json();
      
      // Atualiza pontos do usuário automaticamente após resgate
      try {
        const usuarioAtualizado = await fetch(`/usuarios/${cliente.id}`).then(r => {
          if (!r.ok) {
            throw new Error('Erro ao buscar usuário atualizado');
          }
          return r.json();
        });
        
        if (typeof window.setCliente === 'function') {
          window.setCliente(usuarioAtualizado);
        }
      } catch (errUsuario) {
        console.error('Erro ao atualizar pontos do usuário:', errUsuario);
        // Não bloqueia o fluxo - apenas não atualiza os pontos na interface
      }
      
      // Mostrar painel customizado de sucesso
      setMostrarPainelSucesso(true);
    } catch (err) {
      alert('Erro ao conectar com o servidor.');
    }
  }

  if (erro) return (
    <div style={{
      maxWidth: 600,
      margin: '80px auto',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
      padding: 40,
      textAlign: 'center',
      border: '2px solid #ef4444'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        borderRadius: '50%',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        margin: '0 auto 24px auto',
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
      }}>⚠️</div>
      <h3 style={{ color: '#991b1b', fontWeight: 700, fontSize: '1.5rem', marginBottom: 16 }}>Produto não encontrado</h3>
      <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '1.125rem', margin: 0 }}>{erro}</p>
    </div>
  );
  if (!produto) return (
    <div style={{
      maxWidth: 500,
      margin: '80px auto',
      background: 'linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%)',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)',
      padding: 40,
      textAlign: 'center',
      border: '2px solid #f59e0b'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '50%',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        margin: '0 auto 24px auto',
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
        animation: 'spin 2s linear infinite'
      }}>⭐</div>
      <h3 style={{ color: '#92400e', fontWeight: 700, fontSize: '1.5rem', marginBottom: 16 }}>Carregando prêmio...</h3>
      <p style={{ color: '#a16207', fontSize: '1rem', margin: 0 }}>Aguarde enquanto buscamos as informações do produto.</p>
    </div>
  );

  return (
    <div>
      {/* Painel de sucesso customizado */}
      {mostrarPainelSucesso && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: 24,
            maxWidth: 500,
            width: '100%',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '3px solid #10b981',
            textAlign: 'center',
            position: 'relative',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Ícone de sucesso */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}>✅</div>
            
            {/* Título */}
            <h2 style={{
              color: '#065f46',
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: 16
            }}>Resgate Realizado!</h2>
            
            {/* Mensagem */}
            <p style={{
              color: '#047857',
              fontSize: '1.125rem',
              lineHeight: 1.6,
              marginBottom: 32
            }}>
              Seu pedido foi registrado com sucesso.<br />
              Deseja visualizar o comprovante agora?
            </p>
            
            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {
                  setMostrarPainelSucesso(false);
                  navigate('/meus-resgates');
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 32px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                Ver Comprovante
              </button>
              
              <button
                onClick={() => setMostrarPainelSucesso(false)}
                style={{
                  background: '#ffffff',
                  color: '#047857',
                  border: '2px solid #10b981',
                  borderRadius: 12,
                  padding: '14px 32px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f0fdf4';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                Continuar Navegando
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => navigate('/loja-pontuacao')}
        style={{
          margin: '32px auto 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
          border: '2px solid transparent',
          borderRadius: 16,
          padding: '12px 24px',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3), 0 1px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3), 0 1px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>⭐</span>
        Voltar para Loja de Pontos
      </button>
      <PainelCompraProduto produto={produto} onTrocar={handleTrocar} pontosUsuario={cliente?.pontos ?? 0} cliente={cliente} />
      <div style={{
        maxWidth: 900,
        margin: '40px auto 0',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
        padding: '32px',
        textAlign: 'center',
        fontSize: '1.125rem',
        color: '#065f46',
        border: '2px solid #10b981',
        fontWeight: 600,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elemento decorativo */}
        <div style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 20
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>🎁</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#065f46',
              margin: 0
            }}>Retirada de Prêmio</h3>
          </div>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 20,
            border: '1px solid #10b981',
            lineHeight: 1.6
          }}>
            <div style={{ marginBottom: 12 }}>⭐ Todos os produtos resgatados deverão ser retirados na loja.</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem' }}>📍</span>
              <strong>Endereço:</strong>
              <span style={{ color: '#1e293b', fontWeight: 800, marginLeft: 8 }}>
                {empresaConfig?.endereco || 'Endereço não cadastrado.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Permite atualização global dos pontos do usuário após resgate
if (typeof window !== 'undefined') {
  window.setCliente = undefined;
}
export default function ProdutoPontosWrapper(props) {
  // Permite que ProdutoPontos acesse setCliente globalmente
  if (typeof window !== 'undefined' && props.setCliente) {
    window.setCliente = props.setCliente;
  }
  return <ProdutoPontos {...props} />;
}
