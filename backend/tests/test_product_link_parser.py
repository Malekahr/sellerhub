import pytest
from fastapi import HTTPException

from app.utils.product_link_parser import parse_product_source_link


def test_parse_weidian_itemID_link():
    platform, product_id = parse_product_source_link(
        "https://weidian.com/item.html?itemID=7645188961"
    )

    assert platform == "weidian"
    assert product_id == "7645188961"


def test_parse_weidian_itemId_link():
    platform, product_id = parse_product_source_link(
        "https://weidian.com/item.html?itemId=7645188961"
    )

    assert platform == "weidian"
    assert product_id == "7645188961"


def test_parse_weidian_item_id_link():
    platform, product_id = parse_product_source_link(
        "https://weidian.com/item.html?item_id=7645188961"
    )

    assert platform == "weidian"
    assert product_id == "7645188961"


def test_parse_taobao_link():
    platform, product_id = parse_product_source_link(
        "https://item.taobao.com/item.htm?id=7645188961"
    )

    assert platform == "taobao"
    assert product_id == "7645188961"


def test_parse_tmall_link():
    platform, product_id = parse_product_source_link(
        "https://detail.tmall.com/item.htm?id=7645188961"
    )

    assert platform == "tmall"
    assert product_id == "7645188961"


def test_parse_1688_link():
    platform, product_id = parse_product_source_link(
        "https://detail.1688.com/offer/7645188961.html"
    )

    assert platform == "1688"
    assert product_id == "7645188961"


def test_parse_agent_product_link_and_ignore_other_invite_code():
    platform, product_id = parse_product_source_link(
        "https://litbuy.com/product/weidian/7645188961?inviteCode=OTHER_CODE"
    )

    assert platform == "weidian"
    assert product_id == "7645188961"


def test_reject_unsupported_platform():
    with pytest.raises(HTTPException) as error:
        parse_product_source_link(
            "https://example.com/product/amazon/7645188961"
        )

    assert error.value.status_code == 400


def test_reject_missing_product_id():
    with pytest.raises(HTTPException) as error:
        parse_product_source_link(
            "https://weidian.com/item.html"
        )

    assert error.value.status_code == 400


def test_reject_non_numeric_product_id():
    with pytest.raises(HTTPException) as error:
        parse_product_source_link(
            "https://weidian.com/item.html?itemID=abc123"
        )

    assert error.value.status_code == 400