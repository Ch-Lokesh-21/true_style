from fastapi import APIRouter
from app.api.routers import (
    auth, users,
    brands, product_types, occasions, categories, review_status, order_status,
    return_status, exchange_status,
    hero_images, hero_images_mobile, cards_1, cards_2, how_it_works, testimonials, about, policies, faq,
    terms_and_conditions, store_details, products, product_images, wishlist_items,
    cart_items, user_address, orders, order_items, user_reviews, user_ratings,
    returns, exchanges,
    backup_logs, restore_logs , files, address , contact_us, logs, dashboard
)
from app.core.config import settings

router = APIRouter()
prefix = settings.API_V1_PREFIX

router.include_router(auth.router, prefix=f"{prefix}/auth", tags=["Auth"])
router.include_router(users.router, prefix=f"{prefix}/users", tags=["Users"])
router.include_router(files.router, prefix=f"{prefix}/files", tags=["Files"])
router.include_router(brands.router, prefix=f"{prefix}/brands", tags=["Utility"])
router.include_router(product_types.router, prefix=f"{prefix}/product-types", tags=["Utility","Product-Types"])
router.include_router(occasions.router, prefix=f"{prefix}/occasions", tags=["Utility"])
router.include_router(categories.router, prefix=f"{prefix}/categories", tags=["Utility"])
router.include_router(review_status.router, prefix=f"{prefix}/review-status", tags=["Utility"])
router.include_router(order_status.router, prefix=f"{prefix}/order-status", tags=["Utility"])
router.include_router(return_status.router, prefix=f"{prefix}/return-status", tags=["Utility"])
router.include_router(exchange_status.router, prefix=f"{prefix}/exchange-status", tags=["Utility"])

router.include_router(hero_images.router, prefix=f"{prefix}/hero-images", tags=["Content"])
router.include_router(hero_images_mobile.router, prefix=f"{prefix}/hero-images-mobile", tags=["Content"])
router.include_router(cards_1.router, prefix=f"{prefix}/cards-1", tags=["Content"])
router.include_router(cards_2.router, prefix=f"{prefix}/cards-2", tags=["Content"])
router.include_router(how_it_works.router, prefix=f"{prefix}/how-it-works", tags=["Content"])
router.include_router(testimonials.router, prefix=f"{prefix}/testimonials", tags=["Content"])
router.include_router(about.router, prefix=f"{prefix}/about", tags=["Content"])
router.include_router(policies.router, prefix=f"{prefix}/policies", tags=["Content"])
router.include_router(faq.router, prefix=f"{prefix}/faq", tags=["Content"])
router.include_router(terms_and_conditions.router, prefix=f"{prefix}/terms", tags=["Content"])
router.include_router(store_details.router, prefix=f"{prefix}/store-details", tags=["Content"])

router.include_router(products.router, prefix=f"{prefix}/products", tags=["Products"])
router.include_router(product_images.router, prefix=f"{prefix}/product-images", tags=["Products"])
router.include_router(wishlist_items.router, prefix=f"{prefix}/wishlist-items", tags=["Wishlists"])
router.include_router(cart_items.router, prefix=f"{prefix}/cart-items", tags=["Carts"])
router.include_router(user_address.router, prefix=f"{prefix}/user-address", tags=["Users"])
router.include_router(address.router, prefix=f"{prefix}/address", tags=["Users"])
router.include_router(orders.router, prefix=f"{prefix}/orders", tags=["Orders"])
router.include_router(order_items.router, prefix=f"{prefix}/order-items", tags=["Orders"])
router.include_router(user_reviews.router, prefix=f"{prefix}/user-reviews", tags=["Reviews"])
router.include_router(user_ratings.router, prefix=f"{prefix}/user-ratings", tags=["Ratings"])
router.include_router(returns.router, prefix=f"{prefix}/returns", tags=["Returns"])
router.include_router(exchanges.router, prefix=f"{prefix}/exchanges", tags=["Exchanges"])
router.include_router(backup_logs.router, prefix=f"{prefix}/backup-logs", tags=["Backup"])
router.include_router(restore_logs.router, prefix=f"{prefix}/restore-logs", tags=["Restore"])
router.include_router(contact_us.router, prefix=f"{prefix}/contact-us", tags=["Contact Us"])
router.include_router(logs.router, prefix=f"{prefix}/logs", tags=["Logs"])
router.include_router(dashboard.router, prefix=f"{prefix}/dashboard", tags=["Dashboard"])