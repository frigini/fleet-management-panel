# 🚛 Sistema de Gerenciamento de Frota

Um painel colaborativo para gerenciamento de frota com recursos de edição em tempo real, sistema de autenticação e histórico de auditoria completo.

## ✨ Funcionalidades

### 🔐 **Sistema de Autenticação Completo**
- **Login seguro** com e-mail e senha
- **Cadastro de usuários** com validação de dados
- **Recuperação de senha** via e-mail
- **Tokens JWT** com expiração configurável
- **Proteção de rotas** e dados sensíveis

### 🚛 **Gerenciamento de Frota**
- **Status em tempo real** de todos os veículos
- **Edição colaborativa** com múltiplos usuários
- **Adicionar novos veículos** com formulário completo
- **Histórico de auditoria** detalhado de todas as alterações
- **Atualizações instantâneas** via WebSocket
- **Interface moderna** e responsiva

### 📊 **Recursos Avançados**
- **Banco de dados SQLite** para persistência de dados
- **Criptografia de senhas** com bcrypt
- **Validação de formulários** em tempo real
- **Notificações de status** e feedback visual
- **Suporte completo ao português brasileiro**

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Banco de Dados**: SQLite com índices otimizados
- **Autenticação**: JWT, bcrypt, validação de e-mail
- **Tempo Real**: WebSocket com Socket.IO

## 🚀 Início Rápido (Para Usuários)

### **Opção 1: Inicialização Automática (Recomendado)**

1. **Baixe e descompacte** o projeto
2. **Clique duas vezes** no arquivo `INICIAR-SISTEMA.bat`
3. **Aguarde** a inicialização automática
4. **Acesse** http://localhost:3000 no seu navegador

### **Opção 2: Inicialização Manual**

1. **Instale o Node.js** (se não tiver): https://nodejs.org
2. **Abra duas janelas do terminal** na pasta do projeto
3. **Na primeira janela**, clique duas vezes em `iniciar-servidor.bat`
4. **Na segunda janela**, clique duas vezes em `iniciar-frontend.bat`
5. **Acesse** http://localhost:3000 no seu navegador

## 💻 Para Desenvolvedores

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]
cd fleet-management-panel

# Instale dependências do backend
cd backend
npm install

# Instale dependências do frontend
cd ../frontend
npm install
```

### Desenvolvimento
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📁 Estrutura do Projeto

```
fleet-management-panel/
├── 🎯 INICIAR-SISTEMA.bat      # Inicialização automática
├── iniciar-servidor.bat        # Inicia apenas o backend
├── iniciar-frontend.bat        # Inicia apenas o frontend
├── backend/                     # Servidor Express + Socket.IO
│   ├── src/
│   │   ├── models/             # Modelos de dados
│   │   ├── services/           # Serviços (Auth, Database)
│   │   ├── routes/             # Rotas da API
│   │   ├── middleware/         # Middlewares de autenticação
│   │   └── types/              # Tipos TypeScript
│   └── fleet_management.db     # Banco de dados SQLite
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── contexts/           # Context API (Auth)
│   │   ├── hooks/              # Hooks customizados
│   │   └── types/              # Tipos TypeScript
└── README.md                   # Este arquivo
```

## 🔐 Como Usar o Sistema

### **1. Primeiro Acesso**
1. **Execute** o sistema usando `INICIAR-SISTEMA.bat`
2. **Acesse** http://localhost:3000
3. **Clique** em "Cadastre-se" para criar sua conta
4. **Preencha** seus dados (nome, e-mail, senha)
5. **Faça login** com suas credenciais

### **2. Gerenciando a Frota**
- **Visualize** todos os veículos organizados por tipo e localização
- **Clique** no status ou observações para editar
- **Use** o botão "Adicionar Veículo" para incluir novos equipamentos
- **Acompanhe** o histórico de alterações na barra lateral

### **3. Recursos Colaborativos**
- **Múltiplos usuários** podem usar o sistema simultaneamente
- **Alterações** aparecem em tempo real para todos
- **Histórico completo** de quem fez o quê e quando

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (Backend)
```env
# Opcional - crie um arquivo .env no backend/
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
PORT=5000
```

### Banco de Dados
- **Localização**: `backend/fleet_management.db`
- **Tipo**: SQLite (arquivo único)
- **Backup**: Copie o arquivo `.db` para fazer backup
- **Reset**: Delete o arquivo `.db` para começar do zero

## 🆘 Solução de Problemas

### **Erro: "Node.js não encontrado"**
- **Solução**: Instale o Node.js em https://nodejs.org
- **Versão**: Use a versão LTS (recomendada)

### **Erro: "Porta já em uso"**
- **Solução**: Feche outros programas que usam as portas 3000 ou 5000
- **Alternativa**: Reinicie o computador

### **Erro: "Falha ao conectar"**
- **Verifique**: Se ambos os serviços (backend e frontend) estão rodando
- **Aguarde**: Alguns segundos para a inicialização completa

### **Esqueci minha senha**
- **Clique** em "Esqueceu sua senha?" na tela de login
- **Digite** seu e-mail
- **Verifique** o console do servidor para o token de reset (em desenvolvimento)

## 📝 Changelog

### **Versão 2.0** (Atual)
- ✅ Sistema de autenticação completo
- ✅ Banco de dados SQLite persistente
- ✅ Interface em português brasileiro
- ✅ Recuperação de senha
- ✅ Inicialização simplificada com arquivos .bat

### **Versão 1.0**
- ✅ Gerenciamento básico de frota
- ✅ Tempo real com WebSocket
- ✅ Histórico de auditoria
- ✅ Interface responsiva

## 🤝 Suporte

Para dúvidas ou problemas:
1. **Verifique** a seção "Solução de Problemas" acima
2. **Certifique-se** de que o Node.js está instalado
3. **Tente** reiniciar o sistema usando `INICIAR-SISTEMA.bat`

## 📄 Licença

Este projeto é de uso interno. Todos os direitos reservados.
