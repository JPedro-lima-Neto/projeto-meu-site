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
    LibraryCatalogViewSet,
    UserLibraryEntryViewSet,
    BeyBladeViewSet,
    BeyRatchetViewSet,
    BeyBitViewSet,
    UserBeyBladeViewSet,
    UserBeyRatchetViewSet,
    UserBeyBitViewSet,
    BeybladeBuildViewSet,
    BeyAssistBladeViewSet,
    BeyLockChipViewSet,
    UserBeyAssistBladeViewSet,
    UserBeyLockChipViewSet,
    BeybladeReleaseViewSet,
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

router.register(
    r'boardgames',
    BoardGameViewSet,
    basename='boardgames'
)

router.register(
    r'boardgame-catalog',
    BoardGameCatalogViewSet,
    basename='boardgame-catalog'
)

router.register(
    r'user-boardgames',
    UserBoardGameViewSet,
    basename='user-boardgames'
)

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

router.register(
    r'library-catalog',
    LibraryCatalogViewSet,
    basename='library-catalog'
)

router.register(
    r'reading-library',
    UserLibraryEntryViewSet,
    basename='reading-library'
)

router.register(
    r'beyblades',
    BeyBladeViewSet,
    basename='beyblades'
)

router.register(
    r'bey-ratchets',
    BeyRatchetViewSet,
    basename='bey-ratchets'
)

router.register(
    r'bey-bits',
    BeyBitViewSet,
    basename='bey-bits'
)

router.register(
    r'bey-assist-blades',
    BeyAssistBladeViewSet,
    basename='bey-assist-blades'
)

router.register(
    r'bey-lock-chips',
    BeyLockChipViewSet,
    basename='bey-lock-chips'
)

router.register(
    r'beyblade-releases',
    BeybladeReleaseViewSet,
    basename='beyblade-releases'
)

router.register(
    r'user-beyblades',
    UserBeyBladeViewSet,
    basename='user-beyblades'
)

router.register(
    r'user-bey-ratchets',
    UserBeyRatchetViewSet,
    basename='user-bey-ratchets'
)

router.register(
    r'user-bey-bits',
    UserBeyBitViewSet,
    basename='user-bey-bits'
)

router.register(
    r'user-bey-assist-blades',
    UserBeyAssistBladeViewSet,
    basename='user-bey-assist-blades'
)

router.register(
    r'user-bey-lock-chips',
    UserBeyLockChipViewSet,
    basename='user-bey-lock-chips'
)

router.register(
    r'beyblade-builds',
    BeybladeBuildViewSet,
    basename='beyblade-builds'
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