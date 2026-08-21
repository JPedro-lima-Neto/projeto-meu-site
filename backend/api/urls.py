from django.urls import (
    path,
    include,
)

from rest_framework.routers import (
    DefaultRouter
)

from .views import (
    PlatformViewSet,
    GameCatalogViewSet,
    UserGameEntryViewSet,
    UserOwnedGameViewSet,
    PokemonViewSet,
    UserPokemonViewSet,
    PokemonHallOfFameViewSet,
    ConsoleViewSet,
    BoardGameViewSet,
    BoardGameCatalogViewSet,
    UserBoardGameViewSet,
    UserProfileViewSet,
    AchievementViewSet,
    CustomAuthToken,
)


router = DefaultRouter()


router.register(
    r'platforms',
    PlatformViewSet
)

router.register(
    r'library',
    UserGameEntryViewSet,
    basename='library'
)

router.register(
    r'owned-games',
    UserOwnedGameViewSet,
    basename='owned-games'
)

router.register(
    r'catalog',
    GameCatalogViewSet
)

router.register(
    r'profiles',
    UserProfileViewSet
)

router.register(
    r'achievements',
    AchievementViewSet,
    basename='achievements'
)

router.register(
    r'consoles',
    ConsoleViewSet,
    basename='consoles'
)


# =========================================================
# BOARD GAMES - MODELO ANTIGO
# =========================================================

router.register(
    r'boardgames',
    BoardGameViewSet,
    basename='boardgames'
)


# =========================================================
# BOARD GAMES - NOVO CATÁLOGO / BGG
# =========================================================

router.register(
    r'boardgame-catalog',
    BoardGameCatalogViewSet,
    basename='boardgame-catalog'
)


# =========================================================
# BOARD GAMES - COLEÇÃO DO USUÁRIO
# =========================================================

router.register(
    r'user-boardgames',
    UserBoardGameViewSet,
    basename='user-boardgames'
)


# =========================================================
# POKÉMON
# =========================================================

router.register(
    r'pokedex',
    PokemonViewSet
)

router.register(
    r'user-pokemon',
    UserPokemonViewSet,
    basename='user-pokemon'
)

router.register(
    r'hall-of-fame',
    PokemonHallOfFameViewSet,
    basename='hall-of-fame'
)


urlpatterns = [
    path(
        '',
        include(
            router.urls
        )
    ),

    path(
        'login/',
        CustomAuthToken.as_view(),
        name='api_login'
    ),
]