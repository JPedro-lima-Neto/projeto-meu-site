from django.db import migrations, models


def limpar_isbn_antigo(apps, schema_editor):
    LibraryCatalog = apps.get_model('api', 'LibraryCatalog')

    LibraryCatalog.objects.all().update(isbn=None)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_librarycatalog_userlibraryentry'),
    ]

    operations = [
        migrations.RunPython(
            limpar_isbn_antigo,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='librarycatalog',
            name='isbn',
            field=models.JSONField(
                blank=True,
                default=list,
            ),
        ),
    ]