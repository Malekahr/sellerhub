from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.models.user import User
from app.routes import admin_routes, auth_routes, user_routes
from app.models.user import User
from app.models.seller_review import SellerReview
from app.models.seller_review_product import SellerReviewProduct
from app.models.seller_product_image import SellerProductImage
from app.models.group import Group, GroupMember
from app.routes import admin_routes, auth_routes, group_routes, seller_routes, user_routes




Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{settings.app_name} API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory="app/uploads"),
    name="uploads"
)


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
app.include_router(seller_routes.router)
app.include_router(group_routes.router)



@app.get("/")
def root():
    return {
        "message": f"{settings.app_name} backend is running",
        "environment": settings.app_env
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }