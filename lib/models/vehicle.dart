class Vehicle {
  final String name;
  final String reg;
  final double batteryKwh;
  final int socPercent;
  final int rangeKm;
  final String connector;
  final int color;

  Vehicle({
    required this.name,
    required this.reg,
    required this.batteryKwh,
    required this.socPercent,
    required this.rangeKm,
    required this.connector,
    required this.color,
  });

  factory Vehicle.fromMap(Map<String, dynamic> map) {
    return Vehicle(
      name: map['name'] as String,
      reg: map['reg'] as String,
      batteryKwh: (map['battery_kwh'] as num).toDouble(),
      socPercent: map['soc_percent'] as int,
      rangeKm: map['range_km'] as int,
      connector: map['connector'] as String,
      color: map['color'] as int,
    );
  }
}
