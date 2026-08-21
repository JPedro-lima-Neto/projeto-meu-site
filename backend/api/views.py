import os
import re
import html
import xml.etree.ElementTree as ET

import requests

from decimal import Decimal

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
)


BGG_BASE_URL = (
    'https://boardgamegeek.com/xmlapi2'
)


def get_bgg_headers():
    token = os.environ.get(
        'BGG_API_TOKEN'
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

    text = html.unescape(text)

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
    child = element.find(tag)

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
        return int(value)
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


def parse_bgg_search(xml_content):
    root = ET.fromstring(
        xml_content
    )

    results = []

    for item in root.findall(
        'item'
    ):
        bgg_id = safe_int(
            item.attrib.get('id')
        )

        name_element = item.find(
            'name'
        )

        year_element = item.find(
            'yearpublished'
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

        if (
            year_element
            is not None
        ):
            year = safe_int(
                year_element
                .attrib
                .get('value')
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

    image_element = item.find(
        'image'
    )

    thumbnail_element = (
        item.find(
            'thumbnail'
        )
    )

    cover_url = None
    thumbnail_url = None

    if (
        image_element
        is not None
    ):
        cover_url = (
            image_element.text
        )

    if (
        thumbnail_element
        is not None
    ):
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

            if (
                average_weight
                is not None
            ):
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
    headers = get_bgg_headers()

    if not headers:
        return {
            'success': False,

            'status': 500,

            'error': (
                'BGG_API_TOKEN '
                'não configurado.'
            ),
        }

    url = (
        f'{BGG_BASE_URL}/'
        f'{endpoint}'
    )

    try:
        response = requests.get(
            url,
            params=params or {},
            headers=headers,
            timeout=20
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


class CustomAuthToken(
    ObtainAuthToken
):

    def post(
        self,
        request,
        *args,
        **kwargs
    ):
        email = request.data.get(
            'email'
        )

        password = request.data.get(
            'password'
        )

        user = User.objects.filter(
            email=email
        ).first()

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
            Token.objects.get_or_create(
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
    serializer_class = (
        ConsoleSerializer
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
                Console.objects
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
                Console.objects
                .filter(
                    user=
                    self.request.user
                )
            )

        return (
            Console.objects.none()
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
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
            UserGameEntry.objects
            .none()
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
    serializer_class = (
        UserOwnedGameSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        queryset = (
            UserOwnedGame.objects
            .select_related(
                'user',
                'game_catalog',
                'game_catalog__platform',
                'platform',
            )
        )

        target_username = (
            self.request
            .query_params
            .get(
                'username'
            )
        )

        platform_name = (
            self.request
            .query_params
            .get(
                'platform'
            )
        )

        ownership_type = (
            self.request
            .query_params
            .get(
                'type'
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
                UserOwnedGame.objects
                .none()
            )

        if platform_name:
            queryset = (
                queryset.filter(
                    platform__name__iexact=
                    platform_name
                )
            )

        if ownership_type:
            queryset = (
                queryset.filter(
                    ownership_type__iexact=
                    ownership_type
                )
            )

        return queryset.order_by(
            'game_catalog__title'
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


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
    queryset = (
        Platform.objects.all()
    )

    serializer_class = (
        PlatformSerializer
    )

    permission_classes = [
        AllowAny
    ]


class GameCatalogViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        GameCatalog.objects.all()
    )

    serializer_class = (
        GameCatalogSerializer
    )

    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            created_by=(
                self.request.user
                if self.request
                .user
                .is_authenticated
                else None
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


# =========================================================
# BOARD GAME ANTIGO
# =========================================================

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


# =========================================================
# NOVO CATÁLOGO DE BOARD GAMES
# =========================================================

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

        result = request_bgg(
            'search',
            params={
                'query':
                    query,

                'type':
                    'boardgame',
            }
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
        result = request_bgg(
            'thing',
            params={
                'id':
                    bgg_id,

                'stats':
                    1,
            }
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
            result = request_bgg(
                'thing',
                params={
                    'id':
                        bgg_id,

                    'stats':
                        1,
                }
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


# =========================================================
# COLEÇÃO PESSOAL DE BOARD GAMES
# =========================================================

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

        if (
            owned
            is not None
        ):
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

        if (
            played
            is not None
        ):
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