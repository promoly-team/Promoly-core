from database.repositories.categoria_repository import CategoriaRepository
from database.repositories.plataforma_repository import PlataformaRepository

repo = CategoriaRepository()

repo.create("Eletrônicos", "eletronicos")
repo.create("Casa", "casa")
repo.create("Pet", "pet")

repo.close()

print("✅ Categorias criadas")

repo = PlataformaRepository()

repo.create(
    nome="Mercado Livre",
    slug="mercado_livre",
    dominio_principal="mercadolivre.com.br",
    suporta_afiliado=True,
    tipo_afiliado="link_builder",
)

repo.close()

print("✅ Plataforma Mercado Livre criada")
