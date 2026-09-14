import time

import requests

from django.core.management.base import (
    BaseCommand,
    CommandError,
)

from ...models import (
    Pokemon,
    VGCMove,
    VGCAbility,
    VGCItem,
)

POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'


class Command(BaseCommand):
    help = (
        'Importa e atualiza dados VGC da PokéAPI: '
        'base stats dos Pokémon, golpes, habilidades '
        'e itens seguráveis.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--only',
            choices=[
                'pokemon',
                'moves',
                'abilities',
                'items',
            ],
            help=(
                'Importa somente uma categoria. '
                'Sem esta opção, importa tudo.'
            ),
        )

        parser.add_argument(
            '--sleep',
            type=float,
            default=0.03,
            help=(
                'Pausa em segundos entre requisições. '
                'Padrão: 0.03'
            ),
        )

        parser.add_argument(
            '--timeout',
            type=int,
            default=20,
            help=(
                'Timeout de cada requisição em segundos. '
                'Padrão: 20'
            ),
        )

        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help=(
                'Limita a quantidade de registros importados '
                'em cada categoria. Útil para testes.'
            ),
        )

    def handle(self, *args, **options):
        self.sleep_time = max(
            0,
            options['sleep']
        )

        self.timeout = max(
            1,
            options['timeout']
        )

        self.limit = options['limit']
        only = options['only']

        self.session = requests.Session()

        self.session.headers.update({
            'User-Agent': (
                'GeeksJourney-VGC-Importer/1.0'
            ),
            'Accept': 'application/json',
        })

        if only:
            tasks = [only]
        else:
            tasks = [
                'pokemon',
                'moves',
                'abilities',
                'items',
            ]

        self.stdout.write(
            self.style.MIGRATE_HEADING(
                'Importador VGC iniciado.'
            )
        )

        for task in tasks:
            if task == 'pokemon':
                self.import_pokemon()

            elif task == 'moves':
                self.import_moves()

            elif task == 'abilities':
                self.import_abilities()

            elif task == 'items':
                self.import_items()

        self.stdout.write(
            self.style.SUCCESS(
                'Importação VGC concluída.'
            )
        )

    def api_get(self, url):
        if not url.startswith('http'):
            url = (
                f'{POKEAPI_BASE_URL}/'
                f'{url.lstrip("/")}'
            )

        try:
            response = self.session.get(
                url,
                timeout=self.timeout
            )

            response.raise_for_status()

        except requests.RequestException as error:
            raise CommandError(
                f'Erro ao consultar {url}: {error}'
            )

        if self.sleep_time:
            time.sleep(
                self.sleep_time
            )

        try:
            return response.json()

        except ValueError as error:
            raise CommandError(
                f'Resposta inválida da PokéAPI em {url}: {error}'
            )

    def get_english_name(
        self,
        names,
        fallback
    ):
        for entry in names or []:
            language = (
                entry.get('language')
                or {}
            )

            if language.get('name') == 'en':
                return (
                    entry.get('name')
                    or fallback
                )

        return fallback

    def get_english_effect(
        self,
        entries
    ):
        for entry in entries or []:
            language = (
                entry.get('language')
                or {}
            )

            if language.get('name') != 'en':
                continue

            return (
                entry.get('short_effect')
                or entry.get('effect')
                or ''
            )

        return ''

    def get_resource_list(
        self,
        endpoint
    ):
        data = self.api_get(
            f'{endpoint}/?limit=100000'
        )

        results = (
            data.get('results')
            or []
        )

        if self.limit is not None:
            results = results[
                :max(0, self.limit)
            ]

        return results

    def import_pokemon(self):
        queryset = (
            Pokemon.objects
            .all()
            .order_by(
                'pokedex_id'
            )
        )

        if self.limit is not None:
            queryset = queryset[
                :max(0, self.limit)
            ]

        total = len(queryset)

        self.stdout.write(
            self.style.MIGRATE_LABEL(
                f'Pokémon: {total} registros para atualizar.'
            )
        )

        updated = 0
        failed = 0

        for index, pokemon in enumerate(
            queryset,
            start=1
        ):
            try:
                data = self.api_get(
                    f'pokemon/{pokemon.pokedex_id}/'
                )

                stats = {
                    (
                        stat.get('stat')
                        or {}
                    ).get('name'):
                    stat.get('base_stat')
                    for stat in (
                        data.get('stats')
                        or []
                    )
                }

                types = sorted(
                    data.get('types')
                    or [],
                    key=lambda entry: (
                        entry.get('slot')
                        or 0
                    )
                )

                type_names = [
                    (
                        entry.get('type')
                        or {}
                    ).get('name')
                    for entry in types
                    if (
                        entry.get('type')
                        or {}
                    ).get('name')
                ]

                sprites = (
                    data.get('sprites')
                    or {}
                )

                pokemon.name = (
                    data.get('name')
                    or pokemon.name
                )

                pokemon.sprite_url = (
                    sprites.get('front_default')
                    or pokemon.sprite_url
                )

                pokemon.shiny_sprite_url = (
                    sprites.get('front_shiny')
                    or pokemon.shiny_sprite_url
                )

                if type_names:
                    pokemon.type1 = (
                        type_names[0]
                    )

                    pokemon.type2 = (
                        type_names[1]
                        if len(type_names) > 1
                        else None
                    )

                pokemon.base_hp = (
                    stats.get('hp')
                )

                pokemon.base_attack = (
                    stats.get('attack')
                )

                pokemon.base_defense = (
                    stats.get('defense')
                )

                pokemon.base_special_attack = (
                    stats.get(
                        'special-attack'
                    )
                )

                pokemon.base_special_defense = (
                    stats.get(
                        'special-defense'
                    )
                )

                pokemon.base_speed = (
                    stats.get('speed')
                )

                pokemon.save(
                    update_fields=[
                        'name',
                        'sprite_url',
                        'shiny_sprite_url',
                        'type1',
                        'type2',
                        'base_hp',
                        'base_attack',
                        'base_defense',
                        'base_special_attack',
                        'base_special_defense',
                        'base_speed',
                    ]
                )

                updated += 1

            except Exception as error:
                failed += 1

                self.stderr.write(
                    self.style.WARNING(
                        (
                            f'Falha no Pokémon '
                            f'#{pokemon.pokedex_id} '
                            f'{pokemon.name}: {error}'
                        )
                    )
                )

            if (
                index % 25 == 0
                or index == total
            ):
                self.stdout.write(
                    (
                        f'Pokémon: '
                        f'{index}/{total}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                (
                    f'Pokémon atualizados: {updated}. '
                    f'Falhas: {failed}.'
                )
            )
        )

    def import_moves(self):
        resources = self.get_resource_list(
            'move'
        )

        total = len(resources)

        self.stdout.write(
            self.style.MIGRATE_LABEL(
                f'Golpes: {total} registros para importar.'
            )
        )

        imported = 0
        failed = 0

        for index, resource in enumerate(
            resources,
            start=1
        ):
            name = resource.get('name')

            try:
                data = self.api_get(
                    resource['url']
                )

                generation = (
                    data.get('generation')
                    or {}
                ).get('name')

                move_type = (
                    data.get('type')
                    or {}
                ).get('name')

                damage_class = (
                    data.get('damage_class')
                    or {}
                ).get('name')

                VGCMove.objects.update_or_create(
                    name=(
                        data.get('name')
                        or name
                    ),
                    defaults={
                        'api_id':
                            data.get('id'),

                        'display_name':
                            self.get_english_name(
                                data.get('names'),
                                name
                            ),

                        'move_type':
                            move_type,

                        'damage_class':
                            damage_class,

                        'power':
                            data.get('power'),

                        'accuracy':
                            data.get('accuracy'),

                        'pp':
                            data.get('pp'),

                        'priority':
                            data.get('priority')
                            or 0,

                        'effect':
                            self.get_english_effect(
                                data.get(
                                    'effect_entries'
                                )
                            ),

                        'effect_chance':
                            data.get(
                                'effect_chance'
                            ),

                        'generation':
                            generation,
                    }
                )

                imported += 1

            except Exception as error:
                failed += 1

                self.stderr.write(
                    self.style.WARNING(
                        f'Falha no golpe {name}: {error}'
                    )
                )

            if (
                index % 50 == 0
                or index == total
            ):
                self.stdout.write(
                    f'Golpes: {index}/{total}'
                )

        self.stdout.write(
            self.style.SUCCESS(
                (
                    f'Golpes importados/atualizados: '
                    f'{imported}. Falhas: {failed}.'
                )
            )
        )

    def import_abilities(self):
        resources = self.get_resource_list(
            'ability'
        )

        total = len(resources)

        self.stdout.write(
            self.style.MIGRATE_LABEL(
                (
                    f'Habilidades: {total} '
                    f'registros para importar.'
                )
            )
        )

        imported = 0
        failed = 0

        for index, resource in enumerate(
            resources,
            start=1
        ):
            name = resource.get('name')

            try:
                data = self.api_get(
                    resource['url']
                )

                VGCAbility.objects.update_or_create(
                    name=(
                        data.get('name')
                        or name
                    ),
                    defaults={
                        'api_id':
                            data.get('id'),

                        'display_name':
                            self.get_english_name(
                                data.get('names'),
                                name
                            ),

                        'effect':
                            self.get_english_effect(
                                data.get(
                                    'effect_entries'
                                )
                            ),
                    }
                )

                imported += 1

            except Exception as error:
                failed += 1

                self.stderr.write(
                    self.style.WARNING(
                        (
                            f'Falha na habilidade '
                            f'{name}: {error}'
                        )
                    )
                )

            if (
                index % 50 == 0
                or index == total
            ):
                self.stdout.write(
                    (
                        f'Habilidades: '
                        f'{index}/{total}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                (
                    f'Habilidades importadas/atualizadas: '
                    f'{imported}. Falhas: {failed}.'
                )
            )
        )

    def import_items(self):
        attribute_data = self.api_get(
            'item-attribute/holdable/'
        )

        resources = (
            attribute_data.get('items')
            or []
        )

        if self.limit is not None:
            resources = resources[
                :max(0, self.limit)
            ]

        total = len(resources)

        self.stdout.write(
            self.style.MIGRATE_LABEL(
                (
                    f'Itens seguráveis: {total} '
                    f'registros para importar.'
                )
            )
        )

        imported = 0
        failed = 0

        for index, resource in enumerate(
            resources,
            start=1
        ):
            name = resource.get('name')

            try:
                data = self.api_get(
                    resource['url']
                )

                sprites = (
                    data.get('sprites')
                    or {}
                )

                VGCItem.objects.update_or_create(
                    name=(
                        data.get('name')
                        or name
                    ),
                    defaults={
                        'api_id':
                            data.get('id'),

                        'display_name':
                            self.get_english_name(
                                data.get('names'),
                                name
                            ),

                        'sprite_url':
                            sprites.get(
                                'default'
                            ),

                        'effect':
                            self.get_english_effect(
                                data.get(
                                    'effect_entries'
                                )
                            ),
                    }
                )

                imported += 1

            except Exception as error:
                failed += 1

                self.stderr.write(
                    self.style.WARNING(
                        f'Falha no item {name}: {error}'
                    )
                )

            if (
                index % 50 == 0
                or index == total
            ):
                self.stdout.write(
                    (
                        f'Itens: '
                        f'{index}/{total}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                (
                    f'Itens importados/atualizados: '
                    f'{imported}. Falhas: {failed}.'
                )
            )
        )