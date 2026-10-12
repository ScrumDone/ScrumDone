// Odmiana rzeczowników przez liczebniki wg reguł języka polskiego (Intl.PluralRules)
// one: 1 członek | few: 2-4, 22-24... członków/zadania | many: 0, 5-21, 25... członków/zadań
// other: ułamki (1,5 zadania) - domyślnie forma "few"
export type PluralForms = {
  one: string;
  few: string;
  many: string;
  other?: string;
};

const plRules = new Intl.PluralRules('pl-PL');

export function pluralize(count: number, forms: PluralForms): string {
  switch (plRules.select(count)) {
    case 'one':
      return forms.one;
    case 'few':
      return forms.few;
    case 'many':
      return forms.many;
    default:
      return forms.other ?? forms.few;
  }
}

// "1 członek", "2 członków", "5 członków"
export function formatCount(count: number | null | undefined, forms: PluralForms): string {
  const value = count ?? 0;
  return `${value} ${pluralize(value, forms)}`;
}

export const PLURALS = {
  members: { one: 'członek', few: 'członków', many: 'członków' },
  teamMembers: { one: 'członek zespołu', few: 'członków zespołu', many: 'członków zespołu' },
  tasks: { one: 'zadanie', few: 'zadania', many: 'zadań' },
  tasksGenitive: { one: 'zadania', few: 'zadań', many: 'zadań' },
  completed: { one: 'ukończone', few: 'ukończone', many: 'ukończonych' },
  assignedPeople: {
    one: 'więcej przypisana osoba',
    few: 'więcej przypisane osoby',
    many: 'więcej przypisanych osób',
  },
} satisfies Record<string, PluralForms>;
