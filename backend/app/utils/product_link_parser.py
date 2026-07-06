from urllib.parse import parse_qs, urlparse

from fastapi import HTTPException, status


ALLOWED_PRODUCT_PLATFORMS = {
    "weidian",
    "taobao",
    "tmall",
    "1688",
}


def parse_product_source_link(product_link: str) -> tuple[str, str]:
    """
    Parse a product/source link and return only:
    - platform
    - product_id

    We never store full affiliate URLs.
    """

    if not product_link or not product_link.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product link is required."
        )

    cleaned_link = product_link.strip()

    parsed_url = urlparse(cleaned_link)
    hostname = parsed_url.hostname or ""
    path = parsed_url.path or ""
    query_params = parse_qs(parsed_url.query)

    hostname = hostname.lower()

    # Agent links:
    # {agent}.com/product/{platform}/{id}
    # Example: litbuy.com/product/weidian/7645188961?inviteCode=XXX
    path_parts = [
        part
        for part in path.strip("/").split("/")
        if part
    ]

    if len(path_parts) >= 3 and path_parts[0] == "product":
        platform = path_parts[1].lower()
        product_id = path_parts[2]

        return _validate_parsed_product(platform, product_id)

    # Weidian:
    # weidian.com/item.html?itemID=123456
    if "weidian.com" in hostname:
        product_id = _get_first_query_value(
            query_params,
            ["itemID", "itemId", "item_id"]
        )

        return _validate_parsed_product("weidian", product_id)

    # Taobao:
    # item.taobao.com/item.htm?id=123456
    if hostname == "item.taobao.com":
        product_id = _get_first_query_value(query_params, ["id"])

        return _validate_parsed_product("taobao", product_id)

    # Tmall:
    # detail.tmall.com/item.htm?id=123456
    if hostname == "detail.tmall.com":
        product_id = _get_first_query_value(query_params, ["id"])

        return _validate_parsed_product("tmall", product_id)

    # 1688:
    # detail.1688.com/offer/123456.html
    if hostname == "detail.1688.com":
        path_parts = [
            part
            for part in path.strip("/").split("/")
            if part
        ]

        if len(path_parts) >= 2 and path_parts[0] == "offer":
            product_id = path_parts[1].replace(".html", "")

            return _validate_parsed_product("1688", product_id)

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported product link. Only Weidian, Taobao, Tmall and 1688 links are supported."
    )


def _get_first_query_value(
    query_params: dict[str, list[str]],
    accepted_keys: list[str]
) -> str | None:
    for key in accepted_keys:
        values = query_params.get(key)

        if values and values[0]:
            return values[0]

    return None


def _validate_parsed_product(
    platform: str | None,
    product_id: str | None
) -> tuple[str, str]:
    if not platform or platform not in ALLOWED_PRODUCT_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported product platform."
        )

    if not product_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product ID could not be found in the link."
        )

    cleaned_product_id = str(product_id).strip()

    if not cleaned_product_id.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product ID must be numeric."
        )

    return platform, cleaned_product_id