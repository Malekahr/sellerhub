from urllib.parse import quote

from app.config import settings


def build_original_product_url(platform: str | None, product_id: str | None) -> str | None:
    if not platform or not product_id:
        return None

    if platform == "weidian":
        return f"https://weidian.com/item.html?itemID={product_id}"

    if platform == "taobao":
        return f"https://item.taobao.com/item.htm?id={product_id}"

    if platform == "tmall":
        return f"https://detail.tmall.com/item.htm?id={product_id}"

    if platform == "1688":
        return f"https://detail.1688.com/offer/{product_id}.html"

    return None


def build_kakobuy_affiliate_url(platform: str | None, product_id: str | None) -> str | None:
    if not settings.kakobuy_affiliate_code:
        return None

    original_url = build_original_product_url(
        platform=platform,
        product_id=product_id
    )

    if not original_url:
        return None

    encoded_original_url = quote(original_url, safe="")

    return (
        "https://www.kakobuy.com/item/details"
        f"?url={encoded_original_url}"
        f"&affcode={settings.kakobuy_affiliate_code}"
    )


def build_agent_links(platform: str | None, product_id: str | None) -> list[dict[str, str]]:
    agent_links = []

    kakobuy_url = build_kakobuy_affiliate_url(
        platform=platform,
        product_id=product_id
    )

    if kakobuy_url:
        agent_links.append(
            {
                "agent": "kakobuy",
                "label": "Open with Kakobuy",
                "url": kakobuy_url
            }
        )

    return agent_links