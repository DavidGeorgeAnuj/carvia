import 'package:flutter/material.dart';
import '../models/ev_station.dart';
import '../theme/colors.dart';
import 'charge_screen.dart';

class StationDetailScreen extends StatefulWidget {
  final EVStation station;

  const StationDetailScreen({super.key, required this.station});

  @override
  State<StationDetailScreen> createState() => _StationDetailScreenState();
}

class _StationDetailScreenState extends State<StationDetailScreen> {
  double _targetKwh = 25.0;

  @override
  Widget build(BuildContext context) {
    final station = widget.station;
    final estimatedCost = _targetKwh * station.pricePerKwh;

    return Scaffold(
      backgroundColor: CarviaColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: CarviaColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: CarviaColors.textPrimary),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border, color: CarviaColors.textPrimary),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Hero Header
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        station.name,
                        style: const TextStyle(
                          color: CarviaColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        station.network,
                        style: const TextStyle(
                          color: CarviaColors.green,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: station.overallStatus == 'available'
                        ? CarviaColors.available.withValues(alpha: 0.15)
                        : CarviaColors.busy.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: station.overallStatus == 'available'
                          ? CarviaColors.available
                          : CarviaColors.busy,
                    ),
                  ),
                  child: Text(
                    station.overallStatus.toUpperCase(),
                    style: TextStyle(
                      color: station.overallStatus == 'available'
                          ? CarviaColors.available
                          : CarviaColors.busy,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Rating + Hours + Distance
            Row(
              children: [
                const Icon(Icons.star, color: Colors.amber, size: 18),
                const SizedBox(width: 4),
                Text(
                  station.rating.toString(),
                  style: const TextStyle(color: CarviaColors.textPrimary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                const Text('•', style: TextStyle(color: CarviaColors.textMuted)),
                const SizedBox(width: 12),
                Icon(
                  station.is24x7 ? Icons.all_inclusive : Icons.schedule,
                  color: CarviaColors.textSecondary,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Text(
                  station.is24x7 ? 'Open 24/7' : '06:00 AM - 11:00 PM',
                  style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Address Row
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: CarviaColors.card,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on_outlined, color: CarviaColors.green, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      station.address,
                      style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Static Map Thumbnail Placeholder
            Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: CarviaColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned.fill(
                    child: Opacity(
                      opacity: 0.3,
                      child: Container(
                        color: const Color(0xFF0A1A14),
                      ),
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.map_rounded, color: CarviaColors.green, size: 36),
                      const SizedBox(height: 6),
                      Text(
                        'Lat: ${station.lat.toStringAsFixed(4)}, Lng: ${station.lng.toStringAsFixed(4)}',
                        style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Amenities
            const Text(
              'Station Amenities',
              style: TextStyle(
                color: CarviaColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: station.amenities.map((amenity) {
                return Chip(
                  label: Text(
                    amenity,
                    style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 12),
                  ),
                  backgroundColor: CarviaColors.card,
                  side: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Connectors Section
            const Text(
              'Charging Connectors',
              style: TextStyle(
                color: CarviaColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...station.connectors.map((connector) {
              final isAvailable = connector.status == 'available';

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: CarviaColors.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isAvailable ? CarviaColors.greenDim : Colors.white.withValues(alpha: 0.05),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: CarviaColors.surface,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.electrical_services, color: CarviaColors.green, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            connector.type,
                            style: const TextStyle(
                              color: CarviaColors.textPrimary,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${connector.powerKw} kW Fast Charger',
                            style: const TextStyle(
                              color: CarviaColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: isAvailable
                          ? () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ChargeScreen(
                                    station: station,
                                    connector: connector,
                                    initialCharging: true,
                                  ),
                                ),
                              );
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: CarviaColors.green,
                        foregroundColor: CarviaColors.bg,
                        disabledBackgroundColor: CarviaColors.surface,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                      child: Text(
                        isAvailable ? 'Start Charge' : connector.status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isAvailable ? CarviaColors.bg : CarviaColors.textMuted,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 24),

            // Cost Estimator Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: CarviaColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Cost Calculator',
                        style: TextStyle(
                          color: CarviaColors.textPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '₹${station.pricePerKwh.toStringAsFixed(1)} / kWh',
                        style: const TextStyle(
                          color: CarviaColors.green,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Target Energy: ${_targetKwh.round()} kWh',
                        style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 13),
                      ),
                      Text(
                        'Est: ₹${estimatedCost.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: CarviaColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: CarviaColors.green,
                      inactiveTrackColor: CarviaColors.surface,
                      thumbColor: CarviaColors.green,
                      overlayColor: CarviaColors.green.withValues(alpha: 0.2),
                    ),
                    child: Slider(
                      value: _targetKwh,
                      min: 5.0,
                      max: 80.0,
                      divisions: 15,
                      onChanged: (val) {
                        setState(() {
                          _targetKwh = val;
                        });
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
