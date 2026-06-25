from pathlib import Path


UPLOAD_BASE_DIR = Path("app/uploads")


def delete_uploaded_file(relative_file_path: str) -> str | None:
    base_dir = UPLOAD_BASE_DIR.resolve()
    target_path = (UPLOAD_BASE_DIR / relative_file_path).resolve()

    if base_dir not in target_path.parents:
        raise ValueError("Invalid file path.")

    if target_path.exists() and target_path.is_file():
        target_path.unlink()
        return str(target_path)

    return None