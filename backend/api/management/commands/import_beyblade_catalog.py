import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import (
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
    BeybladeRelease,
)


SOURCE_URL = 'https://takara-tomy-beyblade.com/'

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 Chrome/120 Safari/537.36 MeuAcervo/2.0'
    )
}

BIT_MAP = {
    'F': 'Flat',
    'T': 'Taper',
    'B': 'Ball',
    'N': 'Needle',
    'HN': 'High Needle',
    'LF': 'Low Flat',
    'P': 'Point',
    'O': 'Orb',
    'R': 'Rush',
    'HT': 'High Taper',
    'S': 'Spike',
    'GF': 'Gear Flat',
    'GB': 'Gear Ball',
    'GP': 'Gear Point',
    'GN': 'Gear Needle',
    'A': 'Accel',
    'DB': 'Disc Ball',
    'H': 'Hexa',
    'Q': 'Quake',
    'MN': 'Metal Needle',
    'U': 'Unite',
    'C': 'Cyclone',
    'D': 'Dot',
    'G': 'Glide',
    'E': 'Elevate',
    'FB': 'Free Ball',
    'BS': 'Bound Spike',
    'RA': 'Rubber Accel',
    'L': 'Level',
    'TP': 'Trans Point',
    'LR': 'Low Rush',
    'UN': 'Under Needle',
    'V': 'Vortex',
    'LO': 'Low Orb',
    'W': 'Wedge',
    'K': 'Kick',
}

BLADE_ALIASES = {
    'Dran Sword': 'DranSword',
    'Hells Scythe': 'HellsScythe',
    'Wizard Arrow': 'WizardArrow',
    'Knight Shield': 'KnightShield',
    'Knight Lance': 'KnightLance',
    'Shark Edge': 'SharkEdge',
    'Leon Claw': 'LeonClaw',
    'Viper Tail': 'ViperTail',
    'Rhino Horn': 'RhinoHorn',
    'Phoenix Wing': 'PhoenixWing',
    'Unicorn Sting': 'UnicornSting',
    'Wyvern Gale': 'WyvernGale',
    'Shinobi Shadow': 'ShinobiShadow',
    'Black Shell': 'BlackShell',
    'Hells Chain': 'HellsChain',
    'Dran Dagger': 'DranDagger',
    'Whale Wave': 'WhaleWave',
    'Shelter Drake': 'ShelterDrake',
    'Dran Buster': 'DranBuster',
    'DRAN BUSTER': 'DranBuster',
    'Wizard Rod': 'WizardRod',
    'WIZARD ROD': 'WizardRod',
    'Dranzer Spiral': 'DranzerSpiral',
    'Cobalt Dragoon': 'CobaltDragoon',
    'Cobalt Drake': 'CobaltDrake',
    'Draciel Shield': 'DracielShield',
    'Mammoth Tusk': 'MammothTusk',
    'Xeno Xcalibur': 'XenoXcalibur',
    'Victory Valkyrie': 'VictoryValkyrie',
    'Dragoon Storm': 'DragoonStorm',
    'Weiss Tiger': 'WeissTiger',
    'Phoenix Rudder': 'PhoenixRudder',
    'Knight Mail': 'KnightMail',
    'Ptera Swing': 'PteraSwing',
    'Scorpio Spear': 'ScorpioSpear',
    'Aero Pegasus': 'AeroPegasus',
    'Bear Scratch': 'BearScratch',
    'Sphinx Cowl': 'SphinxCowl',
    'Leon Crest': 'LeonCrest',
    'Silver Wolf': 'SilverWolf',
    'Samurai Saber': 'SamuraiSaber',
    'Tyranno Beat': 'TyrannoBeat',
    'Crimson Garuda': 'CrimsonGaruda',
    'Impact Drake': 'ImpactDrake',
    'Golem Rock': 'GolemRock',
    'Storm Pegasis': 'StormPegasis',

    'Circle Ghost': 'GhostCircle',
    'Hover Wyvern': 'WyvernHover',
    'Buster Dran': 'DranBuster',
    'Dagger Dran': 'DranDagger',
    'Tusk Mammoth': 'MammothTusk',
    'Sting Unicorn': 'UnicornSting',
    'Tail Viper': 'ViperTail',
    'Crest Leon': 'LeonCrest',
    'Arrow Wizard': 'WizardArrow',
    'Antlers': 'Antler',
    'Knife Shinboi': 'Knife Shinobi',
    'Gill Shark': 'SharkGill',
    'Croc Crunch': 'CrocoCrunch',

    'Lightning L-Drago (Rapid-Hit Type)': 'Lightning L-Drago',
    'Lightning L-Drago (Upper Type)': 'Lightning L-Drago',
}

BLADE_ALIASES_CASEFOLD = {
    key.casefold(): value
    for key, value in BLADE_ALIASES.items()
}


class Command(BaseCommand):
    help = (
        'Importa o catálogo Beyblade X usando '
        'takara-tomy-beyblade.com como fonte principal.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--rebuild',
            action='store_true',
            help='Reconstrói releases e variantes preservando as peças-base.',
        )
        parser.add_argument(
            '--workers',
            type=int,
            default=8,
            help='Downloads paralelos. Padrão: 8.',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='Limita a importação para teste. 0 = todos.',
        )
        parser.add_argument(
            '--skip-images',
            action='store_true',
            help='Não grava URLs de imagens.',
        )

    def handle(self, *args, **options):
        self.stdout.write('Baixando catálogo Beyblade X...')
        self.stdout.write(f'Fonte: {SOURCE_URL}')

        urls = self.get_product_urls()

        if options['limit'] > 0:
            urls = urls[:options['limit']]

        self.stdout.write(f'Páginas encontradas: {len(urls)}')

        if not urls:
            self.stdout.write(
                self.style.ERROR('Nenhuma página de produto encontrada.')
            )
            return

        workers = max(1, min(options['workers'], 12))
        products = self.fetch_all(urls, workers)

        products = [
            product
            for product in products
            if product and product.get('blade')
        ]

        unique = {
            product['source_item_id']: product
            for product in products
        }

        products = list(unique.values())

        products.sort(
            key=lambda product: (
                product.get('code') or 'ZZZ-99',
                product.get('name') or '',
                product.get('source_item_id') or '',
            )
        )

        self.stdout.write(f'Beys válidas: {len(products)}')

        if not products:
            self.stdout.write(
                self.style.ERROR(
                    'Nenhum Bey válido pôde ser interpretado.'
                )
            )
            return

        counters = defaultdict(int)
        self.manual_variant_images = defaultdict(dict)

        with transaction.atomic():
            if options['rebuild']:
                self.rebuild_catalog()

            for product in products:
                try:
                    self.save_product(
                        product,
                        counters,
                        options['skip_images'],
                    )
                except Exception as error:
                    counters['errors'] += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f"Ignorado: {product.get('name', '?')} - {error}"
                        )
                    )

        self.print_summary(counters)
        self.validate()

    def get_product_urls(self):
        response = requests.get(
            SOURCE_URL,
            headers=HEADERS,
            timeout=30,
        )
        response.raise_for_status()

        soup = BeautifulSoup(
            response.text,
            'html.parser',
        )

        result = []
        seen = set()

        for anchor in soup.find_all('a', href=True):
            href = anchor['href'].strip()

            if '/product/' not in href:
                continue

            url = urljoin(SOURCE_URL, href)
            url = (
                url
                .split('#')[0]
                .split('?')[0]
                .rstrip('/')
            )

            if (
                urlparse(url).netloc
                != urlparse(SOURCE_URL).netloc
            ):
                continue

            if url not in seen:
                seen.add(url)
                result.append(url)

        return result

    def fetch_all(self, urls, workers):
        products = []

        with ThreadPoolExecutor(
            max_workers=workers
        ) as executor:
            futures = {
                executor.submit(
                    self.fetch_product,
                    url,
                ): url
                for url in urls
            }

            total = len(futures)
            done = 0

            for future in as_completed(futures):
                url = futures[future]

                try:
                    product = future.result()

                    if product:
                        products.append(product)

                except Exception as error:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Falha em {url}: {error}'
                        )
                    )

                done += 1

                if (
                    done % 25 == 0
                    or done == total
                ):
                    self.stdout.write(
                        f'Detalhes: {done}/{total}'
                    )

        return products

    def fetch_product(self, url):
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=30,
        )
        response.raise_for_status()

        soup = BeautifulSoup(
            response.text,
            'html.parser',
        )

        # IMPORTANTE:
        # O parser depende das quebras de linha para encontrar
        # "Blade" e o valor logo abaixo. Não usar '' aqui.
        text = soup.get_text(
            '\n',
            strip=True,
        )

        title = self.extract_title(soup)

        raw_blade = self.field(
            text,
            ('Blade', 'Main Blade'),
        )

        if not raw_blade:
            return None

        ratchet = self.field(
            text,
            ('Ratchet',),
        )

        bit_name = self.field(
            text,
            ('Bit',),
        )

        code = self.field(
            text,
            (
                'Product Code',
                'Product code',
                'Code',
            ),
        )

        line = self.field(
            text,
            ('Line', 'System'),
        )

        bey_type = self.field(
            text,
            ('Type',),
        )

        spin = self.field(
            text,
            (
                'Spin',
                'Spin Direction',
            ),
        )

        assist = self.field(
            text,
            ('Assist Blade',),
        )

        lock = self.field(
            text,
            ('Lock Chip',),
        )

        raw_blade = self.clean_component(
            raw_blade
        )

        blade = self.canonical_blade_name(
            raw_blade
        )

        ratchet = self.clean_component(
            ratchet
        )

        bit_name = self.clean_component(
            bit_name
        )

        assist = self.clean_component(
            assist
        )

        lock = self.clean_component(
            lock
        )

        code = self.normalize_code(
            code or title
        )

        bit_abbreviation = (
            self.find_bit_abbreviation(
                title,
                ratchet,
                bit_name,
            )
        )

        if (
            not bit_name
            and bit_abbreviation
        ):
            bit_name = BIT_MAP.get(
                bit_abbreviation,
                bit_abbreviation,
            )

        modular = bool(
            assist
            or lock
        )

        return {
            'source_item_id':
                self.source_item_id(url),

            'source_url':
                url,

            'name':
                title,

            'code':
                code,

            'system':
                self.normalize_system(
                    line,
                    code,
                    modular,
                ),

            'bey_type':
                self.normalize_type(
                    bey_type
                ),

            'spin':
                self.normalize_spin(
                    spin
                ),

            'blade':
                blade,

            'raw_blade':
                raw_blade,

            'ratchet':
                ratchet,

            'bit_name':
                bit_name,

            'bit_abbreviation':
                bit_abbreviation,

            'assist_blade':
                assist,

            'lock_chip':
                lock,

            'is_modular':
                modular,

            'image_url':
                self.extract_image(
                    soup
                ),
        }

    def field(self, text, labels):
        lines = [
            self.clean_text(line)
            for line in text.splitlines()
            if self.clean_text(line)
        ]

        for label in labels:
            target = label.casefold()

            for index, line in enumerate(lines):
                folded = line.casefold()

                if (
                    folded == target
                    and index + 1 < len(lines)
                ):
                    return lines[
                        index + 1
                    ]

                if folded.startswith(
                    target + ':'
                ):
                    value = line[
                        len(label) + 1:
                    ].strip()

                    if value:
                        return value

        return ''

    def extract_title(self, soup):
        h1 = soup.find('h1')

        if h1:
            return self.clean_text(
                h1.get_text(
                    ' ',
                    strip=True,
                )
            )

        meta = soup.find(
            'meta',
            attrs={
                'property': 'og:title'
            },
        )

        if (
            meta
            and meta.get('content')
        ):
            return self.clean_text(
                meta['content']
            )

        title = soup.find('title')

        return (
            self.clean_text(
                title.get_text(
                    ' ',
                    strip=True,
                )
            )
            if title
            else ''
        )

    def extract_image(self, soup):
        for attrs in (
            {
                'property':
                    'og:image'
            },
            {
                'name':
                    'twitter:image'
            },
        ):
            meta = soup.find(
                'meta',
                attrs=attrs,
            )

            if (
                meta
                and meta.get('content')
            ):
                return urljoin(
                    SOURCE_URL,
                    meta[
                        'content'
                    ].strip(),
                )

        return ''

    def normalize_code(self, value):
        match = re.search(
            r'\b(BX|UX|CX)-(\d{1,2})\b',
            self.clean_text(
                value
            ).upper(),
        )

        if not match:
            return ''

        return (
            f'{match.group(1)}-'
            f'{int(match.group(2)):02d}'
        )

    def normalize_system(
        self,
        line,
        code,
        has_cx_parts,
    ):
        line = (
            self.clean_text(line)
            .casefold()
        )

        # O código oficial do produto tem prioridade.
        # Assim UX-18 nunca vira CX só porque usa peças modulares.
        if code.startswith('CX-'):
            return 'CX'

        if code.startswith('UX-'):
            return 'UX'

        if code.startswith('BX-'):
            return 'BX'

        if 'custom' in line:
            return 'CX'

        if 'unique' in line:
            return 'UX'

        if 'basic' in line:
            return 'BX'

        if has_cx_parts:
            return 'CX'

        return 'OUTRO'

    def normalize_type(self, value):
        value = (
            self.clean_text(value)
            .upper()
        )

        for item in (
            'ATTACK',
            'DEFENSE',
            'STAMINA',
            'BALANCE',
        ):
            if item in value:
                return item

        return None

    def normalize_spin(self, value):
        value = (
            self.clean_text(value)
            .upper()
        )

        if 'DUAL' in value:
            return 'DUAL'

        if 'LEFT' in value:
            return 'LEFT'

        if 'RIGHT' in value:
            return 'RIGHT'

        return None

    def find_bit_abbreviation(
        self,
        title,
        ratchet,
        bit_name,
    ):
        if ratchet:
            index = (
                title.casefold()
                .rfind(
                    ratchet.casefold()
                )
            )

            if index >= 0:
                tail = title[
                    index
                    + len(ratchet):
                ].strip()

                match = re.match(
                    r'([A-Za-z]{1,4})\b',
                    tail,
                )

                if match:
                    return (
                        match.group(1)
                        .upper()
                    )

        normalized = (
            self.clean_text(
                bit_name
            )
            .casefold()
        )

        for abbreviation, name in (
            BIT_MAP.items()
        ):
            if (
                name.casefold()
                == normalized
            ):
                return abbreviation

        return ''

    def canonical_blade_name(
        self,
        value,
    ):
        cleaned = self.clean_component(
            value
        )

        if not cleaned:
            return ''

        return (
            BLADE_ALIASES_CASEFOLD
            .get(
                cleaned.casefold(),
                cleaned,
            )
        )

    def component_slug(
        self,
        value,
    ):
        value = (
            self.clean_text(value)
            .casefold()
        )

        value = re.sub(
            r'[^a-z0-9]+',
            '-',
            value,
        )

        return value.strip('-')

    def blade_variant_identity(
        self,
        product,
    ):
        raw_blade = (
            product.get('raw_blade')
            or product['blade']
        )

        # Formas físicas distintas da mesma base.
        if (
            raw_blade
            != product['blade']
        ):
            return (
                'blade-form:'
                f'{self.component_slug(product["blade"])}:'
                f'{self.component_slug(raw_blade)}'
            )

        # Main Blade modular:
        # trocar Lock Chip ou Assist Blade NÃO cria
        # uma nova cor da Main Blade.
        if product.get('is_modular'):
            return (
                'blade-part:'
                f'{self.component_slug(product["blade"])}'
            )

        return product[
            'source_item_id'
        ]

    def assist_variant_identity(
        self,
        product,
    ):
        if product.get('is_modular'):
            return (
                'assist-part:'
                f'{self.component_slug(product["assist_blade"])}'
            )

        return product[
            'source_item_id'
        ]

    def lock_variant_identity(
        self,
        product,
    ):
        if product.get('is_modular'):
            return (
                'lock-part:'
                f'{self.component_slug(product["lock_chip"])}'
            )

        return product[
            'source_item_id'
        ]

    def clean_component(
        self,
        value,
    ):
        value = self.clean_text(
            value
        )

        if (
            value.casefold()
            in (
                '',
                '-',
                'none',
                'n/a',
                'not applicable',
            )
        ):
            return ''

        return value

    def clean_text(
        self,
        value,
    ):
        return re.sub(
            r'\s+',
            ' ',
            value or '',
        ).strip()

    def source_item_id(
        self,
        url,
    ):
        slug = (
            urlparse(url)
            .path
            .rstrip('/')
            .split('/')[-1]
            .lower()
        )

        return f'tt-db:{slug}'

    def remember_manual_variant_images(self):
        self.manual_variant_images = defaultdict(dict)

        mappings = (
            (
                'blade',
                BeyBladeVariant,
                'blade',
            ),
            (
                'ratchet',
                BeyRatchetVariant,
                'ratchet',
            ),
            (
                'bit',
                BeyBitVariant,
                'bit',
            ),
            (
                'assist_blade',
                BeyAssistBladeVariant,
                'assist_blade',
            ),
            (
                'lock_chip',
                BeyLockChipVariant,
                'lock_chip',
            ),
        )

        preserved = 0

        for type_name, model, relation_name in mappings:
            queryset = (
                model.objects
                .select_related(relation_name)
                .exclude(image='')
            )

            for variant in queryset:
                image = getattr(
                    variant,
                    'image',
                    None,
                )

                image_name = getattr(
                    image,
                    'name',
                    '',
                )

                base = getattr(
                    variant,
                    relation_name,
                    None,
                )

                base_name = getattr(
                    base,
                    'name',
                    '',
                )

                if (
                    not image_name
                    or not base_name
                    or not variant.variant_name
                ):
                    continue

                key = (
                    base_name.casefold(),
                    variant.variant_name,
                )

                self.manual_variant_images[
                    type_name
                ][key] = image_name

                preserved += 1

        return preserved

    def restore_manual_variant_image(
        self,
        type_name,
        base_name,
        variant,
    ):
        if not variant:
            return

        if not hasattr(
            self,
            'manual_variant_images',
        ):
            return

        if not base_name:
            return

        key = (
            base_name.casefold(),
            variant.variant_name,
        )

        image_name = (
            self.manual_variant_images
            .get(type_name, {})
            .get(key)
        )

        if not image_name:
            return

        current_image = getattr(
            variant,
            'image',
            None,
        )

        current_name = getattr(
            current_image,
            'name',
            '',
        )

        if current_name == image_name:
            return

        variant.image = image_name
        variant.save(
            update_fields=['image']
        )

    def rebuild_catalog(self):
        releases = (
            BeybladeRelease.objects
            .count()
        )

        variants = (
            BeyBladeVariant.objects.count()
            + BeyRatchetVariant.objects.count()
            + BeyBitVariant.objects.count()
            + BeyAssistBladeVariant.objects.count()
            + BeyLockChipVariant.objects.count()
        )

        preserved_images = (
            self.remember_manual_variant_images()
        )

        self.stdout.write('')

        self.stdout.write(
            self.style.WARNING(
                'Reconstruindo releases e variantes...'
            )
        )

        BeybladeRelease.objects.all().delete()
        BeyBladeVariant.objects.all().delete()
        BeyRatchetVariant.objects.all().delete()
        BeyBitVariant.objects.all().delete()
        BeyAssistBladeVariant.objects.all().delete()
        BeyLockChipVariant.objects.all().delete()

        self.stdout.write(
            f'Releases removidos: {releases}'
        )

        self.stdout.write(
            f'Variantes removidas: {variants}'
        )

        self.stdout.write(
            'Imagens manuais preservadas: '
            f'{preserved_images}'
        )

        self.stdout.write(
            self.style.SUCCESS(
                'Peças-base, coleção do usuário e '
                'imagens manuais das variantes preservadas.'
            )
        )

        self.stdout.write('')

    def save_product(
        self,
        product,
        counters,
        skip_images,
    ):
        blade, created = (
            self.get_or_create_blade(
                product
            )
        )

        if created:
            counters[
                'blades'
            ] += 1

        ratchet = None

        if product['ratchet']:
            ratchet, created = (
                BeyRatchet.objects
                .get_or_create(
                    name=product[
                        'ratchet'
                    ]
                )
            )

            if created:
                counters[
                    'ratchets'
                ] += 1

        bit = None

        if (
            product['bit_name']
            or product['bit_abbreviation']
        ):
            bit = self.find_bit(
                product[
                    'bit_name'
                ],
                product[
                    'bit_abbreviation'
                ],
            )

            if bit is None:
                bit = (
                    BeyBit.objects
                    .create(
                        name=(
                            product[
                                'bit_name'
                            ]
                            or product[
                                'bit_abbreviation'
                            ]
                        ),
                        abbreviation=(
                            product[
                                'bit_abbreviation'
                            ]
                            or ''
                        ),
                    )
                )

                counters[
                    'bits'
                ] += 1

        assist = None

        if product[
            'assist_blade'
        ]:
            assist, created = (
                BeyAssistBlade.objects
                .get_or_create(
                    name=product[
                        'assist_blade'
                    ]
                )
            )

            if created:
                counters[
                    'assists'
                ] += 1

        lock = None

        if product[
            'lock_chip'
        ]:
            lock, created = (
                BeyLockChip.objects
                .get_or_create(
                    name=product[
                        'lock_chip'
                    ]
                )
            )

            if created:
                counters[
                    'locks'
                ] += 1

        image_url = (
            ''
            if skip_images
            else product[
                'image_url'
            ]
        )

        raw_blade = (
            product.get(
                'raw_blade'
            )
            or product['blade']
        )

        blade_edition = None

        if (
            raw_blade
            != product['blade']
        ):
            blade_edition = (
                raw_blade
            )

        elif product.get(
            'is_modular'
        ):
            blade_edition = (
                'Padrão'
            )

        blade_variant, created = (
            self.upsert_component_variant(
                model=
                    BeyBladeVariant,
                relation_name=
                    'blade',
                relation_object=
                    blade,
                variant_name=
                    self.blade_variant_identity(
                        product
                    ),
                source_code=
                    product['code'],
                edition_name=
                    blade_edition,
                image_url=
                    image_url,
                stable=
                    product.get(
                        'is_modular',
                        False,
                    ),
            )
        )

        if created:
            counters[
                'blade_variants'
            ] += 1

        self.restore_manual_variant_image(
            'blade',
            blade.name,
            blade_variant,
        )

        ratchet_variant = None

        if ratchet:
            ratchet_variant, created = (
                BeyRatchetVariant.objects
                .update_or_create(
                    ratchet=
                        ratchet,
                    variant_name=
                        product[
                            'source_item_id'
                        ],
                    defaults={
                        'source_code':
                            product['code'],
                        'edition_name':
                            None,
                        'image_url':
                            image_url,
                    },
                )
            )

            if created:
                counters[
                    'ratchet_variants'
                ] += 1

            self.restore_manual_variant_image(
                'ratchet',
                ratchet.name,
                ratchet_variant,
            )

        bit_variant = None

        if bit:
            bit_variant, created = (
                BeyBitVariant.objects
                .update_or_create(
                    bit=
                        bit,
                    variant_name=
                        product[
                            'source_item_id'
                        ],
                    defaults={
                        'source_code':
                            product['code'],
                        'edition_name':
                            None,
                        'image_url':
                            image_url,
                    },
                )
            )

            if created:
                counters[
                    'bit_variants'
                ] += 1

            self.restore_manual_variant_image(
                'bit',
                bit.name,
                bit_variant,
            )

        assist_variant = None

        if assist:
            assist_variant, created = (
                self.upsert_component_variant(
                    model=
                        BeyAssistBladeVariant,
                    relation_name=
                        'assist_blade',
                    relation_object=
                        assist,
                    variant_name=
                        self.assist_variant_identity(
                            product
                        ),
                    source_code=
                        product['code'],
                    edition_name=(
                        'Padrão'
                        if product.get(
                            'is_modular'
                        )
                        else None
                    ),
                    image_url=
                        image_url,
                    stable=
                        product.get(
                            'is_modular',
                            False,
                        ),
                )
            )

            if created:
                counters[
                    'assist_variants'
                ] += 1

            self.restore_manual_variant_image(
                'assist_blade',
                assist.name,
                assist_variant,
            )

        lock_variant = None

        if lock:
            lock_variant, created = (
                self.upsert_component_variant(
                    model=
                        BeyLockChipVariant,
                    relation_name=
                        'lock_chip',
                    relation_object=
                        lock,
                    variant_name=
                        self.lock_variant_identity(
                            product
                        ),
                    source_code=
                        product['code'],
                    edition_name=(
                        'Padrão'
                        if product.get(
                            'is_modular'
                        )
                        else None
                    ),
                    image_url=
                        image_url,
                    stable=
                        product.get(
                            'is_modular',
                            False,
                        ),
                )
            )

            if created:
                counters[
                    'lock_variants'
                ] += 1

            self.restore_manual_variant_image(
                'lock_chip',
                lock.name,
                lock_variant,
            )

        _, created = (
            BeybladeRelease.objects
            .update_or_create(
                source_item_id=
                    product[
                        'source_item_id'
                    ],
                defaults={
                    'code':
                        product['code'],
                    'slot_number':
                        None,
                    'edition_name':
                        None,
                    'name':
                        product['name'],
                    'system':
                        product['system'],
                    'blade':
                        blade,
                    'blade_variant':
                        blade_variant,
                    'assist_blade':
                        assist,
                    'assist_blade_variant':
                        assist_variant,
                    'lock_chip':
                        lock,
                    'lock_chip_variant':
                        lock_variant,
                    'ratchet':
                        ratchet,
                    'ratchet_variant':
                        ratchet_variant,
                    'bit':
                        bit,
                    'bit_variant':
                        bit_variant,
                    'image_url':
                        image_url,
                    'source_url':
                        product[
                            'source_url'
                        ],
                },
            )
        )

        if created:
            counters[
                'releases'
            ] += 1
        else:
            counters[
                'updated_releases'
            ] += 1

    def upsert_component_variant(
        self,
        model,
        relation_name,
        relation_object,
        variant_name,
        source_code,
        edition_name,
        image_url,
        stable=False,
    ):
        lookup = {
            relation_name:
                relation_object,

            'variant_name':
                variant_name,
        }

        defaults = {
            'source_code':
                source_code,

            'edition_name':
                edition_name,

            'image_url':
                image_url,
        }

        if not stable:
            return (
                model.objects
                .update_or_create(
                    **lookup,
                    defaults=
                        defaults,
                )
            )

        variant, created = (
            model.objects
            .get_or_create(
                **lookup,
                defaults=
                    defaults,
            )
        )

        if created:
            return variant, True

        changed = []

        if (
            not getattr(
                variant,
                'source_code',
                None,
            )
            and source_code
        ):
            variant.source_code = (
                source_code
            )

            changed.append(
                'source_code'
            )

        if (
            not getattr(
                variant,
                'edition_name',
                None,
            )
            and edition_name
        ):
            variant.edition_name = (
                edition_name
            )

            changed.append(
                'edition_name'
            )

        if (
            not getattr(
                variant,
                'image_url',
                None,
            )
            and image_url
        ):
            variant.image_url = (
                image_url
            )

            changed.append(
                'image_url'
            )

        if changed:
            variant.save(
                update_fields=
                    changed
            )

        return variant, False

    def get_or_create_blade(
        self,
        product,
    ):
        blade = (
            BeyBlade.objects
            .filter(
                name__iexact=
                    product['blade']
            )
            .first()
        )

        if blade:
            changed = []

            if (
                product['bey_type']
                and blade.bey_type
                != product['bey_type']
            ):
                blade.bey_type = (
                    product['bey_type']
                )

                changed.append(
                    'bey_type'
                )

            if (
                product['spin']
                and blade.spin
                != product['spin']
            ):
                blade.spin = (
                    product['spin']
                )

                changed.append(
                    'spin'
                )

            if changed:
                blade.save(
                    update_fields=
                        changed
                )

            return blade, False

        blade = (
            BeyBlade.objects
            .create(
                name=
                    product['blade'],
                bey_type=(
                    product[
                        'bey_type'
                    ]
                    or None
                ),
                spin=(
                    product[
                        'spin'
                    ]
                    or None
                ),
            )
        )

        return blade, True

    def find_bit(
        self,
        name,
        abbreviation,
    ):
        if abbreviation:
            bit = (
                BeyBit.objects
                .filter(
                    abbreviation__iexact=
                        abbreviation
                )
                .first()
            )

            if bit:
                return bit

        if name:
            return (
                BeyBit.objects
                .filter(
                    name__iexact=
                        name
                )
                .first()
            )

        return None

    def print_summary(
        self,
        counters,
    ):
        self.stdout.write('')

        self.stdout.write(
            self.style.SUCCESS(
                'Importação concluída.'
            )
        )

        rows = (
            (
                'Blades novas',
                'blades',
            ),
            (
                'Ratchets novos',
                'ratchets',
            ),
            (
                'Bits novos',
                'bits',
            ),
            (
                'Assist Blades novas',
                'assists',
            ),
            (
                'Lock Chips novos',
                'locks',
            ),
            (
                'Variantes de Blade novas',
                'blade_variants',
            ),
            (
                'Variantes de Ratchet novas',
                'ratchet_variants',
            ),
            (
                'Variantes de Bit novas',
                'bit_variants',
            ),
            (
                'Variantes de Assist Blade novas',
                'assist_variants',
            ),
            (
                'Variantes de Lock Chip novas',
                'lock_variants',
            ),
            (
                'Lançamentos novos',
                'releases',
            ),
            (
                'Lançamentos atualizados',
                'updated_releases',
            ),
            (
                'Erros/ignorados',
                'errors',
            ),
        )

        for label, key in rows:
            self.stdout.write(
                f'{label}: '
                f'{counters[key]}'
            )

    def validate(self):
        self.stdout.write('')

        self.stdout.write(
            self.style.HTTP_INFO(
                'VALIDAÇÃO'
            )
        )

        for name in (
            'DranSword',
            'HellsScythe',
            'WizardArrow',
            'KnightShield',
        ):
            exists = (
                BeyBlade.objects
                .filter(
                    name__iexact=
                        name
                )
                .exists()
            )

            self.stdout.write(
                f'{"OK" if exists else "FALTOU"}: {name}'
            )

        artificial = (
            BeybladeRelease.objects
            .filter(
                code__regex=
                    r'\s+\d+$'
            )
            .count()
        )

        self.stdout.write(
            'Códigos artificiais: '
            f'{artificial}'
        )

        self.stdout.write(
            'BX-08:'
        )

        releases = (
            BeybladeRelease.objects
            .filter(
                code='BX-08'
            )
            .select_related(
                'blade',
                'ratchet',
                'bit',
            )
            .order_by(
                'name'
            )
        )

        if not releases.exists():
            self.stdout.write(
                '  nenhum registro'
            )

        for release in releases:
            blade = (
                release.blade.name
                if release.blade
                else '-'
            )

            ratchet = (
                release.ratchet.name
                if release.ratchet
                else '-'
            )

            bit = (
                release.bit.abbreviation
                if release.bit
                else '-'
            )

            self.stdout.write(
                f'  {blade} '
                f'{ratchet}{bit}'
            )

        self.stdout.write('')
        self.stdout.write(
            'CHECAGEM MODULAR:'
        )

        for blade_name in (
            'Might',
            'Brave',
            'Arc',
        ):
            blade = (
                BeyBlade.objects
                .filter(
                    name__iexact=
                        blade_name
                )
                .first()
            )

            if not blade:
                self.stdout.write(
                    f'  {blade_name}: '
                    'não encontrada'
                )
                continue

            variant_count = (
                BeyBladeVariant.objects
                .filter(
                    blade=blade
                )
                .count()
            )

            release_count = (
                BeybladeRelease.objects
                .filter(
                    blade=blade
                )
                .count()
            )

            self.stdout.write(
                f'  {blade_name}: '
                f'{variant_count} variante(s), '
                f'{release_count} release(s)'
            )