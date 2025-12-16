const express = require('express');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

let db;

// Resetar senha do usuário (admin)
app.put('/usuarios/:id/senha', async (req, res) => {
  const { senha } = req.body;
  if (!senha) return res.status(400).json({ erro: 'Senha obrigatória.' });
  try {
    await db.run('UPDATE usuarios SET senha = ? WHERE id = ?', [senha, req.params.id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(400).json({ erro: 'Não foi possível resetar a senha.' });
  }
});
// Editar usuário
app.put('/usuarios/:id', async (req, res) => {
  console.log('Recebido em PUT /usuarios/:id:', req.body);
  const { nome, cpf, telefone, endereco, email, tipo } = req.body;
  try {
    await db.run(
      'UPDATE usuarios SET nome = ?, cpf = ?, telefone = ?, endereco = ?, email = ?, tipo = ? WHERE id = ?',
      [nome, cpf, telefone, endereco, email, tipo || 'gerente', req.params.id]
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(400).json({ erro: 'Não foi possível atualizar. Dados já cadastrados.' });
  }
});
// Excluir usuário
app.delete('/usuarios/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(400).json({ erro: 'Não foi possível excluir.' });
  }
});

async function initDb() {
  db = await sqlite.open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  // Apagar tabela antiga de usuários se existir (para migração do id INTEGER para TEXT)
  await db.exec('DROP TABLE IF EXISTS usuarios;');
  await db.exec('DROP TABLE IF EXISTS produtos;');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      unidade TEXT,
      moeda TEXT,
      codigo_barra TEXT,
      preco REAL NOT NULL,
      estoque INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      telefone TEXT NOT NULL,
      endereco TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'gerente'
    );
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id TEXT,
      data TEXT,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
    CREATE TABLE IF NOT EXISTS pedido_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      produto_id INTEGER,
      quantidade INTEGER,
      FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY(produto_id) REFERENCES produtos(id)
    );
  `);
}

// Rotas básicas para produtos
app.get('/produtos', async (req, res) => {
  const produtos = await db.all('SELECT * FROM produtos');
  res.json(produtos);
});

app.post('/produtos', async (req, res) => {
  const { nome, descricao, unidade, moeda, codigo_barra, preco, estoque } = req.body;
  const result = await db.run(
    'INSERT INTO produtos (nome, descricao, unidade, moeda, codigo_barra, preco, estoque) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nome, descricao, unidade, moeda, codigo_barra, preco, estoque]
  );
  res.json({ id: result.lastID, nome, descricao, unidade, moeda, codigo_barra, preco, estoque });
});

// Rotas básicas para usuários
app.get('/usuarios', async (req, res) => {
  const usuarios = await db.all('SELECT * FROM usuarios');
  res.json(usuarios);
});

app.post('/usuarios', async (req, res) => {
  const { nome, cpf, telefone, endereco, email, senha, tipo } = req.body;
  // Gerar id de 6 dígitos aleatório e garantir unicidade
  let id;
  let exists = true;
  while (exists) {
    id = String(Math.floor(100000 + Math.random() * 900000));
    const user = await db.get('SELECT id FROM usuarios WHERE id = ?', [id]);
    exists = !!user;
  }
  try {
    await db.run(
      'INSERT INTO usuarios (id, nome, cpf, telefone, endereco, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nome, cpf, telefone, endereco, email, senha, tipo || 'gerente']
    );
    res.json({ id, nome, cpf, telefone, endereco, email, tipo: tipo || 'gerente' });
  } catch (err) {
    res.status(400).json({ erro: 'Não foi possível registrar. Email, CPF ou telefone já cadastrado.' });
  }
});

// Rotas básicas para pedidos
app.get('/pedidos', async (req, res) => {
  const pedidos = await db.all('SELECT * FROM pedidos');
  res.json(pedidos);
});

app.post('/pedidos', async (req, res) => {
  const { usuario_id, data, itens } = req.body;
  const pedido = await db.run('INSERT INTO pedidos (usuario_id, data) VALUES (?, ?)', [usuario_id, data]);
  const pedidoId = pedido.lastID;
  for (const item of itens) {
    await db.run('INSERT INTO pedido_itens (pedido_id, produto_id, quantidade) VALUES (?, ?, ?)', [pedidoId, item.produto_id, item.quantidade]);
  }
  res.json({ id: pedidoId, usuario_id, data, itens });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
  });
});
