# Generated by Django 5.0.6 on 2025-06-25 17:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oj', '0004_discussion_posted_on'),
    ]

    operations = [
        migrations.AddField(
            model_name='solution',
            name='input_data',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='solution',
            name='output_data',
            field=models.TextField(blank=True, default=''),
        ),
    ]
