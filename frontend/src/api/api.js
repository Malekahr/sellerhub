const isLocalFrontend =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalFrontend
    ? "http://127.0.0.1:8000"
    : "https://sellerhub-backend.onrender.com");

const MAX_IMAGE_WIDTH = 1400;
const MAX_IMAGE_HEIGHT = 1400;
const IMAGE_COMPRESSION_QUALITY = 0.78;
const MIN_IMAGE_SIZE_TO_COMPRESS = 450 * 1024;

export function getUploadUrl(filePath) {
  if (!filePath) {
    return "";
  }

  if (filePath.startsWith("http")) {
    return filePath;
  }

  return `${API_BASE_URL}/uploads/${filePath}`;
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function saveToken(token) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export function isLoggedIn() {
  return Boolean(getToken());
}

function isCompressibleImage(file) {
  return (
    file instanceof File &&
    file.type.startsWith("image/") &&
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
    file.size >= MIN_IMAGE_SIZE_TO_COMPRESS
  );
}

function getCompressedImageName(originalName) {
  const cleanName = String(originalName || "image").replace(/\.[^/.]+$/, "");
  return `${cleanName}.jpg`;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image."));
    };

    image.src = objectUrl;
  });
}

function calculateImageSize(width, height) {
  if (width <= MAX_IMAGE_WIDTH && height <= MAX_IMAGE_HEIGHT) {
    return {
      width,
      height,
    };
  }

  const widthRatio = MAX_IMAGE_WIDTH / width;
  const heightRatio = MAX_IMAGE_HEIGHT / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function compressImageFile(file) {
  if (!isCompressibleImage(file)) {
    return file;
  }

  try {
    const image = await loadImageFromFile(file);

    const targetSize = calculateImageSize(image.width, image.height);

    const canvas = document.createElement("canvas");
    canvas.width = targetSize.width;
    canvas.height = targetSize.height;

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const compressedBlob = await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        IMAGE_COMPRESSION_QUALITY
      );
    });

    if (!compressedBlob) {
      return file;
    }

    if (compressedBlob.size >= file.size) {
      return file;
    }

    return new File([compressedBlob], getCompressedImageName(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

async function prepareFormDataForUpload(formData) {
  if (!(formData instanceof FormData)) {
    return formData;
  }

  const compressedFormData = new FormData();

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const compressedFile = await compressImageFile(value);
      compressedFormData.append(key, compressedFile);
    } else {
      compressedFormData.append(key, value);
    }
  }

  return compressedFormData;
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.detail || "Something went wrong with the request.";

    throw new Error(message);
  }

  return data;
}

export function apiGet(path) {
  return apiRequest(path, {
    method: "GET",
  });
}

export function apiPost(path, body) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPatch(path, body) {
  return apiRequest(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function apiDelete(path) {
  return apiRequest(path, {
    method: "DELETE",
  });
}

export async function apiUpload(path, formData) {
  const preparedFormData = await prepareFormDataForUpload(formData);

  return apiRequest(path, {
    method: "POST",
    body: preparedFormData,
  });
}