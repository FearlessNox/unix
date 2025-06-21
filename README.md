# 🐦 Unix - Rede Social Fullstack

Uma rede social moderna desenvolvida com React, TypeScript, Tailwind CSS e Node.js, hospedada na Vercel com Supabase como banco de dados.

## 🚀 Funcionalidades

### ✅ **Sistema de Usuários**
- Registro de usuários com validação
- Login com JWT
- Perfis com nome, nickname e email
- Sessões persistentes

### ✅ **Sistema de Posts (Tweets)**
- Criação de posts com limite de caracteres
- Feed principal com posts em tempo real
- Páginas de detalhes individuais
- Formatação de datas em português

### ✅ **Sistema de Comentários**
- Comentários em posts individuais
- Formulário de comentário integrado
- Lista de comentários com avatares
- Contagem de comentários no feed

### ✅ **Sistema de Likes**
- Like/deslike de posts
- Limite de 1 like por usuário por post
- Contador em tempo real
- Estado visual (coração preenchido/vazio)

### ✅ **Interface Moderna**
- Design responsivo com Tailwind CSS
- Componentes shadcn/ui
- Animações e transições suaves
- Loading states e feedback visual

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI
- **React Router** - Navegação
- **date-fns** - Formatação de datas
- **Sonner** - Toast notifications

### **Backend**
- **Node.js** - Runtime JavaScript
- **Vercel Functions** - Serverless API
- **Supabase** - Banco de dados PostgreSQL
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas

### **Deploy**
- **Vercel** - Hospedagem frontend e backend
- **GitHub** - Versionamento

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta na Vercel

## 🔧 Instalação

### 1. **Clone o repositório**
```bash
git clone https://github.com/FearlessNox/unix.git
cd unix
```

### 2. **Instale as dependências**
```bash
npm install
```

### 3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Backend (para desenvolvimento local)
VITE_API_URL=http://localhost:3000/api
```

### 4. **Configure o Supabase**

No painel do Supabase, crie as seguintes tabelas:

#### **Tabela `users`**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabela `tweets`**
```sql
CREATE TABLE tweets (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabela `comments`**
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tweet_id INTEGER REFERENCES tweets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabela `likes`**
```sql
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tweet_id INTEGER REFERENCES tweets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tweet_id)
);
```

### 5. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🚀 Deploy na Vercel

### 1. **Configure as variáveis de ambiente na Vercel**

No painel da Vercel, adicione as seguintes variáveis:

```env
# Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase

# JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_segura
```

### 2. **Deploy automático**

Conecte seu repositório GitHub à Vercel. O deploy será automático a cada push.

### 3. **Configuração do domínio**

A Vercel fornecerá um domínio automático. Você pode configurar um domínio personalizado nas configurações do projeto.

## 📡 Endpoints da API

### **Autenticação**

#### `POST /api/createUser`
Cria um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "nickname": "joaosilva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "nickname": "joaosilva",
    "email": "joao@email.com"
  }
}
```

#### `POST /api/login`
Autentica um usuário.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "nickname": "joaosilva",
    "email": "joao@email.com"
  },
  "token": "jwt_token_aqui"
}
```

### **Posts (Tweets)**

#### `GET /api/getTweets`
Retorna todos os posts com contagem de comentários e likes.

**Response:**
```json
{
  "tweets": [
    {
      "id": 1,
      "content": "Meu primeiro post!",
      "created_at": "2024-01-15T10:30:00Z",
      "users": {
        "id": 1,
        "name": "João Silva",
        "nickname": "joaosilva"
      },
      "comments": [{"count": 2}],
      "likes": [{"count": 5}]
    }
  ]
}
```

#### `POST /api/createTweet`
Cria um novo post (requer autenticação).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Body:**
```json
{
  "content": "Meu novo post!"
}
```

#### `GET /api/getTweet`
Retorna um post específico.

**Query:**
```
?id=1
```

### **Comentários**

#### `POST /api/createComment`
Cria um comentário (requer autenticação).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Body:**
```json
{
  "content": "Ótimo post!",
  "tweet_id": 1
}
```

#### `GET /api/getComments`
Retorna comentários de um post.

**Query:**
```
?tweet_id=1
```

### **Likes**

#### `POST /api/likeTweet`
Curtir um post (requer autenticação).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Body:**
```json
{
  "tweet_id": 1
}
```

#### `DELETE /api/unlikeTweet`
Descurtir um post (requer autenticação).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Query:**
```
?tweet_id=1
```

#### `GET /api/checkLike`
Verifica se o usuário curtiu um post (requer autenticação).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Query:**
```
?tweet_id=1
```

**Response:**
```json
{
  "liked": true
}
```

## 💡 Exemplos de Uso

### **Criar um usuário**
```javascript
const response = await fetch('/api/createUser', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'João Silva',
    nickname: 'joaosilva',
    email: 'joao@email.com',
    password: 'senha123'
  })
});

const data = await response.json();
console.log(data.user);
```

### **Fazer login**
```javascript
const response = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'joao@email.com',
    password: 'senha123'
  })
});

const data = await response.json();
localStorage.setItem('authToken', data.token);
localStorage.setItem('userData', JSON.stringify(data.user));
```

### **Criar um post**
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('/api/createTweet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    content: 'Meu novo post!'
  })
});

const data = await response.json();
console.log(data.tweet);
```

### **Curtir um post**
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('/api/likeTweet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tweet_id: 1
  })
});

if (response.ok) {
  console.log('Post curtido!');
}
```

## 🏗️ Estrutura do Projeto

```
unix/
├── api/                    # Backend (Vercel Functions)
│   ├── models/            # Modelos de dados
│   │   ├── lib/           # Configurações (Supabase)
│   │   └── index.js       # API principal
│   ├── src/               # Frontend
│   │   ├── components/    # Componentes React
│   │   │   ├── ui/        # Componentes shadcn/ui
│   │   │   ├── Feed.tsx   # Feed principal
│   │   │   ├── Header.tsx # Cabeçalho
│   │   │   └── ...
│   │   │   
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks personalizados
│   │   └── lib/           # Utilitários
│   ├── public/            # Arquivos estáticos
│   └── package.json       # Dependências
└── README.md              # Documentação
```

## 🔒 Segurança

- **Senhas criptografadas** com bcrypt
- **Autenticação JWT** para rotas protegidas
- **Validação de dados** no backend
- **CORS configurado** para produção
- **Rate limiting** implícito da Vercel

## 🚀 Performance

- **Build otimizado** com Vite
- **Code splitting** automático
- **Lazy loading** de componentes
- **Cache de API** no frontend
- **CDN global** da Vercel

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**FearlessNox**
- GitHub: [@FearlessNox](https://github.com/FearlessNox)

## 🙏 Agradecimentos

- [Vercel](https://vercel.com) pela hospedagem
- [Supabase](https://supabase.com) pelo banco de dados
- [shadcn/ui](https://ui.shadcn.com) pelos componentes
- [Tailwind CSS](https://tailwindcss.com) pelo framework CSS
