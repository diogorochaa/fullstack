from prometheus_client import Counter

chat_requests_total = Counter(
    "chat_requests_total",
    "Total chat requests handled",
    ["type"],
)

catalog_search_total = Counter(
    "catalog_search_total",
    "Total catalog searches triggered from chat flows",
    ["source"],
)
