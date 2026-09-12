import 'package:flutter_test/flutter_test.dart';
import 'package:guia_doa/features/troops/domain/troop_catalog.dart';

void main() {
  final troops = <Map<String, dynamic>>[
    <String, dynamic>{
      'nome': 'Arqueiros',
      'vida': 75,
      'def': 30,
      'atqPerto': 5,
      'atqDist': 80,
      'alcance': 1200,
      'vel': 250,
      'car': 25,
      'poder': 4,
      'slug': 'arqueiros',
      'imagem': '/assets/troops/arqueiros.webp',
      'i18n': <String, dynamic>{
        'en-US': <String, dynamic>{'nome': 'Longbowmen', 'desc': 'Ranged troops.'},
      },
    },
    <String, dynamic>{
      'nome': 'Ogros de Granito',
      'vida': 15000,
      'def': 900,
      'atqPerto': 650,
      'atqDist': 0,
      'alcance': 0,
      'vel': 350,
      'car': 30,
      'poder': 9,
      'perfilCombate': <String, dynamic>{
        'funcoesTaticas': <String>['tank'],
      },
    },
    <String, dynamic>{
      'nome': 'Espiões',
      'vida': 10,
      'def': 5,
      'atqPerto': 5,
      'atqDist': 0,
      'alcance': 0,
      'vel': 3000,
      'car': 0,
      'poder': 2,
    },
  ];

  test('classifica ranged, melee, tank e speed sem persistir inferências', () {
    final analysis = analyzeTroops(troops);
    expect(combatClass(troops[0]), 'ranged');
    expect(matchesTroopFilter(troops[0], 'ranged', analysis), isTrue);
    expect(matchesTroopFilter(troops[1], 'melee', analysis), isTrue);
    expect(matchesTroopFilter(troops[1], 'tank', analysis), isTrue);
    expect(matchesTroopFilter(troops[2], 'speed', analysis), isTrue);
  });

  test('filtro ranged_only exige ataque corpo a corpo zero', () {
    final analysis = analyzeTroops(troops);
    expect(matchesTroopFilter(troops[0], 'ranged_only', analysis), isFalse);
    final pure = <String, dynamic>{'atqPerto': 0, 'atqDist': 100, 'vel': 1};
    expect(matchesTroopFilter(pure, 'ranged_only', analysis), isTrue);
  });

  test('nome e imagem são localizados/reaproveitados corretamente', () {
    expect(troopName(troops[0], 'en-US'), 'Longbowmen');
    expect(troopName(troops[0], 'pt-BR'), 'Arqueiros');
    expect(troopLocalAssetPath(troops[0]), 'assets/public/assets/troops/arqueiros.webp');
  });

  test('ordenação numérica usa atributos reais', () {
    final analysis = analyzeTroops(troops);
    final sorted = sortTroops(troops, 'life', analysis, 'pt-BR');
    expect(sorted.first['nome'], 'Ogros de Granito');
  });
}
