CREATE TABLE IF NOT EXISTS plataformas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    dominio_principal TEXT NOT NULL,

    suporta_afiliado INTEGER NOT NULL DEFAULT 1,
    tipo_afiliado TEXT, -- ex: link_builder, param_url, api

    ativa INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    ativa INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    external_id TEXT NOT NULL,
    plataforma_id INTEGER NOT NULL,

    titulo TEXT NOT NULL,
    descricao TEXT,
    preco REAL,
    avaliacao REAL,
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


CREATE TABLE IF NOT EXISTS produto_categoria (
    produto_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (produto_id, categoria_id),

    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS produto_preco_historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    produto_id INTEGER NOT NULL,
    preco REAL NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS links_afiliados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    produto_id INTEGER NOT NULL,
    plataforma_id INTEGER NOT NULL,

    url_afiliada TEXT,
    url_original TEXT,

    status TEXT NOT NULL DEFAULT 'pendente',
    tentativas INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE (produto_id, plataforma_id),

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
);



CREATE TABLE IF NOT EXISTS grupos_whatsapp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,
    identificador_externo TEXT NOT NULL UNIQUE,

    categoria_id INTEGER NOT NULL,

    cooldown_minutos INTEGER NOT NULL DEFAULT 60,
    max_envios_dia INTEGER NOT NULL DEFAULT 10,

    horario_inicio TEXT, -- ex: '08:00'
    horario_fim TEXT,    -- ex: '22:00'

    ativo INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS envios_meta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    produto_id INTEGER NOT NULL,
    plataforma_id INTEGER NOT NULL,

    tipo_post TEXT NOT NULL, -- feed, reel, story

    status TEXT NOT NULL DEFAULT 'pendente',
    tentativas INTEGER NOT NULL DEFAULT 0,
    erro_mensagem TEXT,

    post_id_externo TEXT, -- ID retornado pela Meta API

    publicado_em TIMESTAMP,
    agendado_para TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
);


CREATE TABLE IF NOT EXISTS envios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

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

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    produto_id INTEGER NOT NULL,
    plataforma_id INTEGER NOT NULL,

    ip TEXT,
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
);

CREATE INDEX idx_clicks_produto
ON clicks(produto_id);

CREATE INDEX idx_clicks_created
ON clicks(created_at);


CREATE INDEX idx_envios_meta_status ON envios_meta(status);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_links_status ON links_afiliados(status);
CREATE INDEX idx_envios_grupo ON envios(grupo_id);
CREATE INDEX idx_envios_produto ON envios(produto_id);
CREATE INDEX idx_envios_enviado_em ON envios(enviado_em);
CREATE INDEX idx_preco_historico_produto ON produto_preco_historico(produto_id);
CREATE UNIQUE INDEX idx_produtos_slug ON produtos(slug);
CREATE INDEX idx_produtos_descricao_fts
ON produtos
USING gin (to_tsvector('portuguese', descricao));
CREATE INDEX idx_produto_categoria_produto
ON produto_categoria (produto_id);

CREATE INDEX idx_produto_categoria_categoria
ON produto_categoria (categoria_id);
