// Script para atualizar pedidos antigos com comprovantes
const fs = require('fs').promises;
const path = require('path');

async function atualizarPedidos() {
  try {
    // Ler pedidos
    const pedidosPath = path.join(__dirname, 'pedidos.json');
    const pedidosData = await fs.readFile(pedidosPath, 'utf-8');
    const pedidos = JSON.parse(pedidosData);
    
    // Ler configurações para pegar endereço
    const configPath = path.join(__dirname, 'configuracoes.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    const localRetirada = config.endereco || '';
    
    let atualizados = 0;
    
    // Atualizar cada pedido
    pedidos.forEach(pedido => {
      let precisaAtualizar = false;
      
      // Se for resgate e não tiver comprovante, gerar
      if (pedido.tipo === 'resgate' && !pedido.comprovante) {
        pedido.comprovante = Math.floor(100000 + Math.random() * 900000).toString();
        precisaAtualizar = true;
        console.log(`✅ Comprovante gerado para pedido ${pedido.id}: ${pedido.comprovante}`);
      }
      
      // Adicionar campos faltantes
      if (!pedido.localRetirada) {
        pedido.localRetirada = localRetirada;
        precisaAtualizar = true;
      }
      
      if (!pedido.quantidade) {
        pedido.quantidade = 1;
        precisaAtualizar = true;
      }
      
      if (!pedido.tipo) {
        // Determinar tipo baseado em pontos vs valor
        pedido.tipo = pedido.pontos > 0 ? 'resgate' : 'venda';
        precisaAtualizar = true;
      }
      
      if (precisaAtualizar) {
        atualizados++;
      }
    });
    
    // Salvar pedidos atualizados
    if (atualizados > 0) {
      await fs.writeFile(pedidosPath, JSON.stringify(pedidos, null, 2), 'utf-8');
      console.log(`\n✅ ${atualizados} pedido(s) atualizado(s) com sucesso!`);
    } else {
      console.log('\n✅ Todos os pedidos já estão atualizados!');
    }
    
    // Exibir resumo
    console.log('\n📊 Resumo dos pedidos:');
    pedidos.forEach(p => {
      console.log(`ID: ${p.id} | Tipo: ${p.tipo} | Comprovante: ${p.comprovante || 'N/A'} | Status: ${p.status}`);
    });
    
  } catch (err) {
    console.error('❌ Erro ao atualizar pedidos:', err);
  }
}

atualizarPedidos();
