#!/usr/bin/env python3
"""
Script para atualizar chamadas fetch() nos componentes React
Adiciona import do getApiUrl e substitui fetch('/rota') por fetch(getApiUrl('rota'))
"""

import os
import re
import sys

# Diretório dos componentes
COMPONENTS_DIR = r"C:\Users\Eduardo Antonio\Desktop\site 1.3\site 1.4\frontend\src\components"

# Lista de arquivos para processar
files_to_process = [
    "AdicionarPontosForm.js",
    "ConfigProduto.js",
    "ConfiguracaoGlobal.js",
    "EditarUsuario.js",
    "Estoque.js",
    "HomePromocoes.js",
    "ListaUsuarios.js",
    "LojaPontuacao.js",
    "MeusResgates.js",
    "PainelCompraProduto.js",
    "Pedidos.js",
    "Perfil.js",
    "PixCheckout.js",
    "CreditCardCheckout.js",
    "ProdutoPontos.js",
    "Produtos.js",
    "ProdutosCadastrados.js",
    "ProdutoVenda.js",
    "ResgatesAdmin.js",
    "Usuarios.js",
    "AlterarSenha.js",
    "EditarProduto.js"
]

def add_import_if_needed(content):
    """Adiciona import do getApiUrl se não existir"""
    # Verifica se já tem o import
    if "import { getApiUrl } from '../config/api'" in content or "import { getApiUrl } from \"../config/api\"" in content:
        return content
    
    # Encontra a última linha de import
    lines = content.split('\n')
    last_import_index = -1
    
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last_import_index = i
    
    if last_import_index != -1:
        # Adiciona o import após o último import existente
        lines.insert(last_import_index + 1, "import { getApiUrl } from '../config/api';")
        return '\n'.join(lines)
    
    # Se não encontrou imports, adiciona no início
    return "import { getApiUrl } from '../config/api';\n" + content

def replace_fetch_calls(content):
    """Substitui fetch('/rota') por fetch(getApiUrl('rota'))"""
    # Padrão para encontrar fetch('/ ou fetch("/
    # Captura: fetch( + aspas + barra + caminho + aspas
    
    # Pattern 1: fetch('/rota'
    pattern1 = r"fetch\((['\"])(/[^'\"]+)\1"
    replacement1 = r"fetch(getApiUrl('\2')"
    content = re.sub(pattern1, replacement1, content)
    
    # Limpar a barra inicial que foi capturada
    content = content.replace("getApiUrl('/", "getApiUrl('")
    content = content.replace('getApiUrl("/', 'getApiUrl("')
    
    return content

def process_file(filepath):
    """Processa um arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Adiciona import
        content = add_import_if_needed(content)
        
        # Substitui chamadas fetch
        content = replace_fetch_calls(content)
        
        # Só escreve se houve mudança
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Atualizado: {os.path.basename(filepath)}")
            return True
        else:
            print(f"⏭️  Sem alterações: {os.path.basename(filepath)}")
            return False
            
    except Exception as e:
        print(f"❌ Erro em {os.path.basename(filepath)}: {e}")
        return False

def main():
    print("🔄 Iniciando atualização dos componentes...\n")
    
    updated = 0
    skipped = 0
    errors = 0
    
    for filename in files_to_process:
        filepath = os.path.join(COMPONENTS_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"⚠️  Arquivo não encontrado: {filename}")
            skipped += 1
            continue
        
        if process_file(filepath):
            updated += 1
        else:
            skipped += 1
    
    print(f"\n📊 Resumo:")
    print(f"   Atualizados: {updated}")
    print(f"   Sem alterações: {skipped}")
    print(f"   Erros: {errors}")
    print(f"\n✅ Processo concluído!")

if __name__ == "__main__":
    main()
