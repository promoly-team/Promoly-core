-- ========================
-- PLATAFORMAS
-- ========================
CREATE TABLE plataformas (
    id SERIAL PRIMARY KEY,

    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    dominio_principal TEXT NOT NULL,

    suporta_afiliado BOOLEAN NOT NULL DEFAULT true,
    tipo_afiliado TEXT,

    ativa BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- CATEGORIAS
-- ========================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,

    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    ativa BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- PRODUTOS
-- ========================
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,

    external_id TEXT NOT NULL,
    plataforma_id INTEGER NOT NULL,

    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    descricao TEXT,
    preco DOUBLE PRECISION,
    avaliacao DOUBLE PRECISION,
    vendas INTEGER,

    imagem_url TEXT,
    link_original TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'novo',
    card_hash TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE (external_id, plataforma_id),

    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
);


-- ========================
-- PRODUTO ↔ CATEGORIA
-- ========================
CREATE TABLE produto_categoria (
    produto_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,



-- ========================
-- HISTÓRICO DE PREÇO
-- ========================
CREATE TABLE produto_preco_historico (
    id SERIAL PRIMARY KEY,

    produto_id INTEGER NOT NULL,
    preco DOUBLE PRECISION NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- ========================
-- LINKS AFILIADOS
-- ========================
CREATE TABLE links_afiliados (
    id SERIAL PRIMARY KEY,

    produto_id INTEGER NOT NULL,
    plataforma_id INTEGER NOT NULL,

    url_afiliada TEXT,
    url_original TEXT,

    status TEXT NOT NULL DEFAULT 'pendente',
    tentativas INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_error TEXT,

    UNIQUE (produto_id, plataforma_id),

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
);

-- ========================
-- GRUPOS WHATSAPP
-- ========================
CREATE TABLE grupos_whatsapp (
    id SERIAL PRIMARY KEY,

    nome TEXT NOT NULL,
    identificador_externo TEXT NOT NULL UNIQUE,

    categoria_id INTEGER NOT NULL,

    cooldown_minutos INTEGER NOT NULL DEFAULT 60,
    max_envios_dia INTEGER NOT NULL DEFAULT 10,

    horario_inicio TEXT,
    horario_fim TEXT,

    ativo BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- ========================
-- ENVIOS
-- ========================
CREATE TABLE envios (
    id SERIAL PRIMARY KEY,

    produto_id INTEGER NOT NULL,
    grupo_id INTEGER NOT NULL,
    plataforma_id INTEGER NOT NULL,
    link_afiliado_id INTEGER,

    status TEXT NOT NULL DEFAULT 'pendente',

    tentativas INTEGER NOT NULL DEFAULT 0,
    erro_mensagem TEXT,

    enviado_em TIMESTAMP,
    agendado_para TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (grupo_id) REFERENCES grupos_whatsapp(id),
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id),
    FOREIGN KEY (link_afiliado_id) REFERENCES links_afiliados(id)
);

-- ========================
-- PIPELINE RUNS
-- ========================
CREATE TABLE pipeline_runs (
    id SERIAL PRIMARY KEY,
    pipeline TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

-- ========================
-- CLICKS
-- ========================
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,

    produto_id INTEGER NOT NULL,
    plataforma_id INTEGER NOT NULL,

    ip TEXT,
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
);

-- ========================
-- ÍNDICES
-- ========================
CREATE INDEX idx_clicks_produto ON clicks(produto_id);
CREATE INDEX idx_clicks_created ON clicks(created_at);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_links_status ON links_afiliados(status);
CREATE INDEX idx_envios_grupo ON envios(grupo_id);
CREATE INDEX idx_envios_produto ON envios(produto_id);
CREATE INDEX idx_envios_enviado_em ON envios(enviado_em);
CREATE INDEX idx_preco_historico_produto ON produto_preco_historico(produto_id);
CREATE INDEX idx_preco_historico_produto_data_desc
ON produto_preco_historico (produto_id, created_at DESC);
