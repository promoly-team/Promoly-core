-- =====================================================
-- Schema de teste para a API (PostgreSQL).
--
-- Reconstrói apenas as tabelas consultadas pela camada API
-- (routers/services), com sintaxe Postgres válida. Independente
-- do schema_postgres.sql do repo (que está quebrado) e do alembic.
--
-- Mantido em sincronia manual com:
--   - schema_postgres.sql (tabelas base)
--   - migrations/versions/* (subcategorias, twitter_posts, etc.)
-- =====================================================

DROP TABLE IF EXISTS pipeline_runs CASCADE;
DROP TABLE IF EXISTS twitter_posts CASCADE;
DROP TABLE IF EXISTS clicks CASCADE;
DROP TABLE IF EXISTS links_afiliados CASCADE;
DROP TABLE IF EXISTS produto_subcategoria CASCADE;
DROP TABLE IF EXISTS produto_categoria CASCADE;
DROP TABLE IF EXISTS produto_preco_historico CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS subcategorias CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS plataformas CASCADE;

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

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    ativa BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subcategorias (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    external_id TEXT NOT NULL,
    plataforma_id INTEGER NOT NULL REFERENCES plataformas(id),
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
    UNIQUE (external_id, plataforma_id)
);

CREATE TABLE produto_categoria (
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (produto_id, categoria_id)
);

CREATE TABLE produto_subcategoria (
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    subcategoria_id INTEGER NOT NULL REFERENCES subcategorias(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (produto_id, subcategoria_id)
);

CREATE TABLE produto_preco_historico (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    preco DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE links_afiliados (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    plataforma_id INTEGER NOT NULL REFERENCES plataformas(id),
    url_afiliada TEXT,
    url_original TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    tentativas INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_error TEXT,
    UNIQUE (produto_id, plataforma_id)
);

CREATE TABLE twitter_posts (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL,
    categoria_slug TEXT,
    subcategoria_slug TEXT,
    tipo_post TEXT NOT NULL,
    copy_type TEXT,
    tweet_text TEXT,
    publicado BOOLEAN NOT NULL DEFAULT false,
    publicado_em TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- plataforma_id removido na migration 96eee3aa7ce5.
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    twitter_post_id INTEGER REFERENCES twitter_posts(id),
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pipeline_runs (
    id SERIAL PRIMARY KEY,
    pipeline TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

-- =====================================================
-- VIEW produtos_publicos
--
-- A view não está versionada no repo (existe só no banco
-- de produção). Reconstruída aqui a partir do uso na camada
-- de serviço: produtos ativos com link afiliado válido,
-- expondo url_afiliada.
-- =====================================================
CREATE VIEW produtos_publicos AS
SELECT
    p.id,
    p.external_id,
    p.plataforma_id,
    p.titulo,
    p.slug,
    p.descricao,
    p.preco,
    p.avaliacao,
    p.vendas,
    p.imagem_url,
    p.link_original,
    p.status,
    p.card_hash,
    p.created_at,
    p.updated_at,
    la.url_afiliada
FROM produtos p
JOIN links_afiliados la
    ON la.produto_id = p.id
    AND la.status = 'ok'
    AND la.url_afiliada IS NOT NULL
    AND la.url_afiliada != ''
WHERE p.status = 'ativo';
