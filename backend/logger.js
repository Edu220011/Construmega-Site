const fs = require('fs').promises;
const path = require('path');

// Diretório de logs
const LOG_DIR = path.join(__dirname, 'logs');

// Níveis de log
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Criar diretório de logs se não existir
async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (err) {
    // Diretório já existe ou erro ao criar
  }
}

// Função para formatar mensagem de log
function formatLog(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    // Sanitizar dados sensíveis antes de logar
    const sanitizedData = sanitizeData(data);
    logMessage += ` | Data: ${JSON.stringify(sanitizedData)}`;
  }
  
  return logMessage;
}

// Sanitizar dados sensíveis
function sanitizeData(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sanitized = { ...data };
  const sensitiveKeys = ['senha', 'password', 'token', 'accessToken', 'secret', 'cpf', 'email'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Escrever log em arquivo
async function writeLog(level, message, data = null) {
  try {
    await ensureLogDir();
    
    const logMessage = formatLog(level, message, data);
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${today}.log`);
    
    await fs.appendFile(logFile, logMessage + '\n');
    
    // Em desenvolvimento, também mostrar no console
    if (process.env.NODE_ENV !== 'production') {
      console.log(logMessage);
    }
  } catch (err) {
    // Fallback para console se não conseguir escrever arquivo
    console.error('Erro ao escrever log:', err);
  }
}

// Exportar funções de log por nível
const logger = {
  error: (message, data) => writeLog(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => writeLog(LOG_LEVELS.WARN, message, data),
  info: (message, data) => writeLog(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => writeLog(LOG_LEVELS.DEBUG, message, data)
};

module.exports = logger;
