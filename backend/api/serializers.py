from decimal import Decimal

from rest_framework import serializers
from django.contrib.auth.models import User

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


class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = [
            'id',
            'name',
            'platform_image',
        ]


class GameCatalogSerializer(serializers.ModelSerializer):
    platform = PlatformSerializer(
        read_only=True
    )

    class Meta:
        model = GameCatalog
        fields = '__all__'

        read_only_fields = [
            'created_by',
        ]


class UserProfileSerializer(serializers.ModelSerializer):
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


class AchievementSerializer(serializers.ModelSerializer):
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


class FollowSerializer(serializers.ModelSerializer):
    follower_username = serializers.ReadOnlyField(
        source='follower.username'
    )

    followed_username = serializers.ReadOnlyField(
        source='followed.username'
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


class LikeSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(
        source='user.username'
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


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(
        source='user.username'
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


class UserGameEntrySerializer(serializers.ModelSerializer):
    game_title = serializers.CharField(
        write_only=True
    )

    platform_name = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    genre = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    release_year = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True
    )

    cover_image = serializers.ImageField(
        write_only=True,
        required=False
    )

    class Meta:
        model = UserGameEntry
        fields = '__all__'
        depth = 1

        read_only_fields = [
            'user',
        ]

    def create(self, validated_data):
        title = validated_data.pop(
            'game_title'
        )

        plat_name = validated_data.pop(
            'platform_name',
            None
        )

        genre = validated_data.pop(
            'genre',
            ''
        )

        year = validated_data.pop(
            'release_year',
            None
        )

        cover = validated_data.pop(
            'cover_image',
            None
        )

        game_obj, created = (
            GameCatalog.objects.get_or_create(
                title=title
            )
        )

        if created or not game_obj.cover_image:
            if plat_name:
                game_obj.platform = (
                    Platform.objects.filter(
                        name=plat_name
                    ).first()
                )

            game_obj.genre = genre
            game_obj.release_year = year

            if cover:
                game_obj.cover_image = cover

            game_obj.save()

        validated_data[
            'game_catalog'
        ] = game_obj

        validated_data[
            'user'
        ] = self.context[
            'request'
        ].user

        return super().create(
            validated_data
        )


class UserOwnedGameSerializer(serializers.ModelSerializer):
    game_catalog = GameCatalogSerializer(
        read_only=True
    )

    platform = PlatformSerializer(
        read_only=True
    )

    ownership_type_display = serializers.CharField(
        source='get_ownership_type_display',
        read_only=True
    )

    class Meta:
        model = UserOwnedGame

        fields = [
            'id',
            'user',
            'game_catalog',
            'platform',
            'ownership_type',
            'ownership_type_display',
            'completed',
            'acquired_at',
            'created_at',
        ]

        read_only_fields = [
            'user',
        ]


class PokemonHallOfFameSerializer(
    serializers.ModelSerializer
):
    game_title = serializers.CharField(
        write_only=True
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
        fields = '__all__'
        depth = 1

        read_only_fields = [
            'user',
            'game_catalog',
        ]

    def create(self, validated_data):
        title = validated_data.pop(
            'game_title'
        )

        game_obj = (
            GameCatalog.objects.filter(
                title=title
            ).first()
        )

        if not game_obj:
            raise serializers.ValidationError({
                'game_title':
                    'Jogo não encontrado no catálogo.'
            })

        validated_data[
            'game_catalog'
        ] = game_obj

        validated_data[
            'user'
        ] = self.context[
            'request'
        ].user

        return super().create(
            validated_data
        )


class ConsoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Console
        fields = '__all__'

        read_only_fields = [
            'user',
        ]


# =========================================================
# BOARD GAMES - MODELO ANTIGO
# =========================================================

class BoardGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardGame
        fields = '__all__'

        read_only_fields = [
            'user',
        ]


# =========================================================
# BOARD GAMES - CATÁLOGO
# =========================================================

class BoardGameCatalogSerializer(
    serializers.ModelSerializer
):
    play_time = serializers.CharField(
        read_only=True
    )

    player_count = serializers.CharField(
        read_only=True
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


# =========================================================
# BOARD GAMES - RELAÇÃO DO USUÁRIO
# =========================================================

class UserBoardGameSerializer(
    serializers.ModelSerializer
):
    game = BoardGameCatalogSerializer(
        read_only=True
    )

    game_id = serializers.PrimaryKeyRelatedField(
        source='game',
        queryset=BoardGameCatalog.objects.all(),
        write_only=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
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

    def validate_rating(self, value):
        if value is None:
            return value

        value = Decimal(str(value))

        if value < Decimal('0.0'):
            raise serializers.ValidationError(
                'A nota não pode ser menor que 0.'
            )

        if value > Decimal('10.0'):
            raise serializers.ValidationError(
                'A nota não pode ser maior que 10.'
            )

        if value % Decimal('0.5') != 0:
            raise serializers.ValidationError(
                'A nota deve variar de 0,5 em 0,5.'
            )

        return value

    def validate(self, attrs):
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

    def create(self, validated_data):
        validated_data['user'] = (
            self.context[
                'request'
            ].user
        )

        return super().create(
            validated_data
        )


class PokemonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pokemon
        fields = '__all__'


class UserPokemonSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPokemon
        fields = '__all__'
        depth = 1

        read_only_fields = [
            'user',
        ]