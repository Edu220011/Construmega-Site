
import React, { useEffect, useState } from 'react';
import CarrosselImagens from './CarrosselImagens';
import { useNavigate } from 'react-router-dom';

function Loja({ admin }) {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/produtos')
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
      <div className="produtos-grid">
        {produtos.filter(p => !p.inativo && (String(p.moeda).toLowerCase() === 'r$' || String(p.moeda).toLowerCase() === 'real')).map(p => (
          <div key={p.id} className="produto-card">
            <div>
              <div className="produto-imagem">
                {Array.isArray(p.imagens) && p.imagens.length > 0 ? (
                  <CarrosselImagens imagens={p.imagens} altura={120} largura={120} animacao={true} />
                ) : p.imagem ? (
                  <CarrosselImagens imagens={[p.imagem]} altura={120} largura={120} animacao={true} />
                ) : (
                  <div className="produto-sem-foto">Sem foto</div>
                )}
              </div>
              <h3 className="produto-nome">{p.nome}</h3>
              <p className="produto-preco">Preço: R$ {Number(p.preco).toFixed(2)}</p>
              <p className="produto-estoque">Estoque: <span className={Number(p.estoque)>0?'estoque-disponivel':'estoque-indisponivel'}>{p.estoque !== undefined ? p.estoque : 'N/A'}</span></p>
            </div>
            <button className="produto-botao btn-padrao" onClick={() => navigate(`/produto-venda/${p.id}`)}>Ver detalhes</button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Loja;
