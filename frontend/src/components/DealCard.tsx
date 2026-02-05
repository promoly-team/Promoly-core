import "./DealCard.css";

const API_URL = "http://127.0.0.1:8000";


type Deal = {
  produto_id: number;
  titulo: string;
  imagem_url: string;
  preco_atual: number;
  preco_anterior: number;
  desconto_pct: number;
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="card">
      <div className="card-img">
        <img
          src={deal.imagem_url}
          alt={deal.titulo}
          loading="lazy"
        />
      </div>

      <div className="card-title">
        {deal.titulo}
      </div>

      <div className="card-subtitle">
        🔻 {deal.desconto_pct}% OFF
      </div>

      <div className="card-divider" />

      <div className="card-footer">
        <div className="card-price">
          {formatBRL(deal.preco_atual)}
          <span> {formatBRL(deal.preco_anterior)}</span>
        </div>

        <a
        className="card-btn"
        href={`${API_URL}/go/${deal.produto_id}`}
        target="_blank"
        rel="noopener noreferrer"
        >
        Ver
        </a>

      </div>
    </div>
  );
}
