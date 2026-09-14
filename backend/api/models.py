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

def pokemon_trainer_photo_path(instance, filename):
    return (
        f"pokemon_trainer_cards/user_{instance.user.id}/"
        f"{filename}"
    )

def validate_half_step(value):
    if value is None:
        return

    decimal_value = Decimal(
        str(value)
    )

    if (
        decimal_value
        % Decimal("0.5")
        != 0
    ):
        raise ValidationError(
            "A nota deve variar de 0,5 em 0,5."
        )


class Platform(models.Model):
    igdb_id = models.PositiveIntegerField(
        unique=True,
        blank=True,
        null=True
    )

    name = models.CharField(
        max_length=150,
        unique=True
    )

    abbreviation = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    slug = models.SlugField(
        max_length=180,
        blank=True,
        null=True
    )

    generation = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    logo_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

    def __str__(self):
        return self.name


class GameCatalog(models.Model):
    igdb_id = models.PositiveIntegerField(
        unique=True,
        blank=True,
        null=True
    )

    title = models.CharField(
        max_length=250
    )

    slug = models.SlugField(
        max_length=300,
        blank=True,
        null=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    storyline = models.TextField(
        blank=True,
        null=True
    )

    cover_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    release_year = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    genres = models.JSONField(
        default=list,
        blank=True
    )

    developers = models.JSONField(
        default=list,
        blank=True
    )

    publishers = models.JSONField(
        default=list,
        blank=True
    )

    platforms = models.ManyToManyField(
        Platform,
        related_name='games',
        blank=True
    )

    igdb_rating = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    aggregated_rating = models.DecimalField(
        max_digits=5,
        decimal_places=2,
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
            'title'
        ]

        verbose_name = (
            'Jogo - catálogo IGDB'
        )

        verbose_name_plural = (
            'Jogos - catálogo IGDB'
        )

    def __str__(self):
        if self.release_year:
            return (
                f"{self.title} "
                f"({self.release_year})"
            )

        return self.title


class Console(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_consoles'
    )

    platform = models.ForeignKey(
        Platform,
        on_delete=models.PROTECT,
        related_name='owned_by_users',
        blank=True,
        null=True
    )

    acquired_at = models.DateField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user',
                    'platform'
                ],
                name='unique_user_console'
            )
        ]

        ordering = [
            'platform__name'
        ]

    def __str__(self):
        if self.platform:
            return (
                f"{self.platform.name} "
                f"({self.user.username})"
            )

        return (
            f"Console sem plataforma "
            f"({self.user.username})"
        )


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

    base_hp = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    base_attack = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    base_defense = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    base_special_attack = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    base_special_defense = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    base_speed = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    def __str__(self):
        return self.name


class PokemonHallOfFame(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='pokemon_hall_of_fame'
    )

    game_name = models.CharField(
        max_length=100
    )

    pokemon_1 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )

    pokemon_1_shiny = models.BooleanField(
        default=False
    )

    pokemon_2 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )

    pokemon_2_shiny = models.BooleanField(
        default=False
    )

    pokemon_3 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )

    pokemon_3_shiny = models.BooleanField(
        default=False
    )

    pokemon_4 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )

    pokemon_4_shiny = models.BooleanField(
        default=False
    )

    pokemon_5 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )

    pokemon_5_shiny = models.BooleanField(
        default=False
    )

    pokemon_6 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )

    pokemon_6_shiny = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
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



class VGCMove(models.Model):
    api_id = models.PositiveIntegerField(
        unique=True,
        blank=True,
        null=True
    )

    name = models.CharField(
        max_length=120,
        unique=True
    )

    display_name = models.CharField(
        max_length=120,
        blank=True,
        null=True
    )

    move_type = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    damage_class = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    power = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    accuracy = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    pp = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    priority = models.SmallIntegerField(
        default=0
    )

    effect = models.TextField(
        blank=True,
        null=True
    )

    effect_chance = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    generation = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Golpe VGC'
        verbose_name_plural = 'Golpes VGC'

    def __str__(self):
        return (
            self.display_name
            or self.name
        )


class VGCAbility(models.Model):
    api_id = models.PositiveIntegerField(
        unique=True,
        blank=True,
        null=True
    )

    name = models.CharField(
        max_length=120,
        unique=True
    )

    display_name = models.CharField(
        max_length=120,
        blank=True,
        null=True
    )

    effect = models.TextField(
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Habilidade VGC'
        verbose_name_plural = 'Habilidades VGC'

    def __str__(self):
        return (
            self.display_name
            or self.name
        )


class VGCItem(models.Model):
    api_id = models.PositiveIntegerField(
        unique=True,
        blank=True,
        null=True
    )

    name = models.CharField(
        max_length=120,
        unique=True
    )

    display_name = models.CharField(
        max_length=120,
        blank=True,
        null=True
    )

    sprite_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    effect = models.TextField(
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Item VGC'
        verbose_name_plural = 'Itens VGC'

    def __str__(self):
        return (
            self.display_name
            or self.name
        )


class VGCTeam(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vgc_teams'
    )

    name = models.CharField(
        max_length=100
    )

    regulation = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            '-updated_at',
            '-created_at'
        ]

        verbose_name = 'Equipe VGC'
        verbose_name_plural = 'Equipes VGC'

    def __str__(self):
        return (
            f"{self.name} "
            f"({self.user.username})"
        )


class VGCPokemonBuild(models.Model):
    NATURE_CHOICES = [
        ('HARDY', 'Hardy'),
        ('LONELY', 'Lonely'),
        ('BRAVE', 'Brave'),
        ('ADAMANT', 'Adamant'),
        ('NAUGHTY', 'Naughty'),
        ('BOLD', 'Bold'),
        ('DOCILE', 'Docile'),
        ('RELAXED', 'Relaxed'),
        ('IMPISH', 'Impish'),
        ('LAX', 'Lax'),
        ('TIMID', 'Timid'),
        ('HASTY', 'Hasty'),
        ('SERIOUS', 'Serious'),
        ('JOLLY', 'Jolly'),
        ('NAIVE', 'Naive'),
        ('MODEST', 'Modest'),
        ('MILD', 'Mild'),
        ('QUIET', 'Quiet'),
        ('BASHFUL', 'Bashful'),
        ('RASH', 'Rash'),
        ('CALM', 'Calm'),
        ('GENTLE', 'Gentle'),
        ('SASSY', 'Sassy'),
        ('CAREFUL', 'Careful'),
        ('QUIRKY', 'Quirky'),
    ]

    team = models.ForeignKey(
        VGCTeam,
        on_delete=models.CASCADE,
        related_name='pokemon_builds'
    )

    pokemon = models.ForeignKey(
        Pokemon,
        on_delete=models.PROTECT,
        related_name='vgc_builds'
    )

    slot = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(6),
        ]
    )

    nickname = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    is_shiny = models.BooleanField(
        default=False
    )

    level = models.PositiveSmallIntegerField(
        default=50,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(100),
        ]
    )

    tera_type = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    nature = models.CharField(
        max_length=20,
        choices=NATURE_CHOICES,
        default='SERIOUS'
    )

    ability = models.ForeignKey(
        VGCAbility,
        on_delete=models.SET_NULL,
        related_name='pokemon_builds',
        blank=True,
        null=True
    )

    item = models.ForeignKey(
        VGCItem,
        on_delete=models.SET_NULL,
        related_name='pokemon_builds',
        blank=True,
        null=True
    )

    move_1 = models.ForeignKey(
        VGCMove,
        on_delete=models.SET_NULL,
        related_name='+',
        blank=True,
        null=True
    )

    move_2 = models.ForeignKey(
        VGCMove,
        on_delete=models.SET_NULL,
        related_name='+',
        blank=True,
        null=True
    )

    move_3 = models.ForeignKey(
        VGCMove,
        on_delete=models.SET_NULL,
        related_name='+',
        blank=True,
        null=True
    )

    move_4 = models.ForeignKey(
        VGCMove,
        on_delete=models.SET_NULL,
        related_name='+',
        blank=True,
        null=True
    )

    iv_hp = models.PositiveSmallIntegerField(
        default=31,
        validators=[
            MaxValueValidator(31)
        ]
    )

    iv_attack = models.PositiveSmallIntegerField(
        default=31,
        validators=[
            MaxValueValidator(31)
        ]
    )

    iv_defense = models.PositiveSmallIntegerField(
        default=31,
        validators=[
            MaxValueValidator(31)
        ]
    )

    iv_special_attack = models.PositiveSmallIntegerField(
        default=31,
        validators=[
            MaxValueValidator(31)
        ]
    )

    iv_special_defense = models.PositiveSmallIntegerField(
        default=31,
        validators=[
            MaxValueValidator(31)
        ]
    )

    iv_speed = models.PositiveSmallIntegerField(
        default=31,
        validators=[
            MaxValueValidator(31)
        ]
    )

    ev_hp = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MaxValueValidator(252)
        ]
    )

    ev_attack = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MaxValueValidator(252)
        ]
    )

    ev_defense = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MaxValueValidator(252)
        ]
    )

    ev_special_attack = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MaxValueValidator(252)
        ]
    )

    ev_special_defense = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MaxValueValidator(252)
        ]
    )

    ev_speed = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MaxValueValidator(252)
        ]
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'team_id',
            'slot'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'team',
                    'slot'
                ],
                name='unique_vgc_team_slot'
            )
        ]

        verbose_name = 'Build de Pokémon VGC'
        verbose_name_plural = 'Builds de Pokémon VGC'

    @property
    def total_evs(self):
        return (
            self.ev_hp
            + self.ev_attack
            + self.ev_defense
            + self.ev_special_attack
            + self.ev_special_defense
            + self.ev_speed
        )

    def clean(self):
        super().clean()

        if self.total_evs > 510:
            raise ValidationError(
                'A soma total dos EVs não pode ultrapassar 510.'
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.team.name} - "
            f"Slot {self.slot} - "
            f"{self.pokemon.name}"
        )


class UserGameEntry(models.Model):
    STATUS_CHOICES = [
        (
            'ZEREI',
            'Zerei'
        ),
        (
            'JOGUEI',
            'Joguei'
        ),
        (
            'JOGANDO',
            'Jogando'
        ),
        (
            'PAUSADO',
            'Pausado'
        ),
        (
            'QUERO',
            'Quero Jogar'
        ),
        (
            'PLATINEI',
            'Platinei'
        ),
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
        null=True,
        validators=[
            MinValueValidator(
                Decimal('0.0')
            ),
            MaxValueValidator(
                Decimal('10.0')
            ),
            validate_half_step,
        ]
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

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user',
                    'game_catalog'
                ],
                name='unique_user_game_entry'
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} "
            f"- {self.game_catalog.title} "
            f"- {self.get_status_display()}"
        )


class UserOwnedGame(models.Model):
    OWNERSHIP_TYPE_CHOICES = [
        (
            'FISICO',
            'Físico'
        ),
        (
            'DIGITAL',
            'Digital'
        ),
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

    updated_at = models.DateTimeField(
        auto_now=True
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

        verbose_name = (
            'Jogo da coleção'
        )

        verbose_name_plural = (
            'Jogos da coleção'
        )

    def __str__(self):
        return (
            f"{self.game_catalog.title} - "
            f"{self.platform.name} - "
            f"{self.get_ownership_type_display()}"
        )


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
                name='unique_user_board_game'
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
        statuses = []

        if self.owned:
            statuses.append(
                'Tenho'
            )

        if self.played:
            statuses.append(
                'Joguei'
            )

        return (
            f"{self.game.name} - "
            f"{self.user.username} - "
            f"{' / '.join(statuses)}"
        )


class LibraryCatalog(models.Model):
    ITEM_TYPE_CHOICES = [
        (
            'LIVRO',
            'Livro'
        ),
        (
            'HQ',
            'HQ'
        ),
        (
            'MANGA',
            'Mangá'
        ),
        (
            'REVISTA',
            'Revista'
        ),
        (
            'OUTRO',
            'Outro'
        ),
    ]

    SOURCE_CHOICES = [
        (
            'OPEN_LIBRARY',
            'Open Library'
        ),
        (
            'GCD',
            'Grand Comics Database'
        ),
        (
            'COMIC_VINE',
            'Comic Vine'
        ),
        (
            'GOOGLE_BOOKS',
            'Google Books'
        ),
        (
            'MANUAL',
            'Cadastro manual'
        ),
    ]

    source = models.CharField(
        max_length=30,
        choices=SOURCE_CHOICES,
        blank=True,
        null=True
    )

    source_id = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    openlibrary_key = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True
    )

    edition_key = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    title = models.CharField(
        max_length=300
    )

    subtitle = models.CharField(
        max_length=300,
        blank=True,
        null=True
    )

    series_name = models.CharField(
        max_length=300,
        blank=True,
        null=True
    )

    issue_number = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
        default='LIVRO'
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    authors = models.JSONField(
        default=list,
        blank=True
    )

    publishers = models.JSONField(
        default=list,
        blank=True
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    first_publish_year = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    publication_year = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    isbn = models.JSONField(
        default=list,
        blank=True
    )

    cover_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    cover_image = models.ImageField(
        upload_to='library/covers/',
        blank=True,
        null=True
    )

    subjects = models.JSONField(
        default=list,
        blank=True
    )

    languages = models.JSONField(
        default=list,
        blank=True
    )

    page_count = models.PositiveIntegerField(
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
            'title'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'source',
                    'source_id'
                ],
                name='unique_library_source_item',
                condition=(
                    models.Q(
                        source__isnull=False
                    )
                    &
                    models.Q(
                        source_id__isnull=False
                    )
                )
            )
        ]

        verbose_name = (
            'Obra - catálogo da biblioteca'
        )

        verbose_name_plural = (
            'Obras - catálogo da biblioteca'
        )

    def __str__(self):
        name = self.title

        if self.series_name:
            name = self.series_name

        if self.issue_number:
            name = (
                f"{name} "
                f"#{self.issue_number}"
            )

        if self.publication_year:
            return (
                f"{name} "
                f"({self.publication_year})"
            )

        return name

class UserLibraryEntry(models.Model):
    READING_STATUS_CHOICES = [
        (
            'NAO_LIDO',
            'Não lido'
        ),
        (
            'LENDO',
            'Lendo'
        ),
        (
            'LIDO',
            'Lido'
        ),
        (
            'PAUSADO',
            'Pausado'
        ),
        (
            'QUERO_LER',
            'Quero ler'
        ),
    ]

    OWNERSHIP_TYPE_CHOICES = [
        (
            'FISICO',
            'Físico'
        ),
        (
            'DIGITAL',
            'Digital'
        ),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='library_entries'
    )

    item = models.ForeignKey(
        LibraryCatalog,
        on_delete=models.CASCADE,
        related_name='user_entries'
    )

    owned = models.BooleanField(
        default=False,
        verbose_name='Tenho esta obra?'
    )

    ownership_type = models.CharField(
        max_length=10,
        choices=OWNERSHIP_TYPE_CHOICES,
        blank=True,
        null=True,
        verbose_name='Formato'
    )

    reading_status = models.CharField(
        max_length=15,
        choices=READING_STATUS_CHOICES,
        default='NAO_LIDO',
        verbose_name='Status de leitura'
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
                    'item'
                ],
                name='unique_user_library_entry'
            )
        ]

        ordering = [
            'item__title'
        ]

        verbose_name = (
            'Obra da biblioteca do usuário'
        )

        verbose_name_plural = (
            'Obras da biblioteca do usuário'
        )

    def clean(self):
        super().clean()

        if (
            not self.owned
            and self.ownership_type
        ):
            raise ValidationError(
                (
                    "O formato só pode ser informado "
                    "quando a obra pertence à coleção."
                )
            )

        if (
            self.owned
            and not self.ownership_type
        ):
            raise ValidationError(
                (
                    "Informe se a obra da coleção é "
                    "física ou digital."
                )
            )

    def __str__(self):
        return (
            f"{self.item.title} - "
            f"{self.user.username} - "
            f"{self.get_reading_status_display()}"
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
    POKEMON_MECHANIC_CHOICES = [
        (
            'MEGA_EVOLUTION',
            'Mega Evolução'
        ),
        (
            'Z_MOVE',
            'Z-Move'
        ),
        (
            'DYNAMAX_GIGANTAMAX',
            'Dynamax / Gigantamax'
        ),
        (
            'TERASTAL',
            'Terastal'
        ),
    ]

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

    pokemon_trainer_photo = models.ImageField(
        upload_to=pokemon_trainer_photo_path,
        blank=True,
        null=True
    )

    pokemon_trainer_photo_position = models.CharField(
        max_length=50,
        default='50% 50%'
    )

    pokemon_tcg_league_id = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    pokemon_favorite_mechanic = models.CharField(
        max_length=30,
        choices=POKEMON_MECHANIC_CHOICES,
        blank=True,
        null=True
    )

    pokemon_favorite_1 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
    )

    pokemon_favorite_2 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
    )

    pokemon_favorite_3 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
    )

    pokemon_favorite_4 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
    )

    pokemon_favorite_5 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
    )

    pokemon_favorite_6 = models.ForeignKey(
        Pokemon,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
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


class BeyBlade(models.Model):
    TYPE_CHOICES = [
        (
            'ATAQUE',
            'Ataque'
        ),
        (
            'DEFESA',
            'Defesa'
        ),
        (
            'STAMINA',
            'Stamina'
        ),
        (
            'BALANCE',
            'Balance'
        ),
    ]

    SPIN_CHOICES = [
        (
            'RIGHT',
            'Direita'
        ),
        (
            'LEFT',
            'Esquerda'
        ),
        (
            'DUAL',
            'Dual Spin'
        ),
    ]

    name = models.CharField(
        max_length=150,
        unique=True
    )

    code = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    bey_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        blank=True,
        null=True
    )

    spin = models.CharField(
        max_length=10,
        choices=SPIN_CHOICES,
        blank=True,
        null=True
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to='beyblade/blades/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Blade'
        verbose_name_plural = 'Blades'

    def __str__(self):
        return self.name


class BeyRatchet(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True
    )

    height = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    protrusions = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to='beyblade/ratchets/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Ratchet'
        verbose_name_plural = 'Ratchets'

    def __str__(self):
        return self.name


class BeyBit(models.Model):
    TYPE_CHOICES = [
        (
            'ATAQUE',
            'Ataque'
        ),
        (
            'DEFESA',
            'Defesa'
        ),
        (
            'STAMINA',
            'Stamina'
        ),
        (
            'BALANCE',
            'Balance'
        ),
    ]

    name = models.CharField(
        max_length=100,
        unique=True
    )

    abbreviation = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    bit_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        blank=True,
        null=True
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to='beyblade/bits/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Bit'
        verbose_name_plural = 'Bits'

    def __str__(self):
        if self.abbreviation:
            return (
                f"{self.name} "
                f"({self.abbreviation})"
            )

        return self.name


class BeyAssistBlade(models.Model):
    name = models.CharField(
        max_length=150,
        unique=True
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to='beyblade/assist-blades/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Assist Blade'
        verbose_name_plural = 'Assist Blades'

    def __str__(self):
        return self.name


class BeyLockChip(models.Model):
    name = models.CharField(
        max_length=150,
        unique=True
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to='beyblade/lock-chips/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'name'
        ]

        verbose_name = 'Lock Chip'
        verbose_name_plural = 'Lock Chips'

    def __str__(self):
        return self.name


class BeyBladeVariant(models.Model):
    blade = models.ForeignKey(
        BeyBlade,
        on_delete=models.CASCADE,
        related_name='variants'
    )

    variant_name = models.CharField(
        max_length=150
    )

    edition_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    colors = models.JSONField(
        default=list,
        blank=True
    )

    source_code = models.CharField(
        max_length=80,
        blank=True,
        null=True
    )

    catalog_key = models.CharField(
        max_length=300,
        unique=True,
        blank=True,
        null=True
    )

    is_default = models.BooleanField(
        default=False
    )

    image = models.ImageField(
        upload_to='beyblade/variants/blades/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'blade__name',
            '-is_default',
            'variant_name'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'blade',
                    'variant_name'
                ],
                name='unique_bey_blade_variant'
            )
        ]

        verbose_name = 'Variante de Blade'
        verbose_name_plural = 'Variantes de Blade'

    def __str__(self):
        return (
            f"{self.blade.name} - "
            f"{self.variant_name}"
        )


class BeyRatchetVariant(models.Model):
    ratchet = models.ForeignKey(
        BeyRatchet,
        on_delete=models.CASCADE,
        related_name='variants'
    )

    variant_name = models.CharField(
        max_length=150
    )

    edition_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    colors = models.JSONField(
        default=list,
        blank=True
    )

    source_code = models.CharField(
        max_length=80,
        blank=True,
        null=True
    )

    catalog_key = models.CharField(
        max_length=300,
        unique=True,
        blank=True,
        null=True
    )

    is_default = models.BooleanField(
        default=False
    )

    image = models.ImageField(
        upload_to='beyblade/variants/ratchets/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'ratchet__name',
            '-is_default',
            'variant_name'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'ratchet',
                    'variant_name'
                ],
                name='unique_bey_ratchet_variant'
            )
        ]

        verbose_name = 'Variante de Ratchet'
        verbose_name_plural = 'Variantes de Ratchet'

    def __str__(self):
        return (
            f"{self.ratchet.name} - "
            f"{self.variant_name}"
        )


class BeyBitVariant(models.Model):
    bit = models.ForeignKey(
        BeyBit,
        on_delete=models.CASCADE,
        related_name='variants'
    )

    variant_name = models.CharField(
        max_length=150
    )

    edition_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    colors = models.JSONField(
        default=list,
        blank=True
    )

    source_code = models.CharField(
        max_length=80,
        blank=True,
        null=True
    )

    catalog_key = models.CharField(
        max_length=300,
        unique=True,
        blank=True,
        null=True
    )

    is_default = models.BooleanField(
        default=False
    )

    image = models.ImageField(
        upload_to='beyblade/variants/bits/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'bit__name',
            '-is_default',
            'variant_name'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'bit',
                    'variant_name'
                ],
                name='unique_bey_bit_variant'
            )
        ]

        verbose_name = 'Variante de Bit'
        verbose_name_plural = 'Variantes de Bit'

    def __str__(self):
        return (
            f"{self.bit.name} - "
            f"{self.variant_name}"
        )


class BeyAssistBladeVariant(models.Model):
    assist_blade = models.ForeignKey(
        BeyAssistBlade,
        on_delete=models.CASCADE,
        related_name='variants'
    )

    variant_name = models.CharField(
        max_length=150
    )

    edition_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    colors = models.JSONField(
        default=list,
        blank=True
    )

    source_code = models.CharField(
        max_length=80,
        blank=True,
        null=True
    )

    catalog_key = models.CharField(
        max_length=300,
        unique=True,
        blank=True,
        null=True
    )

    is_default = models.BooleanField(
        default=False
    )

    image = models.ImageField(
        upload_to='beyblade/variants/assist-blades/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'assist_blade__name',
            '-is_default',
            'variant_name'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'assist_blade',
                    'variant_name'
                ],
                name='unique_bey_assist_blade_variant'
            )
        ]

        verbose_name = 'Variante de Assist Blade'
        verbose_name_plural = 'Variantes de Assist Blade'

    def __str__(self):
        return (
            f"{self.assist_blade.name} - "
            f"{self.variant_name}"
        )


class BeyLockChipVariant(models.Model):
    lock_chip = models.ForeignKey(
        BeyLockChip,
        on_delete=models.CASCADE,
        related_name='variants'
    )

    variant_name = models.CharField(
        max_length=150
    )

    edition_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    colors = models.JSONField(
        default=list,
        blank=True
    )

    source_code = models.CharField(
        max_length=80,
        blank=True,
        null=True
    )

    catalog_key = models.CharField(
        max_length=300,
        unique=True,
        blank=True,
        null=True
    )

    is_default = models.BooleanField(
        default=False
    )

    image = models.ImageField(
        upload_to='beyblade/variants/lock-chips/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'lock_chip__name',
            '-is_default',
            'variant_name'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'lock_chip',
                    'variant_name'
                ],
                name='unique_bey_lock_chip_variant'
            )
        ]

        verbose_name = 'Variante de Lock Chip'
        verbose_name_plural = 'Variantes de Lock Chip'

    def __str__(self):
        return (
            f"{self.lock_chip.name} - "
            f"{self.variant_name}"
        )


class UserBeyBlade(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_bey_blades'
    )

    blade = models.ForeignKey(
        BeyBlade,
        on_delete=models.CASCADE,
        related_name='owned_by_users'
    )

    variant = models.ForeignKey(
        BeyBladeVariant,
        on_delete=models.SET_NULL,
        related_name='owned_by_users',
        blank=True,
        null=True
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    acquired_at = models.DateField(
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
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
                    'blade'
                ],
                condition=models.Q(
                    variant__isnull=True
                ),
                name=(
                    'unique_user_bey_blade_'
                    'without_variant'
                )
            ),
            models.UniqueConstraint(
                fields=[
                    'user',
                    'variant'
                ],
                condition=models.Q(
                    variant__isnull=False
                ),
                name=(
                    'unique_user_bey_blade_'
                    'variant'
                )
            ),
        ]

        ordering = [
            'blade__name'
        ]

        verbose_name = 'Blade do usuário'
        verbose_name_plural = 'Blades do usuário'

    def clean(self):
        super().clean()

        if (
            self.variant
            and self.variant.blade_id
            != self.blade_id
        ):
            raise ValidationError(
                (
                    'A variante selecionada não '
                    'pertence à Blade informada.'
                )
            )

    def __str__(self):
        if self.variant:
            return (
                f"{self.variant} - "
                f"{self.user.username}"
            )

        return (
            f"{self.blade.name} - "
            f"{self.user.username}"
        )


class UserBeyRatchet(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_bey_ratchets'
    )

    ratchet = models.ForeignKey(
        BeyRatchet,
        on_delete=models.CASCADE,
        related_name='owned_by_users'
    )

    variant = models.ForeignKey(
        BeyRatchetVariant,
        on_delete=models.SET_NULL,
        related_name='owned_by_users',
        blank=True,
        null=True
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    acquired_at = models.DateField(
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
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
                    'ratchet'
                ],
                condition=models.Q(
                    variant__isnull=True
                ),
                name=(
                    'unique_user_bey_ratchet_'
                    'without_variant'
                )
            ),
            models.UniqueConstraint(
                fields=[
                    'user',
                    'variant'
                ],
                condition=models.Q(
                    variant__isnull=False
                ),
                name=(
                    'unique_user_bey_ratchet_'
                    'variant'
                )
            ),
        ]

        ordering = [
            'ratchet__name'
        ]

        verbose_name = 'Ratchet do usuário'
        verbose_name_plural = 'Ratchets do usuário'

    def clean(self):
        super().clean()

        if (
            self.variant
            and self.variant.ratchet_id
            != self.ratchet_id
        ):
            raise ValidationError(
                (
                    'A variante selecionada não '
                    'pertence ao Ratchet informado.'
                )
            )

    def __str__(self):
        if self.variant:
            return (
                f"{self.variant} - "
                f"{self.user.username}"
            )

        return (
            f"{self.ratchet.name} - "
            f"{self.user.username}"
        )


class UserBeyBit(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_bey_bits'
    )

    bit = models.ForeignKey(
        BeyBit,
        on_delete=models.CASCADE,
        related_name='owned_by_users'
    )

    variant = models.ForeignKey(
        BeyBitVariant,
        on_delete=models.SET_NULL,
        related_name='owned_by_users',
        blank=True,
        null=True
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    acquired_at = models.DateField(
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
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
                    'bit'
                ],
                condition=models.Q(
                    variant__isnull=True
                ),
                name=(
                    'unique_user_bey_bit_'
                    'without_variant'
                )
            ),
            models.UniqueConstraint(
                fields=[
                    'user',
                    'variant'
                ],
                condition=models.Q(
                    variant__isnull=False
                ),
                name=(
                    'unique_user_bey_bit_'
                    'variant'
                )
            ),
        ]

        ordering = [
            'bit__name'
        ]

        verbose_name = 'Bit do usuário'
        verbose_name_plural = 'Bits do usuário'

    def clean(self):
        super().clean()

        if (
            self.variant
            and self.variant.bit_id
            != self.bit_id
        ):
            raise ValidationError(
                (
                    'A variante selecionada não '
                    'pertence ao Bit informado.'
                )
            )

    def __str__(self):
        if self.variant:
            return (
                f"{self.variant} - "
                f"{self.user.username}"
            )

        return (
            f"{self.bit.name} - "
            f"{self.user.username}"
        )


class UserBeyAssistBlade(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_bey_assist_blades'
    )

    assist_blade = models.ForeignKey(
        BeyAssistBlade,
        on_delete=models.CASCADE,
        related_name='owned_by_users'
    )

    variant = models.ForeignKey(
        BeyAssistBladeVariant,
        on_delete=models.SET_NULL,
        related_name='owned_by_users',
        blank=True,
        null=True
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    acquired_at = models.DateField(
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
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
                    'assist_blade'
                ],
                condition=models.Q(
                    variant__isnull=True
                ),
                name=(
                    'unique_user_bey_assist_'
                    'without_variant'
                )
            ),
            models.UniqueConstraint(
                fields=[
                    'user',
                    'variant'
                ],
                condition=models.Q(
                    variant__isnull=False
                ),
                name=(
                    'unique_user_bey_assist_'
                    'variant'
                )
            ),
        ]

        ordering = [
            'assist_blade__name'
        ]

        verbose_name = 'Assist Blade do usuário'
        verbose_name_plural = 'Assist Blades do usuário'

    def clean(self):
        super().clean()

        if (
            self.variant
            and self.variant.assist_blade_id
            != self.assist_blade_id
        ):
            raise ValidationError(
                (
                    'A variante selecionada não '
                    'pertence à Assist Blade informada.'
                )
            )

    def __str__(self):
        if self.variant:
            return (
                f"{self.variant} - "
                f"{self.user.username}"
            )

        return (
            f"{self.assist_blade.name} - "
            f"{self.user.username}"
        )


class UserBeyLockChip(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_bey_lock_chips'
    )

    lock_chip = models.ForeignKey(
        BeyLockChip,
        on_delete=models.CASCADE,
        related_name='owned_by_users'
    )

    variant = models.ForeignKey(
        BeyLockChipVariant,
        on_delete=models.SET_NULL,
        related_name='owned_by_users',
        blank=True,
        null=True
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    acquired_at = models.DateField(
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
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
                    'lock_chip'
                ],
                condition=models.Q(
                    variant__isnull=True
                ),
                name=(
                    'unique_user_bey_lock_'
                    'without_variant'
                )
            ),
            models.UniqueConstraint(
                fields=[
                    'user',
                    'variant'
                ],
                condition=models.Q(
                    variant__isnull=False
                ),
                name=(
                    'unique_user_bey_lock_'
                    'variant'
                )
            ),
        ]

        ordering = [
            'lock_chip__name'
        ]

        verbose_name = 'Lock Chip do usuário'
        verbose_name_plural = 'Lock Chips do usuário'

    def clean(self):
        super().clean()

        if (
            self.variant
            and self.variant.lock_chip_id
            != self.lock_chip_id
        ):
            raise ValidationError(
                (
                    'A variante selecionada não '
                    'pertence ao Lock Chip informado.'
                )
            )

    def __str__(self):
        if self.variant:
            return (
                f"{self.variant} - "
                f"{self.user.username}"
            )

        return (
            f"{self.lock_chip.name} - "
            f"{self.user.username}"
        )


class BeybladeBuild(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='beyblade_builds'
    )

    name = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    blade = models.ForeignKey(
        BeyBlade,
        on_delete=models.PROTECT,
        related_name='builds'
    )

    blade_variant = models.ForeignKey(
        BeyBladeVariant,
        on_delete=models.SET_NULL,
        related_name='builds',
        blank=True,
        null=True
    )

    ratchet = models.ForeignKey(
        BeyRatchet,
        on_delete=models.PROTECT,
        related_name='builds'
    )

    ratchet_variant = models.ForeignKey(
        BeyRatchetVariant,
        on_delete=models.SET_NULL,
        related_name='builds',
        blank=True,
        null=True
    )

    bit = models.ForeignKey(
        BeyBit,
        on_delete=models.PROTECT,
        related_name='builds'
    )

    bit_variant = models.ForeignKey(
        BeyBitVariant,
        on_delete=models.SET_NULL,
        related_name='builds',
        blank=True,
        null=True
    )

    assist_blade = models.ForeignKey(
        BeyAssistBlade,
        on_delete=models.PROTECT,
        related_name='builds',
        blank=True,
        null=True
    )

    assist_blade_variant = models.ForeignKey(
        BeyAssistBladeVariant,
        on_delete=models.SET_NULL,
        related_name='builds',
        blank=True,
        null=True
    )

    lock_chip = models.ForeignKey(
        BeyLockChip,
        on_delete=models.PROTECT,
        related_name='builds',
        blank=True,
        null=True
    )

    lock_chip_variant = models.ForeignKey(
        BeyLockChipVariant,
        on_delete=models.SET_NULL,
        related_name='builds',
        blank=True,
        null=True
    )

    favorite = models.BooleanField(
        default=False
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            '-favorite',
            'blade__name'
        ]

        verbose_name = 'Build Beyblade'
        verbose_name_plural = 'Builds Beyblade'

    def clean(self):
        super().clean()

        if (
            self.blade_variant
            and self.blade_variant.blade_id
            != self.blade_id
        ):
            raise ValidationError(
                (
                    'A variante da Blade não '
                    'corresponde à Blade.'
                )
            )

        if (
            self.ratchet_variant
            and self.ratchet_variant.ratchet_id
            != self.ratchet_id
        ):
            raise ValidationError(
                (
                    'A variante do Ratchet não '
                    'corresponde ao Ratchet.'
                )
            )

        if (
            self.bit_variant
            and self.bit_variant.bit_id
            != self.bit_id
        ):
            raise ValidationError(
                (
                    'A variante do Bit não '
                    'corresponde ao Bit.'
                )
            )

        if (
            self.assist_blade_variant
            and (
                not self.assist_blade_id
                or (
                    self.assist_blade_variant.assist_blade_id
                    != self.assist_blade_id
                )
            )
        ):
            raise ValidationError(
                (
                    'A variante da Assist Blade não '
                    'corresponde à Assist Blade.'
                )
            )

        if (
            self.lock_chip_variant
            and (
                not self.lock_chip_id
                or (
                    self.lock_chip_variant.lock_chip_id
                    != self.lock_chip_id
                )
            )
        ):
            raise ValidationError(
                (
                    'A variante do Lock Chip não '
                    'corresponde ao Lock Chip.'
                )
            )

    def __str__(self):
        parts = []

        if self.lock_chip:
            parts.append(
                self.lock_chip.name
            )

        parts.append(
            self.blade.name
        )

        if self.assist_blade:
            parts.append(
                self.assist_blade.name
            )

        parts.append(
            self.ratchet.name
        )

        parts.append(
            (
                self.bit.abbreviation
                or self.bit.name
            )
        )

        return ' '.join(
            parts
        )


class BeybladeRelease(models.Model):
    SYSTEM_CHOICES = [
        (
            'BX',
            'Basic Line'
        ),
        (
            'UX',
            'Unique Line'
        ),
        (
            'CX',
            'Custom Line'
        ),
        (
            'EX',
            'Exclusive'
        ),
        (
            'OUTRO',
            'Outro'
        ),
    ]

    PRODUCT_TYPE_CHOICES = [
        (
            'STARTER',
            'Starter'
        ),
        (
            'BOOSTER',
            'Booster'
        ),
        (
            'RANDOM_BOOSTER',
            'Random Booster'
        ),
        (
            'SET',
            'Set'
        ),
        (
            'DECK_SET',
            'Deck Set'
        ),
        (
            'LIMITED',
            'Limitado / Exclusivo'
        ),
        (
            'PRIZE',
            'Prêmio / Campanha'
        ),
        (
            'OTHER',
            'Outro'
        ),
    ]

    code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_index=True
    )

    slug = models.SlugField(
        max_length=300,
        unique=True,
        blank=True,
        null=True
    )

    name = models.CharField(
        max_length=250
    )

    product_name = models.CharField(
        max_length=300,
        blank=True,
        null=True
    )

    edition_name = models.CharField(
        max_length=250,
        blank=True,
        null=True
    )

    product_type = models.CharField(
        max_length=30,
        choices=PRODUCT_TYPE_CHOICES,
        blank=True,
        null=True
    )

    slot_number = models.PositiveSmallIntegerField(
        blank=True,
        null=True
    )

    system = models.CharField(
        max_length=20,
        choices=SYSTEM_CHOICES,
        blank=True,
        null=True
    )

    release_date = models.DateField(
        blank=True,
        null=True
    )

    blade = models.ForeignKey(
        BeyBlade,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    blade_variant = models.ForeignKey(
        BeyBladeVariant,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    ratchet = models.ForeignKey(
        BeyRatchet,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    ratchet_variant = models.ForeignKey(
        BeyRatchetVariant,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    bit = models.ForeignKey(
        BeyBit,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    bit_variant = models.ForeignKey(
        BeyBitVariant,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    assist_blade = models.ForeignKey(
        BeyAssistBlade,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    assist_blade_variant = models.ForeignKey(
        BeyAssistBladeVariant,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    lock_chip = models.ForeignKey(
        BeyLockChip,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    lock_chip_variant = models.ForeignKey(
        BeyLockChipVariant,
        on_delete=models.SET_NULL,
        related_name='releases',
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to='beyblade/releases/',
        blank=True,
        null=True
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    source_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    source_item_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        db_index=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'code',
            'slot_number',
            'name'
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'source_url',
                    'source_item_id'
                ],
                condition=(
                    models.Q(
                        source_url__isnull=False
                    )
                    &
                    models.Q(
                        source_item_id__isnull=False
                    )
                ),
                name='unique_beyblade_source_item'
            )
        ]

        verbose_name = 'Lançamento Beyblade'
        verbose_name_plural = 'Lançamentos Beyblade'

    def clean(self):
        super().clean()

        if (
            self.blade_variant
            and (
                not self.blade_id
                or (
                    self.blade_variant.blade_id
                    != self.blade_id
                )
            )
        ):
            raise ValidationError(
                (
                    'A variante da Blade não '
                    'corresponde à Blade.'
                )
            )

        if (
            self.ratchet_variant
            and (
                not self.ratchet_id
                or (
                    self.ratchet_variant.ratchet_id
                    != self.ratchet_id
                )
            )
        ):
            raise ValidationError(
                (
                    'A variante do Ratchet não '
                    'corresponde ao Ratchet.'
                )
            )

        if (
            self.bit_variant
            and (
                not self.bit_id
                or (
                    self.bit_variant.bit_id
                    != self.bit_id
                )
            )
        ):
            raise ValidationError(
                (
                    'A variante do Bit não '
                    'corresponde ao Bit.'
                )
            )

        if (
            self.assist_blade_variant
            and (
                not self.assist_blade_id
                or (
                    self.assist_blade_variant.assist_blade_id
                    != self.assist_blade_id
                )
            )
        ):
            raise ValidationError(
                (
                    'A variante da Assist Blade não '
                    'corresponde à Assist Blade.'
                )
            )

        if (
            self.lock_chip_variant
            and (
                not self.lock_chip_id
                or (
                    self.lock_chip_variant.lock_chip_id
                    != self.lock_chip_id
                )
            )
        ):
            raise ValidationError(
                (
                    'A variante do Lock Chip não '
                    'corresponde ao Lock Chip.'
                )
            )

    def __str__(self):
        prefix = (
            self.code
            or 'SEM CÓDIGO'
        )

        label = self.name

        if self.edition_name:
            label = (
                f"{label} - "
                f"{self.edition_name}"
            )

        if self.slot_number:
            label = (
                f"{label} "
                f"[#{self.slot_number}]"
            )

        return (
            f"{prefix} - "
            f"{label}"
        )