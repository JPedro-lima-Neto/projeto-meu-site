import os
import re
import html
import time
import xml.etree.ElementTree as ET

import requests

from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import User

from rest_framework import (
    viewsets,
    status,
)

from rest_framework.decorators import action

from rest_framework.response import Response

from rest_framework.authtoken.views import (
    ObtainAuthToken
)

from rest_framework.authtoken.models import Token

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)

from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)

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
)

from .serializers import (
    PlatformSerializer,
    GameCatalogSerializer,
    UserGameEntrySerializer,
    UserOwnedGameSerializer,
    PokemonSerializer,
    UserPokemonSerializer,
    PokemonHallOfFameSerializer,
    ConsoleSerializer,
    BoardGameSerializer,
    BoardGameCatalogSerializer,
    UserBoardGameSerializer,
    UserProfileSerializer,
    AchievementSerializer,
    FollowSerializer,
    LikeSerializer,
    CommentSerializer,
    LibraryCatalogSerializer,
    UserLibraryEntrySerializer,
)


BGG_BASE_URL = (
    'https://boardgamegeek.com/xmlapi2'
)


TWITCH_TOKEN_URL = (
    'https://id.twitch.tv/oauth2/token'
)


IGDB_BASE_URL = (
    'https://api.igdb.com/v4'
)


_twitch_token_cache = {
    'access_token': None,
    'expires_at': 0,
}


def get_bgg_headers():
    token = (
        settings.BGG_API_TOKEN
        or os.environ.get(
            'BGG_API_TOKEN'
        )
    )

    if not token:
        return None

    return {
        'Authorization':
            f'Bearer {token}',

        'Accept':
            'application/xml',

        'User-Agent':
            'GeeksJourney/1.0',
    }


def clean_bgg_text(text):
    if not text:
        return ''

    text = html.unescape(
        text
    )

    text = re.sub(
        r'<br\s*/?>',
        '\n',
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r'<[^>]+>',
        '',
        text
    )

    text = text.replace(
        '\r',
        ''
    )

    text = re.sub(
        r'\n{3,}',
        '\n\n',
        text
    )

    return text.strip()


def get_xml_value(
    element,
    tag,
    default=None
):
    child = element.find(
        tag
    )

    if child is None:
        return default

    return child.attrib.get(
        'value',
        default
    )


def safe_int(value):
    if (
        value is None
        or value == ''
    ):
        return None

    try:
        return int(
            value
        )

    except (
        TypeError,
        ValueError
    ):
        return None


def safe_decimal(value):
    if (
        value is None
        or value == ''
    ):
        return None

    try:
        return Decimal(
            str(value)
        )

    except Exception:
        return None


def get_primary_name(item):
    primary = item.find(
        "name[@type='primary']"
    )

    if primary is not None:
        return primary.attrib.get(
            'value',
            ''
        )

    first_name = item.find(
        'name'
    )

    if first_name is not None:
        return first_name.attrib.get(
            'value',
            ''
        )

    return ''


def parse_bgg_search(
    xml_content
):
    root = ET.fromstring(
        xml_content
    )

    results = []

    for item in root.findall(
        'item'
    ):
        bgg_id = safe_int(
            item.attrib.get(
                'id'
            )
        )

        name_element = (
            item.find(
                'name'
            )
        )

        year_element = (
            item.find(
                'yearpublished'
            )
        )

        name = ''

        if name_element is not None:
            name = (
                name_element
                .attrib
                .get(
                    'value',
                    ''
                )
            )

        year = None

        if year_element is not None:
            year = safe_int(
                year_element
                .attrib
                .get(
                    'value'
                )
            )

        results.append({
            'bgg_id':
                bgg_id,

            'name':
                name,

            'year':
                year,
        })

    return results


def parse_bgg_game(
    xml_content
):
    root = ET.fromstring(
        xml_content
    )

    item = root.find(
        'item'
    )

    if item is None:
        return None

    bgg_id = safe_int(
        item.attrib.get(
            'id'
        )
    )

    name = get_primary_name(
        item
    )

    names = []

    for name_element in item.findall(
        'name'
    ):
        value = (
            name_element
            .attrib
            .get(
                'value'
            )
        )

        if (
            value
            and value != name
        ):
            names.append(
                value
            )

    original_name = (
        names[0]
        if names
        else None
    )

    description_element = (
        item.find(
            'description'
        )
    )

    description = ''

    if description_element is not None:
        description = (
            clean_bgg_text(
                description_element.text
            )
        )

    image_element = (
        item.find(
            'image'
        )
    )

    thumbnail_element = (
        item.find(
            'thumbnail'
        )
    )

    cover_url = None
    thumbnail_url = None

    if image_element is not None:
        cover_url = (
            image_element.text
        )

    if thumbnail_element is not None:
        thumbnail_url = (
            thumbnail_element.text
        )

    year = safe_int(
        get_xml_value(
            item,
            'yearpublished'
        )
    )

    min_players = safe_int(
        get_xml_value(
            item,
            'minplayers'
        )
    )

    max_players = safe_int(
        get_xml_value(
            item,
            'maxplayers'
        )
    )

    min_play_time = safe_int(
        get_xml_value(
            item,
            'minplaytime'
        )
    )

    max_play_time = safe_int(
        get_xml_value(
            item,
            'maxplaytime'
        )
    )

    min_age = safe_int(
        get_xml_value(
            item,
            'minage'
        )
    )

    categories = []
    mechanics = []
    designers = []
    artists = []
    publishers = []

    for link in item.findall(
        'link'
    ):
        link_type = (
            link.attrib.get(
                'type'
            )
        )

        value = (
            link.attrib.get(
                'value'
            )
        )

        if not value:
            continue

        if (
            link_type
            ==
            'boardgamecategory'
        ):
            categories.append(
                value
            )

        elif (
            link_type
            ==
            'boardgamemechanic'
        ):
            mechanics.append(
                value
            )

        elif (
            link_type
            ==
            'boardgamedesigner'
        ):
            designers.append(
                value
            )

        elif (
            link_type
            ==
            'boardgameartist'
        ):
            artists.append(
                value
            )

        elif (
            link_type
            ==
            'boardgamepublisher'
        ):
            publishers.append(
                value
            )

    publisher = (
        publishers[0]
        if publishers
        else None
    )

    bgg_rating = None
    bgg_weight = None

    statistics = item.find(
        'statistics'
    )

    if statistics is not None:
        ratings = (
            statistics.find(
                'ratings'
            )
        )

        if ratings is not None:
            average = (
                ratings.find(
                    'average'
                )
            )

            average_weight = (
                ratings.find(
                    'averageweight'
                )
            )

            if average is not None:
                bgg_rating = (
                    safe_decimal(
                        average
                        .attrib
                        .get(
                            'value'
                        )
                    )
                )

            if average_weight is not None:
                bgg_weight = (
                    safe_decimal(
                        average_weight
                        .attrib
                        .get(
                            'value'
                        )
                    )
                )

    return {
        'bgg_id':
            bgg_id,

        'name':
            name,

        'original_name':
            original_name,

        'description':
            description,

        'cover_url':
            cover_url,

        'thumbnail_url':
            thumbnail_url,

        'year':
            year,

        'min_players':
            min_players,

        'max_players':
            max_players,

        'min_play_time':
            min_play_time,

        'max_play_time':
            max_play_time,

        'min_age':
            min_age,

        'publisher':
            publisher,

        'publishers':
            publishers,

        'categories':
            categories,

        'mechanics':
            mechanics,

        'designers':
            designers,

        'artists':
            artists,

        'bgg_rating':
            bgg_rating,

        'bgg_weight':
            bgg_weight,
    }


def request_bgg(
    endpoint,
    params=None
):
    headers = (
        get_bgg_headers()
    )

    if not headers:
        return {
            'success':
                False,

            'status':
                500,

            'error':
                (
                    'BGG_API_TOKEN '
                    'não configurado.'
                ),
        }

    url = (
        f'{BGG_BASE_URL}/'
        f'{endpoint}'
    )

    try:
        response = (
            requests.get(
                url,
                params=params or {},
                headers=headers,
                timeout=20
            )
        )

    except requests.RequestException as error:
        return {
            'success':
                False,

            'status':
                503,

            'error':
                (
                    'Não foi possível '
                    'conectar à '
                    'BoardGameGeek.'
                ),

            'details':
                str(error),
        }

    if response.status_code == 401:
        return {
            'success':
                False,

            'status':
                401,

            'error':
                (
                    'Token da '
                    'BoardGameGeek '
                    'inválido ou ausente.'
                ),
        }

    if response.status_code == 202:
        return {
            'success':
                False,

            'status':
                202,

            'error':
                (
                    'A BoardGameGeek '
                    'ainda está processando '
                    'a solicitação. '
                    'Tente novamente '
                    'em alguns segundos.'
                ),
        }

    if response.status_code in [
        429,
        500,
        502,
        503,
        504,
    ]:
        return {
            'success':
                False,

            'status':
                503,

            'error':
                (
                    'A BoardGameGeek '
                    'está temporariamente '
                    'indisponível ou '
                    'limitando requisições.'
                ),
        }

    if not response.ok:
        return {
            'success':
                False,

            'status':
                response.status_code,

            'error':
                (
                    'Erro ao consultar '
                    'a BoardGameGeek.'
                ),
        }

    return {
        'success':
            True,

        'content':
            response.content,
    }


def get_twitch_access_token():
    client_id = (
        settings.TWITCH_CLIENT_ID
    )

    client_secret = (
        settings.TWITCH_CLIENT_SECRET
    )

    if (
        not client_id
        or not client_secret
    ):
        raise RuntimeError(
            (
                'TWITCH_CLIENT_ID '
                'ou '
                'TWITCH_CLIENT_SECRET '
                'não configurado.'
            )
        )

    current_time = (
        time.time()
    )

    cached_token = (
        _twitch_token_cache.get(
            'access_token'
        )
    )

    expires_at = (
        _twitch_token_cache.get(
            'expires_at',
            0
        )
    )

    if (
        cached_token
        and current_time
        < expires_at
    ):
        return cached_token

    response = (
        requests.post(
            TWITCH_TOKEN_URL,
            params={
                'client_id':
                    client_id,

                'client_secret':
                    client_secret,

                'grant_type':
                    'client_credentials',
            },
            timeout=20,
        )
    )

    response.raise_for_status()

    data = response.json()

    access_token = (
        data.get(
            'access_token'
        )
    )

    expires_in = (
        data.get(
            'expires_in',
            0
        )
    )

    if not access_token:
        raise RuntimeError(
            (
                'A Twitch não retornou '
                'um access token.'
            )
        )

    _twitch_token_cache[
        'access_token'
    ] = access_token

    _twitch_token_cache[
        'expires_at'
    ] = (
        current_time
        +
        max(
            int(expires_in) - 60,
            0
        )
    )

    return access_token


def get_igdb_headers():
    token = (
        get_twitch_access_token()
    )

    return {
        'Client-ID':
            settings.TWITCH_CLIENT_ID,

        'Authorization':
            f'Bearer {token}',

        'Accept':
            'application/json',
    }


def get_igdb_cover_url(
    image_id,
    size='cover_big'
):
    if not image_id:
        return None

    return (
        'https://images.igdb.com/'
        'igdb/image/upload/'
        f't_{size}/'
        f'{image_id}.jpg'
    )


def get_igdb_logo_url(
    image_id,
    size='logo_med'
):
    if not image_id:
        return None

    return (
        'https://images.igdb.com/'
        'igdb/image/upload/'
        f't_{size}/'
        f'{image_id}.png'
    )


def normalize_igdb_platform(platform):
    logo = platform.get('platform_logo') or {}

    return {
        'igdb_id': platform.get('id'),
        'name': platform.get('name'),
        'abbreviation': platform.get('abbreviation'),
        'slug': platform.get('slug'),
        'generation': platform.get('generation'),
        'logo_url': get_igdb_logo_url(
            logo.get('image_id')
        ),
    }


def normalize_igdb_game(game):
    cover = game.get('cover') or {}

    platform_data = [
        normalize_igdb_platform(platform)
        for platform in game.get('platforms', [])
        if platform.get('id')
    ]

    genres = [
        genre.get('name')
        for genre in game.get('genres', [])
        if genre.get('name')
    ]

    developers = []
    publishers = []

    for relation in game.get('involved_companies', []):
        company = relation.get('company') or {}
        company_name = company.get('name')

        if not company_name:
            continue

        if relation.get('developer'):
            developers.append(company_name)

        if relation.get('publisher'):
            publishers.append(company_name)

    release_year = None
    first_release_date = game.get('first_release_date')

    if first_release_date:
        try:
            release_year = time.gmtime(
                first_release_date
            ).tm_year
        except Exception:
            release_year = None

    return {
        'igdb_id': game.get('id'),
        'name': game.get('name'),
        'slug': game.get('slug'),
        'description': game.get('summary'),
        'storyline': game.get('storyline'),
        'release_year': release_year,
        'cover_url': get_igdb_cover_url(
            cover.get('image_id')
        ),
        'platforms': [
            platform.get('name')
            for platform in platform_data
            if platform.get('name')
        ],
        'platform_data': platform_data,
        'genres': genres,
        'developers': developers,
        'publishers': publishers,
        'rating': game.get('rating'),
        'aggregated_rating': game.get('aggregated_rating'),
    }


def request_igdb(endpoint, body):
    try:
        headers = get_igdb_headers()
        response = requests.post(
            f'{IGDB_BASE_URL}/{endpoint}',
            headers=headers,
            data=body,
            timeout=20,
        )
    except requests.RequestException as error:
        return {
            'success': False,
            'status': 503,
            'error': 'Não foi possível conectar à IGDB.',
            'details': str(error),
        }
    except RuntimeError as error:
        return {
            'success': False,
            'status': 500,
            'error': str(error),
        }

    if response.status_code == 401:
        _twitch_token_cache['access_token'] = None
        _twitch_token_cache['expires_at'] = 0
        return {
            'success': False,
            'status': 401,
            'error': 'Não foi possível autenticar na Twitch/IGDB.',
        }

    if response.status_code == 429:
        return {
            'success': False,
            'status': 429,
            'error': 'Limite de requisições da IGDB atingido.',
        }

    if not response.ok:
        return {
            'success': False,
            'status': response.status_code,
            'error': 'Erro ao consultar a IGDB.',
            'details': response.text,
        }

    try:
        data = response.json()
    except ValueError:
        return {
            'success': False,
            'status': 502,
            'error': 'A IGDB retornou uma resposta inválida.',
        }

    return {
        'success': True,
        'data': data,
    }


def _escape_igdb_search(query):
    value = str(query)
    value = value.replace(chr(92), chr(92) * 2)
    value = value.replace(chr(34), chr(92) + chr(34))
    return value


def search_igdb_games(query, limit=20):
    safe_query = _escape_igdb_search(query)

    body = f"""
        search "{safe_query}";
        fields
            id,
            name,
            slug,
            summary,
            storyline,
            first_release_date,
            cover.image_id,
            platforms.id,
            platforms.name,
            platforms.abbreviation,
            platforms.slug,
            platforms.generation,
            platforms.platform_logo.image_id,
            genres.name,
            involved_companies.developer,
            involved_companies.publisher,
            involved_companies.company.name,
            rating,
            aggregated_rating;
        limit {int(limit)};
    """

    result = request_igdb('games', body)

    if not result.get('success'):
        return result

    return {
        'success': True,
        'games': [
            normalize_igdb_game(game)
            for game in result.get('data', [])
        ],
    }


def get_igdb_game_detail(igdb_id):
    body = f"""
        fields
            id,
            name,
            slug,
            summary,
            storyline,
            first_release_date,
            cover.image_id,
            platforms.id,
            platforms.name,
            platforms.abbreviation,
            platforms.slug,
            platforms.generation,
            platforms.platform_logo.image_id,
            genres.name,
            involved_companies.developer,
            involved_companies.publisher,
            involved_companies.company.name,
            rating,
            aggregated_rating;
        where id = {int(igdb_id)};
        limit 1;
    """

    result = request_igdb('games', body)

    if not result.get('success'):
        return result

    games = result.get('data', [])

    if not games:
        return {
            'success': False,
            'status': 404,
            'error': 'Jogo não encontrado na IGDB.',
        }

    return {
        'success': True,
        'game': normalize_igdb_game(games[0]),
    }


def search_igdb_platforms(query, limit=20):
    safe_query = _escape_igdb_search(query)

    body = f"""
        search "{safe_query}";
        fields
            id,
            name,
            abbreviation,
            slug,
            generation,
            platform_logo.image_id;
        limit {int(limit)};
    """

    result = request_igdb('platforms', body)

    if not result.get('success'):
        return result

    return {
        'success': True,
        'platforms': [
            normalize_igdb_platform(platform)
            for platform in result.get('data', [])
        ],
    }


def get_igdb_platform_detail(igdb_id):
    body = f"""
        fields
            id,
            name,
            abbreviation,
            slug,
            generation,
            platform_logo.image_id;
        where id = {int(igdb_id)};
        limit 1;
    """

    result = request_igdb('platforms', body)

    if not result.get('success'):
        return result

    platforms = result.get('data', [])

    if not platforms:
        return {
            'success': False,
            'status': 404,
            'error': 'Plataforma não encontrada na IGDB.',
        }

    return {
        'success': True,
        'platform': normalize_igdb_platform(platforms[0]),
    }


def save_igdb_platform(platform_data):
    if not platform_data:
        return None

    igdb_id = (
        platform_data.get('igdb_id')
        or platform_data.get('id')
    )

    name = (
        platform_data.get('name')
        or ''
    ).strip()

    if not igdb_id:
        raise ValueError(
            'Plataforma da IGDB sem ID.'
        )

    if not name:
        name = f'IGDB {igdb_id}'

    platform = (
        Platform.objects
        .filter(
            igdb_id=igdb_id
        )
        .first()
    )

    if not platform:
        platform = (
            Platform.objects
            .filter(
                name__iexact=name
            )
            .first()
        )

    if platform:
        platform.igdb_id = igdb_id
        platform.name = name

        platform.abbreviation = (
            platform_data.get(
                'abbreviation'
            )
        )

        platform.slug = (
            platform_data.get(
                'slug'
            )
        )

        platform.generation = (
            platform_data.get(
                'generation'
            )
        )

        logo_url = (
            platform_data.get(
                'logo_url'
            )
        )

        if logo_url:
            platform.logo_url = logo_url

        platform.save()

        return platform

    platform = (
        Platform.objects.create(
            igdb_id=igdb_id,
            name=name,
            abbreviation=(
                platform_data.get(
                    'abbreviation'
                )
            ),
            slug=(
                platform_data.get(
                    'slug'
                )
            ),
            generation=(
                platform_data.get(
                    'generation'
                )
            ),
            logo_url=(
                platform_data.get(
                    'logo_url'
                )
            ),
        )
    )

    return platform

class CustomAuthToken(
    ObtainAuthToken
):
    def post(
        self,
        request,
        *args,
        **kwargs
    ):
        email = (
            request.data.get(
                'email'
            )
        )

        password = (
            request.data.get(
                'password'
            )
        )

        user = (
            User.objects.filter(
                email=email
            )
            .first()
        )

        if (
            user is None
            or not user.check_password(
                password
            )
        ):
            return Response(
                {
                    'error':
                        (
                            'E-mail ou '
                            'senha inválidos'
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                )
            )

        token, created = (
            Token.objects
            .get_or_create(
                user=user
            )
        )

        return Response({
            'token':
                token.key,

            'user_id':
                user.pk,

            'username':
                user.username,
        })


class UserProfileViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        UserProfile.objects.all()
    )

    serializer_class = (
        UserProfileSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    parser_classes = (
        MultiPartParser,
        FormParser
    )

    lookup_field = (
        'user__username'
    )

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):
        instance = (
            self.get_object()
        )

        if (
            request.user
            .is_authenticated
            and request.user
            != instance.user
        ):
            instance.profile_views += 1

            instance.save()

        return super().retrieve(
            request,
            *args,
            **kwargs
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        kwargs[
            'partial'
        ] = True

        instance = (
            self.get_object()
        )

        if (
            request.user
            != instance.user
        ):
            return Response(
                {
                    'error':
                        'Não autorizado'
                },
                status=(
                    status
                    .HTTP_403_FORBIDDEN
                )
            )

        return super().update(
            request,
            *args,
            **kwargs
        )


class AchievementViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        AchievementSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    parser_classes = (
        MultiPartParser,
        FormParser
    )

    def get_queryset(self):
        target_username = (
            self.request
            .query_params
            .get(
                'username'
            )
        )

        if target_username:
            return (
                Achievement.objects
                .filter(
                    user__username=
                    target_username
                )
            )

        if (
            self.request
            .user
            .is_authenticated
        ):
            return (
                Achievement.objects
                .filter(
                    user=
                    self.request.user
                )
            )

        return (
            Achievement.objects.none()
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class ConsoleViewSet(
    viewsets.ModelViewSet
):
    serializer_class = ConsoleSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        target_username = (
            self.request.query_params.get('username')
        )

        queryset = Console.objects.select_related(
            'user',
            'platform'
        )

        if target_username:
            return queryset.filter(
                user__username=target_username
            )

        if self.request.user.is_authenticated:
            return queryset.filter(
                user=self.request.user
            )

        return Console.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        url_path='import-igdb'
    )
    def import_igdb(self, request):
        igdb_id = request.data.get('igdb_id')

        if not igdb_id:
            return Response(
                {'error': 'igdb_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            igdb_id = int(igdb_id)
        except (TypeError, ValueError):
            return Response(
                {'error': 'igdb_id inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = get_igdb_platform_detail(igdb_id)

        if not result.get('success'):
            return Response(
                {
                    'error': result.get('error'),
                    'details': result.get('details'),
                },
                status=result.get('status', 503)
            )

        platform = save_igdb_platform(
            result['platform']
        )

        console, created = Console.objects.get_or_create(
            user=request.user,
            platform=platform
        )

        return Response(
            ConsoleSerializer(
                console,
                context={'request': request}
            ).data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            )
        )
class UserGameEntryViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        UserGameEntrySerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        target_username = (
            self.request
            .query_params
            .get(
                'username'
            )
        )

        if target_username:
            return (
                UserGameEntry.objects
                .filter(
                    user__username=
                    target_username
                )
            )

        if (
            self.request
            .user
            .is_authenticated
        ):
            return (
                UserGameEntry.objects
                .filter(
                    user=
                    self.request.user
                )
            )

        return (
            UserGameEntry.objects.none()
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class UserOwnedGameViewSet(
    viewsets.ModelViewSet
):
    serializer_class = UserOwnedGameSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        queryset = (
            UserOwnedGame.objects
            .select_related(
                'user',
                'game_catalog',
                'platform',
            )
            .prefetch_related(
                'game_catalog__platforms'
            )
        )

        target_username = self.request.query_params.get(
            'username'
        )
        platform_name = self.request.query_params.get(
            'platform'
        )
        ownership_type = self.request.query_params.get(
            'type'
        )

        if target_username:
            queryset = queryset.filter(
                user__username=target_username
            )
        elif self.request.user.is_authenticated:
            queryset = queryset.filter(
                user=self.request.user
            )
        else:
            return UserOwnedGame.objects.none()

        if platform_name:
            queryset = queryset.filter(
                platform__name__iexact=platform_name
            )

        if ownership_type:
            queryset = queryset.filter(
                ownership_type__iexact=ownership_type
            )

        return queryset.order_by(
            'game_catalog__title'
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
class FollowViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        FollowSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            follower=self.request.user
        )


class LikeViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        LikeSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class CommentViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        CommentSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class PlatformViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = Platform.objects.all().order_by('name')
    serializer_class = PlatformSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='search-igdb'
    )
    def search_igdb(self, request):
        query = request.query_params.get('q', '').strip()

        if not query:
            return Response(
                {
                    'error': (
                        'Informe uma plataforma '
                        'para pesquisar.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        result = search_igdb_platforms(query)

        if not result.get('success'):
            return Response(
                {
                    'error': result.get('error'),
                    'details': result.get('details'),
                },
                status=result.get('status', 503)
            )

        return Response(
            result.get('platforms', [])
        )

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        url_path='import-igdb'
    )
    def import_igdb(self, request):
        igdb_id = request.data.get('igdb_id')

        if not igdb_id:
            return Response(
                {'error': 'igdb_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            igdb_id = int(igdb_id)
        except (TypeError, ValueError):
            return Response(
                {'error': 'igdb_id inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = get_igdb_platform_detail(igdb_id)

        if not result.get('success'):
            return Response(
                {
                    'error': result.get('error'),
                    'details': result.get('details'),
                },
                status=result.get('status', 503)
            )

        platform = save_igdb_platform(
            result['platform']
        )

        return Response(
            PlatformSerializer(
                platform,
                context={'request': request}
            ).data
        )


class GameCatalogViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        GameCatalog.objects
        .all()
        .prefetch_related('platforms')
        .order_by('title')
    )
    serializer_class = GameCatalogSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='search-igdb'
    )
    def search_igdb(self, request):
        query = request.query_params.get('q', '').strip()

        if not query:
            return Response(
                {
                    'error': (
                        'Informe um nome '
                        'para pesquisar.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        result = search_igdb_games(query)

        if not result.get('success'):
            return Response(
                {
                    'error': result.get('error'),
                    'details': result.get('details'),
                },
                status=result.get('status', 503)
            )

        return Response(
            result.get('games', [])
        )

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        url_path='import-igdb'
    )
    def import_igdb(self, request):
        igdb_id = request.data.get('igdb_id')
        platform_name = request.data.get('platform')
        owned = request.data.get('owned', False)
        ownership_type = request.data.get(
            'ownership_type',
            'DIGITAL'
        )
        status_value = request.data.get('status')
        rating = request.data.get('rating')
        completed = request.data.get('completed', False)

        if not igdb_id:
            return Response(
                {'error': 'igdb_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            igdb_id = int(igdb_id)
        except (TypeError, ValueError):
            return Response(
                {'error': 'igdb_id inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = get_igdb_game_detail(igdb_id)

        if not result.get('success'):
            return Response(
                {
                    'error': result.get('error'),
                    'details': result.get('details'),
                },
                status=result.get('status', 503)
            )

        igdb_game = result['game']
        platform_objects = []

        for platform_data in igdb_game.get(
            'platform_data',
            []
        ):
            try:
                platform_objects.append(
                    save_igdb_platform(platform_data)
                )
            except ValueError:
                continue

        game_catalog, created = (
            GameCatalog.objects.update_or_create(
                igdb_id=igdb_id,
                defaults={
                    'title': (
                        igdb_game.get('name')
                        or f'IGDB {igdb_id}'
                    ),
                    'slug': igdb_game.get('slug'),
                    'description': igdb_game.get(
                        'description'
                    ),
                    'storyline': igdb_game.get(
                        'storyline'
                    ),
                    'cover_url': igdb_game.get(
                        'cover_url'
                    ),
                    'release_year': igdb_game.get(
                        'release_year'
                    ),
                    'genres': igdb_game.get(
                        'genres',
                        []
                    ),
                    'developers': igdb_game.get(
                        'developers',
                        []
                    ),
                    'publishers': igdb_game.get(
                        'publishers',
                        []
                    ),
                    'igdb_rating': safe_decimal(
                        igdb_game.get('rating')
                    ),
                    'aggregated_rating': safe_decimal(
                        igdb_game.get('aggregated_rating')
                    ),
                }
            )
        )

        game_catalog.platforms.set(
            platform_objects
        )

        selected_platform = None

        if platform_name:
            selected_platform = next(
                (
                    platform
                    for platform in platform_objects
                    if platform.name.lower()
                    == str(platform_name).lower()
                ),
                None
            )

            if selected_platform is None:
                return Response(
                    {
                        'error': (
                            'A plataforma escolhida '
                            'não pertence a esta '
                            'versão do jogo na IGDB.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif platform_objects:
            selected_platform = platform_objects[0]

        owned_value = str(owned).lower() in [
            'true',
            '1',
            'yes',
            'sim',
        ]

        completed_value = str(completed).lower() in [
            'true',
            '1',
            'yes',
            'sim',
        ]

        owned_entry = None

        if owned_value:
            if selected_platform is None:
                return Response(
                    {
                        'error': (
                            'Escolha uma plataforma '
                            'para adicionar o jogo '
                            'à coleção.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if ownership_type not in [
                'FISICO',
                'DIGITAL',
            ]:
                return Response(
                    {'error': 'Formato de posse inválido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            owned_entry, owned_created = (
                UserOwnedGame.objects.get_or_create(
                    user=request.user,
                    game_catalog=game_catalog,
                    platform=selected_platform,
                    ownership_type=ownership_type,
                    defaults={
                        'completed': completed_value,
                    }
                )
            )

            if not owned_created:
                owned_entry.completed = completed_value
                owned_entry.save()

        game_entry = None

        if status_value:
            valid_statuses = [
                choice[0]
                for choice in UserGameEntry.STATUS_CHOICES
            ]

            if status_value not in valid_statuses:
                return Response(
                    {'error': 'Status inválido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            normalized_rating = (
                None
                if rating in [None, '']
                else safe_decimal(rating)
            )

            game_entry, entry_created = (
                UserGameEntry.objects.get_or_create(
                    user=request.user,
                    game_catalog=game_catalog,
                    defaults={
                        'status': status_value,
                        'rating': normalized_rating,
                    }
                )
            )

            if not entry_created:
                game_entry.status = status_value

                if rating not in [None, '']:
                    game_entry.rating = normalized_rating

                game_entry.save()

        return Response(
            {
                'message': (
                    f'{game_catalog.title} '
                    'salvo com sucesso.'
                ),
                'game': GameCatalogSerializer(
                    game_catalog,
                    context={'request': request}
                ).data,
                'owned_game': (
                    UserOwnedGameSerializer(
                        owned_entry,
                        context={'request': request}
                    ).data
                    if owned_entry
                    else None
                ),
                'game_entry': (
                    UserGameEntrySerializer(
                        game_entry,
                        context={'request': request}
                    ).data
                    if game_entry
                    else None
                ),
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            )
        )
class PokemonViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        Pokemon.objects
        .all()
        .order_by(
            'pokedex_id'
        )
    )

    serializer_class = (
        PokemonSerializer
    )

    permission_classes = [
        AllowAny
    ]

    pagination_class = None


class UserPokemonViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        UserPokemonSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        target_username = (
            self.request
            .query_params
            .get(
                'username'
            )
        )

        if target_username:
            return (
                UserPokemon.objects
                .filter(
                    user__username=
                    target_username
                )
            )

        if (
            self.request
            .user
            .is_authenticated
        ):
            return (
                UserPokemon.objects
                .filter(
                    user=
                    self.request.user
                )
            )

        return (
            UserPokemon.objects.none()
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class PokemonHallOfFameViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        PokemonHallOfFameSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        target_username = (
            self.request
            .query_params
            .get(
                'username'
            )
        )

        if target_username:
            return (
                PokemonHallOfFame
                .objects
                .filter(
                    user__username=
                    target_username
                )
            )

        if (
            self.request
            .user
            .is_authenticated
        ):
            return (
                PokemonHallOfFame
                .objects
                .filter(
                    user=
                    self.request.user
                )
            )

        return (
            PokemonHallOfFame
            .objects
            .none()
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class BoardGameViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        BoardGameSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        target_username = (
            self.request
            .query_params
            .get(
                'username'
            )
        )

        if target_username:
            return (
                BoardGame.objects
                .filter(
                    user__username=
                    target_username
                )
            )

        if (
            self.request
            .user
            .is_authenticated
        ):
            return (
                BoardGame.objects
                .filter(
                    user=
                    self.request.user
                )
            )

        return (
            BoardGame.objects.none()
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class BoardGameCatalogViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        BoardGameCatalog.objects
        .all()
        .order_by(
            'name'
        )
    )

    serializer_class = (
        BoardGameCatalogSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    @action(
        detail=False,
        methods=[
            'get'
        ],
        permission_classes=[
            IsAuthenticated
        ],
        url_path='search'
    )
    def search_bgg(
        self,
        request
    ):
        query = (
            request.query_params
            .get(
                'q',
                ''
            )
            .strip()
        )

        if not query:
            return Response(
                {
                    'error':
                        (
                            'Informe um nome '
                            'para pesquisar.'
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                )
            )

        result = (
            request_bgg(
                'search',
                params={
                    'query':
                        query,

                    'type':
                        'boardgame',
                }
            )
        )

        if not result[
            'success'
        ]:
            return Response(
                {
                    'error':
                        result.get(
                            'error'
                        )
                },
                status=result.get(
                    'status',
                    503
                )
            )

        try:
            games = (
                parse_bgg_search(
                    result[
                        'content'
                    ]
                )
            )

        except ET.ParseError:
            return Response(
                {
                    'error':
                        (
                            'Resposta inválida '
                            'da BoardGameGeek.'
                        )
                },
                status=(
                    status
                    .HTTP_502_BAD_GATEWAY
                )
            )

        return Response(
            games
        )

    @action(
        detail=False,
        methods=[
            'get'
        ],
        permission_classes=[
            IsAuthenticated
        ],
        url_path=(
            r'bgg/'
            r'(?P<bgg_id>\d+)'
        )
    )
    def bgg_detail(
        self,
        request,
        bgg_id=None
    ):
        result = (
            request_bgg(
                'thing',
                params={
                    'id':
                        bgg_id,

                    'stats':
                        1,
                }
            )
        )

        if not result[
            'success'
        ]:
            return Response(
                {
                    'error':
                        result.get(
                            'error'
                        )
                },
                status=result.get(
                    'status',
                    503
                )
            )

        try:
            game_data = (
                parse_bgg_game(
                    result[
                        'content'
                    ]
                )
            )

        except ET.ParseError:
            return Response(
                {
                    'error':
                        (
                            'Resposta inválida '
                            'da BoardGameGeek.'
                        )
                },
                status=(
                    status
                    .HTTP_502_BAD_GATEWAY
                )
            )

        if not game_data:
            return Response(
                {
                    'error':
                        (
                            'Jogo não '
                            'encontrado.'
                        )
                },
                status=(
                    status
                    .HTTP_404_NOT_FOUND
                )
            )

        return Response(
            game_data
        )

    @action(
        detail=False,
        methods=[
            'post'
        ],
        permission_classes=[
            IsAuthenticated
        ],
        url_path='import'
    )
    def import_game(
        self,
        request
    ):
        bgg_id = (
            request.data.get(
                'bgg_id'
            )
        )

        owned = (
            request.data.get(
                'owned',
                False
            )
        )

        played = (
            request.data.get(
                'played',
                True
            )
        )

        rating = (
            request.data.get(
                'rating'
            )
        )

        acquired_at = (
            request.data.get(
                'acquired_at'
            )
        )

        notes = (
            request.data.get(
                'notes'
            )
        )

        if not bgg_id:
            return Response(
                {
                    'error':
                        (
                            'bgg_id é '
                            'obrigatório.'
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                )
            )

        try:
            bgg_id = int(
                bgg_id
            )

        except (
            TypeError,
            ValueError
        ):
            return Response(
                {
                    'error':
                        (
                            'bgg_id '
                            'inválido.'
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                )
            )

        game = (
            BoardGameCatalog.objects
            .filter(
                bgg_id=bgg_id
            )
            .first()
        )

        if not game:
            result = (
                request_bgg(
                    'thing',
                    params={
                        'id':
                            bgg_id,

                        'stats':
                            1,
                    }
                )
            )

            if not result[
                'success'
            ]:
                return Response(
                    {
                        'error':
                            result.get(
                                'error'
                            )
                    },
                    status=result.get(
                        'status',
                        503
                    )
                )

            try:
                game_data = (
                    parse_bgg_game(
                        result[
                            'content'
                        ]
                    )
                )

            except ET.ParseError:
                return Response(
                    {
                        'error':
                            (
                                'Resposta inválida '
                                'da BoardGameGeek.'
                            )
                    },
                    status=(
                        status
                        .HTTP_502_BAD_GATEWAY
                    )
                )

            if not game_data:
                return Response(
                    {
                        'error':
                            (
                                'Jogo não '
                                'encontrado '
                                'na BoardGameGeek.'
                            )
                    },
                    status=(
                        status
                        .HTTP_404_NOT_FOUND
                    )
                )

            game = (
                BoardGameCatalog.objects
                .create(
                    **game_data
                )
            )

        entry = (
            UserBoardGame.objects
            .filter(
                user=
                    request.user,

                game=
                    game
            )
            .first()
        )

        entry_data = {
            'game_id':
                game.id,

            'owned':
                owned,

            'played':
                played,

            'rating':
                rating,

            'acquired_at':
                acquired_at,

            'notes':
                notes,
        }

        serializer_context = {
            'request':
                request
        }

        if entry:
            serializer = (
                UserBoardGameSerializer(
                    entry,
                    data=entry_data,
                    partial=True,
                    context=(
                        serializer_context
                    )
                )
            )

        else:
            serializer = (
                UserBoardGameSerializer(
                    data=entry_data,
                    context=(
                        serializer_context
                    )
                )
            )

        serializer.is_valid(
            raise_exception=True
        )

        saved_entry = (
            serializer.save()
        )

        return Response(
            UserBoardGameSerializer(
                saved_entry,
                context=(
                    serializer_context
                )
            ).data,
            status=(
                status.HTTP_200_OK
                if entry
                else status.HTTP_201_CREATED
            )
        )


class UserBoardGameViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        UserBoardGameSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        queryset = (
            UserBoardGame.objects
            .select_related(
                'user',
                'game',
            )
        )

        target_username = (
            self.request
            .query_params
            .get(
                'username'
            )
        )

        owned = (
            self.request
            .query_params
            .get(
                'owned'
            )
        )

        played = (
            self.request
            .query_params
            .get(
                'played'
            )
        )

        if target_username:
            queryset = (
                queryset.filter(
                    user__username=
                    target_username
                )
            )

        elif (
            self.request
            .user
            .is_authenticated
        ):
            queryset = (
                queryset.filter(
                    user=
                    self.request.user
                )
            )

        else:
            return (
                UserBoardGame.objects
                .none()
            )

        if owned is not None:
            owned_value = (
                str(owned)
                .lower()
                in [
                    '1',
                    'true',
                    'yes',
                    'sim',
                ]
            )

            queryset = (
                queryset.filter(
                    owned=
                    owned_value
                )
            )

        if played is not None:
            played_value = (
                str(played)
                .lower()
                in [
                    '1',
                    'true',
                    'yes',
                    'sim',
                ]
            )

            queryset = (
                queryset.filter(
                    played=
                    played_value
                )
            )

        return queryset.order_by(
            'game__name'
        )

    def perform_destroy(
        self,
        instance
    ):
        if (
            instance.user
            != self.request.user
        ):
            from rest_framework.exceptions import (
                PermissionDenied
            )

            raise PermissionDenied(
                'Não autorizado.'
            )

        instance.delete()

OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json'
OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org'
OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b'


def _open_library_cover_url(cover_id, size='L'):
    if not cover_id:
        return None

    return f'{OPEN_LIBRARY_COVERS_URL}/id/{cover_id}-{size}.jpg'


def _normalize_open_library_description(value):
    if isinstance(value, dict):
        return value.get('value') or ''

    if isinstance(value, str):
        return value

    return ''


def _normalize_open_library_item_type(subjects):
    normalized = ' '.join(
        str(subject).lower()
        for subject in (subjects or [])
    )

    if any(
        term in normalized
        for term in [
            'comic',
            'comics',
            'graphic novel',
            'graphic novels',
        ]
    ):
        return 'HQ'

    if any(
        term in normalized
        for term in [
            'manga',
            'mangas',
            'japanese comics',
        ]
    ):
        return 'MANGA'

    return 'LIVRO'


def _normalize_open_library_search_doc(doc):
    cover_id = doc.get('cover_i')
    edition_keys = doc.get('edition_key') or []
    isbn_values = doc.get('isbn') or []
    languages = doc.get('language') or []
    subjects = doc.get('subject') or []
    publishers = doc.get('publisher') or []

    return {
        'openlibrary_key': doc.get('key'),
        'edition_key': edition_keys[0] if edition_keys else None,
        'title': doc.get('title') or '',
        'subtitle': doc.get('subtitle'),
        'authors': doc.get('author_name') or [],
        'publishers': publishers[:20],
        'first_publish_year': doc.get('first_publish_year'),
        'publication_year': (
            (doc.get('publish_year') or [None])[0]
        ),
        'isbn': isbn_values[:20],
        'cover_url': _open_library_cover_url(cover_id),
        'subjects': subjects[:40],
        'languages': languages[:20],
        'page_count': (
            doc.get('number_of_pages_median')
            or doc.get('number_of_pages')
        ),
        'item_type': _normalize_open_library_item_type(subjects),
    }


def _request_open_library_search(query, limit=20):
    try:
        response = requests.get(
            OPEN_LIBRARY_SEARCH_URL,
            params={
                'q': query,
                'limit': limit,
                'fields': ','.join([
                    'key',
                    'title',
                    'subtitle',
                    'author_name',
                    'publisher',
                    'first_publish_year',
                    'publish_year',
                    'isbn',
                    'cover_i',
                    'subject',
                    'language',
                    'edition_key',
                    'number_of_pages_median',
                ]),
            },
            timeout=20,
        )
    except requests.RequestException as error:
        return {
            'success': False,
            'status': 503,
            'error': 'Não foi possível conectar à Open Library.',
            'details': str(error),
        }

    if not response.ok:
        return {
            'success': False,
            'status': response.status_code,
            'error': 'Erro ao consultar a Open Library.',
            'details': response.text,
        }

    try:
        data = response.json()
    except ValueError:
        return {
            'success': False,
            'status': 502,
            'error': 'A Open Library retornou uma resposta inválida.',
        }

    return {
        'success': True,
        'items': [
            _normalize_open_library_search_doc(doc)
            for doc in data.get('docs', [])
        ],
    }


def _request_open_library_json(path):
    if not path:
        return None

    if not path.startswith('/'):
        path = f'/{path}'

    try:
        response = requests.get(
            f'{OPEN_LIBRARY_BASE_URL}{path}.json',
            timeout=20,
        )
    except requests.RequestException:
        return None

    if not response.ok:
        return None

    try:
        return response.json()
    except ValueError:
        return None


def _get_open_library_item_detail(openlibrary_key, edition_key=None):
    work_data = _request_open_library_json(openlibrary_key) or {}
    edition_data = {}

    if edition_key:
        edition_data = (
            _request_open_library_json(
                f'/books/{edition_key}'
            )
            or {}
        )

    title = (
        edition_data.get('title')
        or work_data.get('title')
        or ''
    )

    subtitle = (
        edition_data.get('subtitle')
        or work_data.get('subtitle')
    )

    description = _normalize_open_library_description(
        work_data.get('description')
        or edition_data.get('description')
    )

    subjects = work_data.get('subjects') or []
    publishers = edition_data.get('publishers') or []
    languages = []

    for language in edition_data.get('languages') or []:
        if isinstance(language, dict):
            key = language.get('key') or ''
            languages.append(key.rsplit('/', 1)[-1])

    authors = []

    for author_ref in work_data.get('authors') or []:
        author = author_ref.get('author') or {}
        author_key = author.get('key')

        if not author_key:
            continue

        author_data = _request_open_library_json(author_key) or {}
        author_name = author_data.get('name')

        if author_name:
            authors.append(author_name)

    covers = (
        edition_data.get('covers')
        or work_data.get('covers')
        or []
    )

    cover_url = (
        _open_library_cover_url(covers[0])
        if covers
        else None
    )

    isbn = []

    for field in ['isbn_13', 'isbn_10']:
        for value in edition_data.get(field) or []:
            if value not in isbn:
                isbn.append(value)

    publication_year = None
    publish_date = edition_data.get('publish_date')

    if publish_date:
        match = re.search(r'\b(1[0-9]{3}|20[0-9]{2}|21[0-9]{2})\b', str(publish_date))

        if match:
            publication_year = safe_int(match.group(1))

    first_publish_year = None
    first_publish_date = work_data.get('first_publish_date')

    if first_publish_date:
        match = re.search(r'\b(1[0-9]{3}|20[0-9]{2}|21[0-9]{2})\b', str(first_publish_date))

        if match:
            first_publish_year = safe_int(match.group(1))

    page_count = (
        edition_data.get('number_of_pages')
        or edition_data.get('pagination')
    )

    if not isinstance(page_count, int):
        page_count = safe_int(page_count)

    return {
        'openlibrary_key': openlibrary_key,
        'edition_key': edition_key,
        'title': title,
        'subtitle': subtitle,
        'item_type': _normalize_open_library_item_type(subjects),
        'description': description,
        'authors': authors,
        'publishers': publishers,
        'first_publish_year': first_publish_year,
        'publication_year': publication_year,
        'isbn': isbn,
        'cover_url': cover_url,
        'subjects': subjects[:40],
        'languages': languages,
        'page_count': page_count,
    }


class LibraryCatalogViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        LibraryCatalog.objects
        .all()
        .order_by('title')
    )

    serializer_class = LibraryCatalogSerializer

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='search-open-library'
    )
    def search_open_library(self, request):
        query = request.query_params.get('q', '').strip()

        if not query:
            return Response(
                {
                    'error': 'Informe um título, autor ou ISBN para pesquisar.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        result = _request_open_library_search(query)

        if not result.get('success'):
            return Response(
                {
                    'error': result.get('error'),
                    'details': result.get('details'),
                },
                status=result.get('status', 503)
            )

        return Response(result.get('items', []))

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        url_path='import-open-library'
    )
    def import_open_library(self, request):
        openlibrary_key = request.data.get('openlibrary_key')
        edition_key = request.data.get('edition_key')

        if not openlibrary_key:
            return Response(
                {'error': 'openlibrary_key é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        detail = _get_open_library_item_detail(
            openlibrary_key,
            edition_key
        )

        if not detail.get('title'):
            return Response(
                {'error': 'Obra não encontrada na Open Library.'},
                status=status.HTTP_404_NOT_FOUND
            )

        item_type = request.data.get('item_type')

        if item_type:
            detail['item_type'] = item_type

        catalog_item, created = (
            LibraryCatalog.objects.update_or_create(
                openlibrary_key=openlibrary_key,
                edition_key=edition_key,
                defaults=detail
            )
        )

        entry = (
            UserLibraryEntry.objects
            .filter(
                user=request.user,
                item=catalog_item
            )
            .first()
        )

        entry_data = {
            'item_id': catalog_item.id,
            'owned': request.data.get('owned', False),
            'ownership_type': request.data.get('ownership_type'),
            'reading_status': request.data.get('reading_status'),
            'rating': request.data.get('rating'),
            'acquired_at': request.data.get('acquired_at'),
            'notes': request.data.get('notes'),
        }

        entry_data = {
            key: value
            for key, value in entry_data.items()
            if value is not None
        }

        serializer_context = {
            'request': request
        }

        if entry:
            serializer = UserLibraryEntrySerializer(
                entry,
                data=entry_data,
                partial=True,
                context=serializer_context
            )
        else:
            serializer = UserLibraryEntrySerializer(
                data=entry_data,
                context=serializer_context
            )

        serializer.is_valid(raise_exception=True)
        saved_entry = serializer.save()

        return Response(
            {
                'message': f'{catalog_item.title} salvo com sucesso.',
                'catalog_item': LibraryCatalogSerializer(
                    catalog_item,
                    context=serializer_context
                ).data,
                'entry': UserLibraryEntrySerializer(
                    saved_entry,
                    context=serializer_context
                ).data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            )
        )


class UserLibraryEntryViewSet(
    viewsets.ModelViewSet
):
    serializer_class = UserLibraryEntrySerializer

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        queryset = (
            UserLibraryEntry.objects
            .select_related(
                'user',
                'item'
            )
        )

        target_username = self.request.query_params.get('username')
        owned = self.request.query_params.get('owned')
        ownership_type = self.request.query_params.get('ownership_type')
        reading_status = self.request.query_params.get('reading_status')
        item_type = self.request.query_params.get('item_type')

        if target_username:
            queryset = queryset.filter(
                user__username=target_username
            )
        elif self.request.user.is_authenticated:
            queryset = queryset.filter(
                user=self.request.user
            )
        else:
            return UserLibraryEntry.objects.none()

        if owned is not None:
            owned_value = str(owned).lower() in [
                '1',
                'true',
                'yes',
                'sim',
            ]

            queryset = queryset.filter(
                owned=owned_value
            )

        if ownership_type:
            queryset = queryset.filter(
                ownership_type__iexact=ownership_type
            )

        if reading_status:
            queryset = queryset.filter(
                reading_status__iexact=reading_status
            )

        if item_type:
            queryset = queryset.filter(
                item__item_type__iexact=item_type
            )

        return queryset.order_by(
            'item__title'
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied('Não autorizado.')

        instance.delete()