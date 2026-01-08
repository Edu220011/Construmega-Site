import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl } from '../config/api';


function ConfiguracaoGlobal({ admin, cliente }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresa, setEmpresa] = useState({ nomeEmpresa: '', cnpj: '', logo: '', telefoneEmpresa: '', whatsappEmpresa: '', tipoWhatsapp: 'numero', horarios: '', endereco: '', telaInicio: '', avisoPromocoes: '', pagamentoCartao: true, pagamentoPix: true });
  const [logoPreview, setLogoPreview] = useState('');
  const [msg, setMsg] = useState('');
  // Determina aba pelo path
  const path = location.pathname;
  let aba = 'painel';
  if (path.endsWith('/gerais')) aba = 'gerais';
  else if (path.endsWith('/assinatura')) aba = 'assinatura';

  useEffect(() => {
    // Carregar dados da empresa ao abrir
    fetch(getApiUrl('configuracoes'))
      .then(res => res.json())
      .then(data => {
        setEmpresa(data ? { ...data, endereco: data.endereco || '', telaInicio: data.telaInicial || '', avisoPromocoes: data.avisoPromocoes || '', tipoWhatsapp: data.tipoWhatsapp || 'numero', pagamentoCartao: data.pagamentoCartao !== undefined ? data.pagamentoCartao : true, pagamentoPix: data.pagamentoPix !== undefined ? data.pagamentoPix : true } : { nomeEmpresa: '', cnpj: '', logo: '', telefoneEmpresa: '', whatsappEmpresa: '', tipoWhatsapp: 'numero', horarios: '', endereco: '', telaInicio: '', avisoPromocoes: '', pagamentoCartao: true, pagamentoPix: true });
        if (data && data.logo) setLogoPreview(data.logo);
      });
  }, []);

  function goTo(tab) {
    if(tab==='painel') navigate('/configuracao');
    else navigate(`/configuracao/${tab}`);
  }

  function formatCNPJ(value) {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');
    // Aplica a máscara
    value = value.replace(/(\d{2})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1/$2');
    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    return value;
  }

  function formatTelefone(value) {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1)$2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    value = value.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    return value.slice(0, 14);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === 'cnpj') {
      setEmpresa(prev => ({ ...prev, [name]: formatCNPJ(value) }));
    } else if (name === 'telefoneEmpresa' || name === 'whatsappEmpresa') {
      setEmpresa(prev => ({ ...prev, [name]: formatTelefone(value) }));
    } else if (name === 'telaInicio') {
      setEmpresa(prev => ({ ...prev, telaInicio: value, telaInicial: value }));
    } else if (type === 'checkbox') {
      setEmpresa(prev => ({ ...prev, [name]: checked }));
    } else {
      setEmpresa(prev => ({ ...prev, [name]: value }));
    }
  }

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setEmpresa(prev => ({ ...prev, logo: ev.target.result }));
      setLogoPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setMsg('Salvando...');
    const res = await fetch(getApiUrl('configuracoes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empresa)
    });
    if (res.ok) setMsg('Dados salvos com sucesso!');
    else setMsg('Erro ao salvar.');
  }

  // Bloqueia acesso completo para clientes não-admin
  if (!admin) {
    return (
      <div style={{maxWidth:900,margin:'40px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 12px #0002',padding:32}}>
        <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>
          <span role="img" aria-label="engrenagem" style={{marginRight:8}}>⚙️</span>
          Configuração
        </h2>
        <div style={{textAlign:'center',color:'#2d3a4b'}}>
          <h3>Acesso Restrito</h3>
          <p>Você não tem permissão para acessar as configurações do sistema.</p>
          <p style={{color:'#666',fontSize:14,marginTop:16}}>Entre em contato com um administrador para obter acesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1000,
      margin: '40px auto',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
      padding: 40,
      border: '2px solid rgba(102, 126, 234, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <h2 style={{
        textAlign: 'center',
        color: '#2d3748',
        marginBottom: 32,
        fontSize: '2.2rem',
        fontWeight: '700',
        position: 'relative',
        zIndex: 1,
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span role="img" aria-label="engrenagem" style={{
          marginRight: 12,
          fontSize: '2rem',
          filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
        }}>⚙️</span>
        Configuração do Sistema
      </h2>

      <div style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        marginBottom: 40,
        position: 'relative',
        zIndex: 1
      }}>
        <button 
          onClick={() => goTo('painel')} 
          style={{
            padding: '14px 28px',
            borderRadius: 16,
            border: 'none',
            background: aba === 'painel' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'rgba(102, 126, 234, 0.1)',
            color: aba === 'painel' ? '#fff' : '#667eea',
            fontWeight: '700',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: aba === 'painel' 
              ? '0 8px 25px rgba(102, 126, 234, 0.4)' 
              : '0 4px 15px rgba(102, 126, 234, 0.1)',
            transform: aba === 'painel' ? 'translateY(-2px)' : 'translateY(0)',
            border: '2px solid rgba(102, 126, 234, 0.2)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            if (aba !== 'painel') {
              e.target.style.background = 'rgba(102, 126, 234, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (aba !== 'painel') {
              e.target.style.background = 'rgba(102, 126, 234, 0.1)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
            }
          }}
        >
          🏠 Painel Inicial
        </button>
        
        <button 
          onClick={() => goTo('gerais')} 
          style={{
            padding: '14px 28px',
            borderRadius: 16,
            border: 'none',
            background: aba === 'gerais' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'rgba(102, 126, 234, 0.1)',
            color: aba === 'gerais' ? '#fff' : '#667eea',
            fontWeight: '700',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: aba === 'gerais' 
              ? '0 8px 25px rgba(102, 126, 234, 0.4)' 
              : '0 4px 15px rgba(102, 126, 234, 0.1)',
            transform: aba === 'gerais' ? 'translateY(-2px)' : 'translateY(0)',
            border: '2px solid rgba(102, 126, 234, 0.2)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            if (aba !== 'gerais') {
              e.target.style.background = 'rgba(102, 126, 234, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (aba !== 'gerais') {
              e.target.style.background = 'rgba(102, 126, 234, 0.1)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
            }
          }}
        >
          🔧 Configurações Gerais
        </button>
      </div>
      <div style={{marginTop: 40, position: 'relative', zIndex: 1}}>
        {aba === 'painel' && (
          <div style={{
            textAlign: 'center',
            color: '#2d3748',
            background: 'rgba(102, 126, 234, 0.05)',
            padding: '40px 32px',
            borderRadius: 20,
            border: '2px solid rgba(102, 126, 234, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 20,
              filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
            }}>🏠</div>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: 16,
              color: '#667eea'
            }}>Painel de Controle</h3>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: '#4a5568',
              maxWidth: 600,
              margin: '0 auto'
            }}>
              Bem-vindo ao centro de controle do sistema! Aqui você pode gerenciar todas as configurações 
              globais da aplicação de forma simples e intuitiva.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 20,
              marginTop: 32,
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '20px',
                borderRadius: 16,
                minWidth: 200,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
              }}>
                <div style={{fontSize: '2rem', marginBottom: 8}}>🏢</div>
                <div style={{fontWeight: '600', color: '#2d3748'}}>Dados da Empresa</div>
                <div style={{fontSize: '0.9rem', color: '#718096'}}>Nome, CNPJ, Logo</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '20px',
                borderRadius: 16,
                minWidth: 200,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
              }}>
                <div style={{fontSize: '2rem', marginBottom: 8}}>📱</div>
                <div style={{fontWeight: '600', color: '#2d3748'}}>Contatos</div>
                <div style={{fontSize: '0.9rem', color: '#718096'}}>WhatsApp, Telefone</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '20px',
                borderRadius: 16,
                minWidth: 200,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
              }}>
                <div style={{fontSize: '2rem', marginBottom: 8}}>⚙️</div>
                <div style={{fontWeight: '600', color: '#2d3748'}}>Sistema</div>
                <div style={{fontSize: '0.9rem', color: '#718096'}}>Configurações avançadas</div>
              </div>
            </div>
          </div>
        )}
        {aba === 'gerais' && (
          <div style={{
            color: '#2d3748',
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: 32
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: 16,
                filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
              }}>🔧</div>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#667eea',
                marginBottom: 8
              }}>Configurações Gerais</h3>
              <p style={{
                color: '#718096',
                fontSize: '1.05rem'
              }}>Personalize as informações da sua empresa</p>
            </div>

            <form onSubmit={handleSalvar} style={{
              margin: '32px 0',
              padding: '32px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
              border: '2px solid rgba(102, 126, 234, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              <h4 style={{
                marginBottom: 20,
                marginTop: 0,
                color: '#667eea',
                fontSize: '1.3rem',
                fontWeight: '700',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                🏢 Dados da Empresa
              </h4>

              <div style={{display: 'grid', gap: 20}}>
                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  Nome da Empresa:
                  <input 
                    type="text" 
                    name="nomeEmpresa" 
                    value={empresa.nomeEmpresa} 
                    onChange={handleChange} 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748'
                    }} 
                    disabled={!admin}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </label>

                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  CNPJ:
                  <input 
                    type="text" 
                    name="cnpj" 
                    value={empresa.cnpj} 
                    onChange={handleChange} 
                    placeholder="00.000.000/0000-00" 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748'
                    }} 
                    disabled={!admin}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </label>

                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  Logo da Empresa:
                  <input 
                    type="file" 
                    name="logo" 
                    accept="image/*" 
                    onChange={handleLogo} 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748'
                    }} 
                    disabled={!admin} 
                  />
                  {logoPreview && (
                    <div style={{
                      marginTop: 12,
                      padding: 16,
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        style={{
                          maxWidth: 200,
                          maxHeight: 100,
                          objectFit: 'contain',
                          background: '#fff',
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          borderRadius: 8,
                          padding: 8
                        }} 
                      />
                    </div>
                  )}
                </label>

                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  Endereço:
                  <input 
                    type="text" 
                    name="endereco" 
                    value={empresa.endereco} 
                    onChange={handleChange} 
                    placeholder="Rua, número, bairro, cidade" 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748'
                    }} 
                    disabled={!admin}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </label>

                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  Telefone:
                  <input 
                    type="text" 
                    name="telefoneEmpresa" 
                    value={empresa.telefoneEmpresa} 
                    onChange={handleChange} 
                    placeholder="(00)00000-0000" 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748'
                    }} 
                    disabled={!admin}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </label>

                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  WhatsApp:
                  <input 
                    type="text" 
                    name="whatsappEmpresa" 
                    value={empresa.whatsappEmpresa} 
                    onChange={handleChange} 
                    placeholder="(00)00000-0000 ou link do WhatsApp" 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748'
                    }} 
                    disabled={!admin}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </label>
              </div>
              <div style={{marginTop: 8, marginBottom: 20}}>
                <label style={{
                  fontWeight: '600', 
                  fontSize: 16, 
                  color: '#4a5568',
                  display: 'block',
                  marginBottom: 12
                }}>
                  📱 Tipo de WhatsApp:
                </label>
                <div style={{
                  display: 'flex', 
                  gap: 20, 
                  padding: '12px 16px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 12,
                  border: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <label style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    cursor: admin ? 'pointer' : 'not-allowed',
                    fontWeight: '500',
                    color: '#4a5568'
                  }}>
                    <input 
                      type="radio" 
                      name="tipoWhatsapp" 
                      value="numero" 
                      checked={empresa.tipoWhatsapp === 'numero'} 
                      onChange={handleChange}
                      disabled={!admin}
                      style={{
                        transform: 'scale(1.2)',
                        accentColor: '#667eea',
                        cursor: admin ? 'pointer' : 'not-allowed'
                      }}
                    />
                    <span style={{fontSize:14}}>📋 Copiar Número</span>
                  </label>
                  <label style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    cursor: admin ? 'pointer' : 'not-allowed',
                    fontWeight: '500',
                    color: '#4a5568'
                  }}>
                    <input 
                      type="radio" 
                      name="tipoWhatsapp" 
                      value="link" 
                      checked={empresa.tipoWhatsapp === 'link'} 
                      onChange={handleChange}
                      disabled={!admin}
                      style={{
                        transform: 'scale(1.2)',
                        accentColor: '#667eea',
                        cursor: admin ? 'pointer' : 'not-allowed'
                      }}
                    />
                    <span style={{fontSize:14}}>🔗 Link Direto WhatsApp</span>
                  </label>
                </div>
                <div style={{
                  marginTop: 12, 
                  fontSize: 13, 
                  color: '#718096', 
                  lineHeight: 1.4,
                  background: 'rgba(102, 126, 234, 0.02)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <strong>📋 Copiar Número:</strong> Cliente copia o número para colar no WhatsApp<br/>
                  <strong>🔗 Link Direto:</strong> Cliente é redirecionado automaticamente para conversar
                </div>
              </div>

              <label style={{
                fontWeight: '600',
                color: '#4a5568',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                🕒 Horários de Funcionamento:
                <input 
                  type="text" 
                  name="horarios" 
                  value={empresa.horarios} 
                  onChange={handleChange} 
                  placeholder="Ex: Seg a Sex, 8h às 18h" 
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#2d3748'
                  }} 
                  disabled={!admin}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </label>
              {/* Campo Tela Inicial */}
              <div style={{marginTop: 24, marginBottom: 24}}>
                <h4 style={{
                  marginBottom: 16,
                  marginTop: 0,
                  color: '#667eea',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  🏠 Mensagem da Tela Inicial
                </h4>
                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  width: '100%'
                }}>
                  Mensagem de Boas-vindas:
                  <textarea 
                    name="telaInicio" 
                    value={empresa.telaInicio || ''} 
                    onChange={handleChange} 
                    placeholder="Digite aqui a mensagem que aparecerá na tela inicial..." 
                    rows={6} 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      minHeight: 120,
                      resize: 'vertical',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748',
                      fontFamily: 'inherit'
                    }} 
                    disabled={!admin}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </label>
              </div>
              {/* Campo Aviso de Promoções */}
              <div style={{marginTop: 24, marginBottom: 24}}>
                <h4 style={{
                  marginBottom: 16,
                  marginTop: 0,
                  color: '#667eea',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  🎉 Aviso de Promoções
                </h4>
                <label style={{
                  fontWeight: '600',
                  color: '#4a5568',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  width: '100%'
                }}>
                  Mensagem de Promoções:
                  <textarea 
                    name="avisoPromocoes" 
                    value={empresa.avisoPromocoes || ''} 
                    onChange={handleChange} 
                    placeholder="🎉 Confira as promoções especiais disponíveis abaixo! Aproveite descontos e ofertas por tempo limitado." 
                    rows={4} 
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '1rem',
                      minHeight: 100,
                      resize: 'vertical',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748',
                      fontFamily: 'inherit'
                    }} 
                    disabled={!admin}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </label>
              </div>
              <div style={{marginTop: 24}}>
                <h4 style={{
                  marginBottom: 16,
                  color: '#667eea',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  🔧 Configurações do Sistema
                </h4>
                <div style={{
                  padding: '16px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 12,
                  border: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <label style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    cursor: admin ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    color: '#4a5568'
                  }}>
                    <input 
                      type="checkbox" 
                      id="usbBarcodeToggle"
                      onChange={e=>{
                        if (admin) localStorage.setItem('barcodeUsb', e.target.checked ? '1' : '0');
                      }}
                      defaultChecked={localStorage.getItem('barcodeUsb')==='1'}
                      disabled={!admin}
                      style={{
                        transform: 'scale(1.3)',
                        accentColor: '#667eea'
                      }}
                    />
                    📱 Usar leitor de código de barras USB ao invés da câmera
                  </label>
                  <p style={{
                    fontSize: 14,
                    color: '#718096',
                    marginTop: 12,
                    marginLeft: 32,
                    lineHeight: 1.5
                  }}>
                    Quando ativado, o sistema irá usar o leitor de código de barras conectado via USB, desabilitando o uso da câmera.
                    {!admin && <span style={{color: '#e53e3e', display: 'block', marginTop: 4}}>⚠️ Apenas administradores podem alterar esta opção.</span>}
                  </p>
                </div>
              </div>

              <div style={{marginTop: 24}}>
                <h4 style={{
                  marginBottom: 16,
                  color: '#667eea',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  💳 Configurações de Pagamentos
                </h4>
                <div style={{
                  padding: '16px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 12,
                  border: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <label style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    cursor: admin ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    color: '#4a5568'
                  }}>
                    <input 
                      type="checkbox" 
                      name="pagamentoCartao"
                      checked={empresa.pagamentoCartao}
                      onChange={handleChange}
                      disabled={!admin}
                      style={{
                        transform: 'scale(1.3)',
                        accentColor: '#667eea'
                      }}
                    />
                    💳 Habilitar pagamento com cartão de crédito
                  </label>
                  <p style={{
                    fontSize: 14,
                    color: '#718096',
                    marginTop: 8,
                    marginLeft: 32,
                    lineHeight: 1.5
                  }}>
                    Quando ativado, os usuários poderão escolher cartão de crédito como método de pagamento.
                  </p>
                  <label style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    cursor: admin ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    color: '#4a5568',
                    marginTop: 16
                  }}>
                    <input 
                      type="checkbox" 
                      name="pagamentoPix"
                      checked={empresa.pagamentoPix}
                      onChange={handleChange}
                      disabled={!admin}
                      style={{
                        transform: 'scale(1.3)',
                        accentColor: '#667eea'
                      }}
                    />
                    📱 Habilitar pagamento com Pix
                  </label>
                  <p style={{
                    fontSize: 14,
                    color: '#718096',
                    marginTop: 8,
                    marginLeft: 32,
                    lineHeight: 1.5
                  }}>
                    Quando ativado, os usuários poderão escolher Pix como método de pagamento.
                  </p>
                </div>
              </div>
                <button 
                  type="submit" 
                  style={{
                    marginTop: 32,
                    padding: '16px 32px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 25px rgba(72, 187, 120, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)';
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 35px rgba(72, 187, 120, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)';
                  }}
                >
                  💾 Salvar Configurações
                </button>
              )}
              
              {msg && (
                <div style={{
                  marginTop: 20,
                  textAlign: 'center',
                  color: msg.includes('sucesso') ? '#38a169' : '#e53e3e',
                  fontWeight: '600',
                  fontSize: '1.05rem',
                  padding: '16px 24px',
                  background: msg.includes('sucesso') 
                    ? 'rgba(72, 187, 120, 0.1)' 
                    : 'rgba(229, 62, 62, 0.1)',
                  borderRadius: 12,
                  border: `2px solid ${msg.includes('sucesso') ? 'rgba(72, 187, 120, 0.2)' : 'rgba(229, 62, 62, 0.2)'}`,
                  animation: 'fadeInUp 0.3s ease-out'
                }}>
                  {msg.includes('sucesso') ? '✅' : '❌'} {msg}
                </div>
              )}
            </form>
            
            {/* Seção de Ações Administrativas Modernizada */}
            {admin && (
              <div style={{
                marginTop: 40,
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                border: '2px solid rgba(255, 193, 7, 0.3)',
                boxShadow: '0 8px 32px rgba(255, 193, 7, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  background: 'radial-gradient(circle, rgba(255, 193, 7, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: 0,
                  pointerEvents: 'none'
                }} />
                
                <h4 style={{
                  marginBottom: 20,
                  color: '#d69e2e',
                  textAlign: 'center',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  position: 'relative',
                  zIndex: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  ⚠️ Ações Administrativas
                </h4>
                
                <p style={{
                  marginBottom: 24,
                  color: '#975a16',
                  fontSize: 15,
                  textAlign: 'center',
                  lineHeight: 1.5,
                  position: 'relative',
                  zIndex: 1,
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 193, 7, 0.2)'
                }}>
                  ⚠️ <strong>Cuidado!</strong> Estas ações afetam todos os usuários do sistema e não podem ser desfeitas.
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <button 
                    onClick={async () => {
                      if (!confirm('⚠️ ATENÇÃO: Esta ação irá zerar a pontuação de TODOS os usuários do tipo Cliente. Esta operação não pode ser desfeita. Deseja continuar?')) {
                        return;
                      }
                      try {
                        setMsg('🔄 Zerando pontos dos clientes...');
                        const res = await fetch(getApiUrl('usuarios/zerar-pontos-clientes'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' }
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setMsg('✅ ' + data.mensagem);
                        } else {
                          setMsg('❌ Erro ao zerar pontos: ' + (data.erro || 'Erro desconhecido'));
                        }
                      } catch (error) {
                        setMsg('❌ Erro ao zerar pontos: ' + error.message);
                      }
                    }}
                    style={{
                      padding: '14px 28px',
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      boxShadow: '0 8px 25px rgba(229, 62, 62, 0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #c53030 0%, #e53e3e 100%)';
                      e.target.style.transform = 'translateY(-2px) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 35px rgba(229, 62, 62, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(229, 62, 62, 0.4)';
                    }}
                    title="Zera a pontuação de todos os usuários do tipo Cliente"
                  >
                    🗑️ Zerar Pontos dos Clientes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



function AssinaturaPanel() {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('');
  const [validade, setValidade] = useState(() => {
    const v = localStorage.getItem('assinaturaValidade');
    return v ? new Date(v) : null;
  });
  const [gerando, setGerando] = useState(false);
  const [validando, setValidando] = useState(false);

  // Gera uma nova chave automaticamente
  async function gerarChave() {
    setGerando(true);
    setStatus('Gerando chave...');
    try {
      const res = await fetch(getApiUrl('chave/gerar'));
      const data = await res.json();
      setKey(data.chave);
      setStatus('Chave gerada! Clique em "Ativar" para validar.');
    } catch {
      setStatus('Erro ao gerar chave.');
    }
    setGerando(false);
  }

  // Valida a chave automaticamente
  async function ativar() {
    setValidando(true);
    setStatus('Validando chave...');
    try {
      const res = await fetch(getApiUrl('chave/validar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave: key })
      });
      const data = await res.json();
      if (data.valida) {
        const dataValidade = new Date();
        dataValidade.setDate(dataValidade.getDate() + 30);
        localStorage.setItem('assinaturaKey', key);
        localStorage.setItem('assinaturaValidade', dataValidade.toISOString());
        setValidade(dataValidade);
        setStatus('Sistema ativado com sucesso!');
      } else {
        setStatus('Chave inválida.');
      }
    } catch {
      setStatus('Erro ao validar chave.');
    }
    setValidando(false);
  }

  function diasRestantes() {
    if (!validade) return null;
    const diff = Math.ceil((validade - new Date()) / (1000*60*60*24));
    return diff > 0 ? diff : 0;
  }

  useEffect(() => {
    if (validade && validade < new Date()) {
      setStatus('Assinatura expirada. Gere uma nova chave.');
    }
  }, [validade]);

  return (
    <div style={{color:'#2d3a4b',maxWidth:400,margin:'0 auto',textAlign:'center'}}>
      <h3>Assinatura do Sistema</h3>
      <p>Gere e valide sua chave de ativação automaticamente.</p>
      <input
        type="text"
        placeholder="Chave de ativação"
        value={key}
        onChange={e=>setKey(e.target.value)}
        style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ccc',margin:'16px 0',fontSize:16}}
        disabled={diasRestantes() > 0 || gerando}
      />
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:16}}>
        <button onClick={gerarChave} style={{padding:'10px 18px',borderRadius:8,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}} disabled={diasRestantes() > 0 || gerando}>Gerar Chave</button>
        <button onClick={ativar} style={{padding:'10px 18px',borderRadius:8,background:'#2d8a4b',color:'#fff',border:'none',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}} disabled={diasRestantes() > 0 || !key || validando}>Ativar</button>
      </div>
      <div style={{marginTop:24}}>
        {diasRestantes() > 0 ? (
          <div style={{color:'#2d8a4b',fontWeight:'bold'}}>Sistema ativado! Dias restantes: {diasRestantes()}</div>
        ) : (
          <div style={{color:'#b22'}}>{status || 'Assinatura não ativada.'}</div>
        )}
        {validade && (
          <div style={{fontSize:13,marginTop:8}}>Validade até: {validade.toLocaleDateString()}</div>
        )}
      </div>
      <div style={{marginTop:32,color:'#888',fontSize:13}}>
        <em>Agora a ativação é automática e segura.</em>
      </div>
    </div>
  );
}

export default ConfiguracaoGlobal;
