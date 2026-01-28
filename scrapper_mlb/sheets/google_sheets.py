import gspread
from google.oauth2.service_account import Credentials
from config import CRED_JSON, SHEET_NAME

def get_sheet():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    creds = Credentials.from_service_account_file(CRED_JSON, scopes=scopes)
    client = gspread.authorize(creds)
    return client.open(SHEET_NAME).sheet1

def save_products(sheet, products):
    sheet.clear()
    sheet.append_row([
        "Id", "Descrição", "Preço", "Avaliação", "Desconto", "Link", "Imagem"
    ])

    for p in products:
        sheet.append_row([
            p.id_produto,
            p.descricao,
            p.preco,
            p.avaliacao,
            p.desconto,
            p.link,
            p.imagem_url
        ])
