from config import URL
from services.product_service import collect_products
from sheets.google_sheets import get_sheet, save_products

def main():
    products = collect_products(URL)
    sheet = get_sheet()
    save_products(sheet, products)
    print(f"✅ {len(products)} produtos enviados!")

if __name__ == "__main__":
    main()