import 'package:flutter_test/flutter_test.dart';
import 'package:guia_doa/features/catalog/data/game_data_repository.dart';

void main() {
  test('parseList aceita resposta raiz em lista', () {
    final result = GameDataRepository.parseList(<dynamic>[
      <String, dynamic>{'nome': 'Hoplita'},
    ]);
    expect(result, hasLength(1));
    expect(result.first['nome'], 'Hoplita');
  });

  test('parseList aceita lista aninhada por chave da API', () {
    final result = GameDataRepository.parseList(
      <String, dynamic>{
        'dragoes': <dynamic>[<String, dynamic>{'nome': 'Dragão de Fogo'}],
      },
      responseKey: 'dragoes',
    );
    expect(result, hasLength(1));
    expect(result.first['nome'], 'Dragão de Fogo');
  });
}
