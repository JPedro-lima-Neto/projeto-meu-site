from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator,
)


def avatar_path(instance, filename):
    return (
        f"avatars/user_{instance.user.id}/"
        f"{filename}"
    )


def validate_half_step(value):
    if value is None:
        return

    decimal_value = Decimal(str(value))

    if decimal_value % Decimal("0.5") != 0:
        raise ValidationError(
            "A nota deve variar de 0,5 em 0,5."
        )


class Platform(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )

    platform_image = models.ImageField(
        upload_to='platforms/',
        blank=True,
        null=True
    )

    def __str__(self):
        return self.name


class GameCatalog(models.Model):
    title = models.CharField(
        max_length=200
    )

    api_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True
    )

    platform = models.ForeignKey(
        Platform,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    cover_image = models.ImageField(
        upload_to='games_cover/',
        blank=True,
        null=True
    )

    cover_url = models.URLField(
        blank=True,
        null=True
    )

    genre = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    release_year = models.IntegerField(
        blank=True,
        null=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='catalog_contributions'
    )

    def __str__(self):
        if self.platform:
            return (
                f"{self.title} "
                f"({self.platform.name})"
            )

        return self.title


class Pokemon(models.Model):
    pokedex_id = models.IntegerField(
        primary_key=True
    )

    name = models.CharField(
        max_length=100
    )

    sprite_url = models.URLField(
        blank=True,
        null=True
    )

    shiny_sprite_url = models.URLField(
        blank=True,
        null=True
    )

    type1 = models.CharField(
        max_length=50
    )

    type2 = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    def __str__(self):
        return self.name


class PokemonHallOfFame(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    game_name = models.CharField(
        max_length=100
    )

    sprite_1 = models.ImageField(
        upload_to='teams/',
        blank=True,
        null=True
    )

    sprite_2 = models.ImageField(
        upload_to='teams/',
        blank=True,
        null=True
    )

    sprite_3 = models.ImageField(
        upload_to='teams/',
        blank=True,
        null=True
    )

    sprite_4 = models.ImageField(
        upload_to='teams/',
        blank=True,
        null=True
    )

    sprite_5 = models.ImageField(
        upload_to='teams/',
        blank=True,
        null=True
    )

    sprite_6 = models.ImageField(
        upload_to='teams/',
        blank=True,
        null=True
    )

    def __str__(self):
        return (
            f"Hall da Fama: "
            f"{self.game_name} "
            f"({self.user.username})"
        )


class UserPokemon(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='pokedex'
    )

    pokemon = models.ForeignKey(
        Pokemon,
        on_delete=models.CASCADE
    )

    is_shiny = models.BooleanField(
        default=False
    )

    captured_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            'user',
            'pokemon',
            'is_shiny'
        )


class UserGameEntry(models.Model):
    STATUS_CHOICES = [
        ('ZEREI', 'Zerei'),
        ('JOGUEI', 'Joguei'),
        ('JOGANDO', 'Jogando'),
        ('PAUSADO', 'Pausado'),
        ('QUERO', 'Quero Jogar'),
        ('PLATINEI', 'Platinei'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='my_games'
    )

    game_catalog = models.ForeignKey(
        GameCatalog,
        on_delete=models.CASCADE,
        related_name='played_by_users'
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='JOGUEI'
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        blank=True,
        null=True
    )

    play_time = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    review = models.TextField(
        blank=True,
        null=True
    )

    hall_of_fame = models.ForeignKey(
        PokemonHallOfFame,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            'user',
            'game_catalog'
        )

    def __str__(self):
        return (
            f"{self.user.username} "
            f"jogou {self.game_catalog.title}"
        )


class UserOwnedGame(models.Model):
    OWNERSHIP_TYPE_CHOICES = [
        ('FISICO', 'Físico'),
        ('DIGITAL', 'Digital'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_games'
    )

    game_catalog = models.ForeignKey(
        GameCatalog,
        on_delete=models.CASCADE,
        related_name='owned_copies'
    )

    platform = models.ForeignKey(
        Platform,
        on_delete=models.PROTECT,
        related_name='user_owned_games'
    )

    ownership_type = models.CharField(
        max_length=10,
        choices=OWNERSHIP_TYPE_CHOICES,
        default='FISICO'
    )

    completed = models.BooleanField(
        default=False,
        verbose_name='Já zerei?'
    )

    acquired_at = models.DateField(
        blank=True,
        null=True,
        verbose_name='Data de aquisição'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user',
                    'game_catalog',
                    'platform',
                    'ownership_type'
                ],
                name='unique_owned_game_copy'
            )
        ]

        verbose_name = 'Jogo da coleção'
        verbose_name_plural = (
            'Jogos da coleção'
        )

    def __str__(self):
        return (
            f"{self.game_catalog.title} - "
            f"{self.platform.name} - "
            f"{self.get_ownership_type_display()}"
        )


class Console(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    name = models.CharField(
        max_length=100
    )

    photo = models.ImageField(
        upload_to='consoles/',
        blank=True,
        null=True
    )

    def __str__(self):
        return (
            f"{self.name} "
            f"({self.user.username})"
        )


# =========================================================
# BOARD GAMES - SISTEMA ANTIGO
# =========================================================
#
# Vamos manter temporariamente para não quebrar
# o endpoint e os dados que já existem.
#
# Depois que BoardGameCatalog + UserBoardGame estiverem
# funcionando, podemos migrar os dados e remover este model.
# =========================================================

class BoardGame(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    name = models.CharField(
        max_length=200
    )

    cover_image = models.ImageField(
        upload_to='boardgames/',
        blank=True,
        null=True
    )

    rules = models.TextField(
        blank=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    min_players = models.IntegerField(
        blank=True,
        null=True
    )

    max_players = models.IntegerField(
        blank=True,
        null=True
    )

    play_time = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    age = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    publisher = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    year = models.IntegerField(
        blank=True,
        null=True
    )

    def __str__(self):
        return (
            f"{self.name} "
            f"({self.user.username})"
        )


# =========================================================
# BOARD GAMES - NOVO CATÁLOGO
# =========================================================

class BoardGameCatalog(models.Model):
    bgg_id = models.PositiveIntegerField(
        unique=True,
        blank=True,
        null=True,
        verbose_name='ID BoardGameGeek'
    )

    name = models.CharField(
        max_length=250
    )

    original_name = models.CharField(
        max_length=250,
        blank=True,
        null=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    cover_image = models.ImageField(
        upload_to='boardgames/covers/',
        blank=True,
        null=True
    )

    cover_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    thumbnail_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    year = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    min_players = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    max_players = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    min_play_time = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    max_play_time = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    min_age = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    publisher = models.CharField(
        max_length=250,
        blank=True,
        null=True
    )

    categories = models.JSONField(
        default=list,
        blank=True
    )

    mechanics = models.JSONField(
        default=list,
        blank=True
    )

    designers = models.JSONField(
        default=list,
        blank=True
    )

    artists = models.JSONField(
        default=list,
        blank=True
    )

    publishers = models.JSONField(
        default=list,
        blank=True
    )

    bgg_rating = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        blank=True,
        null=True
    )

    bgg_weight = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Complexidade BGG'
    )

    rules = models.TextField(
        blank=True,
        null=True
    )

    imported_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = (
            'Jogo de tabuleiro - catálogo'
        )

        verbose_name_plural = (
            'Jogos de tabuleiro - catálogo'
        )

    @property
    def play_time(self):
        if (
            self.min_play_time
            and self.max_play_time
        ):
            if (
                self.min_play_time
                ==
                self.max_play_time
            ):
                return (
                    f"{self.min_play_time} min"
                )

            return (
                f"{self.min_play_time}"
                f"–"
                f"{self.max_play_time} min"
            )

        if self.min_play_time:
            return (
                f"{self.min_play_time} min"
            )

        if self.max_play_time:
            return (
                f"{self.max_play_time} min"
            )

        return None

    @property
    def player_count(self):
        if (
            self.min_players
            and self.max_players
        ):
            if (
                self.min_players
                ==
                self.max_players
            ):
                return (
                    f"{self.min_players}"
                )

            return (
                f"{self.min_players}"
                f"–"
                f"{self.max_players}"
            )

        if self.min_players:
            return (
                f"{self.min_players}+"
            )

        return None

    def __str__(self):
        if self.year:
            return (
                f"{self.name} "
                f"({self.year})"
            )

        return self.name


# =========================================================
# BOARD GAMES - COLEÇÃO DO USUÁRIO
# =========================================================

class UserBoardGame(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='board_game_entries'
    )

    game = models.ForeignKey(
        BoardGameCatalog,
        on_delete=models.CASCADE,
        related_name='user_entries'
    )

    owned = models.BooleanField(
        default=False,
        verbose_name='Tenho este jogo?'
    )

    played = models.BooleanField(
        default=True,
        verbose_name='Já joguei?'
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        blank=True,
        null=True,
        validators=[
            MinValueValidator(
                Decimal('0.0')
            ),
            MaxValueValidator(
                Decimal('10.0')
            ),
            validate_half_step,
        ],
        verbose_name='Minha nota'
    )

    acquired_at = models.DateField(
        blank=True,
        null=True,
        verbose_name='Data de aquisição'
    )

    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observações'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user',
                    'game'
                ],
                name=(
                    'unique_user_board_game'
                )
            )
        ]

        ordering = [
            'game__name'
        ]

        verbose_name = (
            'Jogo de tabuleiro do usuário'
        )

        verbose_name_plural = (
            'Jogos de tabuleiro do usuário'
        )

    def clean(self):
        super().clean()

        if (
            not self.owned
            and not self.played
        ):
            raise ValidationError(
                (
                    "O jogo precisa estar na "
                    "coleção ou ter sido jogado."
                )
            )

    def __str__(self):
        status = []

        if self.owned:
            status.append(
                'Tenho'
            )

        if self.played:
            status.append(
                'Joguei'
            )

        return (
            f"{self.game.name} - "
            f"{self.user.username} - "
            f"{' / '.join(status)}"
        )


class Follow(models.Model):
    follower = models.ForeignKey(
        User,
        related_name='following',
        on_delete=models.CASCADE
    )

    followed = models.ForeignKey(
        User,
        related_name='followers',
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            'follower',
            'followed'
        )

    def __str__(self):
        return (
            f"{self.follower.username} "
            f"segue {self.followed.username}"
        )


class Like(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    game_entry = models.ForeignKey(
        UserGameEntry,
        related_name='likes',
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            'user',
            'game_entry'
        )


class Comment(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    game_entry = models.ForeignKey(
        UserGameEntry,
        related_name='comments',
        on_delete=models.CASCADE
    )

    text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"Comentário de "
            f"{self.user.username} em "
            f"{self.game_entry.game_catalog.title}"
        )


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    is_public = models.BooleanField(
        default=True
    )

    avatar = models.ImageField(
        upload_to=avatar_path,
        blank=True,
        null=True
    )

    bio = models.TextField(
        max_length=150,
        blank=True,
        null=True
    )

    favorite_game = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    profile_views = models.IntegerField(
        default=0
    )

    avatar_position = models.CharField(
        max_length=50,
        default='50% 50%'
    )

    def __str__(self):
        return self.user.username


class Achievement(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='achievements'
    )

    title = models.CharField(
        max_length=50
    )

    image = models.ImageField(
        upload_to='achievements/'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.title} - "
            f"{self.user.username}"
        )


@receiver(
    post_save,
    sender=User
)
def create_user_profile(
    sender,
    instance,
    created,
    **kwargs
):
    if created:
        UserProfile.objects.get_or_create(
            user=instance
        )


@receiver(
    post_save,
    sender=User
)
def save_user_profile(
    sender,
    instance,
    **kwargs
):
    if hasattr(
        instance,
        'profile'
    ):
        instance.profile.save()