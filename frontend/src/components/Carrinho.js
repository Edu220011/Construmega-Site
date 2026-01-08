import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  salvarCarrinhoUsuario,
  carregarCarrinhoUsuario,
  limparCarrinhoUsuario,
  transferirCarrinhoParaUsuario
} from '../utils/carrinhoUtils';
import PixCheckout from './PixCheckout';
import CreditCardCheckout from './CreditCardCheckout';
import PaymentMethodModal from './PaymentMethodModal';

function Carrinho({ cliente, setCliente }) {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [configuracoes, setConfiguracoes] = useState({ pagamentoCartao: true, pagamentoPix: true });
  const navigate = useNavigate();

  useEffect(() => {
    if (cliente && cliente.id) {
      // Se usuário está logado, carregar carrinho do usuário
      // Primeiro tenta transferir carrinho global se existir
      const carrinhoUsuario = transferirCarrinhoParaUsuario(cliente.id);
      setItens(carrinhoUsuario);
      calcularTotal(carrinhoUsuario);
    } else {
      // Se não está logado, carregar carrinho global (compatibilidade)
      const carrinhoSalvo = localStorage.getItem('carrinho');
      if (carrinhoSalvo) {
        const carrinho = JSON.parse(carrinhoSalvo);
        setItens(carrinho);
        calcularTotal(carrinho);
      }
    }
  }, [cliente]);

  useEffect(() => {
    // Carregar configurações de pagamento
    fetch('/configuracoes')
      .then(res => res.json())
      .then(data => {
        setConfiguracoes({
          pagamentoCartao: data.pagamentoCartao !== undefined ? data.pagamentoCartao : true,
          pagamentoPix: data.pagamentoPix !== undefined ? data.pagamentoPix : true
        });
      })
      .catch(err => console.error('Erro ao carregar configurações:', err));
  }, []);

  const calcularTotal = (itensCarrinho) => {
    const totalCalculado = itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    setTotal(totalCalculado);
  };

  const removerItem = (index) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);

    if (cliente && cliente.id) {
      salvarCarrinhoUsuario(cliente.id, novosItens);
    } else {
      localStorage.setItem('carrinho', JSON.stringify(novosItens));
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }

    calcularTotal(novosItens);
  };

  const alterarQuantidade = (index, novaQuantidade) => {
    if (novaQuantidade < 1) return;
    const novosItens = [...itens];
    novosItens[index].quantidade = novaQuantidade;
    setItens(novosItens);

    if (cliente && cliente.id) {
      salvarCarrinhoUsuario(cliente.id, novosItens);
    } else {
      localStorage.setItem('carrinho', JSON.stringify(novosItens));
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }

    calcularTotal(novosItens);
  };

  const finalizarCompra = async () => {
    if (!cliente || !cliente.id) {
      alert('Por favor, faça login para finalizar a compra.');
      navigate('/login');
      return;
    }

    if (itens.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    // Mostrar modal de seleção de método de pagamento
    setShowPaymentMethodModal(true);
  };

  const processarPagamento = async (tipoPagamento) => {
    try {
      setShowPaymentMethodModal(false);
      
      console.log('🔍 Verificando estoque antes do pagamento...');
      // Verificar estoque atualizado antes do pagamento
      const produtosAtualizados = await fetch('/api/produtos').then(r => r.json());
      console.log('Produtos atualizados:', produtosAtualizados);

      for (const item of itens) {
        const produtoAtual = produtosAtualizados.find(p => String(p.id) === String(item.id));
        console.log('Verificando produto:', item.id, 'estoque atual:', produtoAtual?.estoque);
        if (!produtoAtual || (produtoAtual.estoque ?? 0) < item.quantidade) {
          console.log('ERRO: Estoque insuficiente');
          alert(`Estoque insuficiente para ${item.nome}. Disponível: ${produtoAtual?.estoque ?? 0}`);
          return;
        }
      }

      console.log('Criando preferência de pagamento...');
      // Criar preferência de pagamento no Mercado Pago
      const itensParaPagamento = itens.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade
      }));
      console.log('Itens para pagamento:', itensParaPagamento);

      const res = await fetch('/pagamento/criar-carrinho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: cliente.id,
          itens: itensParaPagamento,
          tipoPagamento: tipoPagamento
        })
      });

      console.log('Resposta da API:', res.status, res.statusText);

      if (!res.ok) {
        const erro = await res.json();
        console.log('ERRO na resposta:', erro);
        alert(erro.erro || 'Erro ao iniciar pagamento.');
        return;
      }

      const data = await res.json();
      console.log('Dados recebidos:', data);

      // Mostrar modal apropriado baseado no tipo de pagamento
      setPreferenceId(data.preference_id);
      if (tipoPagamento === 'creditcard') {
        setShowCreditCardModal(true);
        console.log('Modal do cartão aberto com preferenceId:', data.preference_id);
      } else {
        setShowPixModal(true);
        console.log('Modal do PIX aberto com preferenceId:', data.preference_id);
      }

    } catch (err) {
      console.error('ERRO GERAL:', err);
      alert('Erro ao conectar com o servidor.');
    }
  };

  const fecharPixModal = () => {
    setShowPixModal(false);
    setPreferenceId(null);
    // Limpar carrinho quando fechar o modal
    setItens([]);
    if (cliente && cliente.id) {
      limparCarrinhoUsuario(cliente.id);
    } else {
      localStorage.removeItem('carrinho');
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }
    setTotal(0);
  };

  const fecharCreditCardModal = () => {
    setShowCreditCardModal(false);
    setPreferenceId(null);
    // Limpar carrinho quando fechar o modal
    setItens([]);
    if (cliente && cliente.id) {
      limparCarrinhoUsuario(cliente.id);
    } else {
      localStorage.removeItem('carrinho');
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }
    setTotal(0);
  };

  const fecharPaymentMethodModal = () => {
    setShowPaymentMethodModal(false);
  };

  const limparCarrinho = () => {
    setItens([]);
    if (cliente && cliente.id) {
      limparCarrinhoUsuario(cliente.id);
    } else {
      localStorage.removeItem('carrinho');
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }
    setTotal(0);
  };

  return (
    <div style={{maxWidth:400,margin:'32px auto',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px #0001',padding:32}}>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,marginBottom:20,fontSize:28}}>Carrinho de Compras</h2>
      
      {itens.length === 0 ? (
        <p style={{textAlign:'center',color:'#888',fontSize:16}}>Carrinho vazio</p>
      ) : (
        <>
          <div style={{marginBottom:20}}>
            {itens.map((item, index) => (
              <div key={index} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #eee'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'bold'}}>{item.nome}</div>
                  <div style={{fontSize:14,color:'#666'}}>R$ {item.preco.toFixed(2)} cada</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <button 
                    onClick={() => alterarQuantidade(index, item.quantidade - 1)}
                    style={{
                      width:35,
                      height:35,
                      borderRadius:8,
                      border:'2px solid #007bff',
                      background:'#fff',
                      cursor:'pointer',
                      fontSize:18,
                      fontWeight:'bold',
                      color:'#007bff',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      lineHeight:1
                    }}
                  >
                    −
                  </button>
                  <span style={{minWidth:30,textAlign:'center',fontSize:16,fontWeight:'bold'}}>{item.quantidade}</span>
                  <button 
                    onClick={() => alterarQuantidade(index, item.quantidade + 1)}
                    style={{
                      width:35,
                      height:35,
                      borderRadius:8,
                      border:'2px solid #28a745',
                      background:'#fff',
                      cursor:'pointer',
                      fontSize:18,
                      fontWeight:'bold',
                      color:'#28a745',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      lineHeight:1
                    }}
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removerItem(index)}
                    style={{marginLeft:10,padding:'5px 10px',background:'#dc3545',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:12}}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{borderTop:'2px solid #eee',paddingTop:20,marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:'bold',textAlign:'center'}}>
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
          
          <div style={{display:'flex',gap:10}}>
            <button
              onClick={finalizarCompra}
              style={{flex:1,padding:'12px 0',background:'#28a745',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:'bold',fontSize:16}}
            >
              Finalizar Compra
            </button>
            <button
              onClick={limparCarrinho}
              style={{padding:'12px 20px',background:'#6c757d',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:'bold',fontSize:14}}
            >
              Limpar
            </button>
          </div>
        </>
      )}

      {/* Modal de seleção de método de pagamento */}
      {showPaymentMethodModal && (
        <PaymentMethodModal
          onSelectPayment={processarPagamento}
          onClose={fecharPaymentMethodModal}
          pagamentoCartao={configuracoes.pagamentoCartao}
          pagamentoPix={configuracoes.pagamentoPix}
        />
      )}

      {/* Modal do PIX */}
      {showPixModal && preferenceId && (
        <PixCheckout
          preferenceId={preferenceId}
          onClose={fecharPixModal}
        />
      )}

      {/* Modal do Cartão de Crédito */}
      {showCreditCardModal && preferenceId && (
        <CreditCardCheckout
          preferenceId={preferenceId}
          onClose={fecharCreditCardModal}
        />
      )}
    </div>
  );
}

export default Carrinho;