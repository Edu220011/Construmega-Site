import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ConfiguracaoGlobal() {
  const navigate = useNavigate();
  const location = useLocation();
  // Determina aba pelo path
  const path = location.pathname;
  let aba = 'painel';
  if (path.endsWith('/gerais')) aba = 'gerais';
  else if (path.endsWith('/assinatura')) aba = 'assinatura';

  function goTo(tab) {
    if(tab==='painel') navigate('/configuracao');
    else navigate(`/configuracao/${tab}`);
  }

  return (
    <div style={{maxWidth:900,margin:'40px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 12px #0002',padding:32}}>
      <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>
        <span role="img" aria-label="engrenagem" style={{marginRight:8}}>⚙️</span>
        Configuração
      </h2>
      <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:32}}>
        <button onClick={()=>goTo('painel')} style={{padding:'10px 24px',borderRadius:8,border:'none',background: aba==='painel' ? '#2d3a4b' : '#e9ecf3',color: aba==='painel' ? '#fff' : '#2d3a4b',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}}>Painel Inicial</button>
        <button onClick={()=>goTo('gerais')} style={{padding:'10px 24px',borderRadius:8,border:'none',background: aba==='gerais' ? '#2d3a4b' : '#e9ecf3',color: aba==='gerais' ? '#fff' : '#2d3a4b',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}}>Configurações Gerais</button>
        <button onClick={()=>goTo('assinatura')} style={{padding:'10px 24px',borderRadius:8,border:'none',background: aba==='assinatura' ? '#2d3a4b' : '#e9ecf3',color: aba==='assinatura' ? '#fff' : '#2d3a4b',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}}>Assinatura</button>
      </div>
      <div style={{marginTop:32}}>
        {aba === 'painel' && (
          <div style={{textAlign:'center',color:'#2d3a4b'}}>
            <h3>Painel Inicial</h3>
            <p>Bem-vindo ao painel de configurações globais do sistema.</p>
          </div>
        )}
        {aba === 'gerais' && (
          <div style={{color:'#2d3a4b',maxWidth:500,margin:'0 auto'}}>
            <h3 style={{textAlign:'center'}}>Configurações Gerais</h3>
            <div style={{margin:'32px 0',padding:'24px',background:'#f6f8fa',borderRadius:12,boxShadow:'0 1px 4px #0001'}}>
              <h4 style={{marginBottom:12}}>Leitor de Código de Barras</h4>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <label style={{fontWeight:'bold',fontSize:16,flex:1}}>Usar leitor USB ao invés da câmera</label>
                <input type="checkbox" id="usbBarcodeToggle" onChange={e=>{
                  localStorage.setItem('barcodeUsb', e.target.checked ? '1' : '0');
                }} defaultChecked={localStorage.getItem('barcodeUsb')==='1'} />
              </div>
              <p style={{fontSize:13,color:'#666',marginTop:8}}>Quando ativado, o sistema irá usar o leitor de código de barras conectado via USB, desabilitando o uso da câmera.</p>
            </div>
          </div>
        )}
        {aba === 'assinatura' && (
          <AssinaturaPanel />
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

  function ativar() {
    if (!key || key.length < 8) {
      setStatus('Chave inválida.');
      return;
    }
    // Simula ativação: qualquer chave válida ativa por 30 dias
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);
    localStorage.setItem('assinaturaKey', key);
    localStorage.setItem('assinaturaValidade', dataValidade.toISOString());
    setValidade(dataValidade);
    setStatus('Sistema ativado com sucesso!');
  }

  function diasRestantes() {
    if (!validade) return null;
    const diff = Math.ceil((validade - new Date()) / (1000*60*60*24));
    return diff > 0 ? diff : 0;
  }

  useEffect(() => {
    if (validade && validade < new Date()) {
      setStatus('Assinatura expirada. Insira uma nova chave.');
    }
  }, [validade]);

  return (
    <div style={{color:'#2d3a4b',maxWidth:400,margin:'0 auto',textAlign:'center'}}>
      <h3>Assinatura do Sistema</h3>
      <p>Insira sua chave de ativação para liberar o uso do sistema.</p>
      <input
        type="text"
        placeholder="Digite a chave de ativação"
        value={key}
        onChange={e=>setKey(e.target.value)}
        style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ccc',margin:'16px 0',fontSize:16}}
        disabled={diasRestantes() > 0}
      />
      <button
        onClick={ativar}
        style={{padding:'10px 32px',borderRadius:8,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}}
        disabled={diasRestantes() > 0}
      >Ativar</button>
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
        <em>No futuro, a ativação será automatizada e vinculada a planos de assinatura.</em>
      </div>
    </div>
  );
}

export default ConfiguracaoGlobal;
