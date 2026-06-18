from langchain_core.documents import Document


def product_to_document(product: dict) -> Document:
    return Document(
        page_content=(
            f"Produto: {product['name']}\n"
            f"Descrição: {product['description']}\n"
            f"Preço: R$ {product['price']}\n"
            f"Estoque: {product['stock']}\n"
            f"ID: {product['id']}\n"
            f"Link: /products/{product['id']}"
        ),
        metadata={
            "type": "product",
            "product_id": product["id"],
            "name": product["name"],
        },
    )
