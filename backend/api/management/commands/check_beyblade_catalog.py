from django.core.management.base import BaseCommand

from api.models import (
    BeyBlade,
    BeyRatchet,
    BeyBit,
    BeyAssistBlade,
    BeyLockChip,
    BeybladeRelease,
)


class Command(BaseCommand):
    help = (
        'Audita o catálogo de Beyblade X e mostra '
        'quantidade de variantes e possíveis excessos.'
    )

    def add_arguments(
        self,
        parser
    ):
        parser.add_argument(
            '--limit',
            type=int,
            default=20,
            help=(
                'Quantidade máxima de itens exibidos '
                'em cada seção. Padrão: 20.'
            )
        )

        parser.add_argument(
            '--name',
            type=str,
            default='',
            help=(
                'Filtra por nome específico. '
                'Exemplo: --name "Hells Scythe"'
            )
        )

        parser.add_argument(
            '--show-variants',
            action='store_true',
            help=(
                'Mostra também as variantes de cada item.'
            )
        )

        parser.add_argument(
            '--all',
            action='store_true',
            help=(
                'Mostra todos os itens, ignorando o limite.'
            )
        )

    def handle(
        self,
        *args,
        **options
    ):
        limit = (
            options[
                'limit'
            ]
        )

        name_filter = (
            options[
                'name'
            ]
            .strip()
        )

        show_variants = (
            options[
                'show_variants'
            ]
        )

        show_all = (
            options[
                'all'
            ]
        )

        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                'AUDITORIA DO CATÁLOGO BEYBLADE X'
            )
        )
        self.stdout.write(
            '=' * 60
        )

        self.show_summary()

        self.show_section(
            title='BLADES',
            queryset=BeyBlade.objects.all(),
            relation_name='variants',
            name_filter=name_filter,
            limit=limit,
            show_variants=show_variants,
            show_all=show_all,
        )

        self.show_section(
            title='RATCHETS',
            queryset=BeyRatchet.objects.all(),
            relation_name='variants',
            name_filter=name_filter,
            limit=limit,
            show_variants=show_variants,
            show_all=show_all,
        )

        self.show_section(
            title='BITS',
            queryset=BeyBit.objects.all(),
            relation_name='variants',
            name_filter=name_filter,
            limit=limit,
            show_variants=show_variants,
            show_all=show_all,
        )

        self.show_section(
            title='ASSIST BLADES',
            queryset=BeyAssistBlade.objects.all(),
            relation_name='variants',
            name_filter=name_filter,
            limit=limit,
            show_variants=show_variants,
            show_all=show_all,
        )

        self.show_section(
            title='LOCK CHIPS',
            queryset=BeyLockChip.objects.all(),
            relation_name='variants',
            name_filter=name_filter,
            limit=limit,
            show_variants=show_variants,
            show_all=show_all,
        )

        self.show_release_codes(
            name_filter=name_filter,
            limit=limit,
            show_all=show_all,
        )

        self.show_suspicious_items()

        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                'Auditoria concluída.'
            )
        )

    def show_summary(
        self
    ):
        self.stdout.write('')
        self.stdout.write(
            self.style.HTTP_INFO(
                'RESUMO'
            )
        )

        self.stdout.write(
            (
                'Blades: '
                f'{BeyBlade.objects.count()}'
            )
        )

        self.stdout.write(
            (
                'Ratchets: '
                f'{BeyRatchet.objects.count()}'
            )
        )

        self.stdout.write(
            (
                'Bits: '
                f'{BeyBit.objects.count()}'
            )
        )

        self.stdout.write(
            (
                'Assist Blades: '
                f'{BeyAssistBlade.objects.count()}'
            )
        )

        self.stdout.write(
            (
                'Lock Chips: '
                f'{BeyLockChip.objects.count()}'
            )
        )

        self.stdout.write(
            (
                'Lançamentos: '
                f'{BeybladeRelease.objects.count()}'
            )
        )

    def show_section(
        self,
        title,
        queryset,
        relation_name,
        name_filter,
        limit,
        show_variants,
        show_all,
    ):
        self.stdout.write('')
        self.stdout.write(
            self.style.HTTP_INFO(
                title
            )
        )
        self.stdout.write(
            '-' * 60
        )

        if name_filter:
            queryset = queryset.filter(
                name__icontains=
                    name_filter
            )

        queryset = queryset.order_by(
            'name'
        )

        if not show_all:
            queryset = queryset[
                :limit
            ]

        if not queryset:
            self.stdout.write(
                'Nenhum item encontrado.'
            )
            return

        for item in queryset:
            variants = (
                getattr(
                    item,
                    relation_name
                )
                .all()
                .order_by(
                    '-is_default',
                    'variant_name'
                )
            )

            self.stdout.write(
                (
                    f'{item.name} '
                    f'| variantes: '
                    f'{variants.count()}'
                )
            )

            if show_variants:
                if not variants:
                    self.stdout.write(
                        '  - sem variantes'
                    )

                for variant in variants:
                    source_code = (
                        variant.source_code
                        or '-'
                    )

                    edition = (
                        variant.edition_name
                        or '-'
                    )

                    colors = (
                        ', '.join(
                            variant.colors
                        )
                        if variant.colors
                        else '-'
                    )

                    image_status = (
                        'SIM'
                        if (
                            variant.image
                            or variant.image_url
                        )
                        else 'NÃO'
                    )

                    default_status = (
                        'SIM'
                        if variant.is_default
                        else 'NÃO'
                    )

                    self.stdout.write(
                        (
                            '  - '
                            f'{variant.variant_name}'
                            f' | código: {source_code}'
                            f' | edição: {edition}'
                            f' | cores: {colors}'
                            f' | imagem: {image_status}'
                            f' | padrão: {default_status}'
                        )
                    )

    def show_release_codes(
        self,
        name_filter,
        limit,
        show_all,
    ):
        self.stdout.write('')
        self.stdout.write(
            self.style.HTTP_INFO(
                'LANÇAMENTOS / CÓDIGOS'
            )
        )
        self.stdout.write(
            '-' * 60
        )

        queryset = (
            BeybladeRelease.objects
            .all()
            .order_by(
                'code',
                'slot_number',
                'name'
            )
        )

        if name_filter:
            queryset = queryset.filter(
                name__icontains=
                    name_filter
            )

        if not show_all:
            queryset = queryset[
                :limit
            ]

        for release in queryset:
            self.stdout.write(
                (
                    f'{release.code or "-"} '
                    f'| slot: '
                    f'{release.slot_number or "-"} '
                    f'| {release.name}'
                )
            )

            if release.edition_name:
                self.stdout.write(
                    (
                        '  edição: '
                        f'{release.edition_name}'
                    )
                )

            if release.source_item_id:
                self.stdout.write(
                    (
                        '  source_item_id: '
                        f'{release.source_item_id}'
                    )
                )

    def show_suspicious_items(
        self
    ):
        self.stdout.write('')
        self.stdout.write(
            self.style.WARNING(
                'POSSÍVEIS PROBLEMAS'
            )
        )
        self.stdout.write(
            '-' * 60
        )

        suspicious_releases = (
            BeybladeRelease.objects
            .filter(
                code__regex=
                    r'^(BX|UX|CX)-\d+\s+\d+$'
            )
            .order_by(
                'code'
            )
        )

        if suspicious_releases.exists():
            self.stdout.write(
                self.style.WARNING(
                    (
                        'Ainda existem códigos com '
                        'sufixo artificial:'
                    )
                )
            )

            for release in (
                suspicious_releases[
                    :30
                ]
            ):
                self.stdout.write(
                    (
                        '  - '
                        f'{release.code} '
                        f'| {release.name}'
                    )
                )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    (
                        'Nenhum código no formato '
                        '"BX-00 02" foi encontrado.'
                    )
                )
            )

        duplicate_codes = {}

        for release in (
            BeybladeRelease.objects
            .exclude(
                code__isnull=True
            )
            .exclude(
                code=''
            )
            .order_by(
                'code'
            )
        ):
            duplicate_codes.setdefault(
                release.code,
                []
            ).append(
                release
            )

        repeated = {
            code: items
            for (
                code,
                items
            ) in duplicate_codes.items()
            if len(
                items
            ) > 1
        }

        self.stdout.write('')

        if repeated:
            self.stdout.write(
                (
                    'Códigos oficiais repetidos '
                    f'encontrados: {len(repeated)}'
                )
            )

            for code, items in list(
                repeated.items()
            )[
                :20
            ]:
                self.stdout.write(
                    (
                        f'  {code}: '
                        f'{len(items)} registros'
                    )
                )

                for release in items[
                    :8
                ]:
                    self.stdout.write(
                        (
                            '    - '
                            f'{release.name}'
                            f' | slot: '
                            f'{release.slot_number or "-"}'
                        )
                    )
        else:
            self.stdout.write(
                'Nenhum código oficial repetido.'
            )

        self.stdout.write('')

        self.show_variant_excess(
            'Blade',
            BeyBlade.objects.all()
        )

        self.show_variant_excess(
            'Ratchet',
            BeyRatchet.objects.all()
        )

        self.show_variant_excess(
            'Bit',
            BeyBit.objects.all()
        )

    def show_variant_excess(
        self,
        label,
        queryset
    ):
        items = []

        for item in queryset:
            count = (
                item.variants.count()
            )

            if count >= 10:
                items.append(
                    (
                        count,
                        item.name
                    )
                )

        items.sort(
            reverse=True
        )

        if not items:
            self.stdout.write(
                (
                    f'{label}: nenhum item '
                    'com 10+ variantes.'
                )
            )
            return

        self.stdout.write(
            (
                f'{label}s com muitas '
                'variantes:'
            )
        )

        for count, name in items[
            :20
        ]:
            self.stdout.write(
                (
                    f'  - {name}: '
                    f'{count}'
                )
            )
