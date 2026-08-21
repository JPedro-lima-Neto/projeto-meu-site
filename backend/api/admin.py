from django.contrib import admin

from .models import (
    Platform,
    GameCatalog,
    UserGameEntry,
    UserOwnedGame,
    Pokemon,
    UserPokemon,
    PokemonHallOfFame,
    Console,
    BoardGame,
    UserProfile,
    Achievement,
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'profile_views',
        'is_public',
    )

    search_fields = (
        'user__username',
        'bio',
    )


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'user',
        'created_at',
    )


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = (
        'name',
    )

    search_fields = (
        'name',
    )


@admin.register(GameCatalog)
class GameCatalogAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'platform',
        'release_year',
        'genre',
    )

    list_filter = (
        'platform',
        'release_year',
    )

    search_fields = (
        'title',
        'genre',
    )


@admin.register(UserGameEntry)
class UserGameEntryAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'game_catalog',
        'status',
        'rating',
        'created_at',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'user__username',
        'game_catalog__title',
    )


@admin.register(UserOwnedGame)
class UserOwnedGameAdmin(admin.ModelAdmin):
    list_display = (
        'game_catalog',
        'user',
        'platform',
        'ownership_type',
        'completed',
        'created_at',
    )

    list_filter = (
        'ownership_type',
        'completed',
        'platform',
    )

    search_fields = (
        'game_catalog__title',
        'user__username',
        'platform__name',
    )

    autocomplete_fields = (
        'game_catalog',
        'user',
        'platform',
    )

    ordering = (
        'game_catalog__title',
    )


@admin.register(Pokemon)
class PokemonAdmin(admin.ModelAdmin):
    list_display = (
        'pokedex_id',
        'name',
        'type1',
        'type2',
    )

    search_fields = (
        'name',
    )


@admin.register(UserPokemon)
class UserPokemonAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'pokemon',
        'is_shiny',
        'captured_at',
    )

    list_filter = (
        'is_shiny',
    )


@admin.register(PokemonHallOfFame)
class PokemonHallOfFameAdmin(admin.ModelAdmin):
    list_display = (
        'game_name',
        'user',
    )

    search_fields = (
        'game_name',
        'user__username',
    )


@admin.register(Console)
class ConsoleAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'user',
    )

    search_fields = (
        'name',
        'user__username',
    )


@admin.register(BoardGame)
class BoardGameAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'user',
        'year',
        'publisher',
    )

    search_fields = (
        'name',
        'publisher',
        'user__username',
    )