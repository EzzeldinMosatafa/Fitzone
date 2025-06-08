from django.db import migrations

def merge_articles(apps, schema_editor):
    Article = apps.get_model('articles', 'Article')
    WorkoutArticle = apps.get_model('workout_analysis', 'Article')
    
    # Move all articles from 'article' table to 'workout_article' table
    for article in Article.objects.all():
        WorkoutArticle.objects.create(
            title=article.title,
            content=article.content,
            image=article.image,
            tags=article.tags,
            category=article.category,
            is_featured=article.is_featured,
            read_time=article.read_time,
            author=article.author,
            created_at=article.created_at,
            updated_at=article.updated_at,
            views=article.views
        )

class Migration(migrations.Migration):
    dependencies = [
        ('workout_analysis', '0006_alter_article_table'),
        ('articles', '0002_article_views'),
    ]

    operations = [
        migrations.RunPython(merge_articles),
    ] 