from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urlparse
from urllib.request import Request, urlopen

from app.config import settings


UPLOAD_BASE_DIR = Path("app/uploads")


def _supabase_storage_is_configured() -> bool:
    return bool(
        settings.supabase_url
        and settings.supabase_service_role_key
        and settings.supabase_storage_bucket
    )


def _get_supabase_headers(content_type: str | None = None) -> dict[str, str]:
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
    }

    if content_type:
        headers["Content-Type"] = content_type

    return headers


def _get_public_storage_url(storage_path: str) -> str:
    encoded_path = "/".join(
        quote(path_part)
        for path_part in storage_path.split("/")
    )

    return (
        f"{settings.supabase_url}/storage/v1/object/public/"
        f"{settings.supabase_storage_bucket}/{encoded_path}"
    )


def _extract_storage_path(file_path: str) -> str:
    if not file_path.startswith("http"):
        return file_path

    parsed_url = urlparse(file_path)
    marker = f"/storage/v1/object/public/{settings.supabase_storage_bucket}/"

    if marker not in parsed_url.path:
        return file_path

    storage_path = parsed_url.path.split(marker, 1)[1]

    return unquote(storage_path)


def upload_file_to_supabase_storage(
    file_bytes: bytes,
    filename: str,
    content_type: str
) -> str:
    if not _supabase_storage_is_configured():
        raise RuntimeError("Supabase Storage is not configured.")

    storage_path = f"seller_images/{filename}"

    encoded_path = "/".join(
        quote(path_part)
        for path_part in storage_path.split("/")
    )

    upload_url = (
        f"{settings.supabase_url}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{encoded_path}"
    )

    headers = _get_supabase_headers(content_type=content_type)
    headers["x-upsert"] = "false"

    request = Request(
        upload_url,
        data=file_bytes,
        headers=headers,
        method="POST"
    )

    try:
        with urlopen(request, timeout=30) as response:
            if response.status not in (200, 201):
                raise RuntimeError("Upload to Supabase Storage failed.")
    except HTTPError as error:
        error_body = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(
            f"Upload to Supabase Storage failed: {error.code} {error_body}"
        ) from error
    except URLError as error:
        raise RuntimeError(
            "Upload to Supabase Storage failed: network error."
        ) from error

    return _get_public_storage_url(storage_path)


def delete_uploaded_file(file_path: str) -> str | None:
    if not file_path:
        return None

    if _supabase_storage_is_configured() and file_path.startswith("http"):
        storage_path = _extract_storage_path(file_path)

        if not storage_path or storage_path.startswith("http"):
            return None

        encoded_path = "/".join(
            quote(path_part)
            for path_part in storage_path.split("/")
        )

        delete_url = (
            f"{settings.supabase_url}/storage/v1/object/"
            f"{settings.supabase_storage_bucket}/{encoded_path}"
        )

        request = Request(
            delete_url,
            headers=_get_supabase_headers(),
            method="DELETE"
        )

        try:
            with urlopen(request, timeout=30) as response:
                if response.status in (200, 204):
                    return storage_path

                return None
        except HTTPError:
            return None
        except URLError:
            return None

    base_dir = UPLOAD_BASE_DIR.resolve()
    target_path = (UPLOAD_BASE_DIR / file_path).resolve()

    if base_dir not in target_path.parents:
        raise ValueError("Invalid file path.")

    if target_path.exists() and target_path.is_file():
        target_path.unlink()
        return str(target_path)

    return None