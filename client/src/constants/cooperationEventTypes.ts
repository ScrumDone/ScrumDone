export const COOPERATION_EVENT_TYPES = [
  'Inne',
  'Podpis umowy',
  'Spotkanie',
  'Start projektu',
  'Zakończenie projektu',
  'Zmiana adresu',
  'Zmiana osoby kontaktowej',
  'Wysłano email',
  'Rozmowa telefoniczna',
] as const;

export type CooperationEventType = (typeof COOPERATION_EVENT_TYPES)[number];
