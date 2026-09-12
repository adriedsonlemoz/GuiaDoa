import 'dart:async';
import '../../../core/domain/realm_time.dart';
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/config/app_config.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/feature_store.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../../../core/utils/content_utils.dart';
import '../../catalog/presentation/game_data_controller.dart';
import '../../settings/presentation/settings_page.dart';

class ModuleScaffold extends StatelessWidget {
  const ModuleScaffold({
    super.key,
    required this.title,
    required this.child,
    this.subtitle,
    this.actions,
    this.floatingActionButton,
  });

  final String title;
  final String? subtitle;
  final Widget child;
  final List<Widget>? actions;
  final Widget? floatingActionButton;

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: GuiaColors.premiumBackground,
        appBar: AppBar(
          backgroundColor: GuiaColors.premiumBackground2,
          foregroundColor: GuiaColors.premiumText,
          surfaceTintColor: Colors.transparent,
          titleSpacing: 0,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
              if (subtitle != null)
                Text(
                  subtitle!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 10.5, fontWeight: FontWeight.w600),
                ),
            ],
          ),
          actions: actions,
          bottom: const PreferredSize(
            preferredSize: Size.fromHeight(1),
            child: Divider(height: 1, color: GuiaColors.premiumGold),
          ),
        ),
        body: SafeArea(
          top: false,
          child: DecoratedBox(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[GuiaColors.premiumBackground2, GuiaColors.premiumBackground],
              ),
            ),
            child: Theme(data: Theme.of(context).copyWith(
              inputDecorationTheme: Theme.of(context).inputDecorationTheme.copyWith(
                fillColor: GuiaColors.premiumBackground2,
                labelStyle: const TextStyle(color: GuiaColors.premiumMuted),
                hintStyle: const TextStyle(color: GuiaColors.premiumMuted),
                prefixIconColor: GuiaColors.premiumGoldLight,
                suffixIconColor: GuiaColors.premiumGoldLight,
              ),
              chipTheme: Theme.of(context).chipTheme.copyWith(
                backgroundColor: GuiaColors.premiumPanel,
                selectedColor: GuiaColors.premiumEmerald,
                labelStyle: const TextStyle(color: GuiaColors.premiumText),
                side: const BorderSide(color: GuiaColors.goldDark),
              ),
              textTheme: Theme.of(context).textTheme.apply(bodyColor: GuiaColors.premiumText, displayColor: GuiaColors.premiumText),
            ), child: child),
          ),
        ),
        floatingActionButton: floatingActionButton,
      );
}

class PremiumPanel extends StatelessWidget {
  const PremiumPanel({super.key, required this.child, this.padding = const EdgeInsets.all(12), this.onTap});

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final panel = Container(
      padding: padding,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[Color(0xFF0A493B), Color(0xFF062B25)],
        ),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .72)),
        boxShadow: <BoxShadow>[BoxShadow(color: Colors.black.withValues(alpha: .24), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: child,
    );
    if (onTap == null) return panel;
    return InkWell(borderRadius: BorderRadius.circular(13), onTap: onTap, child: panel);
  }
}

class ModuleIntro extends StatelessWidget {
  const ModuleIntro({super.key, required this.icon, required this.title, required this.text});
  final String icon;
  final String title;
  final String text;

  @override
  Widget build(BuildContext context) => PremiumPanel(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(icon, style: const TextStyle(fontSize: 32)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(title, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text(text, style: const TextStyle(color: GuiaColors.premiumMuted, height: 1.35, fontSize: 12.5)),
                ],
              ),
            ),
          ],
        ),
      );
}

Widget _sectionTitle(String text, {IconData? icon}) => Padding(
      padding: const EdgeInsets.fromLTRB(2, 6, 2, 8),
      child: Row(
        children: <Widget>[
          if (icon != null) ...<Widget>[Icon(icon, color: GuiaColors.premiumGoldLight, size: 19), const SizedBox(width: 7)],
          Expanded(child: Text(text, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 15))),
        ],
      ),
    );

String _imagePath(Map<String, dynamic> item) {
  for (final key in const <String>['imagem', 'image', 'icone', 'icon']) {
    final value = item[key]?.toString().trim();
    if (value != null && value.isNotEmpty) return value;
  }
  return '';
}

Widget _recordImage(Map<String, dynamic> item, {double size = 58, BoxFit fit = BoxFit.cover}) {
  final path = _imagePath(item);
  if (path.isEmpty) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: GuiaColors.premiumEmerald.withValues(alpha: .25), borderRadius: BorderRadius.circular(10)),
      child: const Icon(Icons.auto_awesome, color: GuiaColors.premiumGoldLight),
    );
  }
  if (path.startsWith('/assets/')) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Image.asset(
        'assets/public$path',
        width: size,
        height: size,
        fit: fit,
        errorBuilder: (_, __, ___) => _networkImage(path, size, fit),
      ),
    );
  }
  return _networkImage(path, size, fit);
}

Widget _networkImage(String path, double size, BoxFit fit) {
  final url = path.startsWith('http') ? path : '${AppConfig.apiUrl}${path.startsWith('/') ? path : '/$path'}';
  return ClipRRect(
    borderRadius: BorderRadius.circular(10),
    child: Image.network(
      url,
      width: size,
      height: size,
      fit: fit,
      errorBuilder: (_, __, ___) => SizedBox(width: size, height: size, child: const Icon(Icons.image_not_supported_outlined, color: GuiaColors.premiumMuted)),
    ),
  );
}

Future<void> _showRecordSheet(BuildContext context, Map<String, dynamic> record, String locale, {String? title}) async {
  final visible = record.entries.where((entry) => !const <String>{'_id', '__v', 'i18n'}.contains(entry.key)).toList(growable: false);
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: GuiaColors.premiumBackground2,
    showDragHandle: true,
    builder: (context) => SafeArea(
      child: FractionallySizedBox(
        heightFactor: .86,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(title ?? recordTitle(record, locale), style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 20)),
              const SizedBox(height: 10),
              Expanded(
                child: ListView.separated(
                  itemCount: visible.length,
                  separatorBuilder: (_, __) => const Divider(color: Color(0x3343B491)),
                  itemBuilder: (context, index) {
                    final entry = visible[index];
                    final raw = entry.value;
                    final value = raw is Map<Object?, Object?> || raw is List<Object?> ? const JsonEncoder.withIndent('  ').convert(raw) : raw?.toString() ?? '—';
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(entry.key, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w800, fontSize: 11)),
                        const SizedBox(height: 3),
                        SelectableText(value, style: const TextStyle(color: GuiaColors.premiumText, fontSize: 12.5, height: 1.35)),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class PremiumSearchField extends StatelessWidget {
  const PremiumSearchField({super.key, required this.hint, required this.onChanged, this.controller});
  final String hint;
  final ValueChanged<String> onChanged;
  final TextEditingController? controller;

  @override
  Widget build(BuildContext context) => TextField(
        controller: controller,
        onChanged: onChanged,
        style: const TextStyle(color: GuiaColors.premiumText),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: GuiaColors.premiumMuted),
          prefixIcon: const Icon(Icons.search, color: GuiaColors.premiumGoldLight),
          filled: true,
          fillColor: GuiaColors.premiumBackground2,
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GuiaColors.premiumGold)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GuiaColors.premiumGoldLight, width: 1.5)),
        ),
      );
}

class CatalogModulePage extends StatefulWidget {
  const CatalogModulePage({
    super.key,
    required this.title,
    required this.sectionKey,
    required this.controller,
    required this.profileStore,
    required this.featureStore,
    this.intro,
    this.icon = '📚',
    this.filter,
  });

  final String title;
  final String sectionKey;
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  final String? intro;
  final String icon;
  final bool Function(Map<String, dynamic>)? filter;

  @override
  State<CatalogModulePage> createState() => _CatalogModulePageState();
}

class _CatalogModulePageState extends State<CatalogModulePage> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    return ModuleScaffold(
      title: widget.title,
      subtitle: strings.t('module.online'),
      child: AnimatedBuilder(
        animation: Listenable.merge(<Listenable>[widget.controller, widget.featureStore]),
        builder: (context, _) {
          final normalized = _query.trim().toLowerCase();
          final all = widget.controller.section(widget.sectionKey).where((item) => widget.filter?.call(item) ?? true).toList(growable: false);
          final items = all.where((item) {
            if (normalized.isEmpty) return true;
            final hay = '${recordTitle(item, widget.profileStore.locale)} ${recordSubtitle(item, widget.profileStore.locale)} ${item['descricao'] ?? ''}'.toLowerCase();
            return hay.contains(normalized);
          }).toList(growable: false);
          return RefreshIndicator(
            color: GuiaColors.premiumGold,
            onRefresh: widget.controller.refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
              children: <Widget>[
                if (widget.intro != null) ...<Widget>[
                  ModuleIntro(icon: widget.icon, title: widget.title, text: widget.intro!),
                  const SizedBox(height: 12),
                ],
                PremiumSearchField(hint: strings.t('module.search'), onChanged: (value) => setState(() => _query = value)),
                const SizedBox(height: 12),
                if (items.isEmpty)
                  PremiumPanel(child: Center(child: Padding(padding: const EdgeInsets.all(20), child: Text(strings.t('module.empty'), style: const TextStyle(color: GuiaColors.premiumMuted)))))
                else
                  ...items.map((item) {
                    final id = '${widget.sectionKey}:${item['slug'] ?? item['id'] ?? recordTitle(item, widget.profileStore.locale)}';
                    final favorite = widget.featureStore.isFavorite(id);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: PremiumPanel(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
                        onTap: () => _showRecordSheet(context, item, widget.profileStore.locale),
                        child: Row(
                          children: <Widget>[
                            _recordImage(item, size: 55),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Text(recordTitle(item, widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900)),
                                  if (recordSubtitle(item, widget.profileStore.locale).isNotEmpty) ...<Widget>[
                                    const SizedBox(height: 3),
                                    Text(recordSubtitle(item, widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11.5)),
                                  ],
                                ],
                              ),
                            ),
                            IconButton(
                              tooltip: strings.t(favorite ? 'module.remove_favorite' : 'module.add_favorite'),
                              onPressed: () => widget.featureStore.toggleFavorite(id),
                              icon: Icon(favorite ? Icons.star : Icons.star_border, color: GuiaColors.premiumGoldLight),
                            ),
                            const Icon(Icons.chevron_right, color: GuiaColors.premiumGoldLight),
                          ],
                        ),
                      ),
                    );
                  }),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _TournamentDef {
  const _TournamentDef(this.id, this.icon, this.category, this.calculator);
  final String id;
  final String icon;
  final String category;
  final bool calculator;
}

const List<_TournamentDef> _tournaments = <_TournamentDef>[
  _TournamentDef('treino_tropa', '⚔️', 'tropas', true),
  _TournamentDef('aprimoramento_tropa', '🛡️', 'tropas', true),
  _TournamentDef('evolucao_tropas', '⭐', 'tropas', true),
  _TournamentDef('habilidade_dragao', '🐉', 'dragao', true),
  _TournamentDef('treinamento_dragao', '🍖', 'dragao', true),
  _TournamentDef('pocoes_antigas', '📚', 'poder', true),
  _TournamentDef('talisma', '🧿', 'magia', true),
  _TournamentDef('aceleracoes', '⏩', 'poder', true),
  _TournamentDef('general', '🎖️', 'poder', true),
  _TournamentDef('matar_tropas', '☠️', 'combate', true),
  _TournamentDef('alianca', '🤝', 'alianca', false),
  _TournamentDef('poder', '⚡', 'poder', false),
];

class TournamentsPage extends StatefulWidget {
  const TournamentsPage({super.key, required this.controller, required this.profileStore, required this.featureStore, this.initialId});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  final String? initialId;

  @override
  State<TournamentsPage> createState() => _TournamentsPageState();
}

class _TournamentsPageState extends State<TournamentsPage> {
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    if (widget.initialId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _TournamentDef? item;
        for (final candidate in _tournaments) {
          if (candidate.id == widget.initialId) { item = candidate; break; }
        }
        if (item != null && mounted) _open(item);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final list = _tournaments.where((item) {
      if (_filter == 'all') return true;
      if (_filter == 'calculator') return item.calculator;
      if (_filter == 'guide') return !item.calculator;
      return item.category == _filter;
    }).toList(growable: false);
    return ModuleScaffold(
      title: strings.t('home.botao.torneios'),
      subtitle: strings.t('tournaments.flutter.help'),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: <Widget>[
          ModuleIntro(icon: '🏆', title: strings.t('torneio.hub.titulo'), text: strings.t('torneio.hub.subtitulo')),
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: <Widget>[
              _filterChip(strings.t('module.all'), 'all'),
              _filterChip(strings.t('tournament.type.calculator'), 'calculator'),
              _filterChip(strings.t('tournament.type.guide'), 'guide'),
              _filterChip(strings.t('torneio.cat.tropas'), 'tropas'),
              _filterChip(strings.t('torneio.cat.dragao'), 'dragao'),
              _filterChip(strings.t('torneio.cat.poder'), 'poder'),
            ],
          ),
          const SizedBox(height: 12),
          ...list.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: PremiumPanel(
                  onTap: () => _open(item),
                  child: Row(
                    children: <Widget>[
                      Container(
                        width: 48,
                        height: 48,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(color: GuiaColors.premiumEmerald.withValues(alpha: .28), borderRadius: BorderRadius.circular(10)),
                        child: Text(item.icon, style: const TextStyle(fontSize: 25)),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(strings.t('torneio.titulo.${item.id}'), style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900)),
                            const SizedBox(height: 3),
                            Text(strings.t('torneio.desc.${item.id}'), style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11.5)),
                            const SizedBox(height: 5),
                            Text(
                              '${strings.t('torneio.cat.${item.category}')} · ${strings.t(item.calculator ? 'tournament.type.calculator' : 'tournament.type.guide')}',
                              style: const TextStyle(color: GuiaColors.premiumGoldLight, fontSize: 10, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: GuiaColors.premiumGoldLight),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String value) => ChoiceChip(
        label: Text(label),
        selected: _filter == value,
        onSelected: (_) => setState(() => _filter = value),
        selectedColor: GuiaColors.premiumGoldLight,
        backgroundColor: GuiaColors.premiumPanel,
        side: const BorderSide(color: GuiaColors.premiumGold),
        labelStyle: TextStyle(color: _filter == value ? GuiaColors.premiumBackground : GuiaColors.premiumText, fontWeight: FontWeight.w800),
      );

  void _open(_TournamentDef item) {
    Navigator.of(context).push(MaterialPageRoute<void>(
      builder: (_) => item.calculator
          ? TournamentCalculatorPage(definition: item, controller: widget.controller, profileStore: widget.profileStore, featureStore: widget.featureStore)
          : TournamentGuidePage(definition: item, profileStore: widget.profileStore),
    ));
  }
}

class _WeightedDef {
  const _WeightedDef(this.key, this.labelKey, this.emoji, this.multiplier, {this.divisor = 1});
  final String key;
  final String labelKey;
  final String emoji;
  final int multiplier;
  final int divisor;
}

List<_WeightedDef> _weightedDefs(String id) {
  switch (id) {
    case 'aprimoramento_tropa':
      return const <_WeightedDef>[
        _WeightedDef('incomum', 'torneio.aprimoramento_tropa.raridade.incomum', '🟢', 5),
        _WeightedDef('raro', 'torneio.aprimoramento_tropa.raridade.raro', '🔵', 10),
        _WeightedDef('epico', 'torneio.aprimoramento_tropa.raridade.epico', '🟣', 50),
        _WeightedDef('lendario', 'torneio.aprimoramento_tropa.raridade.lendario', '🟠', 200),
        _WeightedDef('mitologico', 'torneio.aprimoramento_tropa.raridade.mitologico', '🔴', 1000),
      ];
    case 'evolucao_tropas':
      return const <_WeightedDef>[
        _WeightedDef('crepusculo1', 'torneio.evolucao_tropas.fossil.crepusculo1', '🌅', 1, divisor: 10),
        _WeightedDef('crepusculo2', 'torneio.evolucao_tropas.fossil.crepusculo2', '🌄', 1, divisor: 10),
        _WeightedDef('anciao1', 'torneio.evolucao_tropas.fossil.anciao1', '🦴', 1, divisor: 10),
        _WeightedDef('anciao2', 'torneio.evolucao_tropas.fossil.anciao2', '💎', 1, divisor: 10),
      ];
    case 'habilidade_dragao':
      return const <_WeightedDef>[_WeightedDef('essencia', 'torneio.habilidade_dragao.essencia_nome', '🔥', 100)];
    case 'treinamento_dragao':
      return const <_WeightedDef>[
        _WeightedDef('carneiro', 'torneio.treinamento_dragao.carne.carneiro', '🐑', 100),
        _WeightedDef('boi', 'torneio.treinamento_dragao.carne.boi', '🐄', 200),
        _WeightedDef('frango', 'torneio.treinamento_dragao.carne.frango', '🐔', 500),
        _WeightedDef('veado', 'torneio.treinamento_dragao.carne.veado', '🦌', 1000),
        _WeightedDef('salmao', 'torneio.treinamento_dragao.carne.salmao', '🐟', 2000),
        _WeightedDef('lagosta', 'torneio.treinamento_dragao.carne.lagosta', '🦞', 5000),
      ];
    case 'pocoes_antigas':
      return const <_WeightedDef>[
        _WeightedDef('superior', 'torneio.pocoes.nome.superior', '🟣', 50),
        _WeightedDef('intermediaria', 'torneio.pocoes.nome.intermediaria', '🔵', 30),
        _WeightedDef('primaria', 'torneio.pocoes.nome.primaria', '🟢', 10),
      ];
    case 'talisma':
      return const <_WeightedDef>[
        _WeightedDef('verde', 'torneio.talisma.cor.verde', '🟢', 20),
        _WeightedDef('azul', 'torneio.talisma.cor.azul', '🔵', 30),
        _WeightedDef('roxo', 'torneio.talisma.cor.roxo', '🟣', 800),
        _WeightedDef('laranja', 'torneio.talisma.cor.laranja', '🟠', 12000),
      ];
    case 'aceleracoes':
      return const <_WeightedDef>[
        _WeightedDef('i1', 'torneio.aceleracoes.item.1min', '⏱️', 1),
        _WeightedDef('i3', 'torneio.aceleracoes.item.3min', '⏱️', 3),
        _WeightedDef('i5', 'torneio.aceleracoes.item.5min', '⏱️', 5),
        _WeightedDef('i15', 'torneio.aceleracoes.item.15min', '⏱️', 15),
        _WeightedDef('i60', 'torneio.aceleracoes.item.1h', '⏩', 60),
        _WeightedDef('i150', 'torneio.aceleracoes.item.2_5h', '⏩', 150),
        _WeightedDef('i480', 'torneio.aceleracoes.item.8h', '⏩', 480),
        _WeightedDef('i900', 'torneio.aceleracoes.item.15h', '⏩', 900),
        _WeightedDef('i1440', 'torneio.aceleracoes.item.24h', '⏩', 1440),
        _WeightedDef('i2880', 'torneio.aceleracoes.item.2dias', '⏩', 2880),
        _WeightedDef('i5760', 'torneio.aceleracoes.item.4dias', '⏩', 5760),
      ];
    default:
      return const <_WeightedDef>[];
  }
}

class TournamentCalculatorPage extends StatefulWidget {
  const TournamentCalculatorPage({super.key, required this.definition, required this.controller, required this.profileStore, required this.featureStore});
  final _TournamentDef definition;
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;

  @override
  State<TournamentCalculatorPage> createState() => _TournamentCalculatorPageState();
}

class _TournamentCalculatorPageState extends State<TournamentCalculatorPage> {
  final Map<String, TextEditingController> _inputs = <String, TextEditingController>{};
  final TextEditingController _ownedController = TextEditingController();
  final List<_TroopScoreRow> _troopRows = <_TroopScoreRow>[];
  final List<_GeneralScoreRow> _generalRows = <_GeneralScoreRow>[];

  @override
  void initState() {
    super.initState();
    final saved = widget.featureStore.readMap('tournament_flutter_${widget.definition.id}');
    _ownedController.text = saved['owned']?.toString() ?? '';
    for (final def in _weightedDefs(widget.definition.id)) {
      _inputs[def.key] = TextEditingController(text: (saved['values'] is Map<Object?, Object?> ? (saved['values'] as Map<Object?, Object?>)[def.key] : '')?.toString() ?? '');
    }
    if (widget.definition.id == 'treino_tropa' || widget.definition.id == 'matar_tropas') {
      final rows = saved['rows'];
      if (rows is List<Object?>) {
        for (final raw in rows.whereType<Map<Object?, Object?>>()) {
          _troopRows.add(_TroopScoreRow(
            slug: raw['slug']?.toString() ?? '',
            quantity: TextEditingController(text: raw['quantity']?.toString() ?? ''),
            bonus: int.tryParse(raw['bonus']?.toString() ?? '') ?? 1,
          ));
        }
      }
      if (_troopRows.isEmpty) _troopRows.add(_TroopScoreRow());
    }
    if (widget.definition.id == 'general') {
      final rows = saved['rows'];
      if (rows is List<Object?>) {
        for (final raw in rows.whereType<Map<Object?, Object?>>()) {
          _generalRows.add(_GeneralScoreRow(
            value: TextEditingController(text: raw['value']?.toString() ?? ''),
            quantity: TextEditingController(text: raw['quantity']?.toString() ?? '1'),
          ));
        }
      }
      if (_generalRows.isEmpty) _generalRows.add(_GeneralScoreRow());
    }
  }

  @override
  void dispose() {
    _ownedController.dispose();
    for (final item in _inputs.values) item.dispose();
    for (final row in _troopRows) row.dispose();
    for (final row in _generalRows) row.dispose();
    super.dispose();
  }

  int get _owned => int.tryParse(_ownedController.text.replaceAll(RegExp(r'\D'), '')) ?? 0;

  int _weightedTotal() {
    var total = 0;
    for (final def in _weightedDefs(widget.definition.id)) {
      final qty = int.tryParse(_inputs[def.key]?.text.replaceAll(RegExp(r'\D'), '') ?? '') ?? 0;
      total += (qty ~/ def.divisor) * def.multiplier;
    }
    return total;
  }

  Map<String, dynamic>? _troopBySlug(String slug) {
    for (final troop in widget.controller.section('tropas')) {
      if ((troop['slug'] ?? troop['nome']).toString() == slug) return troop;
    }
    return null;
  }

  int _troopTotal() {
    var total = 0;
    for (final row in _troopRows) {
      final troop = _troopBySlug(row.slug);
      final power = intValue(troop?['poder']);
      final qty = int.tryParse(row.quantity.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
      total += qty * power * (widget.definition.id == 'treino_tropa' ? row.bonus : 1);
    }
    return total;
  }

  int _generalTotal() => _generalRows.fold<int>(0, (sum, row) {
        final value = int.tryParse(row.value.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
        final qty = int.tryParse(row.quantity.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
        return sum + value * qty;
      });

  int get _total {
    if (widget.definition.id == 'treino_tropa' || widget.definition.id == 'matar_tropas') return _troopTotal() + _owned;
    if (widget.definition.id == 'general') return _generalTotal() + _owned;
    return _weightedTotal() + _owned;
  }

  Future<void> _save() async {
    final values = <String, dynamic>{for (final entry in _inputs.entries) entry.key: entry.value.text};
    final data = <String, dynamic>{'owned': _ownedController.text, 'values': values};
    if (_troopRows.isNotEmpty) {
      data['rows'] = _troopRows.map((row) => <String, dynamic>{'slug': row.slug, 'quantity': row.quantity.text, 'bonus': row.bonus}).toList();
    }
    if (_generalRows.isNotEmpty) {
      data['rows'] = _generalRows.map((row) => <String, dynamic>{'value': row.value.text, 'quantity': row.quantity.text}).toList();
    }
    await widget.featureStore.writeMap('tournament_flutter_${widget.definition.id}', data);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppStrings(widget.profileStore.locale).t('module.saved'))));
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    return ModuleScaffold(
      title: strings.t('torneio.titulo.${widget.definition.id}'),
      subtitle: strings.t('torneio.desc.${widget.definition.id}'),
      actions: <Widget>[IconButton(onPressed: _save, icon: const Icon(Icons.save_outlined))],
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: <Widget>[
          PremiumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(strings.t('torneio.aceleracoes.total_pontos'), style: const TextStyle(color: GuiaColors.premiumMuted, fontWeight: FontWeight.w800, fontSize: 11)),
                Text(formatCompactNumber(_total), style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 36)),
                const SizedBox(height: 10),
                TextField(
                  controller: _ownedController,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  style: const TextStyle(color: GuiaColors.premiumText),
                  decoration: InputDecoration(labelText: strings.t('torneio.label.possuidos'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          if (widget.definition.id == 'treino_tropa' || widget.definition.id == 'matar_tropas')
            _buildTroopRows(strings)
          else if (widget.definition.id == 'general')
            _buildGeneralRows(strings)
          else
            _buildWeighted(strings),
          const SizedBox(height: 12),
          FilledButton.icon(onPressed: _save, icon: const Icon(Icons.save_outlined), label: Text(strings.t('module.save'))),
        ],
      ),
    );
  }

  Widget _buildWeighted(AppStrings strings) => Column(
        children: _weightedDefs(widget.definition.id).map((def) {
          final qty = int.tryParse(_inputs[def.key]?.text.replaceAll(RegExp(r'\D'), '') ?? '') ?? 0;
          final subtotal = (qty ~/ def.divisor) * def.multiplier;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: PremiumPanel(
              child: Row(
                children: <Widget>[
                  Text(def.emoji, style: const TextStyle(fontSize: 24)),
                  const SizedBox(width: 9),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                      Text(strings.t(def.labelKey), style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w800)),
                      Text(def.divisor > 1 ? '${def.divisor} = ${def.multiplier} pt' : '${def.multiplier} pts / item', style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 10.5)),
                    ]),
                  ),
                  SizedBox(
                    width: 88,
                    child: TextField(
                      controller: _inputs[def.key],
                      keyboardType: TextInputType.number,
                      onChanged: (_) => setState(() {}),
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900),
                      decoration: const InputDecoration(isDense: true, hintText: '0'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(width: 70, child: Text(formatCompactNumber(subtotal), textAlign: TextAlign.end, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900))),
                ],
              ),
            ),
          );
        }).toList(growable: false),
      );

  Widget _buildTroopRows(AppStrings strings) {
    final troops = [...widget.controller.section('tropas')]
      ..sort((a, b) => recordTitle(a, widget.profileStore.locale).compareTo(recordTitle(b, widget.profileStore.locale)));
    return Column(
      children: <Widget>[
        ...List<Widget>.generate(_troopRows.length, (index) {
          final row = _troopRows[index];
          final troop = _troopBySlug(row.slug);
          final power = intValue(troop?['poder']);
          final qty = int.tryParse(row.quantity.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
          final subtotal = qty * power * (widget.definition.id == 'treino_tropa' ? row.bonus : 1);
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: PremiumPanel(
              child: Column(
                children: <Widget>[
                  DropdownButtonFormField<String>(
                    initialValue: row.slug.isEmpty ? null : row.slug,
                    dropdownColor: GuiaColors.premiumPanel,
                    style: const TextStyle(color: GuiaColors.premiumText),
                    decoration: InputDecoration(labelText: strings.t('torneio.matar_tropas.select_troop'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)),
                    items: troops.map((item) {
                      final slug = (item['slug'] ?? item['nome']).toString();
                      return DropdownMenuItem<String>(value: slug, child: Text('${recordTitle(item, widget.profileStore.locale)} · ⭐ ${intValue(item['poder'])}'));
                    }).toList(growable: false),
                    onChanged: (value) => setState(() => row.slug = value ?? ''),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: TextField(
                          controller: row.quantity,
                          keyboardType: TextInputType.number,
                          onChanged: (_) => setState(() {}),
                          style: const TextStyle(color: GuiaColors.premiumText),
                          decoration: InputDecoration(labelText: strings.t('module.quantity'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)),
                        ),
                      ),
                      if (widget.definition.id == 'treino_tropa') ...<Widget>[
                        const SizedBox(width: 8),
                        SizedBox(
                          width: 92,
                          child: DropdownButtonFormField<int>(
                            initialValue: row.bonus,
                            dropdownColor: GuiaColors.premiumPanel,
                            style: const TextStyle(color: GuiaColors.premiumText),
                            items: List<DropdownMenuItem<int>>.generate(5, (i) => DropdownMenuItem<int>(value: i + 1, child: Text('×${i + 1}'))),
                            onChanged: (value) => setState(() => row.bonus = value ?? 1),
                          ),
                        ),
                      ],
                      IconButton(
                        onPressed: _troopRows.length <= 1 ? null : () => setState(() { final removed = _troopRows.removeAt(index); removed.dispose(); }),
                        icon: const Icon(Icons.delete_outline, color: GuiaColors.premiumGoldLight),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Align(alignment: Alignment.centerRight, child: Text('${formatCompactNumber(subtotal)} pts', style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900))),
                ],
              ),
            ),
          );
        }),
        OutlinedButton.icon(
          onPressed: () => setState(() => _troopRows.add(_TroopScoreRow())),
          icon: const Icon(Icons.add),
          label: Text(strings.t('module.add')),
        ),
      ],
    );
  }

  Widget _buildGeneralRows(AppStrings strings) => Column(
        children: <Widget>[
          ...List<Widget>.generate(_generalRows.length, (index) {
            final row = _generalRows[index];
            final value = int.tryParse(row.value.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
            final qty = int.tryParse(row.quantity.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: PremiumPanel(
                child: Row(
                  children: <Widget>[
                    Expanded(child: TextField(controller: row.value, keyboardType: TextInputType.number, onChanged: (_) => setState(() {}), style: const TextStyle(color: GuiaColors.premiumText), decoration: InputDecoration(labelText: strings.t('torneio.general.card_value'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)))),
                    const SizedBox(width: 8),
                    SizedBox(width: 92, child: TextField(controller: row.quantity, keyboardType: TextInputType.number, onChanged: (_) => setState(() {}), style: const TextStyle(color: GuiaColors.premiumText), decoration: InputDecoration(labelText: strings.t('module.quantity'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)))),
                    const SizedBox(width: 8),
                    SizedBox(width: 70, child: Text(formatCompactNumber(value * qty), textAlign: TextAlign.end, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900))),
                    IconButton(onPressed: _generalRows.length <= 1 ? null : () => setState(() { final removed = _generalRows.removeAt(index); removed.dispose(); }), icon: const Icon(Icons.delete_outline, color: GuiaColors.premiumGoldLight)),
                  ],
                ),
              ),
            );
          }),
          OutlinedButton.icon(onPressed: () => setState(() => _generalRows.add(_GeneralScoreRow())), icon: const Icon(Icons.add), label: Text(strings.t('module.add'))),
        ],
      );
}

class _TroopScoreRow {
  _TroopScoreRow({this.slug = '', TextEditingController? quantity, this.bonus = 1}) : quantity = quantity ?? TextEditingController();
  String slug = '';
  final TextEditingController quantity;
  int bonus;
  void dispose() => quantity.dispose();
}

class _GeneralScoreRow {
  _GeneralScoreRow({TextEditingController? value, TextEditingController? quantity})
      : value = value ?? TextEditingController(),
        quantity = quantity ?? TextEditingController(text: '1');
  final TextEditingController value;
  final TextEditingController quantity;
  void dispose() { value.dispose(); quantity.dispose(); }
}

class TournamentGuidePage extends StatelessWidget {
  const TournamentGuidePage({super.key, required this.definition, required this.profileStore});
  final _TournamentDef definition;
  final ProfileStore profileStore;

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(profileStore.locale);
    final prefix = definition.id == 'alianca' ? 'torneio.alianca' : 'torneio.poder';
    final guideKeys = definition.id == 'alianca'
        ? const <String>['intro_pre', 'intro_bold', 'intro_pos']
        : const <String>['intro_pre', 'intro_bold', 'intro_pos'];
    final text = guideKeys.map((key) => strings.t('$prefix.$key')).where((value) => !value.startsWith(prefix)).join(' ');
    return ModuleScaffold(
      title: strings.t('torneio.titulo.${definition.id}'),
      subtitle: strings.t('torneio.desc.${definition.id}'),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: <Widget>[
          ModuleIntro(icon: definition.icon, title: strings.t('torneio.titulo.${definition.id}'), text: text.isEmpty ? strings.t('torneio.desc.${definition.id}') : text),
          const SizedBox(height: 12),
          PremiumPanel(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
              Text(strings.t('torneio.label.como_funciona'), style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              Text(
                definition.id == 'poder'
                    ? strings.t('torneio.poder.intro_pre') + strings.t('torneio.poder.intro_bold') + strings.t('torneio.poder.intro_pos')
                    : strings.t('torneio.alianca.intro_pre') + strings.t('torneio.alianca.intro_bold') + strings.t('torneio.alianca.intro_pos'),
                style: const TextStyle(color: GuiaColors.premiumText, height: 1.45),
              ),
            ]),
          ),
        ],
      ),
    );
  }
}

class MarchCalculatorPage extends StatefulWidget {
  const MarchCalculatorPage({super.key, required this.controller, required this.profileStore});
  final GameDataController controller;
  final ProfileStore profileStore;

  @override
  State<MarchCalculatorPage> createState() => _MarchCalculatorPageState();
}

class _MarchRow {
  _MarchRow({TextEditingController? quantity}) : quantity = quantity ?? TextEditingController();
  String slug = '';
  final TextEditingController quantity;
  void dispose() => quantity.dispose();
}

class _MarchCalculatorPageState extends State<MarchCalculatorPage> {
  final List<_MarchRow> _rows = <_MarchRow>[_MarchRow()];

  @override
  void dispose() {
    for (final row in _rows) row.dispose();
    super.dispose();
  }

  Map<String, dynamic>? _troop(String slug) {
    for (final item in widget.controller.section('tropas')) {
      if ((item['slug'] ?? item['nome']).toString() == slug) return item;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final troops = [...widget.controller.section('tropas')]
      ..sort((a, b) => recordTitle(a, widget.profileStore.locale).compareTo(recordTitle(b, widget.profileStore.locale)));
    var count = 0;
    var power = 0;
    var load = 0;
    var minSpeed = double.infinity;
    for (final row in _rows) {
      final troop = _troop(row.slug);
      final qty = int.tryParse(row.quantity.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
      if (troop == null || qty <= 0) continue;
      count += qty;
      power += intValue(troop['poder']) * qty;
      load += intValue(troop['car']) * qty;
      final speed = numberValue(troop['vel']);
      if (speed > 0) minSpeed = math.min(minSpeed, speed);
    }
    return ModuleScaffold(
      title: strings.t('troops.simulator'),
      subtitle: strings.t('march.title'),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: <Widget>[
          ModuleIntro(icon: '🧮', title: strings.t('march.title'), text: strings.t('troops.simulator.march_help')),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Expanded(child: _MetricBox(label: strings.t('march.troops'), value: formatCompactNumber(count), icon: '⚔️')),
              const SizedBox(width: 7),
              Expanded(child: _MetricBox(label: strings.t('common.power'), value: formatCompactNumber(power), icon: '⭐')),
              const SizedBox(width: 7),
              Expanded(child: _MetricBox(label: strings.t('march.load'), value: formatCompactNumber(load), icon: '📦')),
              const SizedBox(width: 7),
              Expanded(child: _MetricBox(label: strings.t('march.speed'), value: minSpeed.isFinite ? formatCompactNumber(minSpeed) : '—', icon: '💨')),
            ],
          ),
          const SizedBox(height: 12),
          ...List<Widget>.generate(_rows.length, (index) {
            final row = _rows[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: PremiumPanel(
                child: Row(
                  children: <Widget>[
                    Expanded(
                      flex: 2,
                      child: DropdownButtonFormField<String>(
                        initialValue: row.slug.isEmpty ? null : row.slug,
                        dropdownColor: GuiaColors.premiumPanel,
                        style: const TextStyle(color: GuiaColors.premiumText),
                        items: troops.map((item) {
                          final slug = (item['slug'] ?? item['nome']).toString();
                          return DropdownMenuItem<String>(value: slug, child: Text(recordTitle(item, widget.profileStore.locale), overflow: TextOverflow.ellipsis));
                        }).toList(growable: false),
                        onChanged: (value) => setState(() => row.slug = value ?? ''),
                        decoration: InputDecoration(labelText: strings.t('tool.tropas'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: row.quantity,
                        keyboardType: TextInputType.number,
                        onChanged: (_) => setState(() {}),
                        style: const TextStyle(color: GuiaColors.premiumText),
                        decoration: InputDecoration(labelText: strings.t('module.quantity'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)),
                      ),
                    ),
                    IconButton(
                      onPressed: _rows.length == 1 ? null : () => setState(() { final removed = _rows.removeAt(index); removed.dispose(); }),
                      icon: const Icon(Icons.delete_outline, color: GuiaColors.premiumGoldLight),
                    ),
                  ],
                ),
              ),
            );
          }),
          OutlinedButton.icon(onPressed: () => setState(() => _rows.add(_MarchRow())), icon: const Icon(Icons.add), label: Text(strings.t('march.add'))),
        ],
      ),
    );
  }
}

class _MetricBox extends StatelessWidget {
  const _MetricBox({required this.label, required this.value, required this.icon});
  final String label;
  final String value;
  final String icon;

  @override
  Widget build(BuildContext context) => PremiumPanel(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
        child: Column(
          children: <Widget>[
              Text(icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(height: 3),
              Text(value, maxLines: 1, overflow: TextOverflow.fade, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 15)),
              Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 8.5, fontWeight: FontWeight.w700)),
          ],
        ),
      );
}

class TroopUpgradePage extends StatefulWidget {
  const TroopUpgradePage({super.key, required this.profileStore});
  final ProfileStore profileStore;

  @override
  State<TroopUpgradePage> createState() => _TroopUpgradePageState();
}

class _TroopUpgradePageState extends State<TroopUpgradePage> {
  static const List<String> _rarities = <String>['Incomum', 'Raro', 'Épico', 'Lendário', 'Mitológico'];
  static const List<int> _base = <int>[5, 8, 12, 18, 30];
  static const Map<String, int> _mf = <String, int>{'Incomum':1,'Raro':2,'Épico':4,'Lendário':8,'Mitológico':15};
  static const Map<String, int> _mp = <String, int>{'Incomum':0,'Raro':1,'Épico':2,'Lendário':4,'Mitológico':8};
  static const Map<String, int> _mr = <String, int>{'Incomum':0,'Raro':0,'Épico':1,'Lendário':2,'Mitológico':4};

  String _rarity = 'Épico';
  final TextEditingController _from = TextEditingController(text: '1');
  final TextEditingController _to = TextEditingController(text: '5');

  @override
  void dispose() { _from.dispose(); _to.dispose(); super.dispose(); }

  Map<String, int> _calculate() {
    final start = math.max(1, int.tryParse(_from.text) ?? 1);
    final end = math.max(start, int.tryParse(_to.text) ?? start);
    var fossils = 0, potions = 0, relics = 0;
    for (var n = start; n <= end; n++) {
      final b = _base[(n - 1) % 5];
      fossils += b * (_mf[_rarity] ?? 1);
      potions += b * (_mp[_rarity] ?? 0);
      relics += b * (_mr[_rarity] ?? 0);
    }
    return <String, int>{'fossils': fossils, 'potions': potions, 'relics': relics, 'start': start, 'end': end};
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final result = _calculate();
    return ModuleScaffold(
      title: strings.t('upgrade.title'),
      subtitle: strings.t('upgrade.subtitle'),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: <Widget>[
          ModuleIntro(icon: '🛡️', title: strings.t('upgrade.title'), text: strings.t('upgrade.subtitle')),
          const SizedBox(height: 12),
          PremiumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _rarities.map((r) => ChoiceChip(
                    label: Text(strings.t('upgrade.rarity.${<String,String>{'Incomum':'uncommon','Raro':'rare','Épico':'epic','Lendário':'legendary','Mitológico':'mythic'}[r]}')),
                    selected: _rarity == r,
                    onSelected: (_) => setState(() => _rarity = r),
                    selectedColor: GuiaColors.premiumGoldLight,
                    backgroundColor: GuiaColors.premiumPanel,
                    labelStyle: TextStyle(color: _rarity == r ? GuiaColors.premiumBackground : GuiaColors.premiumText, fontWeight: FontWeight.w800),
                  )).toList(growable: false),
                ),
                const SizedBox(height: 10),
                Row(children: <Widget>[
                  Expanded(child: TextField(controller: _from, keyboardType: TextInputType.number, onChanged: (_) => setState(() {}), style: const TextStyle(color: GuiaColors.premiumText), decoration: InputDecoration(labelText: strings.t('upgrade.calc.current'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)))),
                  const SizedBox(width: 8),
                  Expanded(child: TextField(controller: _to, keyboardType: TextInputType.number, onChanged: (_) => setState(() {}), style: const TextStyle(color: GuiaColors.premiumText), decoration: InputDecoration(labelText: strings.t('upgrade.calc.target'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)))),
                ]),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(children: <Widget>[
            Expanded(child: _MetricBox(label: strings.t('upgrade.fossils'), value: formatCompactNumber(result['fossils']!), icon: '🦴')),
            const SizedBox(width: 7),
            Expanded(child: _MetricBox(label: strings.t('upgrade.potions'), value: formatCompactNumber(result['potions']!), icon: '🧪')),
            const SizedBox(width: 7),
            Expanded(child: _MetricBox(label: strings.t('upgrade.relics'), value: formatCompactNumber(result['relics']!), icon: '💎')),
          ]),
          const SizedBox(height: 12),
          PremiumPanel(child: Text(strings.t('upgrade.warning_text'), style: const TextStyle(color: GuiaColors.premiumMuted, height: 1.4))),
        ],
      ),
    );
  }
}

class DragonsPage extends StatefulWidget {
  const DragonsPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;

  @override
  State<DragonsPage> createState() => _DragonsPageState();
}

class _DragonsPageState extends State<DragonsPage> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final query = _query.toLowerCase().trim();
    final dragons = widget.controller.section('dragoes').where((dragon) {
      final hay = '${recordTitle(dragon, widget.profileStore.locale)} ${localizedValue(dragon, 'elemento', widget.profileStore.locale)}'.toLowerCase();
      return query.isEmpty || hay.contains(query);
    }).toList(growable: false);
    return ModuleScaffold(
      title: strings.t('dragons.title'),
      subtitle: strings.t('dragons.flutter.help'),
      child: AnimatedBuilder(
        animation: Listenable.merge(<Listenable>[widget.controller, widget.featureStore]),
        builder: (context, _) => RefreshIndicator(
          onRefresh: widget.controller.refresh,
          color: GuiaColors.premiumGold,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
            children: <Widget>[
              ModuleIntro(icon: '🐉', title: strings.t('dragons.title'), text: strings.t('dragons.flutter.help')),
              const SizedBox(height: 12),
              PremiumSearchField(hint: strings.t('module.search'), onChanged: (value) => setState(() => _query = value)),
              const SizedBox(height: 12),
              ...dragons.map((dragon) {
                final slug = (dragon['slug'] ?? dragon['id'] ?? recordTitle(dragon, widget.profileStore.locale)).toString();
                final favoriteId = 'dragoes:$slug';
                final favorite = widget.featureStore.isFavorite(favoriteId);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: PremiumPanel(
                    onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => DragonDetailPage(dragon: dragon, profileStore: widget.profileStore, featureStore: widget.featureStore))),
                    child: Row(
                      children: <Widget>[
                        _recordImage(dragon, size: 66),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                            Text(recordTitle(dragon, widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900, fontSize: 15)),
                            const SizedBox(height: 3),
                            Text(
                              [localizedValue(dragon, 'elemento', widget.profileStore.locale), localizedValue(dragon, 'raridade', widget.profileStore.locale)].where((value) => value.trim().isNotEmpty).join(' · '),
                              style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11.5),
                            ),
                          ]),
                        ),
                        IconButton(onPressed: () => widget.featureStore.toggleFavorite(favoriteId), icon: Icon(favorite ? Icons.star : Icons.star_border, color: GuiaColors.premiumGoldLight)),
                        const Icon(Icons.chevron_right, color: GuiaColors.premiumGoldLight),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}

class DragonDetailPage extends StatelessWidget {
  const DragonDetailPage({super.key, required this.dragon, required this.profileStore, required this.featureStore});
  final Map<String, dynamic> dragon;
  final ProfileStore profileStore;
  final FeatureStore featureStore;

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(profileStore.locale);
    final name = recordTitle(dragon, profileStore.locale);
    final levels = dragon['niveis'] is List<Object?> ? (dragon['niveis'] as List<Object?>).whereType<Map<Object?, Object?>>().toList(growable: false) : const <Map<Object?, Object?>>[];
    final skills = dragon['habilidades'] is List<Object?> ? (dragon['habilidades'] as List<Object?>).whereType<Map<Object?, Object?>>().toList(growable: false) : const <Map<Object?, Object?>>[];
    final obtain = dragon['obtencao'] is Map<Object?, Object?> ? Map<String, dynamic>.from(dragon['obtencao'] as Map<Object?, Object?>) : <String, dynamic>{};
    return ModuleScaffold(
      title: name,
      subtitle: localizedValue(dragon, 'elemento', profileStore.locale),
      actions: <Widget>[
        IconButton(
          tooltip: strings.t('tracker.title'),
          onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => DragonTrackerPage(dragon: dragon, profileStore: profileStore, featureStore: featureStore))),
          icon: const Icon(Icons.insights_outlined),
        ),
      ],
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: <Widget>[
          PremiumPanel(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                _recordImage(dragon, size: 96, fit: BoxFit.contain),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                    Text(name, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 20)),
                    const SizedBox(height: 4),
                    Text(localizedValue(dragon, 'descricao', profileStore.locale), style: const TextStyle(color: GuiaColors.premiumMuted, height: 1.4)),
                    if (localizedValue(dragon, 'bonusMarcha', profileStore.locale).trim().isNotEmpty) ...<Widget>[
                      const SizedBox(height: 7),
                      Text(localizedValue(dragon, 'bonusMarcha', profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w700)),
                    ],
                  ]),
                ),
              ],
            ),
          ),
          if (obtain.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _sectionTitle(strings.t('dragons.obtain'), icon: Icons.travel_explore),
            PremiumPanel(child: Text(_localizedNested(obtain, 'resumo', profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText, height: 1.45))),
          ],
          if (skills.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _sectionTitle(strings.t('dragons.abilities'), icon: Icons.auto_awesome),
            ...skills.map((skill) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: PremiumPanel(
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                      Text((skill['emoji'] ?? '✨').toString(), style: const TextStyle(fontSize: 24)),
                      const SizedBox(width: 8),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                        Text(_localizedNested(Map<String, dynamic>.from(skill), 'nome', profileStore.locale), style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900)),
                        if ((skill['descricao'] ?? '').toString().isNotEmpty) Text(_localizedNested(Map<String, dynamic>.from(skill), 'descricao', profileStore.locale), style: const TextStyle(color: GuiaColors.premiumMuted, height: 1.35)),
                      ])),
                    ]),
                  ),
                )),
          ],
          if (levels.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _sectionTitle(strings.t('levels.title'), icon: Icons.stairs),
            PremiumPanel(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  headingTextStyle: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900),
                  dataTextStyle: const TextStyle(color: GuiaColors.premiumText),
                  columns: const <DataColumn>[DataColumn(label: Text('Nv.')), DataColumn(label: Text('Vida')), DataColumn(label: Text('Defesa')), DataColumn(label: Text('Ataque')), DataColumn(label: Text('Vel.'))],
                  rows: levels.take(20).map((row) => DataRow(cells: <DataCell>[
                    DataCell(Text('${row['nivel'] ?? '—'}')),
                    DataCell(Text('${row['vida'] ?? '—'}')),
                    DataCell(Text('${row['defesa'] ?? '—'}')),
                    DataCell(Text('${row['ataquePerto'] ?? row['ataqueElemental'] ?? '—'}')),
                    DataCell(Text('${row['velocidade'] ?? '—'}')),
                  ])).toList(growable: false),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

String _localizedNested(Map<String, dynamic> record, String field, String locale) {
  if (!locale.toLowerCase().startsWith('en')) return record[field]?.toString() ?? '';
  final i18n = record['i18n'];
  if (i18n is Map<Object?, Object?>) {
    final branch = i18n['en-US'];
    if (branch is Map<Object?, Object?> && branch[field] != null) return branch[field].toString();
  }
  return record[field]?.toString() ?? '';
}

class DragonTrackerPage extends StatefulWidget {
  const DragonTrackerPage({super.key, required this.dragon, required this.profileStore, required this.featureStore});
  final Map<String, dynamic> dragon;
  final ProfileStore profileStore;
  final FeatureStore featureStore;

  @override
  State<DragonTrackerPage> createState() => _DragonTrackerPageState();
}

class _DragonTrackerPageState extends State<DragonTrackerPage> {
  late final String _key;
  int _dragonLevel = 0;
  final TextEditingController _dragonXp = TextEditingController();
  final Map<String, int> _skillLevels = <String, int>{};
  final Map<String, TextEditingController> _skillXp = <String, TextEditingController>{};

  @override
  void initState() {
    super.initState();
    final slug = (widget.dragon['slug'] ?? widget.dragon['id'] ?? 'dragon').toString();
    _key = 'tracker_dragao_$slug';
    final saved = widget.featureStore.readMap(_key);
    _dragonLevel = int.tryParse(saved['nivelDragao']?.toString() ?? '') ?? 0;
    _dragonXp.text = saved['xpDragaoAtual']?.toString() ?? '';
    final abilities = widget.dragon['habilidades'];
    if (abilities is List<Object?>) {
      final savedSkills = saved['habilidades'] is Map<Object?, Object?> ? saved['habilidades'] as Map<Object?, Object?> : const <dynamic, dynamic>{};
      for (final raw in abilities.whereType<Map<Object?, Object?>>()) {
        final id = (raw['id'] ?? raw['nome'] ?? 'skill').toString();
        final branch = savedSkills[id] is Map<Object?, Object?> ? savedSkills[id] as Map<Object?, Object?> : const <dynamic, dynamic>{};
        _skillLevels[id] = int.tryParse(branch['nivel']?.toString() ?? '') ?? 1;
        _skillXp[id] = TextEditingController(text: branch['xpAtual']?.toString() ?? '');
      }
    }
  }

  @override
  void dispose() {
    _dragonXp.dispose();
    for (final controller in _skillXp.values) controller.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final abilities = <String, dynamic>{};
    for (final id in _skillLevels.keys) {
      abilities[id] = <String, dynamic>{'nivel': _skillLevels[id], 'xpAtual': int.tryParse(_skillXp[id]?.text ?? '') ?? 0};
    }
    await widget.featureStore.writeMap(_key, <String, dynamic>{
      'nivelDragao': _dragonLevel,
      'xpDragaoAtual': int.tryParse(_dragonXp.text) ?? 0,
      'habilidades': abilities,
    });
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppStrings(widget.profileStore.locale).t('dragon_tracker.saved'))));
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final abilities = widget.dragon['habilidades'] is List<Object?> ? (widget.dragon['habilidades'] as List<Object?>).whereType<Map<Object?, Object?>>().toList(growable: false) : const <Map<Object?, Object?>>[];
    return ModuleScaffold(
      title: strings.t('dragon_tracker.progress', <String, Object?>{'name': recordTitle(widget.dragon, widget.profileStore.locale)}),
      subtitle: strings.t('module.local'),
      actions: <Widget>[IconButton(onPressed: _save, icon: const Icon(Icons.save_outlined))],
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: <Widget>[
          PremiumPanel(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
              Row(children: <Widget>[
                _recordImage(widget.dragon, size: 70),
                const SizedBox(width: 10),
                Expanded(child: Text(recordTitle(widget.dragon, widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 17))),
              ]),
              const SizedBox(height: 12),
              Row(children: <Widget>[
                Text(strings.t('dragon_tracker.level'), style: const TextStyle(color: GuiaColors.premiumMuted, fontWeight: FontWeight.w700)),
                const Spacer(),
                IconButton(onPressed: () => setState(() => _dragonLevel = math.max(0, _dragonLevel - 1)), icon: const Icon(Icons.remove_circle_outline, color: GuiaColors.premiumGoldLight)),
                Text('$_dragonLevel', style: const TextStyle(color: GuiaColors.premiumText, fontSize: 20, fontWeight: FontWeight.w900)),
                IconButton(onPressed: () => setState(() => _dragonLevel = math.min(90, _dragonLevel + 1)), icon: const Icon(Icons.add_circle_outline, color: GuiaColors.premiumGoldLight)),
              ]),
              TextField(controller: _dragonXp, keyboardType: TextInputType.number, style: const TextStyle(color: GuiaColors.premiumText), decoration: InputDecoration(labelText: strings.t('dragon_tracker.current_xp'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted))),
            ]),
          ),
          if (abilities.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _sectionTitle(strings.t('dragons.abilities'), icon: Icons.auto_awesome),
            ...abilities.map((raw) {
              final skill = Map<String, dynamic>.from(raw);
              final id = (skill['id'] ?? skill['nome'] ?? 'skill').toString();
              final level = _skillLevels[id] ?? 1;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: PremiumPanel(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                    Row(children: <Widget>[
                      Expanded(child: Text(_localizedNested(skill, 'nome', widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900))),
                      IconButton(onPressed: () => setState(() => _skillLevels[id] = math.max(1, level - 1)), icon: const Icon(Icons.remove, color: GuiaColors.premiumGoldLight)),
                      Text('$level', style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900)),
                      IconButton(onPressed: () => setState(() => _skillLevels[id] = math.min(90, level + 1)), icon: const Icon(Icons.add, color: GuiaColors.premiumGoldLight)),
                    ]),
                    TextField(controller: _skillXp[id], keyboardType: TextInputType.number, style: const TextStyle(color: GuiaColors.premiumText), decoration: InputDecoration(labelText: strings.t('dragon_tracker.current_xp'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted))),
                  ]),
                ),
              );
            }),
          ],
          const SizedBox(height: 8),
          FilledButton.icon(onPressed: _save, icon: const Icon(Icons.save), label: Text(strings.t('dragon_tracker.save'))),
        ],
      ),
    );
  }
}

String _ui(ProfileStore store, String pt, String en) => store.locale.toLowerCase().startsWith('en') ? en : pt;

class BuildingsPage extends StatelessWidget {
  const BuildingsPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;

  @override
  Widget build(BuildContext context) => CatalogModulePage(
        title: _ui(profileStore, 'Edifícios', 'Buildings'),
        sectionKey: 'edificios',
        controller: controller,
        profileStore: profileStore,
        featureStore: featureStore,
        icon: '🏰',
        intro: _ui(profileStore, 'Consulte construções normais, especiais, Gruta, Basílica e Pedras Espirituais.', 'Browse normal and special buildings, Cave, Basilica and Spirit Stones.'),
      );
}

class ItemsPage extends StatefulWidget {
  const ItemsPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override State<ItemsPage> createState() => _ItemsPageState();
}

class _ItemsPageState extends State<ItemsPage> {
  String _query = '';
  String _category = 'all';
  @override
  Widget build(BuildContext context) {
    final all = widget.controller.section('itens');
    final categories = <String>{};
    for (final item in all) {
      final value = (item['categoria'] ?? item['category'] ?? item['tipo'] ?? '').toString().trim();
      if (value.isNotEmpty) categories.add(value);
    }
    final q = _query.trim().toLowerCase();
    final items = all.where((item) {
      final cat = (item['categoria'] ?? item['category'] ?? item['tipo'] ?? '').toString();
      final hay = '${recordTitle(item, widget.profileStore.locale)} ${recordSubtitle(item, widget.profileStore.locale)} $cat'.toLowerCase();
      return (_category == 'all' || cat == _category) && (q.isEmpty || hay.contains(q));
    }).toList(growable: false);
    return ModuleScaffold(
      title: _ui(widget.profileStore, 'Itens', 'Items'),
      subtitle: '${items.length} / ${all.length}',
      child: ListView(padding: const EdgeInsets.fromLTRB(12,12,12,30), children: <Widget>[
        ModuleIntro(icon: '🎒', title: _ui(widget.profileStore, 'Catálogo de Itens', 'Item Catalog'), text: _ui(widget.profileStore, 'Recursos, acelerações, arcas, defesa, campos e materiais especiais.', 'Resources, speedups, chests, defense, field and special materials.')),
        const SizedBox(height: 12),
        PremiumSearchField(hint: _ui(widget.profileStore, 'Buscar item...', 'Search item...'), onChanged: (v) => setState(() => _query = v)),
        if (categories.isNotEmpty) ...<Widget>[
          const SizedBox(height: 10),
          SizedBox(height: 38, child: ListView(scrollDirection: Axis.horizontal, children: <Widget>[
            Padding(padding: const EdgeInsets.only(right: 6), child: ChoiceChip(label: Text(_ui(widget.profileStore,'Todos','All')), selected: _category == 'all', onSelected: (_) => setState(() => _category = 'all'))),
            ...categories.map((cat) => Padding(padding: const EdgeInsets.only(right: 6), child: ChoiceChip(label: Text(cat), selected: _category == cat, onSelected: (_) => setState(() => _category = cat)))),
          ])),
        ],
        const SizedBox(height: 12),
        ...items.map((item) {
          final id = 'itens:${item['slug'] ?? item['id'] ?? recordTitle(item, widget.profileStore.locale)}';
          final fav = widget.featureStore.isFavorite(id);
          return Padding(padding: const EdgeInsets.only(bottom: 8), child: PremiumPanel(
            onTap: () => _showRecordSheet(context, item, widget.profileStore.locale),
            child: Row(children: <Widget>[
              _recordImage(item, size: 56), const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                Text(recordTitle(item, widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900)),
                Text((item['categoria'] ?? item['tipo'] ?? recordSubtitle(item, widget.profileStore.locale)).toString(), style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11)),
              ])),
              IconButton(onPressed: () => widget.featureStore.toggleFavorite(id), icon: Icon(fav ? Icons.star : Icons.star_border, color: GuiaColors.premiumGoldLight)),
              const Icon(Icons.chevron_right, color: GuiaColors.premiumGoldLight),
            ]),
          ));
        }),
      ]),
    );
  }
}

class ResearchPage extends StatelessWidget {
  const ResearchPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override Widget build(BuildContext context) => CatalogModulePage(
    title: _ui(profileStore, 'Pesquisas', 'Research'), sectionKey: 'pesquisas', controller: controller, profileStore: profileStore, featureStore: featureStore,
    icon: '🔬', intro: _ui(profileStore, 'Tecnologias, níveis, requisitos e bônus de cada pesquisa.', 'Technologies, levels, requirements and bonuses for each research.'),
  );
}

class GuidesPage extends StatelessWidget {
  const GuidesPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override Widget build(BuildContext context) => CatalogModulePage(
    title: _ui(profileStore, 'Dicas e Guias', 'Tips & Guides'), sectionKey: 'dicas', controller: controller, profileStore: profileStore, featureStore: featureStore,
    icon: '💡', intro: _ui(profileStore, 'Estratégias e explicações do Guia Doa.', 'Strategies and explanations from Guia Doa.'),
  );
}

class CampaignPage extends StatelessWidget {
  const CampaignPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override Widget build(BuildContext context) => CatalogModulePage(
    title: _ui(profileStore, 'Campanha', 'Campaign'), sectionKey: 'campanha', controller: controller, profileStore: profileStore, featureStore: featureStore,
    icon: '🗺️', intro: _ui(profileStore, 'Mapa da campanha, locais, inimigos, Grodz e conteúdo Zyrvorthian.', 'Campaign map, locations, enemies, Grodz and Zyrvorthian content.'),
  );
}

class EventsPage extends StatelessWidget {
  const EventsPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override Widget build(BuildContext context) => CatalogModulePage(
    title: _ui(profileStore, 'Eventos', 'Events'), sectionKey: 'eventos', controller: controller, profileStore: profileStore, featureStore: featureStore,
    icon: '⚡', intro: _ui(profileStore, 'Eventos, ocorrências, regras e recompensas por reino.', 'Events, schedules, rules and rewards by realm.'),
  );
}

class RealmsPage extends StatefulWidget {
  const RealmsPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override State<RealmsPage> createState() => _RealmsPageState();
}
class _RealmsPageState extends State<RealmsPage> {
  String _query = '';
  String? _zone;
  Timer? _timer;
  @override void initState() { super.initState(); _timer = Timer.periodic(const Duration(minutes: 1), (_) { if (mounted) setState(() {}); }); }
  @override void dispose() { _timer?.cancel(); super.dispose(); }
  @override Widget build(BuildContext context) => AnimatedBuilder(animation: Listenable.merge([widget.controller, widget.profileStore]), builder: (context, _) {
    final strings = AppStrings(widget.profileStore.locale);
    final realms = RealmTime.choices(widget.controller.section('reinos'));
    final zones = realms.map(RealmTime.zone).where((v) => v.isNotEmpty).toSet().toList()
      ..sort((a,b) => RealmTime.offset(a)!.compareTo(RealmTime.offset(b)!));
    if (_zone != null && !zones.contains(_zone)) _zone = null;
    final filtered = realms.where((r) => (_zone == null || RealmTime.zone(r) == _zone)
      && '${RealmTime.name(r)} ${r['id']} ${RealmTime.zone(r)}'.toLowerCase().contains(_query.toLowerCase())).toList();
    return ModuleScaffold(title: strings.t('realms.title'), actions: [IconButton(onPressed: widget.controller.loading ? null : widget.controller.refresh,
      tooltip: strings.t('home.sync'), icon: const Icon(Icons.refresh))], child: RefreshIndicator(onRefresh: widget.controller.refresh, child: ListView(
        physics: const AlwaysScrollableScrollPhysics(), padding: const EdgeInsets.fromLTRB(12, 12, 12, 30), children: [
          Text(strings.t('realms.intro'), style: const TextStyle(color: GuiaColors.premiumMuted)), const SizedBox(height: 12),
          TextField(onChanged: (v) => setState(() => _query = v), decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: strings.t('realms.search'))),
          const SizedBox(height: 8),
          Wrap(spacing: 6, runSpacing: 6, children: [
            ChoiceChip(label: Text(strings.t('realms.filter_all')), selected: _zone == null, onSelected: (_) => setState(() => _zone = null)),
            ...zones.map((zone) => ChoiceChip(label: Text(zone), selected: _zone == zone, onSelected: (_) => setState(() => _zone = zone))),
          ]),
          if (widget.controller.sectionLoading('reinos')) const Padding(padding: EdgeInsets.all(12), child: LinearProgressIndicator()),
          if (widget.controller.sectionError('reinos') != null) Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(
            _ui(widget.profileStore, realms.isEmpty ? 'Não foi possível carregar os reinos. Toque em atualizar para tentar novamente.' : 'Exibindo reinos salvos. A atualização falhou; tente novamente.',
              realms.isEmpty ? 'Could not load realms. Tap refresh to try again.' : 'Showing saved realms. Refresh failed; try again.'), style: const TextStyle(color: GuiaColors.premiumGoldLight))),
          if (filtered.isEmpty && !widget.controller.sectionLoading('reinos') && widget.controller.sectionError('reinos') == null)
            Padding(padding: const EdgeInsets.all(18), child: Text(strings.t('realms.no_results'), style: const TextStyle(color: GuiaColors.premiumMuted))),
          ...filtered.map((realm) {
            final zone = RealmTime.zone(realm);
            final opening = RealmTime.serverInstant(realm['aberturaEm']);
            final now = DateTime.now().toUtc();
            final days = opening == null || opening.isAfter(now) ? null : now.difference(opening).inDays;
            return Padding(padding: const EdgeInsets.only(top: 9), child: PremiumPanel(onTap: () => _showRecordSheet(context, realm, widget.profileStore.locale), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${realm['id'] ?? '—'} · ${RealmTime.name(realm)}', style: const TextStyle(color: GuiaColors.premiumText, fontSize: 17, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Wrap(spacing: 12, runSpacing: 6, children: [
                Text(zone.isEmpty ? '${strings.t('realms.timezone')}: ${strings.t('realms.not_informed')}' : '$zone · ${RealmTime.clock(zone, now)}', style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.bold)),
                if ((realm['status'] ?? '').toString().isNotEmpty) Text('${realm['status']}', style: const TextStyle(color: GuiaColors.premiumMuted)),
              ]),
              if (days != null) Padding(padding: const EdgeInsets.only(top: 5), child: Text(strings.t('realms.age_days', {'count': days}), style: const TextStyle(color: GuiaColors.premiumMuted))),
            ])));
          }),
        ])));
  });
}

class LevelsPage extends StatefulWidget {
  const LevelsPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override State<LevelsPage> createState() => _LevelsPageState();
}

class _LevelsPageState extends State<LevelsPage> {
  final TextEditingController _power = TextEditingController();
  @override void initState() { super.initState(); final saved = widget.featureStore.readMap('levels_progress'); _power.text = saved['power']?.toString() ?? ''; }
  @override void dispose() { _power.dispose(); super.dispose(); }
  Future<void> _save() async { await widget.featureStore.writeMap('levels_progress', <String,dynamic>{'power': int.tryParse(_power.text) ?? 0, 'updatedAt': DateTime.now().toIso8601String()}); if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_ui(widget.profileStore,'Progresso salvo.','Progress saved.')))); }
  @override Widget build(BuildContext context) {
    final levels = widget.controller.section('niveis');
    final currentPower = int.tryParse(_power.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
    Map<String,dynamic>? next;
    for (final row in levels) { final need = intValue(row['poder'] ?? row['power'] ?? row['requisito']); if (need > currentPower && (next == null || need < intValue(next['poder'] ?? next['power'] ?? next['requisito']))) next = row; }
    return ModuleScaffold(title: _ui(widget.profileStore,'Níveis','Levels'), subtitle: _ui(widget.profileStore,'Progresso local + tabela oficial','Local progress + official table'), actions: <Widget>[IconButton(onPressed: _save, icon: const Icon(Icons.save_outlined))], child: ListView(padding: const EdgeInsets.fromLTRB(12,12,12,30), children: <Widget>[
      ModuleIntro(icon: '📈', title: _ui(widget.profileStore,'Progresso de Nível','Level Progress'), text: _ui(widget.profileStore,'Informe seu poder para localizar a próxima meta e consulte a tabela completa.','Enter your power to locate the next target and browse the full table.')),
      const SizedBox(height: 12), PremiumPanel(child: TextField(controller: _power, keyboardType: TextInputType.number, onChanged: (_) => setState(() {}), style: const TextStyle(color: GuiaColors.premiumText), decoration: InputDecoration(labelText: _ui(widget.profileStore,'Seu poder atual','Current power'), labelStyle: const TextStyle(color: GuiaColors.premiumMuted)))),
      if (next != null) ...<Widget>[const SizedBox(height: 10), PremiumPanel(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
        Text(_ui(widget.profileStore,'Próxima meta','Next target'), style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900)),
        const SizedBox(height: 5), Text(recordTitle(next, widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText, fontSize: 18, fontWeight: FontWeight.w900)),
        Text('${_ui(widget.profileStore,'Poder','Power')}: ${formatCompactNumber(intValue(next['poder'] ?? next['power'] ?? next['requisito']))}', style: const TextStyle(color: GuiaColors.premiumMuted)),
      ]))],
      const SizedBox(height: 12), _sectionTitle(_ui(widget.profileStore,'Tabela de níveis','Level table'), icon: Icons.table_rows_outlined),
      ...levels.map((row) => Padding(padding: const EdgeInsets.only(bottom: 7), child: PremiumPanel(onTap: () => _showRecordSheet(context,row,widget.profileStore.locale), child: Row(children:<Widget>[
        SizedBox(width:50, child: Text('${row['nivel'] ?? row['level'] ?? '—'}', textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.premiumGoldLight,fontSize:18,fontWeight:FontWeight.w900))),
        const SizedBox(width:8), Expanded(child: Text(recordTitle(row,widget.profileStore.locale), style: const TextStyle(color: GuiaColors.premiumText,fontWeight:FontWeight.w800))),
        Text(formatCompactNumber(intValue(row['poder'] ?? row['power'] ?? row['requisito'])), style: const TextStyle(color: GuiaColors.premiumMuted)),
      ])))),
    ]));
  }
}

class IslandsPage extends StatefulWidget {
  const IslandsPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override State<IslandsPage> createState() => _IslandsPageState();
}

class _IslandsPageState extends State<IslandsPage> {
  final List<String> _slots = List<String>.filled(12, '');
  @override void initState() { super.initState(); final saved=widget.featureStore.readList('island_planner_slots'); for (var i=0;i<math.min(saved.length,_slots.length);i++) _slots[i]=saved[i].toString(); }
  Future<void> _save() => widget.featureStore.writeList('island_planner_slots', _slots);
  @override Widget build(BuildContext context) {
    final buildings = widget.controller.section('edificios');
    return ModuleScaffold(title:_ui(widget.profileStore,'Ilhas','Islands'), subtitle:_ui(widget.profileStore,'Planejador local','Local planner'), actions:<Widget>[IconButton(onPressed:(){_save(); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(_ui(widget.profileStore,'Ilha salva.','Island saved.'))));},icon:const Icon(Icons.save_outlined))], child: ListView(padding:const EdgeInsets.fromLTRB(12,12,12,30),children:<Widget>[
      ModuleIntro(icon:'🏝️',title:_ui(widget.profileStore,'Planejador de Ilha','Island Planner'),text:_ui(widget.profileStore,'Monte uma distribuição rápida de edifícios. O plano fica salvo neste aparelho.','Build a quick building layout. The plan stays saved on this device.')),
      const SizedBox(height:12), GridView.builder(shrinkWrap:true,physics:const NeverScrollableScrollPhysics(),gridDelegate:const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount:3,crossAxisSpacing:7,mainAxisSpacing:7,childAspectRatio:.95),itemCount:_slots.length,itemBuilder:(context,index){ final selected=_slots[index]; return PremiumPanel(padding:const EdgeInsets.all(7),child:Column(children:<Widget>[
        Text('#${index+1}',style:const TextStyle(color:GuiaColors.premiumGoldLight,fontWeight:FontWeight.w900,fontSize:10)),
        const SizedBox(height:4), Expanded(child:DropdownButtonHideUnderline(child:DropdownButton<String>(isExpanded:true,value:selected.isEmpty?null:selected,hint:Text(_ui(widget.profileStore,'Vazio','Empty'),style:const TextStyle(color:GuiaColors.premiumMuted,fontSize:10)),dropdownColor:GuiaColors.premiumPanel,style:const TextStyle(color:GuiaColors.premiumText,fontSize:10),items:buildings.map((b){final id=(b['slug']??b['id']??recordTitle(b,widget.profileStore.locale)).toString();return DropdownMenuItem<String>(value:id,child:Text(recordTitle(b,widget.profileStore.locale),overflow:TextOverflow.ellipsis));}).toList(growable:false),onChanged:(v)=>setState(()=>_slots[index]=v??'')))),
        IconButton(iconSize:17,onPressed:selected.isEmpty?null:()=>setState(()=>_slots[index]=''),icon:const Icon(Icons.close,color:GuiaColors.premiumMuted)),
      ]));}),
      const SizedBox(height:12), FilledButton.icon(onPressed:_save,icon:const Icon(Icons.save),label:Text(_ui(widget.profileStore,'Salvar planejamento','Save plan'))),
    ]));
  }
}

class BackupPage extends StatefulWidget {
  const BackupPage({super.key, required this.profileStore, required this.featureStore});
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  @override State<BackupPage> createState()=>_BackupPageState();
}
class _BackupPageState extends State<BackupPage>{
  final TextEditingController _input=TextEditingController();
  String? _status;
  @override void dispose(){_input.dispose();super.dispose();}
  Future<void> _copy() async { await Clipboard.setData(ClipboardData(text:widget.featureStore.exportPrettyJson())); setState(()=>_status=_ui(widget.profileStore,'Backup copiado.','Backup copied.')); }
  Future<void> _paste() async { final data=await Clipboard.getData('text/plain'); if(data?.text!=null)setState(()=>_input.text=data!.text!); }
  Future<void> _restore() async { try { final decoded=jsonDecode(_input.text); if(decoded is! Map<Object?, Object?>) throw const FormatException(); final count=await widget.featureStore.importSnapshot(Map<String,dynamic>.from(decoded)); setState(()=>_status=_ui(widget.profileStore,'$count registros restaurados.','$count values restored.')); } catch(_){setState(()=>_status=_ui(widget.profileStore,'Backup inválido.','Invalid backup.'));} }
  @override Widget build(BuildContext context)=>ModuleScaffold(title:_ui(widget.profileStore,'Backup','Backup'),subtitle:_ui(widget.profileStore,'Dados locais','Local data'),child:ListView(padding:const EdgeInsets.fromLTRB(12,12,12,30),children:<Widget>[
    ModuleIntro(icon:'💾',title:_ui(widget.profileStore,'Backup e restauração','Backup & restore'),text:_ui(widget.profileStore,'Copie seus dados locais em JSON ou cole um backup para restaurar.','Copy your local data as JSON or paste a backup to restore.')),
    const SizedBox(height:12),PremiumPanel(child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:<Widget>[
      FilledButton.icon(onPressed:_copy,icon:const Icon(Icons.copy),label:Text(_ui(widget.profileStore,'Copiar backup JSON','Copy JSON backup'))),
      const SizedBox(height:8),OutlinedButton.icon(onPressed:_paste,icon:const Icon(Icons.content_paste),label:Text(_ui(widget.profileStore,'Colar do clipboard','Paste from clipboard'))),
      const SizedBox(height:10),TextField(controller:_input,onChanged:(_)=>setState((){}),minLines:7,maxLines:14,style:const TextStyle(color:GuiaColors.premiumText,fontFamily:'monospace',fontSize:11),decoration:InputDecoration(hintText:_ui(widget.profileStore,'Cole o JSON aqui','Paste JSON here'),hintStyle:const TextStyle(color:GuiaColors.premiumMuted))),
      const SizedBox(height:8),FilledButton.icon(onPressed:_input.text.trim().isEmpty?null:_restore,icon:const Icon(Icons.restore),label:Text(_ui(widget.profileStore,'Restaurar','Restore'))),
      if(_status!=null)...<Widget>[const SizedBox(height:8),Text(_status!,style:const TextStyle(color:GuiaColors.premiumGoldLight,fontWeight:FontWeight.w800))],
    ])),
  ]));
}

class AssistantPage extends StatefulWidget {
  const AssistantPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  @override State<AssistantPage> createState()=>_AssistantPageState();
}
class _AssistantPageState extends State<AssistantPage>{
  final TextEditingController _message=TextEditingController();
  final List<Map<String,String>> _messages=<Map<String,String>>[];
  bool _loading=false;
  @override void dispose(){_message.dispose();super.dispose();}
  Future<void> _send() async { final text=_message.text.trim(); if(text.isEmpty||_loading)return; setState((){_messages.add(<String,String>{'role':'user','text':text});_message.clear();_loading=true;}); try{ final history = _messages.where((m) => m['text'] != null).take(_messages.length - 1).map((m) => <String, dynamic>{'role': m['role'], 'content': m['text']}).toList(growable: false); final response=await ApiClient().postJson('/api/assistente',<String,dynamic>{'pergunta':text,'locale':widget.profileStore.locale,'historico':history}); String answer; if(response is Map<Object?, Object?>){answer=(response['resposta']??response['answer']??response['mensagem']??response).toString();}else{answer=response.toString();} if(mounted)setState(()=>_messages.add(<String,String>{'role':'assistant','text':answer})); }catch(e){if(mounted)setState(()=>_messages.add(<String,String>{'role':'assistant','text':e.toString()}));}finally{if(mounted)setState(()=>_loading=false);} }
  @override Widget build(BuildContext context)=>ModuleScaffold(title:_ui(widget.profileStore,'Assistente','Assistant'),subtitle:'Render API',child:Column(children:<Widget>[
    Expanded(child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
      ModuleIntro(icon:'🧙',title:_ui(widget.profileStore,'Conselheiro','Advisor'),text:_ui(widget.profileStore,'Pergunte sobre tropas, dragões, itens, torneios e estratégias.','Ask about troops, dragons, items, tournaments and strategies.')),
      const SizedBox(height:10),..._messages.map((m)=>Align(alignment:m['role']=='user'?Alignment.centerRight:Alignment.centerLeft,child:Container(margin:const EdgeInsets.only(bottom:8),padding:const EdgeInsets.all(10),constraints:const BoxConstraints(maxWidth:640),decoration:BoxDecoration(color:m['role']=='user'?GuiaColors.premiumEmerald:GuiaColors.premiumPanel,borderRadius:BorderRadius.circular(12),border:Border.all(color:GuiaColors.premiumGold.withValues(alpha:.45))),child:Text(m['text']??'',style:const TextStyle(color:GuiaColors.premiumText))))),
      if(_loading) const Center(child:Padding(padding:EdgeInsets.all(8),child:CircularProgressIndicator(color:GuiaColors.premiumGoldLight))),
    ])),
    SafeArea(top:false,child:Padding(padding:const EdgeInsets.fromLTRB(10,6,10,10),child:Row(children:<Widget>[Expanded(child:TextField(controller:_message,onSubmitted:(_)=>_send(),style:const TextStyle(color:GuiaColors.premiumText),decoration:InputDecoration(hintText:_ui(widget.profileStore,'Digite sua pergunta...','Type your question...'),hintStyle:const TextStyle(color:GuiaColors.premiumMuted))),),const SizedBox(width:7),IconButton.filled(onPressed:_loading?null:_send,icon:const Icon(Icons.send))]))),
  ]));
}

class ColorTextPage extends StatefulWidget {
  const ColorTextPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  @override State<ColorTextPage> createState()=>_ColorTextPageState();
}
class _ColorTextPageState extends State<ColorTextPage>{
  final TextEditingController _text=TextEditingController();
  String _color='00FF88';
  String _color2='55AAFF';
  bool _gradient=false;
  static const List<DropdownMenuItem<String>> _colors=<DropdownMenuItem<String>>[
    DropdownMenuItem(value:'00FF88',child:Text('Verde / Green')), DropdownMenuItem(value:'FFD54F',child:Text('Dourado / Gold')),
    DropdownMenuItem(value:'55AAFF',child:Text('Azul / Blue')), DropdownMenuItem(value:'FF5555',child:Text('Vermelho / Red')),
    DropdownMenuItem(value:'FF77DD',child:Text('Rosa / Pink')), DropdownMenuItem(value:'FFFFFF',child:Text('Branco / White')),
  ];
  @override void dispose(){_text.dispose();super.dispose();}
  int _hex(String value)=>int.parse(value,radix:16);
  String _mix(String a,String b,double t){
    final av=_hex(a),bv=_hex(b); final ar=(av>>16)&255,ag=(av>>8)&255,ab=av&255; final br=(bv>>16)&255,bg=(bv>>8)&255,bb=bv&255;
    final r=(ar+(br-ar)*t).round(),g=(ag+(bg-ag)*t).round(),bl=(ab+(bb-ab)*t).round();
    return ((r<<16)|(g<<8)|bl).toRadixString(16).padLeft(6,'0').toUpperCase();
  }
  String get _code {
    final text=_text.text; if(!_gradient||text.length<2)return '[#$_color]$text[-]';
    final out=StringBuffer(); for(var i=0;i<text.length;i++){final c=_mix(_color,_color2,i/(text.length-1));out.write('[#$c]${text[i]}[-]');} return out.toString();
  }
  @override Widget build(BuildContext context)=>ModuleScaffold(title:_ui(widget.profileStore,'Texto Colorido','Colored Text'),subtitle:_ui(widget.profileStore,'Cor única ou gradiente','Single color or gradient'),child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
    ModuleIntro(icon:'🎨',title:_ui(widget.profileStore,'Construtor de texto','Text Builder'),text:_ui(widget.profileStore,'Crie texto em cor única ou gradiente e copie o código pronto para o jogo.','Create single-color or gradient text and copy the ready game code.')),
    const SizedBox(height:12),PremiumPanel(child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:<Widget>[
      TextField(controller:_text,onChanged:(_)=>setState((){}),style:const TextStyle(color:GuiaColors.premiumText),decoration:InputDecoration(labelText:_ui(widget.profileStore,'Texto','Text'),labelStyle:const TextStyle(color:GuiaColors.premiumMuted))),
      const SizedBox(height:8),SwitchListTile(contentPadding:EdgeInsets.zero,value:_gradient,onChanged:(v)=>setState(()=>_gradient=v),title:Text(_ui(widget.profileStore,'Usar gradiente','Use gradient'),style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w800))),
      DropdownButtonFormField<String>(initialValue:_color,dropdownColor:GuiaColors.premiumPanel,items:_colors,onChanged:(v)=>setState(()=>_color=v??_color),decoration:InputDecoration(labelText:_ui(widget.profileStore,'Cor inicial','Start color'))),
      if(_gradient)...<Widget>[const SizedBox(height:8),DropdownButtonFormField<String>(initialValue:_color2,dropdownColor:GuiaColors.premiumPanel,items:_colors,onChanged:(v)=>setState(()=>_color2=v??_color2),decoration:InputDecoration(labelText:_ui(widget.profileStore,'Cor final','End color')))],
      const SizedBox(height:12),SelectableText(_code,style:const TextStyle(color:GuiaColors.premiumGoldLight,fontWeight:FontWeight.w900,fontFamily:'monospace')),
      const SizedBox(height:8),FilledButton.icon(onPressed:_text.text.isEmpty?null:()=>Clipboard.setData(ClipboardData(text:_code)),icon:const Icon(Icons.copy),label:Text(_ui(widget.profileStore,'Copiar código','Copy code'))),
    ])),
  ]));
}


class ColorBuilderPage extends StatelessWidget {
  const ColorBuilderPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  @override
  Widget build(BuildContext context) {
    final tools = <({String icon, String title, String subtitle, Widget page})>[
      (icon:'🎨', title:_ui(profileStore,'Texto colorido','Colored text'), subtitle:_ui(profileStore,'Cor única e código pronto para copiar','Single color and ready-to-copy code'), page:ColorTextPage(profileStore:profileStore)),
      (icon:'Aa', title:_ui(profileStore,'Letras especiais','Special letters'), subtitle:'G⊙KU™ · ü · ï · ñ · ë', page:SpecialCharsPage(profileStore:profileStore)),
      (icon:'🏳️', title:_ui(profileStore,'Bandeiras','Flags'), subtitle:_ui(profileStore,'Pesquise e copie bandeiras rapidamente','Search and copy flags quickly'), page:FlagsPage(profileStore:profileStore)),
      (icon:'⚔️', title:_ui(profileStore,'Placar','Scoreboard'), subtitle:_ui(profileStore,'Monte um placar compacto para copiar','Build a compact scoreboard to copy'), page:ScoreBuilderPage(profileStore:profileStore)),
    ];
    return ModuleScaffold(
      title:_ui(profileStore,'Construtor de Texto','Text Builder'),
      subtitle:_ui(profileStore,'Quatro ferramentas da versão anterior','Four tools from the previous version'),
      child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
        ModuleIntro(icon:'✦',title:_ui(profileStore,'O que você quer criar?','What do you want to create?'),text:_ui(profileStore,'As ferramentas de texto da versão anterior foram preservadas no Flutter.','The previous version text tools are preserved in Flutter.')),
        const SizedBox(height:12),
        ...tools.map((tool)=>Padding(padding:const EdgeInsets.only(bottom:8),child:PremiumPanel(onTap:()=>Navigator.of(context).push(MaterialPageRoute<void>(builder:(_)=>tool.page)),child:Row(children:<Widget>[
          SizedBox(width:42,child:Text(tool.icon,textAlign:TextAlign.center,style:const TextStyle(fontSize:24,fontWeight:FontWeight.w900,color:GuiaColors.premiumGoldLight))),
          const SizedBox(width:9),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:<Widget>[
            Text(tool.title,style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w900)),
            const SizedBox(height:2),Text(tool.subtitle,style:const TextStyle(color:GuiaColors.premiumMuted,fontSize:11.5)),
          ])),const Icon(Icons.chevron_right,color:GuiaColors.premiumGoldLight),
        ])))),
      ]),
    );
  }
}

class SpecialCharsPage extends StatefulWidget {
  const SpecialCharsPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  @override State<SpecialCharsPage> createState()=>_SpecialCharsPageState();
}
class _SpecialCharsPageState extends State<SpecialCharsPage>{
  final TextEditingController _text=TextEditingController();
  static const String _chars='⊙ ™ † ‡ ★ ☆ ✦ ✧ ♛ ♚ ♜ ♞ ♠ ♣ ♥ ♦ Ä Ë Ï Ö Ü ä ë ï ö ü Ñ ñ Ç ç Ø ø Æ æ ß';
  @override void dispose(){_text.dispose();super.dispose();}
  @override Widget build(BuildContext context)=>ModuleScaffold(title:_ui(widget.profileStore,'Letras especiais','Special letters'),child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
    ModuleIntro(icon:'Aa',title:_ui(widget.profileStore,'Caracteres especiais','Special characters'),text:_ui(widget.profileStore,'Toque em um caractere para adicioná-lo ao texto e copie o resultado.','Tap a character to append it and copy the result.')),
    const SizedBox(height:12),PremiumPanel(child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:<Widget>[
      TextField(controller:_text,onChanged:(_)=>setState((){}),style:const TextStyle(color:GuiaColors.premiumText,fontSize:18),decoration:InputDecoration(labelText:_ui(widget.profileStore,'Seu texto','Your text'),labelStyle:const TextStyle(color:GuiaColors.premiumMuted))),
      const SizedBox(height:12),Wrap(spacing:7,runSpacing:7,children:_chars.split(' ').where((e)=>e.isNotEmpty).map((c)=>ActionChip(label:Text(c,style:const TextStyle(fontSize:17)),onPressed:(){_text.text='${_text.text}$c';_text.selection=TextSelection.collapsed(offset:_text.text.length);setState((){});})).toList(growable:false)),
      const SizedBox(height:12),FilledButton.icon(onPressed:_text.text.isEmpty?null:()=>Clipboard.setData(ClipboardData(text:_text.text)),icon:const Icon(Icons.copy),label:Text(_ui(widget.profileStore,'Copiar','Copy'))),
    ])),
  ]));
}

class FlagsPage extends StatefulWidget {
  const FlagsPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  @override State<FlagsPage> createState()=>_FlagsPageState();
}
class _FlagsPageState extends State<FlagsPage>{
  String _query='';
  static const Map<String,String> _flags=<String,String>{'Brasil':'🇧🇷','Portugal':'🇵🇹','Estados Unidos':'🇺🇸','Canadá':'🇨🇦','México':'🇲🇽','Argentina':'🇦🇷','Chile':'🇨🇱','Colômbia':'🇨🇴','França':'🇫🇷','Itália':'🇮🇹','Espanha':'🇪🇸','Alemanha':'🇩🇪','Reino Unido':'🇬🇧','Japão':'🇯🇵','Coreia do Sul':'🇰🇷','China':'🇨🇳','Austrália':'🇦🇺','Turquia':'🇹🇷'};
  @override Widget build(BuildContext context){final q=_query.toLowerCase();final list=_flags.entries.where((e)=>q.isEmpty||e.key.toLowerCase().contains(q)).toList();return ModuleScaffold(title:_ui(widget.profileStore,'Bandeiras','Flags'),child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
    PremiumSearchField(hint:_ui(widget.profileStore,'Buscar país...','Search country...'),onChanged:(v)=>setState(()=>_query=v)),const SizedBox(height:12),
    ...list.map((e)=>Padding(padding:const EdgeInsets.only(bottom:7),child:PremiumPanel(onTap:()=>Clipboard.setData(ClipboardData(text:e.value)),child:Row(children:<Widget>[Text(e.value,style:const TextStyle(fontSize:30)),const SizedBox(width:12),Expanded(child:Text(e.key,style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w800))),const Icon(Icons.copy,color:GuiaColors.premiumGoldLight)])))),
  ]));}
}

class ScoreBuilderPage extends StatefulWidget {
  const ScoreBuilderPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  @override State<ScoreBuilderPage> createState()=>_ScoreBuilderPageState();
}
class _ScoreBuilderPageState extends State<ScoreBuilderPage>{
  final TextEditingController _left=TextEditingController(text:'MID');
  final TextEditingController _right=TextEditingController(text:'LEG');
  int _a=0,_b=0;
  @override void dispose(){_left.dispose();_right.dispose();super.dispose();}
  String get _score=>'${_left.text.trim()} $_a-$_b ${_right.text.trim()}';
  Widget _side(TextEditingController c,bool left)=>Expanded(child:Column(children:<Widget>[
    TextField(controller:c,onChanged:(_)=>setState((){}),textAlign:TextAlign.center,style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w900),decoration:InputDecoration(labelText:_ui(widget.profileStore,'Nome','Name'),labelStyle:const TextStyle(color:GuiaColors.premiumMuted))),
    const SizedBox(height:7),Row(mainAxisAlignment:MainAxisAlignment.center,children:<Widget>[IconButton(onPressed:()=>setState(()=>left?_a=math.max(0,_a-1):_b=math.max(0,_b-1)),icon:const Icon(Icons.remove_circle_outline,color:GuiaColors.premiumGoldLight)),Text('${left?_a:_b}',style:const TextStyle(color:GuiaColors.premiumText,fontSize:26,fontWeight:FontWeight.w900)),IconButton(onPressed:()=>setState(()=>left?_a++:_b++),icon:const Icon(Icons.add_circle_outline,color:GuiaColors.premiumGoldLight))]),
  ]));
  @override Widget build(BuildContext context)=>ModuleScaffold(title:_ui(widget.profileStore,'Placar','Scoreboard'),child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
    ModuleIntro(icon:'⚔️',title:_ui(widget.profileStore,'Gerador de placar','Score generator'),text:_ui(widget.profileStore,'Monte nomes e resultado e copie uma linha pronta.','Build names and score and copy a ready line.')),const SizedBox(height:12),
    PremiumPanel(child:Column(children:<Widget>[Row(children:<Widget>[_side(_left,true),const Padding(padding:EdgeInsets.symmetric(horizontal:7),child:Text('×',style:TextStyle(color:GuiaColors.premiumGoldLight,fontSize:22))),_side(_right,false)]),const SizedBox(height:12),SelectableText(_score,style:const TextStyle(color:GuiaColors.premiumGoldLight,fontSize:20,fontWeight:FontWeight.w900)),const SizedBox(height:8),FilledButton.icon(onPressed:()=>Clipboard.setData(ClipboardData(text:_score)),icon:const Icon(Icons.copy),label:Text(_ui(widget.profileStore,'Copiar placar','Copy score')))])),
  ]));
}

class AboutPage extends StatelessWidget {
  const AboutPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  @override Widget build(BuildContext context)=>ModuleScaffold(title:_ui(profileStore,'Sobre','About'),subtitle:AppConfig.displayVersion,child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
    Center(child:ClipRRect(borderRadius:BorderRadius.circular(24),child:Image.asset('assets/public/img/app-icon.png',width:132,height:132))),const SizedBox(height:14),
    PremiumPanel(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:<Widget>[
      const Text('Guia Doa',style:TextStyle(color:GuiaColors.premiumGoldLight,fontSize:24,fontWeight:FontWeight.w900)),const SizedBox(height:6),
      Text(_ui(profileStore,'Guia multiplataforma de Dragons of Atlantis Mobile.','Multiplatform guide for Dragons of Atlantis Mobile.'),style:const TextStyle(color:GuiaColors.premiumText,height:1.4)),const SizedBox(height:10),
      const Text('Android · Web · iOS',style:TextStyle(color:GuiaColors.premiumMuted)),const SizedBox(height:4),const Text(AppConfig.displayVersion,style:TextStyle(color:GuiaColors.premiumMuted)),
    ])),
  ]));
}

class DonationPage extends StatelessWidget {
  const DonationPage({super.key, required this.profileStore});
  final ProfileStore profileStore;
  static const String _pix='adriedson@outlook.com';
  @override Widget build(BuildContext context)=>ModuleScaffold(title:_ui(profileStore,'Apoiar o projeto','Support the project'),child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
    ModuleIntro(icon:'💎',title:_ui(profileStore,'Apoie o Guia Doa','Support Guia Doa'),text:_ui(profileStore,'O Guia Doa continua gratuito. Se quiser apoiar o projeto, use a chave oficial abaixo.','Guia Doa remains free. If you want to support the project, use the official key below.')),
    const SizedBox(height:12),PremiumPanel(child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:<Widget>[
      Text(_ui(profileStore,'Chave PIX','PIX key'),style:const TextStyle(color:GuiaColors.premiumMuted,fontWeight:FontWeight.w700)),const SizedBox(height:5),
      const SelectableText(_pix,style:TextStyle(color:GuiaColors.premiumGoldLight,fontSize:18,fontWeight:FontWeight.w900)),const SizedBox(height:10),
      FilledButton.icon(onPressed:()=>Clipboard.setData(const ClipboardData(text:_pix)),icon:const Icon(Icons.copy),label:Text(_ui(profileStore,'Copiar PIX','Copy PIX'))),
    ])),
    const SizedBox(height:10),PremiumPanel(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:<Widget>[
      Text(_ui(profileStore,'Outras formas','Other methods'),style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w900)),const SizedBox(height:4),
      Text(_ui(profileStore,'PayPal e cripto ainda não informados, como na versão anterior.','PayPal and crypto are still not provided, as in the previous version.'),style:const TextStyle(color:GuiaColors.premiumMuted,height:1.4)),
    ])),
  ]));
}

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller; final ProfileStore profileStore; final FeatureStore featureStore;
  @override Widget build(BuildContext context){
    final found=<MapEntry<String,Map<String,dynamic>>>[];
    for(final section in controller.sections.entries){for(final item in section.value){final id='${section.key}:${item['slug']??item['id']??recordTitle(item,profileStore.locale)}';if(featureStore.isFavorite(id))found.add(MapEntry(id,item));}}
    return ModuleScaffold(title:_ui(profileStore,'Favoritos','Favorites'),subtitle:'${found.length}',child:AnimatedBuilder(animation:featureStore,builder:(context,_)=>ListView(padding:const EdgeInsets.all(12),children:<Widget>[
      ModuleIntro(icon:'⭐',title:_ui(profileStore,'Itens salvos','Saved items'),text:_ui(profileStore,'Tudo que você marcou com estrela nos catálogos.','Everything you starred in catalogs.')),const SizedBox(height:12),
      if(found.isEmpty)PremiumPanel(child:Text(_ui(profileStore,'Nenhum favorito ainda.','No favorites yet.'),style:const TextStyle(color:GuiaColors.premiumMuted))) else ...found.map((entry)=>Padding(padding:const EdgeInsets.only(bottom:8),child:PremiumPanel(onTap:()=>_showRecordSheet(context,entry.value,profileStore.locale),child:Row(children:<Widget>[_recordImage(entry.value,size:52),const SizedBox(width:10),Expanded(child:Text(recordTitle(entry.value,profileStore.locale),style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w900))),IconButton(onPressed:()=>featureStore.toggleFavorite(entry.key),icon:const Icon(Icons.star,color:GuiaColors.premiumGoldLight))])))),
    ])));
  }
}

class TrackerHubPage extends StatelessWidget {
  const TrackerHubPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller; final ProfileStore profileStore; final FeatureStore featureStore;
  @override Widget build(BuildContext context){final dragons=controller.section('dragoes');return ModuleScaffold(title:_ui(profileStore,'Tracker','Tracker'),subtitle:_ui(profileStore,'Progresso local','Local progress'),child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
    ModuleIntro(icon:'📊',title:_ui(profileStore,'Acompanhamento','Tracking'),text:_ui(profileStore,'Acompanhe níveis e progresso dos seus dragões e do seu perfil.','Track levels and progress for your dragons and profile.')),const SizedBox(height:12),
    PremiumPanel(onTap:()=>Navigator.of(context).push(MaterialPageRoute<void>(builder:(_)=>LevelsPage(controller:controller,profileStore:profileStore,featureStore:featureStore))),child:ListTile(contentPadding:EdgeInsets.zero,leading:const Text('📈',style:TextStyle(fontSize:27)),title:Text(_ui(profileStore,'Progresso de nível','Level progress'),style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w900)),trailing:const Icon(Icons.chevron_right,color:GuiaColors.premiumGoldLight))),const SizedBox(height:10),
    _sectionTitle(_ui(profileStore,'Dragões','Dragons'),icon:Icons.pets),...dragons.map((dragon)=>Padding(padding:const EdgeInsets.only(bottom:8),child:PremiumPanel(onTap:()=>Navigator.of(context).push(MaterialPageRoute<void>(builder:(_)=>DragonTrackerPage(dragon:dragon,profileStore:profileStore,featureStore:featureStore))),child:Row(children:<Widget>[_recordImage(dragon,size:48),const SizedBox(width:9),Expanded(child:Text(recordTitle(dragon,profileStore.locale),style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w800))),const Icon(Icons.chevron_right,color:GuiaColors.premiumGoldLight)])))),
  ]));}
}

class ExtrasPage extends StatelessWidget {
  const ExtrasPage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller; final ProfileStore profileStore; final FeatureStore featureStore;
  @override Widget build(BuildContext context){
    final entries=<({String icon,String title,Widget page})>[
      (icon:'🌐',title:_ui(profileStore,'Reinos','Realms'),page:RealmsPage(controller:controller,profileStore:profileStore,featureStore:featureStore)),
      (icon:'🧙',title:_ui(profileStore,'Assistente','Assistant'),page:AssistantPage(profileStore:profileStore)),
      (icon:'🎨',title:_ui(profileStore,'Texto colorido','Colored text'),page:ColorBuilderPage(profileStore:profileStore)),
      (icon:'💾',title:_ui(profileStore,'Backup','Backup'),page:BackupPage(profileStore:profileStore,featureStore:featureStore)),
      (icon:'❤️',title:_ui(profileStore,'Apoiar','Support'),page:DonationPage(profileStore:profileStore)),
      (icon:'ℹ️',title:_ui(profileStore,'Sobre','About'),page:AboutPage(profileStore:profileStore)),
    ];
    return ModuleScaffold(title:_ui(profileStore,'Extras','Extras'),child:ListView(padding:const EdgeInsets.all(12),children:<Widget>[
      ModuleIntro(icon:'🧰',title:_ui(profileStore,'Ferramentas extras','Extra tools'),text:_ui(profileStore,'Recursos complementares preservados da versão anterior.','Complementary tools preserved from the previous version.')),const SizedBox(height:12),
      ...entries.map((entry)=>Padding(padding:const EdgeInsets.only(bottom:8),child:PremiumPanel(onTap:()=>Navigator.of(context).push(MaterialPageRoute<void>(builder:(_)=>entry.page)),child:Row(children:<Widget>[Text(entry.icon,style:const TextStyle(fontSize:25)),const SizedBox(width:10),Expanded(child:Text(entry.title,style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w900))),const Icon(Icons.chevron_right,color:GuiaColors.premiumGoldLight)])))),
    ]));
  }
}

class MorePage extends StatelessWidget {
  const MorePage({super.key, required this.controller, required this.profileStore, required this.featureStore});
  final GameDataController controller; final ProfileStore profileStore; final FeatureStore featureStore;
  @override Widget build(BuildContext context){
    final rows=<({String icon,String title,Widget page})>[
      (icon:'🗺️',title:_ui(profileStore,'Campanha','Campaign'),page:CampaignPage(controller:controller,profileStore:profileStore,featureStore:featureStore)),
      (icon:'📈',title:_ui(profileStore,'Níveis','Levels'),page:LevelsPage(controller:controller,profileStore:profileStore,featureStore:featureStore)),
      (icon:'⚡',title:_ui(profileStore,'Eventos','Events'),page:EventsPage(controller:controller,profileStore:profileStore,featureStore:featureStore)),
      (icon:'🧰',title:_ui(profileStore,'Extras','Extras'),page:ExtrasPage(controller:controller,profileStore:profileStore,featureStore:featureStore)),
      (icon:'⚙️',title:_ui(profileStore,'Configurações','Settings'),page:SettingsPage(profileStore:profileStore,gameData:controller)),
    ];
    return ModuleScaffold(title:_ui(profileStore,'Mais','More'),child:ListView(padding:const EdgeInsets.all(12),children:rows.map((row)=>Padding(padding:const EdgeInsets.only(bottom:8),child:PremiumPanel(onTap:()=>Navigator.of(context).push(MaterialPageRoute<void>(builder:(_)=>row.page)),child:Row(children:<Widget>[Text(row.icon,style:const TextStyle(fontSize:25)),const SizedBox(width:10),Expanded(child:Text(row.title,style:const TextStyle(color:GuiaColors.premiumText,fontWeight:FontWeight.w900))),const Icon(Icons.chevron_right,color:GuiaColors.premiumGoldLight)])))).toList(growable:false)));
  }
}
