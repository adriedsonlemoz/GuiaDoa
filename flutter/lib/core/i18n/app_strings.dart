class AppStrings {
  AppStrings(this.locale);

  final String locale;

  bool get isEnglish => locale.toLowerCase().startsWith('en');

  String t(String key) => (isEnglish ? _en : _pt)[key] ?? _pt[key] ?? key;

  static const Map<String, String> _pt = <String, String>{
    'app.subtitle': 'Guia de Dragons of Atlantis',
    'home.arsenal': 'ARSENAL DO COMANDANTE',
    'home.sync': 'Sincronizar',
    'home.profile': 'Perfil',
    'home.noProfile': 'Configure seu perfil',
    'home.currentData': 'Dados oficiais via API/MongoDB',
    'home.migrating': 'Módulo em migração para Flutter',
    'tool.tropas': 'Tropas',
    'tool.dragoes': 'Dragões',
    'tool.edificios': 'Edifícios',
    'tool.pesquisas': 'Pesquisas',
    'tool.itens': 'Itens',
    'tool.reinos': 'Reinos',
    'tool.niveis': 'Níveis',
    'tool.eventos': 'Eventos',
    'tool.torneios': 'Torneios',
    'tool.dicas': 'Dicas',
    'tool.campanha': 'Campanha',
    'tool.ilhas': 'Ilhas',
    'catalog.search': 'Buscar',
    'catalog.empty': 'Nenhum registro encontrado.',
    'catalog.offline': 'Exibindo o último snapshot salvo.',
    'catalog.online': 'Sincronizado com a API.',
    'profile.title': 'Seu perfil',
    'profile.name': 'Nome',
    'profile.realm': 'Reino',
    'profile.language': 'Idioma',
    'profile.continue': 'Continuar',
    'profile.save': 'Salvar',
    'profile.validation': 'Preencha nome e reino.',
    'common.back': 'Voltar',
    'common.retry': 'Tentar novamente',
  };

  static const Map<String, String> _en = <String, String>{
    'app.subtitle': 'Dragons of Atlantis Guide',
    'home.arsenal': 'COMMANDER ARSENAL',
    'home.sync': 'Sync',
    'home.profile': 'Profile',
    'home.noProfile': 'Set up your profile',
    'home.currentData': 'Official data via API/MongoDB',
    'home.migrating': 'Module being migrated to Flutter',
    'tool.tropas': 'Troops',
    'tool.dragoes': 'Dragons',
    'tool.edificios': 'Buildings',
    'tool.pesquisas': 'Research',
    'tool.itens': 'Items',
    'tool.reinos': 'Realms',
    'tool.niveis': 'Levels',
    'tool.eventos': 'Events',
    'tool.torneios': 'Tournaments',
    'tool.dicas': 'Tips',
    'tool.campanha': 'Campaign',
    'tool.ilhas': 'Islands',
    'catalog.search': 'Search',
    'catalog.empty': 'No records found.',
    'catalog.offline': 'Showing the last saved snapshot.',
    'catalog.online': 'Synced with the API.',
    'profile.title': 'Your profile',
    'profile.name': 'Name',
    'profile.realm': 'Realm',
    'profile.language': 'Language',
    'profile.continue': 'Continue',
    'profile.save': 'Save',
    'profile.validation': 'Enter your name and realm.',
    'common.back': 'Back',
    'common.retry': 'Try again',
  };
}
