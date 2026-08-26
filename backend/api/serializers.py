from decimal import Decimal

from rest_framework import serializers

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
    Follow,
    Like,
    Comment,
)


class PlatformSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Platform

        fields = [
            'id',
            'igdb_id',
            'name',
            'abbreviation',
            'slug',
            'generation',
            'logo_url',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'igdb_id',
            'name',
            'abbreviation',
            'slug',
            'generation',
            'logo_url',
            'updated_at',
        ]


class GameCatalogSerializer(
    serializers.ModelSerializer
):
    platforms = PlatformSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = GameCatalog

        fields = [
            'id',
            'igdb_id',
            'title',
            'slug',
            'description',
            'storyline',
            'cover_url',
            'release_year',
            'genres',
            'developers',
            'publishers',
            'platforms',
            'igdb_rating',
            'aggregated_rating',
            'imported_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'igdb_id',
            'title',
            'slug',
            'description',
            'storyline',
            'cover_url',
            'release_year',
            'genres',
            'developers',
            'publishers',
            'platforms',
            'igdb_rating',
            'aggregated_rating',
            'imported_at',
            'updated_at',
        ]


class UserProfileSerializer(
    serializers.ModelSerializer
):
    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = UserProfile

        fields = [
            'username',
            'avatar',
            'bio',
            'favorite_game',
            'is_public',
            'avatar_position',
            'profile_views',
        ]


class AchievementSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Achievement

        fields = [
            'id',
            'title',
            'image',
            'created_at',
        ]

        read_only_fields = [
            'user',
        ]


class FollowSerializer(
    serializers.ModelSerializer
):
    follower_username = (
        serializers.ReadOnlyField(
            source='follower.username'
        )
    )

    followed_username = (
        serializers.ReadOnlyField(
            source='followed.username'
        )
    )

    class Meta:
        model = Follow

        fields = [
            'id',
            'follower',
            'followed',
            'follower_username',
            'followed_username',
            'created_at',
        ]

        read_only_fields = [
            'follower',
        ]


class LikeSerializer(
    serializers.ModelSerializer
):
    username = (
        serializers.ReadOnlyField(
            source='user.username'
        )
    )

    class Meta:
        model = Like

        fields = [
            'id',
            'user',
            'game_entry',
            'username',
            'created_at',
        ]

        read_only_fields = [
            'user',
        ]


class CommentSerializer(
    serializers.ModelSerializer
):
    username = (
        serializers.ReadOnlyField(
            source='user.username'
        )
    )

    avatar = serializers.ImageField(
        source='user.profile.avatar',
        read_only=True
    )

    class Meta:
        model = Comment

        fields = [
            'id',
            'user',
            'game_entry',
            'username',
            'avatar',
            'text',
            'created_at',
        ]

        read_only_fields = [
            'user',
        ]


class UserGameEntrySerializer(
    serializers.ModelSerializer
):
    game_catalog = (
        GameCatalogSerializer(
            read_only=True
        )
    )

    game_catalog_id = (
        serializers.PrimaryKeyRelatedField(
            source='game_catalog',
            queryset=(
                GameCatalog.objects.all()
            ),
            write_only=True,
            required=False
        )
    )

    status_display = (
        serializers.CharField(
            source='get_status_display',
            read_only=True
        )
    )

    username = (
        serializers.CharField(
            source='user.username',
            read_only=True
        )
    )

    class Meta:
        model = UserGameEntry

        fields = [
            'id',
            'user',
            'username',
            'game_catalog',
            'game_catalog_id',
            'status',
            'status_display',
            'rating',
            'play_time',
            'review',
            'hall_of_fame',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'game_catalog',
            'status_display',
            'created_at',
            'updated_at',
        ]

    def validate_rating(
        self,
        value
    ):
        if value is None:
            return value

        value = Decimal(
            str(value)
        )

        if value < Decimal('0.0'):
            raise serializers.ValidationError(
                (
                    'A nota não pode ser '
                    'menor que 0.'
                )
            )

        if value > Decimal('10.0'):
            raise serializers.ValidationError(
                (
                    'A nota não pode ser '
                    'maior que 10.'
                )
            )

        if (
            value
            % Decimal('0.5')
            != 0
        ):
            raise serializers.ValidationError(
                (
                    'A nota deve variar '
                    'de 0,5 em 0,5.'
                )
            )

        return value

    def create(
        self,
        validated_data
    ):
        validated_data[
            'user'
        ] = (
            self.context[
                'request'
            ].user
        )

        return super().create(
            validated_data
        )


class UserOwnedGameSerializer(
    serializers.ModelSerializer
):
    game_catalog = (
        GameCatalogSerializer(
            read_only=True
        )
    )

    game_catalog_id = (
        serializers.PrimaryKeyRelatedField(
            source='game_catalog',
            queryset=(
                GameCatalog.objects.all()
            ),
            write_only=True,
            required=False
        )
    )

    platform = (
        PlatformSerializer(
            read_only=True
        )
    )

    platform_id = (
        serializers.PrimaryKeyRelatedField(
            source='platform',
            queryset=(
                Platform.objects.all()
            ),
            write_only=True,
            required=False
        )
    )

    ownership_type_display = (
        serializers.CharField(
            source=(
                'get_ownership_type_display'
            ),
            read_only=True
        )
    )

    username = (
        serializers.CharField(
            source='user.username',
            read_only=True
        )
    )

    class Meta:
        model = UserOwnedGame

        fields = [
            'id',
            'user',
            'username',
            'game_catalog',
            'game_catalog_id',
            'platform',
            'platform_id',
            'ownership_type',
            'ownership_type_display',
            'completed',
            'acquired_at',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'game_catalog',
            'platform',
            'ownership_type_display',
            'created_at',
            'updated_at',
        ]

    def create(
        self,
        validated_data
    ):
        validated_data[
            'user'
        ] = (
            self.context[
                'request'
            ].user
        )

        return super().create(
            validated_data
        )


class PokemonHallOfFameSerializer(
    serializers.ModelSerializer
):
    username = (
        serializers.CharField(
            source='user.username',
            read_only=True
        )
    )

    game_title = (
        serializers.CharField(
            source='game_name',
            required=False
        )
    )

    sprite_1 = serializers.ImageField(
        required=False,
        allow_null=True
    )

    sprite_2 = serializers.ImageField(
        required=False,
        allow_null=True
    )

    sprite_3 = serializers.ImageField(
        required=False,
        allow_null=True
    )

    sprite_4 = serializers.ImageField(
        required=False,
        allow_null=True
    )

    sprite_5 = serializers.ImageField(
        required=False,
        allow_null=True
    )

    sprite_6 = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = PokemonHallOfFame

        fields = [
            'id',
            'user',
            'username',
            'game_name',
            'game_title',
            'sprite_1',
            'sprite_2',
            'sprite_3',
            'sprite_4',
            'sprite_5',
            'sprite_6',
        ]

        read_only_fields = [
            'user',
            'username',
        ]

        extra_kwargs = {
            'game_name': {
                'required': False,
            },
        }

    def validate(
        self,
        attrs
    ):
        game_name = (
            attrs.get(
                'game_name'
            )
        )

        if (
            not game_name
            and self.instance is None
        ):
            raise serializers.ValidationError(
                {
                    'game_title':
                        (
                            'Informe o nome '
                            'do jogo.'
                        )
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data[
            'user'
        ] = (
            self.context[
                'request'
            ].user
        )

        return super().create(
            validated_data
        )


class ConsoleSerializer(
    serializers.ModelSerializer
):
    platform = (
        PlatformSerializer(
            read_only=True
        )
    )

    platform_id = (
        serializers.PrimaryKeyRelatedField(
            source='platform',
            queryset=(
                Platform.objects.all()
            ),
            write_only=True
        )
    )

    username = (
        serializers.CharField(
            source='user.username',
            read_only=True
        )
    )

    class Meta:
        model = Console

        fields = [
            'id',
            'user',
            'username',
            'platform',
            'platform_id',
            'acquired_at',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'platform',
            'created_at',
        ]

    def create(
        self,
        validated_data
    ):
        validated_data[
            'user'
        ] = (
            self.context[
                'request'
            ].user
        )

        return super().create(
            validated_data
        )


class BoardGameSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = BoardGame

        fields = '__all__'

        read_only_fields = [
            'user',
        ]


class BoardGameCatalogSerializer(
    serializers.ModelSerializer
):
    play_time = serializers.CharField(
        read_only=True
    )

    player_count = (
        serializers.CharField(
            read_only=True
        )
    )

    class Meta:
        model = BoardGameCatalog

        fields = [
            'id',
            'bgg_id',
            'name',
            'original_name',
            'description',
            'cover_image',
            'cover_url',
            'thumbnail_url',
            'year',
            'min_players',
            'max_players',
            'player_count',
            'min_play_time',
            'max_play_time',
            'play_time',
            'min_age',
            'publisher',
            'publishers',
            'categories',
            'mechanics',
            'designers',
            'artists',
            'bgg_rating',
            'bgg_weight',
            'rules',
            'imported_at',
            'updated_at',
        ]

        read_only_fields = [
            'imported_at',
            'updated_at',
        ]


class UserBoardGameSerializer(
    serializers.ModelSerializer
):
    game = (
        BoardGameCatalogSerializer(
            read_only=True
        )
    )

    game_id = (
        serializers
        .PrimaryKeyRelatedField(
            source='game',
            queryset=(
                BoardGameCatalog
                .objects
                .all()
            ),
            write_only=True
        )
    )

    username = (
        serializers.CharField(
            source='user.username',
            read_only=True
        )
    )

    class Meta:
        model = UserBoardGame

        fields = [
            'id',
            'user',
            'username',
            'game',
            'game_id',
            'owned',
            'played',
            'rating',
            'acquired_at',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'user',
            'username',
            'created_at',
            'updated_at',
        ]

    def validate_rating(
        self,
        value
    ):
        if value is None:
            return value

        value = Decimal(
            str(value)
        )

        if value < Decimal('0.0'):
            raise serializers.ValidationError(
                (
                    'A nota não pode ser '
                    'menor que 0.'
                )
            )

        if value > Decimal('10.0'):
            raise serializers.ValidationError(
                (
                    'A nota não pode ser '
                    'maior que 10.'
                )
            )

        if (
            value
            % Decimal('0.5')
            != 0
        ):
            raise serializers.ValidationError(
                (
                    'A nota deve variar '
                    'de 0,5 em 0,5.'
                )
            )

        return value

    def validate(
        self,
        attrs
    ):
        owned = attrs.get(
            'owned',
            getattr(
                self.instance,
                'owned',
                False
            )
        )

        played = attrs.get(
            'played',
            getattr(
                self.instance,
                'played',
                True
            )
        )

        if (
            not owned
            and not played
        ):
            raise serializers.ValidationError(
                {
                    'non_field_errors': [
                        (
                            'O jogo precisa estar '
                            'na coleção ou ter sido '
                            'jogado.'
                        )
                    ]
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data[
            'user'
        ] = (
            self.context[
                'request'
            ].user
        )

        return super().create(
            validated_data
        )


class PokemonSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Pokemon

        fields = '__all__'


class UserPokemonSerializer(
    serializers.ModelSerializer
):
    pokemon = (
        PokemonSerializer(
            read_only=True
        )
    )

    pokemon_id = (
        serializers.PrimaryKeyRelatedField(
            source='pokemon',
            queryset=(
                Pokemon.objects.all()
            ),
            write_only=True,
            required=False
        )
    )

    username = (
        serializers.CharField(
            source='user.username',
            read_only=True
        )
    )

    class Meta:
        model = UserPokemon

        fields = [
            'id',
            'user',
            'username',
            'pokemon',
            'pokemon_id',
            'is_shiny',
            'captured_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'pokemon',
            'captured_at',
        ]

    def create(
        self,
        validated_data
    ):
        validated_data[
            'user'
        ] = (
            self.context[
                'request'
            ].user
        )

        return super().create(
            validated_data
        )