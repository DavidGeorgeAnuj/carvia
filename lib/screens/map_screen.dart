import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:sliding_up_panel/sliding_up_panel.dart';

import '../data/mock_data.dart';
import '../models/ev_station.dart';
import '../theme/colors.dart';
import '../widgets/filter_chips_row.dart';
import 'station_detail_screen.dart';

class MapScreen extends StatefulWidget {
  final Function(EVStation)? onStartCharge;

  const MapScreen({super.key, this.onStartCharge});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _mapController;
  String? _mapStyle;
  EVStation? _selectedStation;
  final PanelController _panelController = PanelController();
  final TextEditingController _searchController = TextEditingController();

  final List<String> _activeFilters = [];
  Set<Marker> _markers = {};
  BitmapDescriptor? _greenMarker;
  BitmapDescriptor? _amberMarker;
  BitmapDescriptor? _redMarker;

  static const LatLng _bengaluruCenter = LatLng(12.9716, 77.5946);

  @override
  void initState() {
    super.initState();
    _loadMapStyle();
    _createCustomMarkers();
  }

  Future<void> _loadMapStyle() async {
    try {
      final style = await rootBundle.loadString('assets/map_style.json');
      setState(() {
        _mapStyle = style;
      });
    } catch (_) {}
  }

  Future<BitmapDescriptor> _createCircleMarker(Color color) async {
    final pictureRecorder = ui.PictureRecorder();
    final canvas = Canvas(pictureRecorder);
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    canvas.drawCircle(const Offset(24, 24), 18, paint);
    canvas.drawCircle(const Offset(24, 24), 18, borderPaint);

    final image = await pictureRecorder.endRecording().toImage(48, 48);
    final data = await image.toByteData(format: ui.ImageByteFormat.png);
    return BitmapDescriptor.fromBytes(data!.buffer.asUint8List());
  }

  Future<void> _createCustomMarkers() async {
    try {
      _greenMarker = await _createCircleMarker(CarviaColors.available);
      _amberMarker = await _createCircleMarker(CarviaColors.busy);
      _redMarker = await _createCircleMarker(CarviaColors.full);
    } catch (_) {
      _greenMarker = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      _amberMarker = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
      _redMarker = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
    }
    _buildMarkers();
  }

  void _buildMarkers() {
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

    final markers = filtered.map((station) {
      BitmapDescriptor icon = _greenMarker ?? BitmapDescriptor.defaultMarker;
      if (station.overallStatus == 'busy') {
        icon = _amberMarker ?? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
      } else if (station.overallStatus == 'full') {
        icon = _redMarker ?? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
      }

      return Marker(
        markerId: MarkerId(station.id),
        position: LatLng(station.lat, station.lng),
        icon: icon,
        infoWindow: InfoWindow(title: station.name, snippet: '${station.maxPowerKw} kW • ₹${station.pricePerKwh}/kWh'),
        onTap: () {
          setState(() {
            _selectedStation = station;
          });
          _panelController.animatePanelToPosition(1.0);
        },
      );
    }).toSet();

    setState(() {
      _markers = markers;
    });
  }

  void _toggleFilter(String filter) {
    setState(() {
      if (_activeFilters.contains(filter)) {
        _activeFilters.remove(filter);
      } else {
        _activeFilters.add(filter);
      }
      _buildMarkers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CarviaColors.bg,
      body: Stack(
        children: [
          // 1. Google Map
          GoogleMap(
            initialCameraPosition: const CameraPosition(
              target: _bengaluruCenter,
              zoom: 12.0,
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
            markers: _markers,
            style: _mapStyle,
            onMapCreated: (controller) {
              _mapController = controller;
            },
            onTap: (_) {
              if (_selectedStation != null) {
                setState(() {
                  _selectedStation = null;
                });
                _panelController.animatePanelToPosition(0.0);
              }
            },
          ),

          // 2. Search bar + Filters Row (Floating top)
          SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  decoration: BoxDecoration(
                    color: CarviaColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (_) => _buildMarkers(),
                    style: const TextStyle(color: CarviaColors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search stations, areas, networks...',
                      hintStyle: const TextStyle(color: CarviaColors.textMuted, fontSize: 14),
                      prefixIcon: const Icon(Icons.search, color: CarviaColors.green),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: CarviaColors.textSecondary, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                _buildMarkers();
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                  ),
                ),
                FilterChipsRow(
                  activeFilters: _activeFilters,
                  onToggle: _toggleFilter,
                ),
              ],
            ),
          ),

          // 3. Recenter FAB
          Positioned(
            right: 16,
            bottom: _selectedStation != null ? 300 : 100,
            child: FloatingActionButton.small(
              backgroundColor: CarviaColors.surface,
              foregroundColor: CarviaColors.green,
              onPressed: () {
                _mapController?.animateCamera(
                  CameraUpdate.newLatLngZoom(_bengaluruCenter, 12.0),
                );
              },
              child: const Icon(Icons.my_location),
            ),
          ),

          // 4. Sliding Up Panel for Selected Station
          SlidingUpPanel(
            controller: _panelController,
            minHeight: _selectedStation != null ? 280 : 0,
            maxHeight: 280,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
            color: CarviaColors.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
            panel: _selectedStation == null
                ? const SizedBox.shrink()
                : _buildStationSheetContent(_selectedStation!),
          ),
        ],
      ),
    );
  }

  Widget _buildStationSheetContent(EVStation station) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: CarviaColors.textMuted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Title & Network
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      station.name,
                      style: const TextStyle(
                        color: CarviaColors.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${station.network} • 2.3 km away',
                      style: const TextStyle(
                        color: CarviaColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: CarviaColors.card,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: CarviaColors.greenDim),
                ),
                child: Text(
                  '${station.maxPowerKw} kW',
                  style: const TextStyle(
                    color: CarviaColors.green,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Connectors + Price Row
          Row(
            children: [
              Text(
                '${station.availableConnectorsCount} of ${station.connectors.length} free',
                style: TextStyle(
                  color: station.availableConnectorsCount > 0 ? CarviaColors.green : CarviaColors.full,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              const SizedBox(width: 8),
              const Text('•', style: TextStyle(color: CarviaColors.textMuted)),
              const SizedBox(width: 8),
              Text(
                '₹${station.pricePerKwh.toStringAsFixed(1)} / kWh',
                style: const TextStyle(
                  color: CarviaColors.textPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              const Spacer(),
              Row(
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    station.rating.toString(),
                    style: const TextStyle(color: CarviaColors.textPrimary, fontSize: 13),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Amenities row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: station.amenities.map((a) {
                return Container(
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: CarviaColors.card,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    a,
                    style: const TextStyle(color: CarviaColors.textSecondary, fontSize: 11),
                  ),
                );
              }).toList(),
            ),
          ),
          const Spacer(),

          // Two Action Buttons: View Station (Outlined) & Start Charge (Filled Green)
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => StationDetailScreen(station: station),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: CarviaColors.green),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'View Station',
                    style: TextStyle(color: CarviaColors.green, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    if (widget.onStartCharge != null) {
                      widget.onStartCharge!(station);
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => StationDetailScreen(station: station),
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: CarviaColors.green,
                    foregroundColor: CarviaColors.bg,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'Start Charge',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
