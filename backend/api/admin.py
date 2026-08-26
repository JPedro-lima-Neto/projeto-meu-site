from django.contrib import admin
from django.urls import path
from django.shortcuts import (
    render,
    redirect,
)
from django.contrib import messages

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
    BoardGameCatalog,
    UserBoardGame,
    UserProfile,
    Achievement,
    LibraryCatalog,
    UserLibraryEntry,
)

from .views import (
    request_bgg,
    parse_bgg_search,
    parse_bgg_game,
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
        'abbreviation',
        'igdb_id',
        'generation',
    )

    search_fields = (
        'name',
        'abbreviation',
        'slug',
        'igdb_id',
    )

    ordering = (
        'name',
    )

    readonly_fields = (
        'igdb_id',
        'name',
        'abbreviation',
        'slug',
        'generation',
        'logo_url',
    )


@admin.register(GameCatalog)
class GameCatalogAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'igdb_id',
        'release_year',
        'igdb_rating',
        'aggregated_rating',
    )

    list_filter = (
        'release_year',
        'platforms',
    )

    search_fields = (
        'title',
        'igdb_id',
        'genres',
        'developers',
        'publishers',
    )

    filter_horizontal = (
        'platforms',
    )

    ordering = (
        'title',
    )

    readonly_fields = (
        'igdb_id',
        'title',
        'description',
        'storyline',
        'cover_url',
        'release_year',
        'genres',
        'developers',
        'publishers',
        'igdb_rating',
        'aggregated_rating',
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

    autocomplete_fields = (
        'user',
        'game_catalog',
    )

    ordering = (
        '-created_at',
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
        'platform',
        'user',
        'created_at',
    )

    list_filter = (
        'platform',
    )

    search_fields = (
        'platform__name',
        'platform__abbreviation',
        'user__username',
    )

    autocomplete_fields = (
        'platform',
        'user',
    )

    ordering = (
        'platform__name',
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


@admin.register(BoardGameCatalog)
class BoardGameCatalogAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'bgg_id',
        'year',
        'publisher',
        'min_players',
        'max_players',
        'bgg_rating',
    )

    list_filter = (
        'year',
        'publisher',
    )

    search_fields = (
        'name',
        'publisher',
        'bgg_id',
    )

    ordering = (
        'name',
    )

    readonly_fields = (
        'bgg_id',
        'name',
        'original_name',
        'cover_url',
        'thumbnail_url',
        'year',
        'min_players',
        'max_players',
        'min_play_time',
        'max_play_time',
        'min_age',
        'publisher',
        'publishers',
        'categories',
        'mechanics',
        'designers',
        'artists',
        'bgg_rating',
        'bgg_weight',
        'imported_at',
        'updated_at',
    )

    fieldsets = (
        (
            'Informações principais',
            {
                'fields': (
                    'name',
                    'original_name',
                    'description',
                    'cover_image',
                    'cover_url',
                    'thumbnail_url',
                )
            }
        ),
        (
            'Informações do jogo',
            {
                'fields': (
                    'year',
                    'min_players',
                    'max_players',
                    'min_play_time',
                    'max_play_time',
                    'min_age',
                    'publisher',
                    'publishers',
                )
            }
        ),
        (
            'Detalhes',
            {
                'fields': (
                    'categories',
                    'mechanics',
                    'designers',
                    'artists',
                    'bgg_rating',
                    'bgg_weight',
                )
            }
        ),
        (
            'Conteúdo editável',
            {
                'fields': (
                    'rules',
                )
            }
        ),
        (
            'BoardGameGeek',
            {
                'fields': (
                    'bgg_id',
                )
            }
        ),
        (
            'Sistema',
            {
                'fields': (
                    'imported_at',
                    'updated_at',
                )
            }
        ),
    )

    change_list_template = (
        'admin/boardgame_catalog_changelist.html'
    )

    def get_urls(self):
        urls = super().get_urls()

        custom_urls = [
            path(
                'importar-bgg/',
                self.admin_site.admin_view(
                    self.import_bgg_view
                ),
                name='boardgamecatalog_import_bgg',
            ),
        ]

        return custom_urls + urls

    def import_bgg_view(
        self,
        request
    ):
        query = (
            request.GET
            .get(
                'q',
                ''
            )
            .strip()
        )

        results = []

        if query:
            result = request_bgg(
                'search',
                params={
                    'query': query,
                    'type': 'boardgame',
                }
            )

            if not result.get(
                'success'
            ):
                messages.error(
                    request,
                    result.get(
                        'error',
                        (
                            'Erro ao pesquisar '
                            'na BoardGameGeek.'
                        )
                    )
                )

            else:
                try:
                    results = (
                        parse_bgg_search(
                            result['content']
                        )
                    )

                except Exception as error:
                    messages.error(
                        request,
                        (
                            'Não foi possível '
                            'interpretar a resposta '
                            'da BoardGameGeek.'
                        )
                    )

                    print(
                        'Erro BGG:',
                        error
                    )

        if request.method == 'POST':
            bgg_id = (
                request.POST
                .get(
                    'bgg_id'
                )
            )

            if not bgg_id:
                messages.error(
                    request,
                    'BGG ID não informado.'
                )

                return redirect(
                    request.path
                )

            existing_game = (
                BoardGameCatalog
                .objects
                .filter(
                    bgg_id=bgg_id
                )
                .first()
            )

            if existing_game:
                messages.warning(
                    request,
                    (
                        f'{existing_game.name} '
                        'já existe no catálogo. '
                        'Os dados existentes '
                        'foram mantidos.'
                    )
                )

                return redirect(
                    (
                        f'../'
                        f'{existing_game.id}/'
                        f'change/'
                    )
                )

            detail_result = request_bgg(
                'thing',
                params={
                    'id': bgg_id,
                    'stats': 1,
                }
            )

            if not detail_result.get(
                'success'
            ):
                messages.error(
                    request,
                    detail_result.get(
                        'error',
                        (
                            'Erro ao buscar '
                            'detalhes do jogo.'
                        )
                    )
                )

                return redirect(
                    request.path
                )

            try:
                game_data = (
                    parse_bgg_game(
                        detail_result[
                            'content'
                        ]
                    )
                )

            except Exception as error:
                messages.error(
                    request,
                    (
                        'Não foi possível '
                        'interpretar os detalhes '
                        'do jogo.'
                    )
                )

                print(
                    'Erro BGG:',
                    error
                )

                return redirect(
                    request.path
                )

            if not game_data:
                messages.error(
                    request,
                    (
                        'Jogo não encontrado '
                        'na BoardGameGeek.'
                    )
                )

                return redirect(
                    request.path
                )

            game = (
                BoardGameCatalog
                .objects
                .create(
                    **game_data
                )
            )

            messages.success(
                request,
                (
                    f'{game.name} foi '
                    'importado com sucesso. '
                    'Você pode editar a '
                    'descrição em português '
                    'antes de salvar.'
                )
            )

            return redirect(
                (
                    f'../'
                    f'{game.id}/'
                    f'change/'
                )
            )

        context = {
            **self.admin_site.each_context(
                request
            ),

            'title': (
                'Importar jogo '
                'da BoardGameGeek'
            ),

            'query': query,

            'results': results,

            'opts': self.model._meta,
        }

        return render(
            request,
            'admin/boardgame_import_bgg.html',
            context
        )


@admin.register(UserBoardGame)
class UserBoardGameAdmin(admin.ModelAdmin):
    list_display = (
        'game',
        'user',
        'owned',
        'played',
        'rating',
    )

    list_filter = (
        'owned',
        'played',
    )

    search_fields = (
        'game__name',
        'user__username',
    )

    autocomplete_fields = (
        'game',
        'user',
    )

    ordering = (
        'game__name',
    )


@admin.register(LibraryCatalog)
class LibraryCatalogAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'item_type',
        'publication_year',
        'display_publishers',
        'display_isbn',
    )

    list_filter = (
        'item_type',
        'publication_year',
    )

    search_fields = (
        'title',
        'subtitle',
        'authors',
        'publishers',
        'isbn',
        'openlibrary_key',
        'edition_key',
    )

    ordering = (
        'title',
    )

    readonly_fields = (
        'openlibrary_key',
        'edition_key',
        'title',
        'subtitle',
        'item_type',
        'description',
        'authors',
        'publishers',
        'first_publish_year',
        'publication_year',
        'isbn',
        'cover_url',
        'subjects',
        'languages',
        'page_count',
        'imported_at',
        'updated_at',
    )

    def display_publishers(
        self,
        obj
    ):
        if not obj.publishers:
            return '-'

        if isinstance(
            obj.publishers,
            list
        ):
            return ', '.join(
                str(value)
                for value
                in obj.publishers[:3]
            )

        return str(
            obj.publishers
        )

    display_publishers.short_description = (
        'Editoras'
    )

    def display_isbn(
        self,
        obj
    ):
        if not obj.isbn:
            return '-'

        if isinstance(
            obj.isbn,
            list
        ):
            return ', '.join(
                str(value)
                for value
                in obj.isbn[:2]
            )

        return str(
            obj.isbn
        )

    display_isbn.short_description = (
        'ISBN'
    )


@admin.register(UserLibraryEntry)
class UserLibraryEntryAdmin(admin.ModelAdmin):
    list_display = (
        'item',
        'user',
        'owned',
        'ownership_type',
        'reading_status',
        'rating',
    )

    list_filter = (
        'owned',
        'ownership_type',
        'reading_status',
    )

    search_fields = (
        'item__title',
        'user__username',
    )

    autocomplete_fields = (
        'item',
        'user',
    )

    ordering = (
        'item__title',
    )