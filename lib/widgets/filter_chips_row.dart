import 'package:flutter/material.dart';
import '../theme/colors.dart';

class FilterChipsRow extends StatelessWidget {
  final List<String> activeFilters;
  final Function(String) onToggle;

  static const List<String> allFilters = [
    'DC Fast 50kW+',
    'Ultra-Fast 120kW+',
    'Available Now',
    'CCS2',
    'Type 2 AC',
    '24/7 Open',
  ];

  const FilterChipsRow({
    super.key,
    required this.activeFilters,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: allFilters.map((filter) {
          final bool isActive = activeFilters.contains(filter);

          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: FilterChip(
              label: Text(
                filter,
                style: TextStyle(
                  color: isActive ? CarviaColors.bg : CarviaColors.textSecondary,
                  fontSize: 12,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
              selected: isActive,
              onSelected: (_) => onToggle(filter),
              backgroundColor: Colors.transparent,
              selectedColor: CarviaColors.green,
              showCheckmark: false,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isActive ? CarviaColors.green : CarviaColors.surface,
                  width: 1.5,
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            ),
          );
        }).toList(),
      ),
    );
  }
}
