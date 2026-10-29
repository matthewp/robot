export interface NavItem {
  title: string;
  slug: string;
  api?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const sections: NavSection[] = [
  {
    id: 'start',
    label: 'Start here',
    items: [
      { title: 'Introduction', slug: '' },
      { title: 'Core concepts', slug: 'core-concepts' },
    ],
  },
  {
    id: 'concepts',
    label: 'Concepts',
    items: [
      { title: 'State', slug: 'concepts-state' },
      { title: 'Transitions', slug: 'concepts-transitions' },
      { title: 'Events', slug: 'concepts-events' },
      { title: 'Guards', slug: 'concepts-guards' },
      { title: 'Actions', slug: 'concepts-actions' },
    ],
  },
  {
    id: 'guides',
    label: 'Guides',
    items: [
      { title: 'Composition', slug: 'composition' },
      { title: 'Nested states', slug: 'nested-states' },
      { title: 'Awaiting async execution', slug: 'awaiting-asynchronous-execution' },
      { title: 'Comparison with XState', slug: 'comparison-with-xstate' },
    ],
  },
  {
    id: 'api',
    label: 'API',
    items: [
      { title: 'createMachine', slug: 'createmachine', api: true },
      { title: 'state', slug: 'state', api: true },
      { title: 'transition', slug: 'transition', api: true },
      { title: 'guard', slug: 'guard', api: true },
      { title: 'action', slug: 'action', api: true },
      { title: 'reduce', slug: 'reduce', api: true },
      { title: 'invoke', slug: 'invoke', api: true },
      { title: 'interpret', slug: 'interpret', api: true },
      { title: 'immediate', slug: 'immediate', api: true },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    items: [
      { title: 'react-robot', slug: 'react-robot', api: true },
      { title: 'preact-robot', slug: 'preact-robot', api: true },
      { title: 'svelte-robot-factory', slug: 'svelte-robot-factory', api: true },
      { title: 'lit-robot', slug: 'lit-robot', api: true },
      { title: 'haunted-robot', slug: 'haunted-robot', api: true },
      { title: 'robot-hooks', slug: 'robot-hooks', api: true },
    ],
  },
];

export const flat = sections.flatMap((section, i) =>
  section.items.map((item) => ({ ...item, section, sectionIndex: i + 1 }))
);

export function href(slug: string) {
  return slug ? `/docs/${slug}/` : '/docs/';
}

export function locate(slug: string) {
  const index = flat.findIndex((item) => item.slug === slug);
  return {
    current: flat[index],
    prev: index > 0 ? flat[index - 1] : undefined,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined,
  };
}
