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
    LibraryCatalog,
    UserLibraryEntry,
    BeyBlade,
    BeyRatchet,
    BeyBit,
    BeyAssistBlade,
    BeyLockChip,
    BeyBladeVariant,
    BeyRatchetVariant,
    BeyBitVariant,
    BeyAssistBladeVariant,
    BeyLockChipVariant,
    UserBeyBlade,
    UserBeyRatchet,
    UserBeyBit,
    UserBeyAssistBlade,
    UserBeyLockChip,
    BeybladeBuild,
    BeybladeRelease,
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

class LibraryCatalogSerializer(
    serializers.ModelSerializer
):
    item_type_display = serializers.CharField(
        source='get_item_type_display',
        read_only=True
    )

    source_display = serializers.CharField(
        source='get_source_display',
        read_only=True
    )

    cover_image = serializers.ImageField(
        read_only=True
    )

    class Meta:
        model = LibraryCatalog

        fields = [
            'id',
            'source',
            'source_display',
            'source_id',
            'openlibrary_key',
            'edition_key',
            'title',
            'subtitle',
            'series_name',
            'issue_number',
            'item_type',
            'item_type_display',
            'description',
            'authors',
            'publishers',
            'country',
            'first_publish_year',
            'publication_year',
            'isbn',
            'cover_image',
            'cover_url',
            'subjects',
            'languages',
            'page_count',
            'imported_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'source_display',
            'item_type_display',
            'cover_image',
            'imported_at',
            'updated_at',
        ]

class UserLibraryEntrySerializer(
    serializers.ModelSerializer
):
    item = LibraryCatalogSerializer(
        read_only=True
    )

    item_id = serializers.PrimaryKeyRelatedField(
        source='item',
        queryset=LibraryCatalog.objects.all(),
        write_only=True,
        required=False
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    reading_status_display = serializers.CharField(
        source='get_reading_status_display',
        read_only=True
    )

    ownership_type_display = serializers.CharField(
        source='get_ownership_type_display',
        read_only=True
    )

    class Meta:
        model = UserLibraryEntry

        fields = [
            'id',
            'user',
            'username',
            'item',
            'item_id',
            'owned',
            'ownership_type',
            'ownership_type_display',
            'reading_status',
            'reading_status_display',
            'rating',
            'acquired_at',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'item',
            'ownership_type_display',
            'reading_status_display',
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

        ownership_type = attrs.get(
            'ownership_type',
            getattr(
                self.instance,
                'ownership_type',
                None
            )
        )

        if owned and not ownership_type:
            raise serializers.ValidationError(
                {
                    'ownership_type': (
                        'Informe se a obra é física ou digital.'
                    )
                }
            )

        if not owned and ownership_type:
            raise serializers.ValidationError(
                {
                    'ownership_type': (
                        'O formato só pode ser informado quando '
                        'a obra pertence à coleção.'
                    )
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data['user'] = (
            self.context['request'].user
        )

        return super().create(
            validated_data
        )


class BeyBladeSerializer(
    serializers.ModelSerializer
):
    bey_type_display = serializers.CharField(
        source='get_bey_type_display',
        read_only=True
    )

    spin_display = serializers.CharField(
        source='get_spin_display',
        read_only=True
    )

    class Meta:
        model = BeyBlade

        fields = [
            'id',
            'name',
            'code',
            'bey_type',
            'bey_type_display',
            'spin',
            'spin_display',
            'weight',
            'image',
            'image_url',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'bey_type_display',
            'spin_display',
            'created_at',
            'updated_at',
        ]


class BeyRatchetSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = BeyRatchet

        fields = [
            'id',
            'name',
            'height',
            'protrusions',
            'weight',
            'image',
            'image_url',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


class BeyBitSerializer(
    serializers.ModelSerializer
):
    bit_type_display = serializers.CharField(
        source='get_bit_type_display',
        read_only=True
    )

    class Meta:
        model = BeyBit

        fields = [
            'id',
            'name',
            'abbreviation',
            'bit_type',
            'bit_type_display',
            'weight',
            'image',
            'image_url',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'bit_type_display',
            'created_at',
            'updated_at',
        ]


class BeyAssistBladeSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = BeyAssistBlade

        fields = [
            'id',
            'name',
            'weight',
            'image',
            'image_url',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


class BeyLockChipSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = BeyLockChip

        fields = [
            'id',
            'name',
            'weight',
            'image',
            'image_url',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


class BeyBladeVariantSerializer(
    serializers.ModelSerializer
):
    blade = BeyBladeSerializer(
        read_only=True
    )

    blade_id = serializers.PrimaryKeyRelatedField(
        source='blade',
        queryset=BeyBlade.objects.all(),
        write_only=True,
        required=False
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = BeyBladeVariant

        fields = [
            'id',
            'blade',
            'blade_id',
            'variant_name',
            'colors',
            'source_code',
            'image',
            'image_url',
            'display_image',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'blade',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.image:
            request = self.context.get(
                'request'
            )

            try:
                url = obj.image.url
            except Exception:
                url = None

            if (
                url
                and request
            ):
                return request.build_absolute_uri(
                    url
                )

            return url

        if obj.image_url:
            return obj.image_url

        if obj.blade:
            if obj.blade.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.blade.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.blade.image_url

        return None


class BeyRatchetVariantSerializer(
    serializers.ModelSerializer
):
    ratchet = BeyRatchetSerializer(
        read_only=True
    )

    ratchet_id = serializers.PrimaryKeyRelatedField(
        source='ratchet',
        queryset=BeyRatchet.objects.all(),
        write_only=True,
        required=False
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = BeyRatchetVariant

        fields = [
            'id',
            'ratchet',
            'ratchet_id',
            'variant_name',
            'colors',
            'source_code',
            'image',
            'image_url',
            'display_image',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'ratchet',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.image:
            request = self.context.get(
                'request'
            )

            try:
                url = obj.image.url
            except Exception:
                url = None

            if (
                url
                and request
            ):
                return request.build_absolute_uri(
                    url
                )

            return url

        if obj.image_url:
            return obj.image_url

        if obj.ratchet:
            if obj.ratchet.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.ratchet.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.ratchet.image_url

        return None


class BeyBitVariantSerializer(
    serializers.ModelSerializer
):
    bit = BeyBitSerializer(
        read_only=True
    )

    bit_id = serializers.PrimaryKeyRelatedField(
        source='bit',
        queryset=BeyBit.objects.all(),
        write_only=True,
        required=False
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = BeyBitVariant

        fields = [
            'id',
            'bit',
            'bit_id',
            'variant_name',
            'colors',
            'source_code',
            'image',
            'image_url',
            'display_image',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'bit',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.image:
            request = self.context.get(
                'request'
            )

            try:
                url = obj.image.url
            except Exception:
                url = None

            if (
                url
                and request
            ):
                return request.build_absolute_uri(
                    url
                )

            return url

        if obj.image_url:
            return obj.image_url

        if obj.bit:
            if obj.bit.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.bit.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.bit.image_url

        return None


class BeyAssistBladeVariantSerializer(
    serializers.ModelSerializer
):
    assist_blade = BeyAssistBladeSerializer(
        read_only=True
    )

    assist_blade_id = serializers.PrimaryKeyRelatedField(
        source='assist_blade',
        queryset=BeyAssistBlade.objects.all(),
        write_only=True,
        required=False
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = BeyAssistBladeVariant

        fields = [
            'id',
            'assist_blade',
            'assist_blade_id',
            'variant_name',
            'colors',
            'source_code',
            'image',
            'image_url',
            'display_image',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'assist_blade',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.image:
            request = self.context.get(
                'request'
            )

            try:
                url = obj.image.url
            except Exception:
                url = None

            if (
                url
                and request
            ):
                return request.build_absolute_uri(
                    url
                )

            return url

        if obj.image_url:
            return obj.image_url

        if obj.assist_blade:
            if obj.assist_blade.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.assist_blade.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.assist_blade.image_url

        return None


class BeyLockChipVariantSerializer(
    serializers.ModelSerializer
):
    lock_chip = BeyLockChipSerializer(
        read_only=True
    )

    lock_chip_id = serializers.PrimaryKeyRelatedField(
        source='lock_chip',
        queryset=BeyLockChip.objects.all(),
        write_only=True,
        required=False
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = BeyLockChipVariant

        fields = [
            'id',
            'lock_chip',
            'lock_chip_id',
            'variant_name',
            'colors',
            'source_code',
            'image',
            'image_url',
            'display_image',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'lock_chip',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.image:
            request = self.context.get(
                'request'
            )

            try:
                url = obj.image.url
            except Exception:
                url = None

            if (
                url
                and request
            ):
                return request.build_absolute_uri(
                    url
                )

            return url

        if obj.image_url:
            return obj.image_url

        if obj.lock_chip:
            if obj.lock_chip.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.lock_chip.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.lock_chip.image_url

        return None


class UserBeyBladeSerializer(
    serializers.ModelSerializer
):
    blade = BeyBladeSerializer(
        read_only=True
    )

    blade_id = serializers.PrimaryKeyRelatedField(
        source='blade',
        queryset=BeyBlade.objects.all(),
        write_only=True
    )

    variant = BeyBladeVariantSerializer(
        read_only=True
    )

    variant_id = serializers.PrimaryKeyRelatedField(
        source='variant',
        queryset=BeyBladeVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = UserBeyBlade

        fields = [
            'id',
            'user',
            'username',
            'blade',
            'blade_id',
            'variant',
            'variant_id',
            'display_image',
            'quantity',
            'acquired_at',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'blade',
            'variant',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.variant:
            return BeyBladeVariantSerializer(
                obj.variant,
                context=self.context
            ).data.get(
                'display_image'
            )

        if obj.blade:
            if obj.blade.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.blade.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.blade.image_url

        return None

    def validate_quantity(
        self,
        value
    ):
        if value < 1:
            raise serializers.ValidationError(
                'A quantidade deve ser pelo menos 1.'
            )

        return value

    def validate(
        self,
        attrs
    ):
        blade = attrs.get(
            'blade',
            getattr(
                self.instance,
                'blade',
                None
            )
        )

        variant = attrs.get(
            'variant',
            getattr(
                self.instance,
                'variant',
                None
            )
        )

        if (
            variant
            and blade
            and variant.blade_id
            != blade.id
        ):
            raise serializers.ValidationError(
                {
                    'variant_id': (
                        'Esta variante não pertence '
                        'à Blade selecionada.'
                    )
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data['user'] = (
            self.context['request'].user
        )

        return super().create(
            validated_data
        )


class UserBeyRatchetSerializer(
    serializers.ModelSerializer
):
    ratchet = BeyRatchetSerializer(
        read_only=True
    )

    ratchet_id = serializers.PrimaryKeyRelatedField(
        source='ratchet',
        queryset=BeyRatchet.objects.all(),
        write_only=True
    )

    variant = BeyRatchetVariantSerializer(
        read_only=True
    )

    variant_id = serializers.PrimaryKeyRelatedField(
        source='variant',
        queryset=BeyRatchetVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = UserBeyRatchet

        fields = [
            'id',
            'user',
            'username',
            'ratchet',
            'ratchet_id',
            'variant',
            'variant_id',
            'display_image',
            'quantity',
            'acquired_at',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'ratchet',
            'variant',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.variant:
            return BeyRatchetVariantSerializer(
                obj.variant,
                context=self.context
            ).data.get(
                'display_image'
            )

        if obj.ratchet:
            if obj.ratchet.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.ratchet.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.ratchet.image_url

        return None

    def validate_quantity(
        self,
        value
    ):
        if value < 1:
            raise serializers.ValidationError(
                'A quantidade deve ser pelo menos 1.'
            )

        return value

    def validate(
        self,
        attrs
    ):
        ratchet = attrs.get(
            'ratchet',
            getattr(
                self.instance,
                'ratchet',
                None
            )
        )

        variant = attrs.get(
            'variant',
            getattr(
                self.instance,
                'variant',
                None
            )
        )

        if (
            variant
            and ratchet
            and variant.ratchet_id
            != ratchet.id
        ):
            raise serializers.ValidationError(
                {
                    'variant_id': (
                        'Esta variante não pertence '
                        'ao Ratchet selecionado.'
                    )
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data['user'] = (
            self.context['request'].user
        )

        return super().create(
            validated_data
        )


class UserBeyBitSerializer(
    serializers.ModelSerializer
):
    bit = BeyBitSerializer(
        read_only=True
    )

    bit_id = serializers.PrimaryKeyRelatedField(
        source='bit',
        queryset=BeyBit.objects.all(),
        write_only=True
    )

    variant = BeyBitVariantSerializer(
        read_only=True
    )

    variant_id = serializers.PrimaryKeyRelatedField(
        source='variant',
        queryset=BeyBitVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = UserBeyBit

        fields = [
            'id',
            'user',
            'username',
            'bit',
            'bit_id',
            'variant',
            'variant_id',
            'display_image',
            'quantity',
            'acquired_at',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'bit',
            'variant',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.variant:
            return BeyBitVariantSerializer(
                obj.variant,
                context=self.context
            ).data.get(
                'display_image'
            )

        if obj.bit:
            if obj.bit.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.bit.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.bit.image_url

        return None

    def validate_quantity(
        self,
        value
    ):
        if value < 1:
            raise serializers.ValidationError(
                'A quantidade deve ser pelo menos 1.'
            )

        return value

    def validate(
        self,
        attrs
    ):
        bit = attrs.get(
            'bit',
            getattr(
                self.instance,
                'bit',
                None
            )
        )

        variant = attrs.get(
            'variant',
            getattr(
                self.instance,
                'variant',
                None
            )
        )

        if (
            variant
            and bit
            and variant.bit_id
            != bit.id
        ):
            raise serializers.ValidationError(
                {
                    'variant_id': (
                        'Esta variante não pertence '
                        'ao Bit selecionado.'
                    )
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data['user'] = (
            self.context['request'].user
        )

        return super().create(
            validated_data
        )


class UserBeyAssistBladeSerializer(
    serializers.ModelSerializer
):
    assist_blade = BeyAssistBladeSerializer(
        read_only=True
    )

    assist_blade_id = serializers.PrimaryKeyRelatedField(
        source='assist_blade',
        queryset=BeyAssistBlade.objects.all(),
        write_only=True
    )

    variant = BeyAssistBladeVariantSerializer(
        read_only=True
    )

    variant_id = serializers.PrimaryKeyRelatedField(
        source='variant',
        queryset=BeyAssistBladeVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = UserBeyAssistBlade

        fields = [
            'id',
            'user',
            'username',
            'assist_blade',
            'assist_blade_id',
            'variant',
            'variant_id',
            'display_image',
            'quantity',
            'acquired_at',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'assist_blade',
            'variant',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.variant:
            return BeyAssistBladeVariantSerializer(
                obj.variant,
                context=self.context
            ).data.get(
                'display_image'
            )

        if obj.assist_blade:
            if obj.assist_blade.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.assist_blade.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.assist_blade.image_url

        return None

    def validate(
        self,
        attrs
    ):
        assist_blade = attrs.get(
            'assist_blade',
            getattr(
                self.instance,
                'assist_blade',
                None
            )
        )

        variant = attrs.get(
            'variant',
            getattr(
                self.instance,
                'variant',
                None
            )
        )

        if (
            variant
            and assist_blade
            and variant.assist_blade_id
            != assist_blade.id
        ):
            raise serializers.ValidationError(
                {
                    'variant_id': (
                        'Esta variante não pertence '
                        'à Assist Blade selecionada.'
                    )
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data['user'] = (
            self.context['request'].user
        )

        return super().create(
            validated_data
        )


class UserBeyLockChipSerializer(
    serializers.ModelSerializer
):
    lock_chip = BeyLockChipSerializer(
        read_only=True
    )

    lock_chip_id = serializers.PrimaryKeyRelatedField(
        source='lock_chip',
        queryset=BeyLockChip.objects.all(),
        write_only=True
    )

    variant = BeyLockChipVariantSerializer(
        read_only=True
    )

    variant_id = serializers.PrimaryKeyRelatedField(
        source='variant',
        queryset=BeyLockChipVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = UserBeyLockChip

        fields = [
            'id',
            'user',
            'username',
            'lock_chip',
            'lock_chip_id',
            'variant',
            'variant_id',
            'display_image',
            'quantity',
            'acquired_at',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'lock_chip',
            'variant',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.variant:
            return BeyLockChipVariantSerializer(
                obj.variant,
                context=self.context
            ).data.get(
                'display_image'
            )

        if obj.lock_chip:
            if obj.lock_chip.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.lock_chip.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.lock_chip.image_url

        return None

    def validate(
        self,
        attrs
    ):
        lock_chip = attrs.get(
            'lock_chip',
            getattr(
                self.instance,
                'lock_chip',
                None
            )
        )

        variant = attrs.get(
            'variant',
            getattr(
                self.instance,
                'variant',
                None
            )
        )

        if (
            variant
            and lock_chip
            and variant.lock_chip_id
            != lock_chip.id
        ):
            raise serializers.ValidationError(
                {
                    'variant_id': (
                        'Esta variante não pertence '
                        'ao Lock Chip selecionado.'
                    )
                }
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data['user'] = (
            self.context['request'].user
        )

        return super().create(
            validated_data
        )


class BeybladeBuildSerializer(
    serializers.ModelSerializer
):
    blade = BeyBladeSerializer(
        read_only=True
    )

    blade_variant = BeyBladeVariantSerializer(
        read_only=True
    )

    ratchet = BeyRatchetSerializer(
        read_only=True
    )

    ratchet_variant = BeyRatchetVariantSerializer(
        read_only=True
    )

    bit = BeyBitSerializer(
        read_only=True
    )

    bit_variant = BeyBitVariantSerializer(
        read_only=True
    )

    assist_blade = BeyAssistBladeSerializer(
        read_only=True
    )

    assist_blade_variant = BeyAssistBladeVariantSerializer(
        read_only=True
    )

    lock_chip = BeyLockChipSerializer(
        read_only=True
    )

    lock_chip_variant = BeyLockChipVariantSerializer(
        read_only=True
    )

    blade_id = serializers.PrimaryKeyRelatedField(
        source='blade',
        queryset=BeyBlade.objects.all(),
        write_only=True
    )

    blade_variant_id = serializers.PrimaryKeyRelatedField(
        source='blade_variant',
        queryset=BeyBladeVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    ratchet_id = serializers.PrimaryKeyRelatedField(
        source='ratchet',
        queryset=BeyRatchet.objects.all(),
        write_only=True
    )

    ratchet_variant_id = serializers.PrimaryKeyRelatedField(
        source='ratchet_variant',
        queryset=BeyRatchetVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    bit_id = serializers.PrimaryKeyRelatedField(
        source='bit',
        queryset=BeyBit.objects.all(),
        write_only=True
    )

    bit_variant_id = serializers.PrimaryKeyRelatedField(
        source='bit_variant',
        queryset=BeyBitVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    assist_blade_id = serializers.PrimaryKeyRelatedField(
        source='assist_blade',
        queryset=BeyAssistBlade.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    assist_blade_variant_id = serializers.PrimaryKeyRelatedField(
        source='assist_blade_variant',
        queryset=BeyAssistBladeVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    lock_chip_id = serializers.PrimaryKeyRelatedField(
        source='lock_chip',
        queryset=BeyLockChip.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    lock_chip_variant_id = serializers.PrimaryKeyRelatedField(
        source='lock_chip_variant',
        queryset=BeyLockChipVariant.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    build_name = serializers.SerializerMethodField()
    display_image = serializers.SerializerMethodField()

    class Meta:
        model = BeybladeBuild

        fields = [
            'id',
            'user',
            'username',
            'name',
            'build_name',
            'display_image',
            'blade',
            'blade_id',
            'blade_variant',
            'blade_variant_id',
            'ratchet',
            'ratchet_id',
            'ratchet_variant',
            'ratchet_variant_id',
            'bit',
            'bit_id',
            'bit_variant',
            'bit_variant_id',
            'assist_blade',
            'assist_blade_id',
            'assist_blade_variant',
            'assist_blade_variant_id',
            'lock_chip',
            'lock_chip_id',
            'lock_chip_variant',
            'lock_chip_variant_id',
            'favorite',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'blade',
            'blade_variant',
            'ratchet',
            'ratchet_variant',
            'bit',
            'bit_variant',
            'assist_blade',
            'assist_blade_variant',
            'lock_chip',
            'lock_chip_variant',
            'build_name',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_build_name(
        self,
        obj
    ):
        bit_name = (
            obj.bit.abbreviation
            or obj.bit.name
        )

        parts = []

        if obj.lock_chip:
            parts.append(
                obj.lock_chip.name
            )

        parts.append(
            obj.blade.name
        )

        if obj.assist_blade:
            parts.append(
                obj.assist_blade.name
            )

        parts.append(
            obj.ratchet.name
        )

        parts.append(
            bit_name
        )

        return ' '.join(
            parts
        )

    def get_display_image(
        self,
        obj
    ):
        if obj.blade_variant:
            return BeyBladeVariantSerializer(
                obj.blade_variant,
                context=self.context
            ).data.get(
                'display_image'
            )

        if obj.blade:
            if obj.blade.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.blade.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.blade.image_url

        return None

    def validate(
        self,
        attrs
    ):
        request = self.context.get(
            'request'
        )

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return attrs

        user = request.user

        blade = attrs.get(
            'blade',
            getattr(
                self.instance,
                'blade',
                None
            )
        )

        blade_variant = attrs.get(
            'blade_variant',
            getattr(
                self.instance,
                'blade_variant',
                None
            )
        )

        ratchet = attrs.get(
            'ratchet',
            getattr(
                self.instance,
                'ratchet',
                None
            )
        )

        ratchet_variant = attrs.get(
            'ratchet_variant',
            getattr(
                self.instance,
                'ratchet_variant',
                None
            )
        )

        bit = attrs.get(
            'bit',
            getattr(
                self.instance,
                'bit',
                None
            )
        )

        bit_variant = attrs.get(
            'bit_variant',
            getattr(
                self.instance,
                'bit_variant',
                None
            )
        )

        errors = {}

        if blade_variant and (
            not blade
            or blade_variant.blade_id != blade.id
        ):
            errors[
                'blade_variant_id'
            ] = (
                'A variante não pertence '
                'à Blade selecionada.'
            )

        if ratchet_variant and (
            not ratchet
            or ratchet_variant.ratchet_id != ratchet.id
        ):
            errors[
                'ratchet_variant_id'
            ] = (
                'A variante não pertence '
                'ao Ratchet selecionado.'
            )

        if bit_variant and (
            not bit
            or bit_variant.bit_id != bit.id
        ):
            errors[
                'bit_variant_id'
            ] = (
                'A variante não pertence '
                'ao Bit selecionado.'
            )

        if blade and not UserBeyBlade.objects.filter(
            user=user,
            blade=blade,
            **(
                {
                    'variant':
                        blade_variant
                }
                if blade_variant
                else {}
            )
        ).exists():
            errors[
                'blade_id'
            ] = (
                'Você não possui esta Blade/variante.'
            )

        if ratchet and not UserBeyRatchet.objects.filter(
            user=user,
            ratchet=ratchet,
            **(
                {
                    'variant':
                        ratchet_variant
                }
                if ratchet_variant
                else {}
            )
        ).exists():
            errors[
                'ratchet_id'
            ] = (
                'Você não possui este Ratchet/variante.'
            )

        if bit and not UserBeyBit.objects.filter(
            user=user,
            bit=bit,
            **(
                {
                    'variant':
                        bit_variant
                }
                if bit_variant
                else {}
            )
        ).exists():
            errors[
                'bit_id'
            ] = (
                'Você não possui este Bit/variante.'
            )

        if errors:
            raise serializers.ValidationError(
                errors
            )

        return attrs

    def create(
        self,
        validated_data
    ):
        validated_data['user'] = (
            self.context['request'].user
        )

        return super().create(
            validated_data
        )


class BeybladeReleaseSerializer(
    serializers.ModelSerializer
):
    blade = BeyBladeSerializer(
        read_only=True
    )

    blade_variant = BeyBladeVariantSerializer(
        read_only=True
    )

    ratchet = BeyRatchetSerializer(
        read_only=True
    )

    ratchet_variant = BeyRatchetVariantSerializer(
        read_only=True
    )

    bit = BeyBitSerializer(
        read_only=True
    )

    bit_variant = BeyBitVariantSerializer(
        read_only=True
    )

    assist_blade = BeyAssistBladeSerializer(
        read_only=True
    )

    assist_blade_variant = BeyAssistBladeVariantSerializer(
        read_only=True
    )

    lock_chip = BeyLockChipSerializer(
        read_only=True
    )

    lock_chip_variant = BeyLockChipVariantSerializer(
        read_only=True
    )

    system_display = serializers.CharField(
        source='get_system_display',
        read_only=True
    )

    display_image = serializers.SerializerMethodField()

    class Meta:
        model = BeybladeRelease

        fields = [
            'id',
            'code',
            'name',
            'system',
            'system_display',
            'release_date',
            'blade',
            'blade_variant',
            'ratchet',
            'ratchet_variant',
            'bit',
            'bit_variant',
            'assist_blade',
            'assist_blade_variant',
            'lock_chip',
            'lock_chip_variant',
            'image',
            'image_url',
            'display_image',
            'source_url',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'system_display',
            'blade',
            'blade_variant',
            'ratchet',
            'ratchet_variant',
            'bit',
            'bit_variant',
            'assist_blade',
            'assist_blade_variant',
            'lock_chip',
            'lock_chip_variant',
            'display_image',
            'created_at',
            'updated_at',
        ]

    def get_display_image(
        self,
        obj
    ):
        if obj.image:
            request = self.context.get(
                'request'
            )

            try:
                url = obj.image.url
            except Exception:
                url = None

            if (
                url
                and request
            ):
                return request.build_absolute_uri(
                    url
                )

            if url:
                return url

        if obj.blade_variant:
            variant_image = (
                BeyBladeVariantSerializer(
                    obj.blade_variant,
                    context=self.context
                )
                .data
                .get(
                    'display_image'
                )
            )

            if variant_image:
                return variant_image

        if obj.image_url:
            return obj.image_url

        if obj.blade:
            if obj.blade.image:
                request = self.context.get(
                    'request'
                )

                try:
                    url = obj.blade.image.url
                except Exception:
                    url = None

                if (
                    url
                    and request
                ):
                    return request.build_absolute_uri(
                        url
                    )

                if url:
                    return url

            return obj.blade.image_url

        return None