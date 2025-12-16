
import React, { useState, useEffect } from 'react';
import BarcodeReader from './BarcodeReader';

function ConfigProduto() {
  const [aba, setAba] = useState('criar');
  const [showBarcode, setShowBarcode] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetch('http://localhost:3001/produtos')
      .then(res => res.json())
      .then(setProdutos);
  }, []);

  return (
    <div style={{maxWidth:900,margin:'40px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 12px #0002',padding:32}}>
      <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>Produtos</h2>
      <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:32}}>
        <button onClick={()=>setAba('criar')} style={{padding:'10px 24px',borderRadius:8,border:'none',background: aba==='criar' ? '#2d3a4b' : '#e9ecf3',color: aba==='criar' ? '#fff' : '#2d3a4b',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}}>Criar Produto</button>
        <button onClick={()=>setAba('produtos')} style={{padding:'10px 24px',borderRadius:8,border:'none',background: aba==='produtos' ? '#2d3a4b' : '#e9ecf3',color: aba==='produtos' ? '#fff' : '#2d3a4b',fontWeight:'bold',fontSize:'1.05rem',cursor:'pointer'}}>Produtos</button>
      </div>
      <div style={{marginTop:32}}>
        {aba === 'criar' && (
          <form style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:18}} onSubmit={e => {e.preventDefault(); /* salvar produto */}}>
            <label style={{fontWeight:'bold'}}>Nome do Produto:
              <input name="nome" required style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}} />
            </label>
            <label style={{fontWeight:'bold'}}>Descrição:
              <textarea name="descricao" required rows={3} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}} />
            </label>
            <label style={{fontWeight:'bold'}}>Unidade de Medida:
              <input name="unidade" required placeholder="Ex: kg, un, m²" style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}} />
            </label>
            <label style={{fontWeight:'bold'}}>Tipo de Moeda:
              <select name="moeda" required style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}}>
                <option value="real">Real (R$)</option>
                <option value="pontos">Pontos</option>
              </select>
            </label>
            <label style={{fontWeight:'bold'}}>Código de Barras:
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input name="codigoBarras" id="codigoBarrasInput" required style={{flex:1,padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}} />
                <button type="button" onClick={()=>setShowBarcode(true)} style={{padding:'8px 14px',borderRadius:6,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold',marginTop:4}}>Ler código</button>
              </div>
            </label>
            {showBarcode && (
              <div style={{margin:'16px 0'}}>
                <BarcodeReader onDetected={codigo => {
                  document.getElementById('codigoBarrasInput').value = codigo;
                  setShowBarcode(false);
                }} />
                <button type="button" onClick={()=>setShowBarcode(false)} style={{marginTop:8,padding:'6px 18px',borderRadius:6,background:'#b0b8c9',color:'#2d3a4b',border:'none',fontWeight:'bold'}}>Cancelar</button>
              </div>
            )}
            <button type="submit" style={{marginTop:18,padding:'12px 0',borderRadius:8,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold',fontSize:'1.1rem'}}>Salvar Produto</button>
          </form>
        )}
        {aba === 'produtos' && (
          <div>
            <input
              type="text"
              placeholder="Pesquisar por nome ou código de barras..."
              style={{width:'100%',maxWidth:400,padding:8,borderRadius:6,border:'1px solid #ccc',marginBottom:24}}
              onChange={e => {
                const v = e.target.value.toLowerCase();
                fetch('http://localhost:3001/produtos')
                  .then(res => res.json())
                  .then(data => setProdutos(data.filter(p =>
                    p.nome.toLowerCase().includes(v) || (p.codigo_barra||'').includes(v)
                  )));
              }}
            />
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:20}}>
              {produtos.map(prod => (
                <div key={prod.id} style={{border:'1px solid #ddd',borderRadius:8,padding:16,background:'#fafbfc',boxShadow:'0 1px 4px #0001',position:'relative'}}>
                  {editId === prod.id ? (
                    <form onSubmit={e => {
                      e.preventDefault();
                      fetch(`http://localhost:3001/produtos/${prod.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editForm)
                      })
                        .then(res => res.json())
                        .then(updated => {
                          setProdutos(produtos.map(p => p.id === prod.id ? {...p, ...editForm} : p));
                          setEditId(null);
                        });
                    }} style={{display:'flex',flexDirection:'column',gap:8}}>
                      <input value={editForm.nome||''} onChange={e=>setEditForm({...editForm,nome:e.target.value})} required />
                      <textarea value={editForm.descricao||''} onChange={e=>setEditForm({...editForm,descricao:e.target.value})} required rows={2} />
                      <input value={editForm.unidade||''} onChange={e=>setEditForm({...editForm,unidade:e.target.value})} required />
                      <select value={editForm.moeda||'real'} onChange={e=>setEditForm({...editForm,moeda:e.target.value})} required>
                        <option value="real">Real (R$)</option>
                        <option value="pontos">Pontos</option>
                      </select>
                      <input value={editForm.codigo_barra||''} onChange={e=>setEditForm({...editForm,codigo_barra:e.target.value})} required />
                      <input value={editForm.preco||''} onChange={e=>setEditForm({...editForm,preco:e.target.value})} required type="number" step="0.01" />
                      <input value={editForm.estoque||''} onChange={e=>setEditForm({...editForm,estoque:e.target.value})} required type="number" />
                      <div style={{display:'flex',gap:8}}>
                        <button type="submit" style={{flex:1,background:'#2d3a4b',color:'#fff',border:'none',borderRadius:6,padding:'8px 0',fontWeight:'bold'}}>Salvar</button>
                        <button type="button" onClick={()=>setEditId(null)} style={{flex:1,background:'#b0b8c9',color:'#2d3a4b',border:'none',borderRadius:6,padding:'8px 0',fontWeight:'bold'}}>Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 style={{margin:'8px 0'}}>{prod.nome}</h3>
                      <p style={{fontWeight:'bold', color:'#2d3a4b'}}>Preço: {prod.moeda === 'pontos' ? prod.preco+' pts' : 'R$ '+prod.preco}</p>
                      <p style={{fontSize:13, color:'#666'}}>Estoque: {prod.estoque}</p>
                      <p style={{fontSize:13, color:'#666'}}>Unidade: {prod.unidade}</p>
                      <p style={{fontSize:13, color:'#666'}}>Código de Barras: {prod.codigo_barra}</p>
                      <p style={{fontSize:13, color:'#666'}}>Descrição: {prod.descricao}</p>
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <button onClick={()=>{setEditId(prod.id);setEditForm(prod);}} style={{flex:1,background:'#2d3a4b',color:'#fff',border:'none',borderRadius:6,padding:'6px 0',fontWeight:'bold'}}>Editar</button>
                        <button onClick={()=>{
                          if(window.confirm('Tem certeza que deseja excluir este produto?')){
                            fetch(`http://localhost:3001/produtos/${prod.id}`,{method:'DELETE'})
                              .then(()=>setProdutos(produtos.filter(p=>p.id!==prod.id)));
                          }
                        }} style={{flex:1,background:'#c92d2d',color:'#fff',border:'none',borderRadius:6,padding:'6px 0',fontWeight:'bold'}}>Excluir</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfigProduto;
