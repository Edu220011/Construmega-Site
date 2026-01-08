import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BarcodeReader from './BarcodeReader';

function ConfigProduto() {
  const location = useLocation();
  const navigate = useNavigate();

  // Função para pegar query params
  function getQueryParam(name) {
    return new URLSearchParams(location.search).get(name);
  }
  const [aba, setAba] = useState('criar');
  const [showBarcode, setShowBarcode] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [filtroMoeda, setFiltroMoeda] = useState('todos');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar produtos ao montar o componente
  useEffect(() => {
    fetch('/api/produtos')
      .then(res => res.json())
      .then(data => {
        setProdutos(data);
        setProdutosFiltrados(data);
      })
      .catch(err => console.error('Erro ao carregar produtos:', err));
  }, []);

  // Aplicar filtro de moeda
  useEffect(() => {
    if (filtroMoeda === 'todos') {
      setProdutosFiltrados(produtos);
    } else {
      setProdutosFiltrados(produtos.filter(p => p.moeda === filtroMoeda));
    }
  }, [filtroMoeda, produtos]);

  return (
    <div style={{maxWidth:1200,margin:'40px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 12px #0002',padding:32}}>
      <style>{`
        /* Animação de shimmer para o preço */
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        /* Hover effects para cards */
        .produto-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .produto-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 16px 40px rgba(102, 126, 234, 0.15) !important;
          border-color: rgba(102, 126, 234, 0.3) !important;
        }
        
        .produto-card:hover .produto-acoes {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        .produto-card:hover .image-overlay {
          opacity: 1 !important;
        }
        
        /* Animação de entrada dos cards */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .produto-card {
          animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        /* Delay escalonado para animação */
        .produto-card:nth-child(1) { animation-delay: 0.1s; }
        .produto-card:nth-child(2) { animation-delay: 0.2s; }
        .produto-card:nth-child(3) { animation-delay: 0.3s; }
        .produto-card:nth-child(4) { animation-delay: 0.4s; }
        .produto-card:nth-child(5) { animation-delay: 0.5s; }
        .produto-card:nth-child(6) { animation-delay: 0.6s; }
        .produto-card:nth-child(7) { animation-delay: 0.7s; }
        .produto-card:nth-child(8) { animation-delay: 0.8s; }
        
        /* Hover para botões de ação */
        .produto-acoes {
          transform: translateY(10px);
        }
        
        /* Responsividade melhorada */
        @media (max-width: 768px) {
          .produto-card {
            transform: none !important;
          }
          .produto-card:hover {
            transform: translateY(-4px) !important;
          }
        }
        
        /* Animação para inputs em foco */
        input:focus, textarea:focus, select:focus {
          transform: translateY(-1px) !important;
        }
        
        /* Pulse para badges promocionais */
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .produto-card label:has(input:checked) {
          animation: pulse 2s infinite;
        }
      `}</style>
      <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>Configuração de Produtos</h2>
      <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:32}}>
        <button className="btn-padrao" onClick={()=>navigate('/config-produto/criar')}>Criar Produto</button>
        <button className="btn-padrao" onClick={()=>navigate('/config-produto/produtos')}>Produtos</button>
        <button className="btn-padrao" onClick={()=>navigate('/config-produto/estoque')}>Estoque</button>
      </div>
      <div style={{marginTop:32}}>
        {/* Bloco principal do conteúdo */}
          {location.pathname==='/config-produto/criar' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              borderRadius: 20,
              padding: '24px 32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '2px solid rgba(102, 126, 234, 0.1)',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Header compacto */}
              <div style={{
                textAlign: 'center',
                marginBottom: 28,
                paddingBottom: 20,
                borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 50,
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  marginBottom: 16
                }}>
                  🏷️ Criar Novo Produto
                </div>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Preencha os campos abaixo para adicionar um produto ao catálogo
                </p>
              </div>

              <form style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 240px',
                gap: 28,
                alignItems: 'start'
              }} onSubmit={async e => {
                  e.preventDefault();
                  const form = e.target;
                  const formData = new FormData(form);
                  const nome = formData.get('nome');
                  const descricao = formData.get('descricao');
                  const unidade = formData.get('unidade');
                  const moeda = formData.get('moeda');
                  const preco = formData.get('preco');
                  const codigoBarras = formData.get('codigoBarras');
                  const fotoFile = formData.get('foto');
                  let fotoBase64 = '';
                  if (fotoFile && fotoFile.size > 0) {
                    fotoBase64 = await new Promise(resolve => {
                      const reader = new FileReader();
                      reader.onload = ev => resolve(ev.target.result);
                      reader.readAsDataURL(fotoFile);
                    });
                  }
                  // Se não preencher código de barras, perguntar ao usuário
                  if (!codigoBarras) {
                    const confirmar = window.confirm('O campo Código de Barras não foi preenchido. Deseja salvar mesmo assim? O produto será adicionado e vinculado apenas ao ID.');
                    if (!confirmar) return;
                  }
                  const novoProduto = {
                    nome,
                    descricao,
                    unidade,
                    moeda,
                    preco,
                    codigoBarras,
                    estoque: 0,
                    imagens: fotoBase64 ? [fotoBase64] : []
                  };
                  try {
                    const res = await fetch('/api/produtos', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(novoProduto)
                    });
                    if (res.ok) {
                      alert('Produto criado com sucesso!');
                      navigate('/config-produto/produtos');
                    } else {
                      alert('Erro ao criar produto.');
                    }
                  } catch (err) {
                    alert('Erro ao criar produto.');
                  }
                }}>
                {/* Formulário principal */}
                <div style={{
                  display: 'grid',
                  gap: 20
                }}>
                  {/* Campos do produto */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                    gap: 16,
                    background: 'rgba(102, 126, 234, 0.03)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    {/* Nome do produto */}
                    <div style={{gridColumn: window.innerWidth < 768 ? '1' : '1 / -1'}}>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Nome do Produto *
                      </label>
                      <input 
                        name="nome" 
                        required 
                        placeholder="Digite o nome completo do produto"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Descrição */}
                    <div style={{gridColumn: window.innerWidth < 768 ? '1' : '1 / -1'}}>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Descrição *
                      </label>
                      <textarea 
                        name="descricao" 
                        required 
                        rows={2}
                        placeholder="Descreva o produto"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Unidade */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Unidade *
                      </label>
                      <input 
                        name="unidade" 
                        required 
                        placeholder="Ex: kg, un, L"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(76, 175, 80, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4caf50';
                          e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Moeda */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Moeda *
                      </label>
                      <select 
                        name="moeda" 
                        required 
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(76, 175, 80, 0.2)',
                          fontSize: '0.9rem',
                          background: '#fff',
                          color: '#2d3748',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4caf50';
                          e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="real">💰 Real (R$)</option>
                        <option value="pontos">🎯 Pontos</option>
                      </select>
                    </div>

                    {/* Preço */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Valor *
                      </label>
                      <input 
                        name="preco" 
                        required 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(76, 175, 80, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4caf50';
                          e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Código de Barras */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Código de Barras
                      </label>
                      <div style={{display: 'flex', gap: 8}}>
                        <input 
                          name="codigoBarras" 
                          id="codigoBarrasInput" 
                          placeholder="Opcional"
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '2px solid rgba(255, 152, 0, 0.2)',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            background: '#fff',
                            color: '#2d3748',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ff9800';
                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowBarcode(true)}
                          style={{
                            background: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 16px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#f57c00';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#ff9800';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          📷
                        </button>
                      </div>
                    </div>

                    {/* Upload e Botão */}
                    <div style={{gridColumn: window.innerWidth < 768 ? '1' : '1 / -1'}}>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Foto do Produto (1080x1080px)
                      </label>
                      <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          name="foto" 
                          id="fotoProdutoInput" 
                          style={{flex: 1}}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                document.getElementById('previewProdutoImg').src = ev.target.result;
                              };
                              reader.readAsDataURL(file);
                            } else {
                              document.getElementById('previewProdutoImg').src = '';
                            }
                          }}
                        />
                        <button 
                          type="submit" 
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 24px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          ✨ Salvar
                        </button>
                      </div>
                      {isMobile && (
                        <div style={{marginTop: 8}}>
                          <label 
                            htmlFor="cameraProdutoInput" 
                            style={{
                              cursor: 'pointer',
                              color: '#4caf50',
                              fontWeight: '600',
                              textDecoration: 'underline',
                              fontSize: '0.85rem'
                            }}
                          >
                            📷 Tirar foto com câmera
                          </label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            id="cameraProdutoInput" 
                            style={{display: 'none'}} 
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  document.getElementById('previewProdutoImg').src = ev.target.result;
                                  const dataTransfer = new DataTransfer();
                                  dataTransfer.items.add(file);
                                  document.getElementById('fotoProdutoInput').files = dataTransfer.files;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {showBarcode && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '16px',
                        background: 'rgba(255, 152, 0, 0.1)',
                        borderRadius: 12,
                        border: '2px solid rgba(255, 152, 0, 0.2)'
                      }}>
                        <BarcodeReader onDetected={codigo => {
                          document.getElementById('codigoBarrasInput').value = codigo;
                          setShowBarcode(false);
                        }} />
                        <button 
                          type="button" 
                          onClick={() => setShowBarcode(false)}
                          style={{
                            marginTop: 12,
                            padding: '8px 16px',
                            borderRadius: 8,
                            background: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview lateral */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(156, 39, 176, 0.03)',
                  padding: '20px',
                  borderRadius: 16,
                  border: '1px solid rgba(156, 39, 176, 0.1)',
                  height: 'fit-content',
                  position: 'sticky',
                  top: 20
                }}>
                  <h4 style={{
                    color: '#9c27b0',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                    textAlign: 'center'
                  }}>
                    👁️ Preview
                  </h4>
                  
                  <div style={{
                    width: '100%',
                    height: 180,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '2px dashed rgba(156, 39, 176, 0.2)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img 
                      id="previewProdutoImg" 
                      alt="Preview" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: 8
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      pointerEvents: 'none'
                    }}>
                      {!document.getElementById('previewProdutoImg')?.src && '📷 Imagem'}
                    </div>
                  </div>
                  
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    Formato final no catálogo
                  </p>
                </div>
              </form>
            </div>
          )}
          {location.pathname==='/config-produto/produtos' && (
          <div>
            {/* Header moderno do painel */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 20,
              padding: '24px 32px',
              marginBottom: 32,
              color: '#fff',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    📦 Painel de Produtos
                  </h2>
                  <p style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    Gerencie seu catálogo completo de produtos
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '8px 16px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span>🛍️</span>
                    <span>{produtos.length} Produtos</span>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '8px 16px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span>🏠</span>
                    <span>{produtos.filter(p => p.promo).length}/10 na Home</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de pesquisa moderna */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 24,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              {/* Campo de pesquisa */}
              <div style={{
                position: 'relative',
                maxWidth: 500,
                margin: '0 auto 16px auto'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '1.1rem'
                }}>
                  🔍
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou código de barras..."
                  style={{
                    width: '100%',
                    padding: '14px 20px 14px 50px',
                    borderRadius: 12,
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#fff',
                    color: '#2d3748',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onChange={e => {
                    const v = e.target.value.toLowerCase();
                    fetch('/api/produtos')
                      .then(res => res.json())
                      .then(data => {
                        const filtrados = data.filter(p =>
                          p.nome.toLowerCase().includes(v) || (p.codigoBarras||'').includes(v)
                        );
                        setProdutos(filtrados);
                      });
                  }}
                />
              </div>
              
              {/* Filtros de moeda */}
              <div style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setFiltroMoeda('todos')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: '2px solid',
                    borderColor: filtroMoeda === 'todos' ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                    background: filtroMoeda === 'todos' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
                    color: filtroMoeda === 'todos' ? '#fff' : '#6b7280',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: filtroMoeda === 'todos' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                  }}
                >
                  🌐 Todos
                </button>
                <button
                  onClick={() => setFiltroMoeda('real')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: '2px solid',
                    borderColor: filtroMoeda === 'real' ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                    background: filtroMoeda === 'real' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#fff',
                    color: filtroMoeda === 'real' ? '#fff' : '#6b7280',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: filtroMoeda === 'real' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  💰 Real (R$)
                </button>
                <button
                  onClick={() => setFiltroMoeda('pontos')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: '2px solid',
                    borderColor: filtroMoeda === 'pontos' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                    background: filtroMoeda === 'pontos' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#fff',
                    color: filtroMoeda === 'pontos' ? '#fff' : '#6b7280',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: filtroMoeda === 'pontos' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                  }}
                >
                  🎯 Pontos
                </button>
              </div>
            </div>
            {/* Grid de produtos moderno */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
              padding: '0 4px'
            }}>
              {produtosFiltrados.map(prod =>
                <div key={prod.id} className="produto-card" style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  borderRadius: 16,
                  padding: 0,
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '320px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }} onClick={(e) => {
                  if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('select') && !e.target.closest('textarea')) {
                    setEditId(editId === prod.id ? null : prod.id);
                    if (editId !== prod.id) {
                      setEditForm({
                        nome: prod.nome,
                        descricao: prod.descricao,
                        unidade: prod.unidade,
                        moeda: prod.moeda,
                        preco: prod.preco,
                        estoque: prod.estoque,
                        codigo_barra: prod.codigoBarras || prod.codigo_barra,
                        status: prod.status || (prod.inativo ? 'inativo' : 'ativo')
                      });
                      const params = new URLSearchParams(location.search);
                      params.set('id', prod.id);
                      navigate(location.pathname + '?' + params.toString(), { replace: true });
                    } else {
                      const params = new URLSearchParams(location.search);
                      params.delete('id');
                      navigate(location.pathname + (params.toString() ? '?' + params.toString() : ''), { replace: true });
                    }
                  }
                }}>
                  
                  {/* Badge de status superior */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 20,
                    display: 'flex',
                    gap: 6
                  }}>
                    {(() => {
                      const isInativo = prod.status === 'inativo' || prod.inativo === true;
                      return (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 16,
                          fontWeight: '700',
                          fontSize: '0.7rem',
                          background: isInativo ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {isInativo ? '❌ Inativo' : '✅ Ativo'}
                        </span>
                      );
                    })()}
                    
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontWeight: '700',
                      fontSize: '0.7rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: '#fff',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ID: {prod.id}
                    </span>
                  </div>

                  {/* Badge de exibição na página inicial */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 20
                  }}>
                    <label 
                      title={prod.promo ? "Exibindo na página inicial" : "Clique para exibir na página inicial"}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: prod.promo ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      color: prod.promo ? '#fff' : '#6b7280',
                      padding: '6px 12px',
                      borderRadius: 16,
                      cursor: !prod.promo && produtos.filter(p => p.promo).length >= 10 ? 'not-allowed' : 'pointer',
                      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: prod.promo ? 'none' : '2px solid rgba(102, 126, 234, 0.2)',
                      transition: 'all 0.3s ease',
                      opacity: !prod.promo && produtos.filter(p => p.promo).length >= 10 ? 0.5 : 1
                    }}>
                      <input
                        type="checkbox"
                        checked={!!prod.promo}
                        disabled={!prod.promo && produtos.filter(p => p.promo).length >= 10}
                        onChange={async e => {
                          e.stopPropagation();
                          const novoValor = e.target.checked;
                          if (!novoValor || produtos.filter(p => p.promo).length < 10) {
                            await fetch(`/api/produtos/${prod.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ promo: novoValor })
                            });
                            setProdutos(produtos.map(p => p.id === prod.id ? { ...p, promo: novoValor } : p));
                          }
                        }}
                        style={{marginRight: 5, transform: 'scale(0.85)'}}
                      />
                      <span>
                        {prod.promo ? '🏠 Na Home' : '📌 Exibir'}
                      </span>
                    </label>
                  </div>

                  {/* Conteúdo Principal do Card */}
                  <div style={{
                    padding: '18px 16px 16px 16px',
                    height: 'calc(100% - 60px)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {editId === prod.id ? (
                      // MODO DE EDIÇÃO MODERNIZADO
                      <div style={{
                        background: 'rgba(102, 126, 234, 0.03)',
                        padding: '14px',
                        borderRadius: 12,
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        marginTop: 35
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 14,
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          borderRadius: 10,
                          fontSize: '0.9rem',
                          fontWeight: '700'
                        }}>
                          ✏️ Editando Produto
                        </div>
                        
                        <form onSubmit={e => {
                          e.preventDefault();
                          if (!editForm.codigo_barra) {
                            const confirmar = window.confirm('O campo Código de Barras está vazio. Deseja salvar mesmo assim? O produto será vinculado apenas ao ID.');
                            if (!confirmar) return;
                          }
                          const payload = {
                            ...editForm,
                            codigoBarras: editForm.codigo_barra || ''
                          };
                          delete payload.codigo_barra;
                          fetch(`/produtos/${prod.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                          })
                            .then(res => res.json())
                            .then(updated => {
                              setProdutos(produtos.map(p => p.id === prod.id ? {...p, ...editForm} : p));
                              setEditId(null);
                              const params = new URLSearchParams(location.search);
                              params.delete('id');
                              navigate(location.pathname + (params.toString() ? '?' + params.toString() : ''), { replace: true });
                            });
                        }} style={{display:'grid',gap:12}}>
                          
                          {/* Nome */}
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: '600',
                              color: '#4a5568',
                              fontSize: '0.8rem',
                              marginBottom: 5
                            }}>
                              Nome do Produto
                            </label>
                            <input 
                              value={editForm.nome||''} 
                              onChange={e=>setEditForm({...editForm,nome:e.target.value})} 
                              required 
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease',
                                background: '#fff',
                                color: '#2d3748',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </div>
                          
                          {/* Descrição */}
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: '600',
                              color: '#4a5568',
                              fontSize: '0.8rem',
                              marginBottom: 5
                            }}>
                              Descrição
                            </label>
                            <textarea 
                              value={editForm.descricao||''} 
                              onChange={e=>setEditForm({...editForm,descricao:e.target.value})} 
                              required 
                              rows={2}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease',
                                background: '#fff',
                                color: '#2d3748',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </div>
                          
                          {/* Grid para campos menores */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10
                          }}>
                            {/* Unidade */}
                            <div>
                              <label style={{
                                display: 'block',
                                fontWeight: '600',
                                color: '#4a5568',
                                fontSize: '0.8rem',
                                marginBottom: 5
                              }}>
                                Unidade
                              </label>
                              <input 
                                value={editForm.unidade||''} 
                                onChange={e=>setEditForm({...editForm,unidade:e.target.value})} 
                                required 
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  border: '2px solid rgba(76, 175, 80, 0.2)',
                                  fontSize: '0.85rem',
                                  transition: 'all 0.3s ease',
                                  background: '#fff',
                                  color: '#2d3748',
                                  boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#4caf50';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                            
                            {/* Moeda */}
                            <div>
                              <label style={{
                                display: 'block',
                                fontWeight: '600',
                                color: '#4a5568',
                                fontSize: '0.8rem',
                                marginBottom: 5
                              }}>
                                Moeda
                              </label>
                              <select 
                                value={editForm.moeda||'real'} 
                                onChange={e=>setEditForm({...editForm,moeda:e.target.value})} 
                                required
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  border: '2px solid rgba(76, 175, 80, 0.2)',
                                  fontSize: '0.85rem',
                                  background: '#fff',
                                  color: '#2d3748',
                                  cursor: 'pointer',
                                  boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#4caf50';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              >
                                <option value="real">💰 Real (R$)</option>
                                <option value="pontos">🎯 Pontos</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Segunda linha do grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10
                          }}>
                            {/* Preço */}
                            <div>
                              <label style={{
                                display: 'block',
                                fontWeight: '600',
                                color: '#4a5568',
                                fontSize: '0.8rem',
                                marginBottom: 5
                              }}>
                                Preço
                              </label>
                              <input 
                                value={editForm.preco||''} 
                                onChange={e=>setEditForm({...editForm,preco:e.target.value})} 
                                required 
                                type="number" 
                                step="0.01"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  border: '2px solid rgba(255, 152, 0, 0.2)',
                                  fontSize: '0.85rem',
                                  transition: 'all 0.3s ease',
                                  background: '#fff',
                                  color: '#2d3748',
                                  boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#ff9800';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                            
                            {/* Estoque */}
                            <div>
                              <label style={{
                                display: 'block',
                                fontWeight: '600',
                                color: '#4a5568',
                                fontSize: '0.8rem',
                                marginBottom: 5
                              }}>
                                Estoque
                              </label>
                              <input 
                                value={editForm.estoque||''} 
                                onChange={e=>setEditForm({...editForm,estoque:e.target.value})} 
                                required 
                                type="number"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  border: '2px solid rgba(255, 152, 0, 0.2)',
                                  fontSize: '0.85rem',
                                  transition: 'all 0.3s ease',
                                  background: '#fff',
                                  color: '#2d3748',
                                  boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#ff9800';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Status */}
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: '600',
                              color: '#4a5568',
                              fontSize: '0.8rem',
                              marginBottom: 5
                            }}>
                              Status do Produto
                            </label>
                            <select value={editForm.status || 'ativo'}
                              onChange={async e => {
                                const novoStatus = e.target.value;
                                setEditForm({...editForm, status: novoStatus});
                                // Atualiza backend instantaneamente
                                await fetch(`/produtos/${prod.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...editForm, status: novoStatus, codigoBarras: editForm.codigo_barra || '' })
                                });
                                setProdutos(produtos.map(p => p.id === prod.id ? { ...p, status: novoStatus } : p));
                              }}
                              required
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '2px solid rgba(156, 39, 176, 0.2)',
                                fontSize: '0.85rem',
                                background: '#fff',
                                color: '#2d3748',
                                cursor: 'pointer',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#9c27b0';
                                e.target.style.boxShadow = '0 0 0 3px rgba(156, 39, 176, 0.1)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(156, 39, 176, 0.2)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              <option value="ativo">✅ Ativo</option>
                              <option value="inativo">❌ Inativo</option>
                            </select>
                          </div>
                          
                          {/* Código de Barras */}
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: '600',
                              color: '#4a5568',
                              fontSize: '0.8rem',
                              marginBottom: 5
                            }}>
                              Código de Barras
                            </label>
                            <input 
                              value={editForm.codigo_barra||''} 
                              onChange={e=>setEditForm({...editForm,codigo_barra:e.target.value})}
                              placeholder="Opcional"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '2px solid rgba(107, 114, 128, 0.2)',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease',
                                background: '#fff',
                                color: '#2d3748',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#6b7280';
                                e.target.style.boxShadow = '0 0 0 3px rgba(107, 114, 128, 0.1)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </div>
                          
                          {/* Botões de ação */}
                          <div style={{display:'flex',gap:10,marginTop:6}}>
                            <button type="submit" style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '10px 16px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 3px 12px rgba(16, 185, 129, 0.3)'
                            }}
                              onClick={async (e) => {
                                // Se o campo estoque for alterado, atualize a lista após salvar
                                e.preventDefault();
                                const payload = {
                                  ...editForm,
                                  codigoBarras: editForm.codigo_barra || ''
                                };
                                delete payload.codigo_barra;
                                await fetch(`/produtos/${prod.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(payload)
                                });
                                // Recarrega produtos do backend para refletir estoque atualizado
                                const res = await fetch('/api/produtos');
                                const data = await res.json();
                                setProdutos(data);
                                setEditId(null);
                                const params = new URLSearchParams(location.search);
                                params.delete('id');
                                navigate(location.pathname + (params.toString() ? '?' + params.toString() : ''), { replace: true });
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
                              }}
                            >
                              💾 Salvar
                            </button>
                            <button type="button" style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '10px 16px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 3px 12px rgba(107, 114, 128, 0.3)'
                            }} onClick={()=>{
                              setEditId(null);
                              const params = new URLSearchParams(location.search);
                              params.delete('id');
                              navigate(location.pathname + (params.toString() ? '?' + params.toString() : ''), { replace: true });
                            }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 16px rgba(107, 114, 128, 0.3)';
                              }}
                            >
                              ❌ Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      // MODO DE VISUALIZAÇÃO MODERNIZADO
                      <div style={{
                        display:'flex',
                        flexDirection:'column',
                        height:'100%',
                        paddingTop: 35
                      }}>
                        
                        {/* Imagem do Produto com efeito hover */}
                        <div style={{
                          width:'100%',
                          height:'140px',
                          background:'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          borderRadius:12,
                          display:'flex',
                          alignItems:'center',
                          justifyContent:'center',
                          marginBottom:14,
                          overflow:'hidden',
                          border:'2px solid rgba(102, 126, 234, 0.1)',
                          position: 'relative',
                          transition: 'all 0.3s ease'
                        }}>
                          {prod.foto ? (
                            <img 
                              src={prod.foto} 
                              alt={prod.nome}
                              style={{
                                width:'100%',
                                height:'100%',
                                objectFit:'cover',
                                transition:'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            />
                          ) : (
                            <div style={{
                              display:'flex',
                              flexDirection:'column',
                              alignItems:'center',
                              color:'#94a3b8',
                              fontSize:'16px',
                              fontWeight: '600'
                            }}>
                              <span style={{fontSize:'48px',marginBottom:12}}>📷</span>
                              <span>Sem imagem</span>
                            </div>
                          )}
                          
                          {/* Overlay sutil */}
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(102, 126, 234, 0.05) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none'
                          }} className="image-overlay" />
                        </div>

                        {/* Nome do Produto */}
                        <h3 style={{
                          margin:'0 0 12px 0',
                          fontSize:'1.05rem',
                          fontWeight:'800',
                          color:'#1e293b',
                          lineHeight:'1.3',
                          display:'-webkit-box',
                          WebkitLineClamp:2,
                          WebkitBoxOrient:'vertical',
                          overflow:'hidden',
                          minHeight: '50px'
                        }}>{prod.nome}</h3>

                        {/* Preço em Destaque Modernizado */}
                        <div style={{
                          background: prod.moeda === 'pontos' 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color:'white',
                          padding:'10px 14px',
                          borderRadius:10,
                          marginBottom:12,
                          fontWeight:'800',
                          fontSize:'1rem',
                          textAlign:'center',
                          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.15)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* Efeito de brilho */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                          }} />
                          
                          {prod.moeda === 'pontos' ? (
                            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
                              <span style={{fontSize: '1.1rem'}}>⭐</span>
                              {prod.preco} Pontos
                            </span>
                          ) : (
                            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
                              <span style={{fontSize: '1.1rem'}}>💰</span>
                              R$ {parseFloat(prod.preco).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Grid de Informações Modernizado */}
                        <div style={{
                          display:'grid',
                          gridTemplateColumns:'1fr 1fr',
                          gap:10,
                          marginBottom:12
                        }}>
                          {/* Card Estoque */}
                          <div style={{
                            background: (prod.estoque === 0 || prod.estoque === '0') 
                              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
                              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                            padding:'10px',
                            borderRadius:10,
                            border: (prod.estoque === 0 || prod.estoque === '0') 
                              ? '2px solid rgba(239, 68, 68, 0.2)'
                              : '2px solid rgba(16, 185, 129, 0.2)',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: '1.1rem',
                              marginBottom: 3
                            }}>
                              {(prod.estoque === 0 || prod.estoque === '0') ? '📦' : '✅'}
                            </div>
                            <div style={{
                              fontWeight:'700',
                              fontSize:'0.75rem',
                              color: (prod.estoque === 0 || prod.estoque === '0') ? '#ef4444' : '#059669',
                              marginBottom: 2
                            }}>
                              ESTOQUE
                            </div>
                            <div style={{
                              fontWeight:'700',
                              fontSize:'0.85rem',
                              color: (prod.estoque === 0 || prod.estoque === '0') ? '#ef4444' : '#374151'
                            }}>
                              {(prod.estoque === 0 || prod.estoque === '0') ? 'Esgotado' : prod.estoque}
                            </div>
                          </div>
                          
                          {/* Card Unidade */}
                          <div style={{
                            background:'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
                            padding:'10px',
                            borderRadius:10,
                            border:'2px solid rgba(99, 102, 241, 0.2)',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: '1.1rem',
                              marginBottom: 3
                            }}>📏</div>
                            <div style={{
                              fontWeight:'700',
                              fontSize:'0.75rem',
                              color:'#6366f1',
                              marginBottom: 2
                            }}>
                              UNIDADE
                            </div>
                            <div style={{
                              fontWeight:'700',
                              fontSize:'0.85rem',
                              color:'#374151'
                            }}>
                              {prod.unidade}
                            </div>
                          </div>
                        </div>

                        {/* Código de Barras (se existir) */}
                        {(prod.codigoBarras || prod.codigo_barra) && (
                          <div style={{
                            background:'linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(75, 85, 99, 0.08) 100%)',
                            padding:'10px',
                            borderRadius:10,
                            marginBottom:12,
                            border:'2px solid rgba(107, 114, 128, 0.15)',
                            textAlign:'center'
                          }}>
                            <div style={{
                              fontWeight:'700',
                              fontSize:'0.75rem',
                              color:'#6b7280',
                              marginBottom: 5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6
                            }}>
                              🔢 CÓDIGO DE BARRAS
                            </div>
                            <div style={{
                              fontFamily:'monospace',
                              fontSize:'0.85rem',
                              color:'#374151',
                              fontWeight: '600',
                              wordBreak:'break-all',
                              background: 'rgba(255, 255, 255, 0.8)',
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid rgba(107, 114, 128, 0.2)'
                            }}>
                              {prod.codigoBarras || prod.codigo_barra}
                            </div>
                          </div>
                        )}

                        {/* Descrição */}
                        <div style={{
                          fontSize:'0.9rem',
                          color:'#6b7280',
                          lineHeight:'1.5',
                          marginBottom:20,
                          display:'-webkit-box',
                          WebkitLineClamp:3,
                          WebkitBoxOrient:'vertical',
                          overflow:'hidden',
                          flex:1,
                          background: 'rgba(102, 126, 234, 0.03)',
                          padding: '12px',
                          borderRadius: 10,
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          fontWeight: '500'
                        }}>
                          {prod.descricao}
                        </div>

                        {/* Botões de Ação Modernizados */}
                        <div className="produto-acoes" style={{
                          display:'flex',
                          gap:10,
                          opacity:0,
                          transition:'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          pointerEvents:'none',
                          marginTop: 'auto'
                        }}>
                          <button 
                            style={{
                              flex:1,
                              pointerEvents:'auto',
                              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color:'white',
                              border:'none',
                              padding:'14px 16px',
                              borderRadius:12,
                              fontWeight:'700',
                              fontSize:'0.9rem',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8
                            }} 
                            onClick={()=>navigate(`/config-produto/produtos/${prod.id}`)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
                            }}
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          
                          <button 
                            style={{
                              flex:1,
                              background:'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color:'#fff',
                              pointerEvents:'auto',
                              border:'none',
                              padding:'14px 16px',
                              borderRadius:12,
                              fontWeight:'700',
                              fontSize:'0.9rem',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8
                            }} 
                            onClick={()=>{
                              if(window.confirm('⚠️ Tem certeza que deseja excluir este produto?\\n\\nEsta ação não pode ser desfeita.')){
                                fetch(`/api/produtos/${prod.id}`,{method:'DELETE'})
                                  .then(()=>setProdutos(produtos.filter(p=>p.id!==prod.id)));
                              }
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.3)';
                            }}
                          >
                            <span>🗑️</span>
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfigProduto;





