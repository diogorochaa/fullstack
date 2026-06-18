from src.services.knowledge_base.slug import slugify_name


def test_slugify_name_basic():
    assert slugify_name("Financeiro") == "financeiro"


def test_slugify_name_accented():
    assert slugify_name("Infraestrutura TI") == "infraestrutura-ti"


def test_slugify_name_empty():
    assert slugify_name("   ") == ""
