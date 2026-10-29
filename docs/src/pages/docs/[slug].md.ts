import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((item) => ({ params: { slug: item.id }, props: { item } }));
}

export const GET: APIRoute = ({ props }) => {
  const { item } = props as { item: { data: { title: string }; body?: string } };
  let body = item.body ?? '';
  if (!/^#\s/m.test(body)) body = `# ${item.data.title}\n\n${body}`;
  return new Response(body.trim() + '\n', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
