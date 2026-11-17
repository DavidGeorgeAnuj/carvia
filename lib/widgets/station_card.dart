import 'package:flutter/material.dart';
import '../models/ev_station.dart';
import '../theme/colors.dart';

class StationCard extends StatelessWidget {
  final EVStation station;
  final String? distance;
  final VoidCallback? onTap;
  final VoidCallback? onNavigate;

  const StationCard({
    super.key,
    required this.station,
    this.distance,
    this.onTap,
    this.onNavigate,
  });

  Color _getStatusColor(String status) {
    switch (status) {
      case 'available':
        return CarviaColors.available;
      case 'busy':
        return CarviaColors.busy;
      case 'full':
      default:
        return CarviaColors.full;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(station.overallStatus);
    final distText = distance ?? '2.4 km';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: CarviaColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: Status dot + Station Name
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 4, right: 8),
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: statusColor.withValues(alpha: 0.4),
                            blurRadius: 6,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Text(
                        station.name,
                        style: const TextStyle(
                          color: CarviaColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),

                // Network + Distance
                Row(
                  children: [
                    Text(
                      station.network,
                      style: const TextStyle(
                        color: CarviaColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text('•', style: TextStyle(color: CarviaColors.textMuted)),
                    const SizedBox(width: 8),
                    Text(
                      distText,
                      style: const TextStyle(
                        color: CarviaColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Max power badge + connector badges row
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: CarviaColors.surface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: CarviaColors.greenDim),
                      ),
                      child: Text(
                        '⚡ ${station.maxPowerKw} kW',
                        style: const TextStyle(
                          color: CarviaColors.green,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: station.connectors.map((c) {
                            return Container(
                              margin: const EdgeInsets.only(right: 6),
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: CarviaColors.surface,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${c.type} (${c.powerKw}kW)',
                                style: const TextStyle(
                                  color: CarviaColors.textSecondary,
                                  fontSize: 11,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Price + Available connectors + Navigate Button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '₹${station.pricePerKwh.toStringAsFixed(1)} / kWh',
                          style: const TextStyle(
                            color: CarviaColors.textPrimary,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          '${station.availableConnectorsCount} of ${station.connectors.length} connectors available',
                          style: TextStyle(
                            color: station.availableConnectorsCount > 0
                                ? CarviaColors.green
                                : CarviaColors.full,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    IconButton.filled(
                      onPressed: onNavigate ?? onTap,
                      style: IconButton.styleFrom(
                        backgroundColor: CarviaColors.green,
                        foregroundColor: CarviaColors.bg,
                        padding: const EdgeInsets.all(10),
                      ),
                      icon: const Icon(Icons.navigation_rounded, size: 20),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
