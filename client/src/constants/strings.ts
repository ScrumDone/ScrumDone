export const STRINGS = {
  common: {
    none: 'Brak',
    cancel: 'Anuluj',
    saveChanges: 'Zapisz zmiany',
    close: 'Zamknij',
    edit: 'Edytuj',
    delete: 'Usuń',
    add: 'Dodaj',
    priority: 'Priorytet',
  },

  navigation: {
    brand: {
      name: 'scrum',
      tld: 'done',
    },
    items: {
      home: 'Strona główna',
      calendar: 'Kalendarz',
      projects: 'Projekty',
      companies: 'Firmy',
      reports: 'Raporty',
      files: 'Pliki',
    },
    topBar: {
      notificationsAriaLabel: 'Powiadomienia',
      unreadAriaLabel: 'Nieodczytane',
      user: {
        name: 'Artur Nowak',
        org: 'Randomo',
      },
    },
  },

  homepage: {
    title: 'Strona Główna',
    today: 'Dzisiaj',
    news: 'Aktualności',
    projects: 'Projekty',
    welcomeTaskFrom: 'from:',
  },

  projects: {
    title: 'Projekty',
    addProject: 'Dodaj projekt',
    card: {
      progressLabel: 'Postęp',
      membersCountSuffix: 'członków',
    },
    overview: {
      offtrack: 'Offtrack',
      issues: 'issues',
      aria: {
        doneTasks: 'Zakończone zadania',
        inProgressTasks: 'Zadania w toku',
        blockedTasks: 'Zablokowane zadania',
      },
    },
    topBar: {
      backToProjects: 'Powrót do projektów',
      teamMembersSuffix: 'członków zespołu',
      viewMode: {
        kanban: 'Kanban',
        scrum: 'Scrum',
      },
      editProject: 'Edytuj projekt',
      tabs: {
        kanbanBoard: 'Tablica Kanban',
        calendar: 'Kalendarz',
        sprints: 'Sprinty',
        filesRepo: 'Repozytorium plikow',
      },
    },
    editModal: {
      title: 'Edycja projektu',
      subtitle: 'Zarządzaj ustawieniami i zespołem projektu',
      closeAriaLabel: 'Zamknij okno edycji projektu',
      fields: {
        projectName: 'Nazwa projektu',
        projectDescription: 'Opis projektu',
        startDate: 'Data rozpoczęcia',
        endDate: 'Data zakończenia',
        teamMembers: 'Członkowie zespołu',
      },
      actionsSectionTitle: 'Akcje projektu',
      actions: {
        changeClient: 'Zmień klienta',
        archiveProject: 'Archiwizuj projekt',
        deleteProject: 'Usuń projekt',
      },
      memberSelectAriaLabelPrefix: 'Wybierz',
    },
    projectNotFound: 'Nie znaleziono projektu o podanym adresie.',
  },

  companies: {
    title: 'Firmy',
    addCompany: 'Dodaj firmę',
    card: {
      taxIdPrefix: 'NIP:',
      mainContact: 'Główny kontakt',
      contacts: 'Osoby kontaktowe',
      projects: 'Projekty',
    },
  },

  reports: {
    title: 'Raporty',
    generateReport: 'Wygeneruj raport',
    empty: {
      title: 'Brak raportow',
      descriptionLine1: 'Nie masz jeszcze zadnych wygenerowanych raportow.',
      descriptionLine2: 'Kliknij przycisk powyzej, aby utworzyc pierwszy raport.',
      primaryCta: 'Stworz pierwszy raport',
    },
  },

  projectFiles: {
    title: 'Pliki',
    list: {
      projectPrefix: 'Projekt:',
      noProject: 'Bez projektu',
      typePrefix: 'Typ:',
    },
    emptyState: {
      title: 'Brak plików dla wybranych filtrów',
      description: 'Zmień wyszukiwaną nazwę, projekt, typ lub odznacz część tagów.',
    },
    filters: {
      searchPlaceholder: 'Szukaj plików...',
      allProjects: 'Wszystkie projekty',
      allTypes: 'Wszystkie typy',
      tagsTitle: 'Tagi:',
      selectedTags: 'Wybrane tagi:',
    },
  },

  kanban: {
    boardTitle: 'Tablica Kanban',
    addTask: 'Dodaj zadanie',
    columns: {
      todo: 'Do zrobienia',
      inProgress: 'W toku',
      review: 'Sprawdzanie',
      done: 'Gotowe',
    },
    priorityOptions: {
      high: 'Wysoki',
      medium: 'Średni',
      low: 'Niski',
    },
  },

  sprints: {
    sections: {
      activeSprint: 'Aktywny sprint',
      plannedSprints: 'Zaplanowane sprinty',
      completedSprints: 'Ukończone sprinty',
    },
    meta: {
      tasksCount: 'zadań',
      completedCount: 'ukończonych',
      noTasksInSprint: 'Brak zadań w tym sprincie',
    },
    sidebar: {
      sprintsTitle: 'Sprinty',
      teamMembersTitle: 'Członkowie zespołu',
      completionStatusTitle: 'Status ukończenia',
      backlogTitle: 'Backlog (4)',
      addTaskTitle: 'Dodaj zadanie',
      statuses: {
        done: 'Ukończone',
        notDone: 'Nieukończone',
      },
    },
    status: {
      active: 'Aktywny',
      planned: 'Zaplanowany',
      done: 'Ukończony',
    },
    editModal: {
      title: 'Edycja sprintu',
      subtitle: 'Zarządzaj aktywnym sprintem projektu',
      closeAriaLabel: 'Zamknij okno edycji sprintu',
      fields: {
        sprintName: 'Nazwa sprintu',
        startDate: 'Data rozpoczęcia',
        endDate: 'Data zakończenia',
        sprintStatus: 'Status sprintu',
      },
      actionsTitle: 'Akcje sprintu',
      actions: {
        closeAndStartNew: 'Zamknij i rozpocznij nowy sprint',
        extendByWeek: 'Przedłuż sprint o tydzień',
        deleteSprint: 'Usuń sprint',
      },
    },
  },

  calendar: {
    title: 'Kalendarz',
    view: {
      week: 'Tydzień',
      month: 'Miesiąc',
    },
    weekNavigation: {
      prevWeekAriaLabel: 'Poprzedni tydzień',
      nextWeekAriaLabel: 'Następny tydzień',
    },
    mode: {
      personal: 'Personal',
      team: 'Team',
    },
    filters: {
      peopleDefaultTitle: 'Osoby',
      projectsTitle: 'Projekty',
      priorityTitle: 'Priorytet',
      priorityOptions: {
        high: 'Wysoki',
        medium: 'Średni',
        low: 'Niski',
      },
    },
    noDeadlineTasks: {
      title: 'Zadania bez deadline',
    },
    weekDaysShort: ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'],
  },

  task: {
    breadcrumb: {
      home: 'Strona główna (start-page) /',
    },
    sections: {
      description: 'Opis',
      attachments: 'Załączniki',
      subtasks: 'Zadania podrzędne',
      relatedIssues: 'Powiązane zgłoszenia',
      details: 'Szczegóły',
      labels: 'Etykiety',
    },
    actions: {
      addSubtask: 'Dodaj zadanie podrzędne',
      addRelatedIssue: 'Dodaj powiązane zgłoszenie',
    },
    detailsFields: {
      person: 'Osoba',
      project: 'Projekt',
      createdAt: 'Utworzono',
      dueDate: 'Termin',
      estimateTime: 'Czas estimacji',
      priority: 'Priorytet',
      doAfter: 'Wykonaj po',
    },
    status: {
      todo: 'Do zrobienia',
      inProgress: 'W toku',
      done: 'Gotowe',
    },
  },

  newsFeed: {
    entries: {
      mariaWrote: 'Maria napisała',
      mariaMessage: 'Hej, jak idzie praca nad menu?',
      youAddedTask: 'Dodałeś nowe zadanie Logowanie',
      fileAddedToProjectPrefix: 'Do projektu Kendo dodano nowy plik -',
      taskPrefix: 'Zadanie',
      taskEndsToday: 'Database schema design kończy się dzisiaj',
      erykAssignedYou: 'Eryk przypisał Ci zadanie',
      janCommented: 'Jan skomentował zadanie',
    },
  },
} as const;

