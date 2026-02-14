# Gerar PDF técnico do projeto do outdoor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib import pagesizes
from reportlab.lib.units import mm

# Caminho do arquivo
file_path = "Projeto_Outdoor_Estrutura_Tubo_20mm.pdf"
doc = SimpleDocTemplate(file_path, pagesize=pagesizes.A4)
elements = []

styles = getSampleStyleSheet()
title_style = styles["Heading1"]
normal_style = styles["Normal"]

# Título
elements.append(Paragraph("PROJETO TÉCNICO - ESTRUTURA OUTDOOR", title_style))
elements.append(Spacer(1, 12))

# Dados gerais
elements.append(Paragraph("<b>Dimensões Gerais:</b>", styles["Heading2"]))
elements.append(Spacer(1, 8))

data = [
    ["Altura (A)", "2,05 m"],
    ["Comprimento (C)", "3,615 m"],
    ["Material Estrutural", "Tubo metálico Ø20 mm"],
    ["Pés Laterais (2 unidades)", "1,50 m cada"],
    ["Tipo de Estrutura", "Quadro retangular com pés laterais soldados"]
]

table = Table(data, colWidths=[70*mm, 80*mm])
table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,0), (-1,-1), 10),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
]))

elements.append(table)
elements.append(Spacer(1, 20))

# Descrição estrutural
elements.append(Paragraph("<b>Descrição Estrutural:</b>", styles["Heading2"]))
elements.append(Spacer(1, 8))

descricao = """
A estrutura consiste em um quadro retangular principal formado por tubos metálicos 
de 20 mm de diâmetro externo, com dimensões totais de 2,05 m de altura por 
3,615 m de comprimento. 

Nas extremidades laterais inferiores do quadro principal, são soldados dois pés 
verticais de 1,50 m de comprimento, também confeccionados com tubo Ø20 mm. 

As conexões devem ser realizadas por soldagem MIG ou TIG, garantindo alinhamento 
perpendicular entre quadro e pés de apoio. Recomenda-se reforço com chapas 
metálicas triangulares (mão francesa) nos pontos de união entre quadro e pés 
para maior estabilidade estrutural.
"""

elements.append(Paragraph(descricao, normal_style))
elements.append(Spacer(1, 20))

# Lista de materiais
elements.append(Paragraph("<b>Lista de Materiais (Estimativa):</b>", styles["Heading2"]))
elements.append(Spacer(1, 8))

lista_materiais = [
    "02 tubos de 3,615 m (longarinas horizontais)",
    "02 tubos de 2,05 m (montantes verticais)",
    "02 tubos de 1,50 m (pés laterais)",
    "04 chapas triangulares para reforço estrutural (opcional)",
    "Material de solda compatível com aço carbono"
]

elements.append(ListFlowable(
    [ListItem(Paragraph(item, normal_style)) for item in lista_materiais],
    bulletType='bullet'
))

elements.append(Spacer(1, 20))

# Observações técnicas
elements.append(Paragraph("<b>Observações Técnicas:</b>", styles["Heading2"]))
elements.append(Spacer(1, 8))

observacoes = """
• Recomenda-se pintura anticorrosiva após soldagem.
• Verificar nivelamento do solo antes da instalação.
• Caso o outdoor seja fixado permanentemente, recomenda-se base de concreto 
para fixação dos pés.
• Todas as medidas estão em metros (m).
"""

elements.append(Paragraph(observacoes, normal_style))

# Gerar PDF
doc.build(elements)

file_path
