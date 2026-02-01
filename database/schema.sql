CREATE TABLE plataformas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    dominio_principal TEXT NOT NULL,

    suporta_afiliado INTEGER NOT NULL DEFAULT 1,
    tipo_afiliado TEXT, -- ex: link_builder, param_url, api

    ativa INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    ativa INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    external_id TEXT NOT NULL,
    plataforma_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,

    titulo TEXT NOT NULL,
    descricao TEXT,
    preco REAL,
    avaliacao REAL,
    vendas INTEGER,

    imagem_url TEXT,
    link_original TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'novo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE (external_id, plataforma_id),

    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);



CREATE TABLE links_afiliados (
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



CREATE TABLE grupos_whatsapp (
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



CREATE TABLE envios (
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



CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_links_status ON links_afiliados(status);
CREATE INDEX idx_envios_grupo ON envios(grupo_id);
CREATE INDEX idx_envios_produto ON envios(produto_id);
CREATE INDEX idx_envios_enviado_em ON envios(enviado_em);

