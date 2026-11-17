import 'dart:async';
import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/ev_station.dart';
import '../theme/colors.dart';
import '../widgets/battery_arc_painter.dart';

enum ChargingState { idle, connecting, charging, complete }

class ChargeScreen extends StatefulWidget {
  final EVStation? station;
  final Connector? connector;
  final bool initialCharging;
  final VoidCallback? onFindStation;

  const ChargeScreen({
    super.key,
    this.station,
    this.connector,
    this.initialCharging = false,
    this.onFindStation,
  });

  @override
  State<ChargeScreen> createState() => _ChargeScreenState();
}

class _ChargeScreenState extends State<ChargeScreen> with SingleTickerProviderStateMixin {
  ChargingState _state = ChargingState.idle;
  EVStation? _station;
  Connector? _connector;

  late AnimationController _animController;
  Timer? _ticker;

  double _kwhDelivered = 0.0;
  int _elapsedSeconds = 0;
  double _liveCost = 0.0;
  double _currentSoc = 0.67; // starts at 67%
  double _pricePerKwh = 16.0;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 300),
    );

    if (widget.initialCharging && widget.station != null) {
      _startSession(widget.station!, widget.connector);
    }
  }

  void _startSession(EVStation station, Connector? connector) {
    setState(() {
      _state = ChargingState.connecting;
      _station = station;
      _connector = connector ?? station.connectors.first;
      _pricePerKwh = station.pricePerKwh;
      _kwhDelivered = 0.0;
      _elapsedSeconds = 0;
      _liveCost = 0.0;
      _currentSoc = 0.67;
    });

    // Simulate 1.5s connecting delay
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      setState(() {
        _state = ChargingState.charging;
      });
      _animController.forward(from: _currentSoc);

      _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }
        setState(() {
          _elapsedSeconds += 1;
          const double deltaKwh = 48.0 / 3600.0; // ~0.0133 kWh/sec
          _kwhDelivered += deltaKwh;
          _liveCost += deltaKwh * _pricePerKwh;
          _currentSoc = (_currentSoc + (deltaKwh / 40.5)).clamp(0.0, 1.0); // 40.5kWh battery
        });
      });
    });
  }

  void _stopSession() {
    _ticker?.cancel();
    _animController.stop();
    setState(() {
      _state = ChargingState.complete;
    });
  }

  void _resetToIdle() {
    setState(() {
      _state = ChargingState.idle;
      _station = null;
      _connector = null;
    });
  }

  String _formatDuration(int seconds) {
    final int min = seconds ~/ 60;
    final int sec = seconds % 60;
    final int hr = min ~/ 60;
    if (hr > 0) {
      return '${hr}h ${min % 60}m ${sec}s';
    }
    return '${min.toString().padLeft(2, '0')}:${sec.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CarviaColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Live Charging',
          style: TextStyle(
            color: CarviaColors.textPrimary,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: _buildBody(),
        ),
      ),
    );
  }

  Widget _buildBody() {
    switch (_state) {
      case ChargingState.idle:
        return _buildIdleView();
      case ChargingState.connecting:
        return _buildConnectingView();
      case ChargingState.charging:
        return _buildChargingView();
      case ChargingState.complete:
        return _buildCompleteView();
    }
  }

  Widget _buildIdleView() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: CarviaColors.surface,
              shape: BoxShape.circle,
              border: Border.all(color: CarviaColors.green.withValues(alpha: 0.2), width: 2),
            ),
            child: const Icon(
              Icons.power_rounded,
              color: CarviaColors.green,
              size: 64,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'No Active Session',
            style: TextStyle(
              color: CarviaColors.textPrimary,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Go to Stations or Map to plug in and charge',
            style: TextStyle(
              color: CarviaColors.textSecondary,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          OutlinedButton.icon(
            onPressed: widget.onFindStation,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: CarviaColors.green, width: 1.5),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.search, color: CarviaColors.green),
            label: const Text(
              'Find a Station',
              style: TextStyle(color: CarviaColors.green, fontWeight: FontWeight.bold, fontSize: 15),
            ),
          ),
          const SizedBox(height: 16),
          // Debug button to simulate immediately
          TextButton(
            onPressed: () => _startSession(evStations.first, null),
            child: const Text(
              'Simulate Session (Debug)',
              style: TextStyle(color: CarviaColors.textMuted, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnectingView() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: CarviaColors.green),
          const SizedBox(height: 24),
          const Text(
            'Handshaking with Charger...',
            style: TextStyle(
              color: CarviaColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _station?.name ?? 'EV Station',
            style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildChargingView() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 8),

          // Station & Connector Header
          Text(
            _station?.name ?? 'Charging Hub',
            style: const TextStyle(
              color: CarviaColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            '${_connector?.type ?? "CCS2"} • ${_station?.network ?? "Fast Network"}',
            style: const TextStyle(
              color: CarviaColors.green,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 24),

          // Battery Arc
          SizedBox(
            width: 260,
            height: 260,
            child: CustomPaint(
              painter: BatteryArcPainter(percent: _currentSoc),
            ),
          ),
          const SizedBox(height: 16),

          // Power readout row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: CarviaColors.surface,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              '48.2 kW  •  412V  •  117A',
              style: TextStyle(
                color: CarviaColors.textSecondary,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 24),

          // 3 Stat tiles row
          Row(
            children: [
              _buildStatTile(
                'Energy Delivered',
                '${_kwhDelivered.toStringAsFixed(2)} kWh',
              ),
              const SizedBox(width: 10),
              _buildStatTile(
                'Elapsed Time',
                _formatDuration(_elapsedSeconds),
              ),
              const SizedBox(width: 10),
              _buildStatTile(
                'Live Cost',
                '₹${_liveCost.toStringAsFixed(2)}',
              ),
            ],
          ),
          const SizedBox(height: 36),

          // Stop Charging Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _stopSession,
              style: ElevatedButton.styleFrom(
                backgroundColor: CarviaColors.full,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 4,
              ),
              child: const Text(
                'STOP CHARGING',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStatTile(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: CarviaColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                color: CarviaColors.green,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                color: CarviaColors.textMuted,
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompleteView() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: CarviaColors.green.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline, color: CarviaColors.green, size: 64),
          ),
          const SizedBox(height: 20),
          const Text(
            'Session Complete!',
            style: TextStyle(
              color: CarviaColors.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Charged to ${(_currentSoc * 100).round()}% SoC',
            style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: CarviaColors.card,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                _buildSummaryRow('Total Energy', '${_kwhDelivered.toStringAsFixed(2)} kWh'),
                const Divider(color: CarviaColors.surface),
                _buildSummaryRow('Duration', _formatDuration(_elapsedSeconds)),
                const Divider(color: CarviaColors.surface),
                _buildSummaryRow('Total Paid', '₹${_liveCost.toStringAsFixed(2)}'),
              ],
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _resetToIdle,
              style: ElevatedButton.styleFrom(
                backgroundColor: CarviaColors.green,
                foregroundColor: CarviaColors.bg,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('DONE', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 14)),
        Text(value, style: const TextStyle(color: CarviaColors.textPrimary, fontSize: 15, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
