def extract_price(item):
    inteiro = item.find("span", class_="andes-money-amount__fraction")
    centavos = item.find("span", class_="andes-money-amount__cents")

    if not inteiro:
        return None

    price = inteiro.get_text(strip=False)
    if centavos:
        price += f",{centavos.get_text(strip=False)}"

    return price
