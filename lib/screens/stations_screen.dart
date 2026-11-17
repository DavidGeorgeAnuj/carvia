import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/ev_station.dart';
import '../theme/colors.dart';
import '../widgets/filter_chips_row.dart';
import '../widgets/station_card.dart';
import 'station_detail_screen.dart';

class StationsScreen extends StatefulWidget {
  final Function(EVStation)? onSelectStation;

  const StationsScreen({super.key, this.onSelectStation});

  @override
  State<StationsScreen> createState() => _StationsScreenState();
}

class _StationsScreenState extends State<StationsScreen> {
  final TextEditingController _searchController = TextEditingController();
  final List<String> _activeFilters = [];
  String _selectedSort = 'Distance'; // Distance, Power, Price

  void _toggleFilter(String filter) {
    setState(() {
      if (_activeFilters.contains(filter)) {
        _activeFilters.remove(filter);
      } else {
        _activeFilters.add(filter);
      }
    });
  }

  List<EVStation> _getFilteredAndSortedStations() {
    final query = _searchController.text.toLowerCase().trim();

    final filtered = evStations.where((station) {
      if (query.isNotEmpty) {
        final matchesName = station.name.toLowerCase().contains(query);
        final matchesAddress = station.address.toLowerCase().contains(query);
        final matchesNetwork = station.network.toLowerCase().contains(query);
        if (!matchesName && !matchesAddress && !matchesNetwork) return false;
      }

      if (_activeFilters.contains('DC Fast 50kW+') && station.maxPowerKw < 50) return false;
      if (_activeFilters.contains('Ultra-Fast 120kW+') && station.maxPowerKw < 120) return false;
      if (_activeFilters.contains('Available Now') && station.availableConnectorsCount == 0) return false;
      if (_activeFilters.contains('24/7 Open') && !station.is24x7) return false;
      if (_activeFilters.contains('CCS2') && !station.connectors.any((c) => c.type == 'CCS2')) return false;
      if (_activeFilters.contains('Type 2 AC') && !station.connectors.any((c) => c.type == 'Type2AC')) return false;

      return true;
    }).toList();

    // Sorting
    filtered.sort((a, b) {
      if (_selectedSort == 'Power') {
        return b.maxPowerKw.compareTo(a.maxPowerKw);
      } else if (_selectedSort == 'Price') {
        return a.pricePerKwh.compareTo(b.pricePerKwh);
      } else {
        // Distance default (mock order or by lat/lng diff)
        return a.id.compareTo(b.id);
      }
    });

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final stations = _getFilteredAndSortedStations();

    return Scaffold(
      backgroundColor: CarviaColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Stations',
          style: TextStyle(
            color: CarviaColors.textPrimary,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Column(
        children: [
          // 1. Search Box
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Container(
              decoration: BoxDecoration(
                color: CarviaColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(color: CarviaColors.textPrimary, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Search by station, network, area...',
                  hintStyle: const TextStyle(color: CarviaColors.textMuted, fontSize: 14),
                  prefixIcon: const Icon(Icons.search, color: CarviaColors.green),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, color: CarviaColors.textSecondary, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {});
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
          ),

          // 2. Sort Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
            child: Row(
              children: [
                const Text(
                  'Sort by: ',
                  style: TextStyle(color: CarviaColors.textMuted, fontSize: 12),
                ),
                _buildSortOption('Distance'),
                const SizedBox(width: 8),
                _buildSortOption('Power'),
                const SizedBox(width: 8),
                _buildSortOption('Price'),
                const Spacer(),
                Text(
                  '${stations.length} found',
                  style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),

          // 3. Filter Chips
          FilterChipsRow(
            activeFilters: _activeFilters,
            onToggle: _toggleFilter,
          ),

          // 4. Stations List
          Expanded(
            child: stations.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.ev_station_outlined, color: CarviaColors.textMuted, size: 48),
                        SizedBox(height: 12),
                        Text(
                          'No stations match your filters',
                          style: TextStyle(color: CarviaColors.textSecondary, fontSize: 15),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 100, top: 4),
                    itemCount: stations.length,
                    itemBuilder: (context, index) {
                      final station = stations[index];
                      return StationCard(
                        station: station,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => StationDetailScreen(station: station),
                            ),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSortOption(String mode) {
    final bool isSelected = _selectedSort == mode;

    return InkWell(
      onTap: () {
        setState(() {
          _selectedSort = mode;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Column(
          children: [
            Text(
              mode,
              style: TextStyle(
                color: isSelected ? CarviaColors.green : CarviaColors.textSecondary,
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
            if (isSelected)
              Container(
                margin: const EdgeInsets.only(top: 2),
                height: 2,
                width: 20,
                color: CarviaColors.green,
              ),
          ],
        ),
      ),
    );
  }
}
