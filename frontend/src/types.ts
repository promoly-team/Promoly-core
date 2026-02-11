export type BaseProduct = {
  produto_id: number;
  slug: string;      
  titulo: string;
  imagem_url: string;
  url_afiliada: string;
};


export type Deal = BaseProduct & {
  preco_atual: number;
  preco_anterior: number;
  desconto_pct: number;
};

export type Offer = BaseProduct & {
  preco: number | null;
};

export type ProductCardData = Deal | Offer;


export type Product = BaseProduct & {
  descricao?: string;
  preco: number | null;
  avaliacao?: number;
};
