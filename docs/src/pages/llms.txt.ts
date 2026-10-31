import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sections } from '../lib/nav';

export const GET: APIRoute = async ({ site }) => {
  const base = site ? site.origin : 'https://regularhuman.dev';
  const docs = new Map((await getCollection('docs')).map((d) => [d.id, d]));

  const lines = [
    '# Robot',
    '',
    '> Robot (npm: robot3) is a 1.3 kB library for building finite state machines',
    '> in JavaScript out of plain functions: createMachine, state, transition,',
    '> guard, reduce, action, invoke, immediate and interpret.',
    '',
    'Every page below is plain markdown.',
  ];

  for (const section of sections) {
    const items = section.items.filter((item) => docs.has(item.slug));
    if (!items.length) continue;
    lines.push('', `## ${section.label}`, '');
    for (const item of items) {
      lines.push(`- [${item.title}](${base}/docs/${item.slug}.md)`);
    }
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
