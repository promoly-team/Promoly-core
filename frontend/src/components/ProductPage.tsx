import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchProduct, fetchPrices } from "../services/api";
import type { Product } from "../types";
import "./ProductPage.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* =========================
   FEATURE FLAG
========================= */

const ENABLE_TIME_RANGE_ZOOM = false;

type PriceHistoryItem = {
  preco: number;
  data: number; // timestamp
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [similares, setSimilares] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("all");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchProduct(Number(id)),
      fetchPrices(Number(id)),
    ])
      .then(([productData, prices]) => {
        setProduct(productData.produto);
        setSimilares(productData.similares);

        const normalized: PriceHistoryItem[] = prices
          .map((p) => ({
            preco: p.preco,
            data: new Date(p.data).getTime(),
          }))
          .sort((a, b) => a.data - b.data);

        setPriceHistory(normalized);
      })
      .catch((err: unknown) => {
        console.error(err);
        setError("Não foi possível carregar o produto");
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* =========================
     CÁLCULO DOMÍNIO X (ZOOM)
  ========================= */

  const lastDate = useMemo(() => {
    if (priceHistory.length === 0) return 0;
    return priceHistory[priceHistory.length - 1].data;
  }, [priceHistory]);

  const xDomain = useMemo(() => {
    if (!ENABLE_TIME_RANGE_ZOOM) return ["auto", "auto"];

    if (range === "all" || !lastDate) return ["auto", "auto"];

    const daysMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };

    const days = daysMap[range];
    const cutoff = new Date(lastDate);
    cutoff.setDate(cutoff.getDate() - days);

    return [cutoff.getTime(), lastDate];
  }, [range, lastDate]);

  /* =========================
     DOMÍNIO Y
  ========================= */

  const maxPrice =
    priceHistory.length > 0
      ? Math.max(...priceHistory.map((p) => p.preco))
      : 0;

  const minPrice =
    priceHistory.length > 0
      ? Math.min(...priceHistory.map((p) => p.preco))
      : 0;

  const padding = Math.max(maxPrice * 0.05, 20);

  const upperDomain = maxPrice + padding;
  const lowerDomain = Math.max(0, minPrice - padding);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copiado!");
  };

  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Produto não encontrado.</p>;

  return (
    <div className="product-page">
      <section className="product-main">
        <img
          src={product.imagem_url}
          alt={product.titulo}
          className="product-image"
        />

        <div className="product-header">
          <h1>{product.titulo}</h1>
          <span className="product-id">
            ID: {product.produto_id}
          </span>
        </div>

        {product.avaliacao && (
          <div className="rating">
            ⭐ {product.avaliacao}
          </div>
        )}

        {product.categorias && product.categorias.length > 0 && (
          <div className="categories">
            {product.categorias.map((cat, index) => (
              <span
                key={`${cat}-${index}`}
                className="category-tag"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {product.preco !== null && (
          <div className="price">
            {product.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        {product.descricao && (
          <p className="description">
            {product.descricao}
          </p>
        )}

        <div className="action-buttons">
          <a
            href={product.url_afiliada}
            target="_blank"
            rel="noopener noreferrer"
            className="buy-btn big"
          >
            Ver oferta
          </a>

          <button
            onClick={copyLink}
            className="secondary-btn"
          >
            Copiar link
          </button>
        </div>

        {/* =========================
           GRÁFICO
        ========================= */}

        {priceHistory.length > 0 && (
          <div className="price-chart-wrapper">
            <div className="price-chart">
              <h2 className="price-chart-title">
                Histórico do preço
              </h2>

              {/* 🔘 Botões só aparecem se feature flag ativada */}
              {ENABLE_TIME_RANGE_ZOOM && (
                <div className="chart-range-selector">
                  {["7d", "30d", "90d", "all"].map(
                    (option) => (
                      <button
                        key={option}
                        className={`range-btn ${
                          range === option
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setRange(option as any)
                        }
                      >
                        {option === "all"
                          ? "Tudo"
                          : option}
                      </button>
                    )
                  )}
                </div>
              )}

              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />

                  {ENABLE_TIME_RANGE_ZOOM ? (
                    <XAxis
                      dataKey="data"
                      type="number"
                      scale="time"
                      domain={xDomain}
                      tickFormatter={(timestamp) =>
                        new Date(timestamp as number).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                          }
                        )
                      }
                    />
                  ) : (
                    <XAxis
                      dataKey="data"
                      tickFormatter={(timestamp) =>
                        new Date(timestamp as number).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                          }
                        )
                      }
                    />
                  )}


                  <YAxis
                    width={60}
                    domain={[
                      lowerDomain,
                      upperDomain,
                    ]}
                    tickFormatter={(value) =>
                      (value as number).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        }
                      )
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      (value as number).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )
                    }
                    labelFormatter={(label) =>
                      new Date(
                        label as number
                      ).toLocaleDateString("pt-BR")
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="preco"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* =========================
         SIMILARES
      ========================= */}

      {similares.length > 0 && (
        <aside className="product-aside">
          <h3>Produtos semelhantes</h3>

          <div className="similar-grid">
            {similares.map((p, index) => (
              <div
                key={`${p.produto_id}-${index}`}
                className="similar-card"
                onClick={() =>
                  (window.location.href = `/produto/${p.produto_id}`)
                }
              >
                <img
                  src={p.imagem_url}
                  alt={p.titulo}
                  className="similar-image"
                />

                <div className="similar-info">
                  <div className="similar-title">
                    {p.titulo}
                  </div>

                  {p.preco !== null && (
                    <div className="similar-price">
                      {p.preco.toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}
                    </div>
                  )}

                  {p.avaliacao && (
                    <div className="similar-rating">
                      ⭐ {p.avaliacao}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
