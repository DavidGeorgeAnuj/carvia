class ChargeSession {
  final String id;
  final String stationName;
  final String date;
  final double kwh;
  final double cost;
  final int durationMin;
  final String connector;

  ChargeSession({
    required this.id,
    required this.stationName,
    required this.date,
    required this.kwh,
    required this.cost,
    required this.durationMin,
    required this.connector,
  });

  factory ChargeSession.fromMap(Map<String, dynamic> map) {
    return ChargeSession(
      id: map['id'] as String,
      stationName: map['stationName'] as String,
      date: map['date'] as String,
      kwh: (map['kwh'] as num).toDouble(),
      cost: (map['cost'] as num).toDouble(),
      durationMin: map['duration_min'] as int,
      connector: map['connector'] as String,
    );
  }
}
