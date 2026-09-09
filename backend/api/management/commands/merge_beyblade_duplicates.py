from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.models import (
    BeyBlade,
    BeyBladeVariant,
    BeybladeRelease,
    UserBeyBlade,
    BeybladeBuild,
)


ALIASES = {
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
    'Hover Wyvern': 'WyvernHover',
    'Tackle Goat': 'GoatTackle',
    'Lightning L-Drago (Rapid-Hit Type)': 'Lightning L-Drago',
    'Lightning L-Drago (Upper Type)': 'Lightning L-Drago',
}


class Command(BaseCommand):
    help = (
        'Unifica Blades duplicadas sem apagar variantes, releases, '
        'itens da coleção ou builds. Sem --apply apenas simula.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Aplica as alterações. Sem esta opção, apenas simula.',
        )
        parser.add_argument(
            '--only',
            type=str,
            default='',
            help='Processa somente um alias. Ex.: --only "Circle Ghost"',
        )

    def handle(self, *args, **options):
        apply_changes = options['apply']
        only = options['only'].strip()
        aliases = ALIASES

        if only:
            match = next(
                ((a, c) for a, c in ALIASES.items() if a.casefold() == only.casefold()),
                None,
            )
            if not match:
                raise CommandError(f'Alias "{only}" não existe na lista.')
            aliases = {match[0]: match[1]}

        self.stdout.write('')
        self.stdout.write(
            self.style.WARNING('MODO APLICAÇÃO' if apply_changes else 'MODO SIMULAÇÃO')
        )
        self.stdout.write('')

        totals = {
            'groups': 0,
            'missing_source': 0,
            'missing_target': 0,
            'variants_moved': 0,
            'variants_merged': 0,
            'releases_moved': 0,
            'owned_moved': 0,
            'owned_merged': 0,
            'builds_moved': 0,
            'sources_deleted': 0,
        }

        if apply_changes:
            with transaction.atomic():
                self.process_aliases(aliases, totals, True)
        else:
            self.process_aliases(aliases, totals, False)

        self.print_summary(totals, apply_changes)

    def process_aliases(self, aliases, totals, apply_changes):
        for source_name, target_name in aliases.items():
            source = BeyBlade.objects.filter(name__iexact=source_name).first()
            target = BeyBlade.objects.filter(name__iexact=target_name).first()

            if not source:
                totals['missing_source'] += 1
                self.stdout.write(f'IGNORADO: {source_name} não existe.')
                continue

            if not target:
                totals['missing_target'] += 1
                self.stdout.write(
                    self.style.WARNING(
                        f'ATENÇÃO: destino {target_name} não existe para {source_name}.'
                    )
                )
                continue

            if source.id == target.id:
                continue

            totals['groups'] += 1
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS(f'{source.name} -> {target.name}'))

            self.merge_one(source, target, totals, apply_changes)

    def merge_one(self, source, target, totals, apply_changes):
        source_variants = list(
            BeyBladeVariant.objects.filter(blade=source).order_by('id')
        )

        for source_variant in source_variants:
            target_variant = BeyBladeVariant.objects.filter(
                blade=target,
                variant_name=source_variant.variant_name,
            ).first()

            if not target_variant:
                totals['variants_moved'] += 1
                self.stdout.write(
                    f'  variante mover: {source_variant.id} {source_variant.variant_name}'
                )

                if apply_changes:
                    source_variant.blade = target
                    source_variant.save(update_fields=['blade'])
                continue

            totals['variants_merged'] += 1
            self.stdout.write(
                f'  variante fundir: {source_variant.id} -> {target_variant.id} '
                f'({source_variant.variant_name})'
            )

            if apply_changes:
                self.merge_variant_metadata(source_variant, target_variant)

                BeybladeRelease.objects.filter(
                    blade_variant=source_variant
                ).update(blade_variant=target_variant)

                self.move_owned_variant_entries(
                    source,
                    target,
                    source_variant,
                    target_variant,
                    totals,
                )

                self.move_build_variant_refs(source_variant, target_variant)
                source_variant.delete()

        release_count = BeybladeRelease.objects.filter(blade=source).count()
        owned_count = UserBeyBlade.objects.filter(blade=source).count()
        build_count = BeybladeBuild.objects.filter(blade=source).count()

        totals['releases_moved'] += release_count
        totals['builds_moved'] += build_count

        self.stdout.write(f'  releases: {release_count}')
        self.stdout.write(f'  itens da coleção: {owned_count}')
        self.stdout.write(f'  builds: {build_count}')

        if not apply_changes:
            return

        BeybladeRelease.objects.filter(blade=source).update(blade=target)
        self.move_remaining_owned_entries(source, target, totals)
        BeybladeBuild.objects.filter(blade=source).update(blade=target)

        remaining = {
            'variantes': BeyBladeVariant.objects.filter(blade=source).count(),
            'releases': BeybladeRelease.objects.filter(blade=source).count(),
            'coleção': UserBeyBlade.objects.filter(blade=source).count(),
            'builds': BeybladeBuild.objects.filter(blade=source).count(),
        }

        if any(remaining.values()):
            raise CommandError(
                f'Não foi seguro apagar {source.name}. Restaram: {remaining}. '
                'A transação será revertida.'
            )

        source.delete()
        totals['sources_deleted'] += 1

    def merge_variant_metadata(self, source_variant, target_variant):
        changed = []

        for field_name in ('source_code', 'edition_name', 'image_url'):
            if not hasattr(target_variant, field_name):
                continue
            target_value = getattr(target_variant, field_name, None)
            source_value = getattr(source_variant, field_name, None)
            if not target_value and source_value:
                setattr(target_variant, field_name, source_value)
                changed.append(field_name)

        if (
            hasattr(target_variant, 'image')
            and not getattr(target_variant, 'image', None)
            and getattr(source_variant, 'image', None)
        ):
            target_variant.image = source_variant.image
            changed.append('image')

        if changed:
            target_variant.save(update_fields=changed)

    def move_owned_variant_entries(
        self,
        source,
        target,
        source_variant,
        target_variant,
        totals,
    ):
        entries = list(
            UserBeyBlade.objects.filter(
                blade=source,
                variant=source_variant,
            )
        )

        for entry in entries:
            existing = UserBeyBlade.objects.filter(
                user=entry.user,
                blade=target,
                variant=target_variant,
            ).exclude(pk=entry.pk).first()

            if existing:
                existing.quantity = (existing.quantity or 0) + (entry.quantity or 0)
                existing.save(update_fields=['quantity'])
                entry.delete()
                totals['owned_merged'] += 1
            else:
                entry.blade = target
                entry.variant = target_variant
                entry.save(update_fields=['blade', 'variant'])
                totals['owned_moved'] += 1

    def move_remaining_owned_entries(self, source, target, totals):
        entries = list(
            UserBeyBlade.objects.filter(blade=source).select_related('variant')
        )

        for entry in entries:
            variant = entry.variant

            if variant and variant.blade_id != target.id:
                matching_variant = BeyBladeVariant.objects.filter(
                    blade=target,
                    variant_name=variant.variant_name,
                ).first()
                if matching_variant:
                    variant = matching_variant

            existing = UserBeyBlade.objects.filter(
                user=entry.user,
                blade=target,
                variant=variant,
            ).exclude(pk=entry.pk).first()

            if existing:
                existing.quantity = (existing.quantity or 0) + (entry.quantity or 0)
                existing.save(update_fields=['quantity'])
                entry.delete()
                totals['owned_merged'] += 1
            else:
                entry.blade = target
                entry.variant = variant
                entry.save(update_fields=['blade', 'variant'])
                totals['owned_moved'] += 1

    def move_build_variant_refs(self, source_variant, target_variant):
        if not any(field.name == 'blade_variant' for field in BeybladeBuild._meta.fields):
            return

        BeybladeBuild.objects.filter(
            blade_variant=source_variant
        ).update(blade_variant=target_variant)

    def print_summary(self, totals, apply_changes):
        self.stdout.write('')
        self.stdout.write('=' * 64)
        self.stdout.write(self.style.SUCCESS('RESUMO'))

        rows = (
            ('Grupos processados', 'groups'),
            ('Aliases ausentes', 'missing_source'),
            ('Destinos ausentes', 'missing_target'),
            ('Variantes movidas', 'variants_moved'),
            ('Variantes fundidas', 'variants_merged'),
            ('Releases movidos', 'releases_moved'),
            ('Itens da coleção movidos', 'owned_moved'),
            ('Itens da coleção fundidos', 'owned_merged'),
            ('Builds movidas', 'builds_moved'),
            ('Bases duplicadas removidas', 'sources_deleted'),
        )

        for label, key in rows:
            self.stdout.write(f'{label}: {totals[key]}')

        self.stdout.write('')

        if apply_changes:
            self.stdout.write(self.style.SUCCESS('Unificação aplicada com sucesso.'))
        else:
            self.stdout.write(
                self.style.WARNING(
                    'SIMULAÇÃO apenas. Para aplicar, rode novamente com --apply.'
                )
            )
