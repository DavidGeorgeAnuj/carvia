import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../theme/colors.dart';
import '../widgets/battery_arc_painter.dart';

class GarageScreen extends StatelessWidget {
  const GarageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vehicle = userVehicles.first;

    return Scaffold(
      backgroundColor: CarviaColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'My Garage',
          style: TextStyle(
            color: CarviaColors.textPrimary,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 100, top: 4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section 1 — Active Vehicle Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: CarviaColors.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              vehicle.name,
                              style: const TextStyle(
                                color: CarviaColors.textPrimary,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              vehicle.reg,
                              style: const TextStyle(
                                color: CarviaColors.green,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.speed, color: CarviaColors.textSecondary, size: 16),
                                const SizedBox(width: 6),
                                Text(
                                  '${vehicle.rangeKm} km remaining',
                                  style: const TextStyle(
                                    color: CarviaColors.textPrimary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        width: 80,
                        height: 80,
                        child: CustomPaint(
                          painter: BatteryArcPainter(
                            percent: vehicle.socPercent / 100.0,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: CarviaColors.surface),
                  const SizedBox(height: 6),
                  const Row(
                    children: [
                      Icon(Icons.history, color: CarviaColors.textMuted, size: 16),
                      SizedBox(width: 8),
                      Text(
                        'Last charged: Yesterday, Whitefield Hub',
                        style: TextStyle(color: CarviaColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 2 — My Vehicles
            const Text(
              'My Vehicles',
              style: TextStyle(
                color: CarviaColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 110,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: userVehicles.length + 1,
                itemBuilder: (context, index) {
                  if (index < userVehicles.length) {
                    final v = userVehicles[index];
                    return Container(
                      width: 220,
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: CarviaColors.card,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: CarviaColors.greenDim),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                v.name,
                                style: const TextStyle(
                                  color: CarviaColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              const Icon(Icons.check_circle, color: CarviaColors.green, size: 18),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: CarviaColors.surface,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  v.connector,
                                  style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 11),
                                ),
                              ),
                              Text(
                                '${v.socPercent}% SoC',
                                style: const TextStyle(
                                  color: CarviaColors.green,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }
                  // Add Vehicle Card
                  return Container(
                    width: 140,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: CarviaColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {},
                        child: const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_circle_outline, color: CarviaColors.green, size: 28),
                            SizedBox(height: 6),
                            Text(
                              'Add Vehicle',
                              style: TextStyle(color: CarviaColors.textSecondary, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Section 3 — Wallet
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
              decoration: BoxDecoration(
                color: CarviaColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: CarviaColors.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.account_balance_wallet, color: CarviaColors.green, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CARVIA Wallet',
                        style: TextStyle(color: CarviaColors.textSecondary, fontSize: 12),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '₹${walletBalance.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: CarviaColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: CarviaColors.green),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    ),
                    child: const Text('Add Money', style: TextStyle(color: CarviaColors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 4 — Charging History
            const Text(
              'Recent Sessions',
              style: TextStyle(
                color: CarviaColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...chargingHistory.map((session) {
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: CarviaColors.card,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: CarviaColors.surface,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.bolt, color: CarviaColors.green, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            session.stationName,
                            style: const TextStyle(
                              color: CarviaColors.textPrimary,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${session.date} • ${session.durationMin} mins',
                            style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '₹${session.cost.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: CarviaColors.textPrimary,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${session.kwh} kWh',
                          style: const TextStyle(color: CarviaColors.green, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 24),

            // Section 5 — Settings
            const Text(
              'Preferences & Account',
              style: TextStyle(
                color: CarviaColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: CarviaColors.card,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  _buildSettingTile(Icons.notifications_none, 'Notifications', trailing: 'Enabled'),
                  const Divider(color: CarviaColors.surface, height: 1),
                  _buildSettingTile(Icons.ev_station_outlined, 'Default Connector', trailing: 'CCS2'),
                  const Divider(color: CarviaColors.surface, height: 1),
                  _buildSettingTile(Icons.home_outlined, 'Home Tariff', trailing: '₹7.50 / kWh'),
                  const Divider(color: CarviaColors.surface, height: 1),
                  _buildSettingTile(Icons.person_outline, 'Account Details'),
                  const Divider(color: CarviaColors.surface, height: 1),
                  _buildSettingTile(Icons.help_outline, 'Help & 24/7 Support'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingTile(IconData icon, String title, {String? trailing}) {
    return ListTile(
      leading: Icon(icon, color: CarviaColors.textSecondary, size: 22),
      title: Text(
        title,
        style: const TextStyle(color: CarviaColors.textPrimary, fontSize: 14),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (trailing != null)
            Text(
              trailing,
              style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 13),
            ),
          const SizedBox(width: 6),
          const Icon(Icons.arrow_forward_ios, color: CarviaColors.textMuted, size: 14),
        ],
      ),
      onTap: () {},
    );
  }
}
