import 'package:flutter/material.dart';

import '../../../core/theme/guia_theme.dart';

class LanguageSelector extends StatelessWidget {
  const LanguageSelector({
    super.key,
    required this.locale,
    required this.onChanged,
    this.compact = false,
  });

  final String locale;
  final ValueChanged<String> onChanged;
  final bool compact;

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[
          Expanded(
            child: _LanguageOption(
              selected: locale == 'pt-BR',
              flag: '🇧🇷',
              label: 'Português',
              compact: compact,
              onTap: () => onChanged('pt-BR'),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _LanguageOption(
              selected: locale == 'en-US',
              flag: '🇺🇸',
              label: 'English',
              compact: compact,
              onTap: () => onChanged('en-US'),
            ),
          ),
        ],
      );
}

class _LanguageOption extends StatelessWidget {
  const _LanguageOption({
    required this.selected,
    required this.flag,
    required this.label,
    required this.compact,
    required this.onTap,
  });

  final bool selected;
  final String flag;
  final String label;
  final bool compact;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: EdgeInsets.symmetric(
              horizontal: compact ? 10 : 12,
              vertical: compact ? 10 : 13,
            ),
            decoration: BoxDecoration(
              color: selected
                  ? GuiaColors.premiumEmerald.withValues(alpha: .72)
                  : GuiaColors.premiumPanel.withValues(alpha: .82),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selected ? GuiaColors.premiumGoldLight : GuiaColors.premiumGold.withValues(alpha: .45),
                width: selected ? 1.6 : 1,
              ),
              boxShadow: selected
                  ? <BoxShadow>[
                      BoxShadow(
                        color: GuiaColors.premiumGold.withValues(alpha: .18),
                        blurRadius: 12,
                        spreadRadius: 1,
                      ),
                    ]
                  : const <BoxShadow>[],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(flag, style: TextStyle(fontSize: compact ? 18 : 21)),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    label,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: selected ? GuiaColors.premiumGoldLight : GuiaColors.premiumText,
                      fontWeight: FontWeight.w800,
                      fontSize: compact ? 12 : 13,
                    ),
                  ),
                ),
                if (selected) ...<Widget>[
                  const SizedBox(width: 6),
                  const Icon(Icons.check_circle, size: 16, color: GuiaColors.premiumGoldLight),
                ],
              ],
            ),
          ),
        ),
      );
}
