class Connector {
  final String type; // CCS2, Type2AC, CHAdeMO
  final int powerKw;
  final String status; // available, busy, full

  Connector({
    required this.type,
    required this.powerKw,
    required this.status,
  });

  factory Connector.fromMap(Map<String, dynamic> map) {
    return Connector(
      type: map['type'] as String,
      powerKw: map['power_kw'] as int,
      status: map['status'] as String,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type,
      'power_kw': powerKw,
      'status': status,
    };
  }
}

class EVStation {
  final String id;
  final String name;
  final String network;
  final double lat;
  final double lng;
  final String address;
  final List<Connector> connectors;
  final double pricePerKwh;
  final List<String> amenities;
  final bool is24x7;
  final double rating;

  EVStation({
    required this.id,
    required this.name,
    required this.network,
    required this.lat,
    required this.lng,
    required this.address,
    required this.connectors,
    required this.pricePerKwh,
    required this.amenities,
    required this.is24x7,
    required this.rating,
  });

  int get maxPowerKw {
    if (connectors.isEmpty) return 0;
    return connectors.map((c) => c.powerKw).reduce((a, b) => a > b ? a : b);
  }

  int get availableConnectorsCount {
    return connectors.where((c) => c.status == 'available').length;
  }

  String get overallStatus {
    if (connectors.any((c) => c.status == 'available')) return 'available';
    if (connectors.any((c) => c.status == 'busy')) return 'busy';
    return 'full';
  }

  factory EVStation.fromMap(Map<String, dynamic> map) {
    return EVStation(
      id: map['id'] as String,
      name: map['name'] as String,
      network: map['network'] as String,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      address: map['address'] as String,
      connectors: (map['connectors'] as List<dynamic>)
          .map((c) => Connector.fromMap(c as Map<String, dynamic>))
          .toList(),
      pricePerKwh: (map['price_per_kwh'] as num).toDouble(),
      amenities: List<String>.from(map['amenities'] as List),
      is24x7: map['is_24x7'] as bool,
      rating: (map['rating'] as num).toDouble(),
    );
  }
}
