import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('articles');
  return rss({
    title: 'rnnclex.com | Blog NCLEX para enfermeros hispanos',
    description: 'Guías en español sobre el NCLEX-RN, la licencia de enfermería y la homologación en Estados Unidos.',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/${post.data.section}/${post.data.slug}/`,
      })),
  });
}
