import React, { useEffect, useState } from 'react';
import CarrosselImagens from './CarrosselImagens';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

function LojaPontuacao() {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(getApiUrl('api/produtos'))
      .then(res => res.json())
      .then(setProdutos);
  }, []);

  return (
    <>
      <div className="nav-abas nav-abas-produtos" style={{marginTop:24, marginBottom:0, justifyContent:'center'}}>
        <div className="abas-menu abas-menu-produtos">
          <button
            className={"aba" + (window.location.pathname === '/produtos' ? ' ativa' : '')}
            onClick={()=>navigate('/produtos')}
            type="button"
          >Loja</button>
          <button
            className={"aba" + (window.location.pathname === '/loja-pontuacao' ? ' ativa' : '')}
            onClick={()=>navigate('/loja-pontuacao')}
            type="button"
          >Troque Seus Pontos</button>
        </div>
      </div>
      
      {/* Grid moderno de produtos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        padding: '32px 16px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {produtos.filter(p => !p.inativo && String(p.moeda).toLowerCase() === 'pontos').map(p => (
          <div key={p.id} style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
            border: '2px solid rgba(102, 126, 234, 0.15)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 48px rgba(102, 126, 234, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)';
          }}>
            
            {/* Badge de pontos */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{fontSize: '1.1rem'}}>⭐</span>
              {Number(p.preco).toFixed(0)}
            </div>
            
            {/* Badge de estoque */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: Number(p.estoque) > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '700',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {Number(p.estoque) > 0 ? '✅ Disponível' : '❌ Esgotado'}
            </div>

            {/* Imagem centralizada e grande */}
            <div style={{
              width: '100%',
              height: '340px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {Array.isArray(p.imagens) && p.imagens.length > 0 ? (
                <div style={{
                  width: '300px',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CarrosselImagens imagens={p.imagens} altura={300} largura={300} animacao={true} />
                </div>
              ) : p.imagem ? (
                <div style={{
                  width: '300px',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CarrosselImagens imagens={[p.imagem]} altura={300} largura={300} animacao={true} />
                </div>
              ) : (
                <div style={{
                  fontSize: '4rem',
                  color: '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📷</span>
                  <span style={{fontSize: '0.85rem', fontWeight: '500', color: '#94a3b8'}}>Sem foto</span>
                </div>
              )}
            </div>

            {/* Conteúdo do card */}
            <div style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1
            }}>
              {/* Nome do produto */}
              <h3 style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: '800',
                color: '#1e293b',
                lineHeight: '1.4',
                minHeight: '2.8em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: 'center'
              }}>
                {p.nome}
              </h3>

              {/* Informações adicionais */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: '500'
              }}>
                <span>📦</span>
                <span>Estoque: <strong style={{color: Number(p.estoque) > 0 ? '#10b981' : '#ef4444'}}>{p.estoque !== undefined ? p.estoque : 'N/A'}</strong></span>
              </div>

              {/* Botão de ação */}
              <button
                onClick={()=>navigate(`/produto-pontos/${p.id}`)}
                disabled={Number(p.estoque) === 0}
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  padding: '14px 24px',
                  background: Number(p.estoque) > 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: Number(p.estoque) > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: Number(p.estoque) > 0 ? '0 4px 16px rgba(102, 126, 234, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: Number(p.estoque) === 0 ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (Number(p.estoque) > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = Number(p.estoque) > 0 ? '0 4px 16px rgba(102, 126, 234, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)';
                }}
              >
                {Number(p.estoque) > 0 ? '🎁 Trocar por Pontos' : '😔 Esgotado'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default LojaPontuacao;