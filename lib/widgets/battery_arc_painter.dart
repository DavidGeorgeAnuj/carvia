import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/colors.dart';

class BatteryArcPainter extends CustomPainter {
  final double percent; // 0.0 to 1.0

  BatteryArcPainter({required this.percent});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 12;

    // 270 degrees arc: from 135 deg (3*pi/4) to 405 deg (9*pi/4)
    const double startAngle = 3 * pi / 4;
    const double sweepAngle = 3 * pi / 2; // 270 degrees

    // Background arc
    final bgPaint = Paint()
      ..color = CarviaColors.surface
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      bgPaint,
    );

    // Color based on percentage
    final Color progressColor;
    if (percent > 0.50) {
      progressColor = CarviaColors.green;
    } else if (percent >= 0.20) {
      progressColor = CarviaColors.busy;
    } else {
      progressColor = CarviaColors.full;
    }

    // Active fill arc
    final activePaint = Paint()
      ..color = progressColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;

    final double activeSweep = sweepAngle * percent.clamp(0.0, 1.0);
    if (activeSweep > 0) {
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        activeSweep,
        false,
        activePaint,
      );
    }

    // Center text - Percent
    final percentText = '${(percent * 100).round()}%';
    final percentPainter = TextPainter(
      text: TextSpan(
        text: percentText,
        style: const TextStyle(
          color: CarviaColors.textPrimary,
          fontSize: 32,
          fontWeight: FontWeight.bold,
          letterSpacing: -1,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    percentPainter.paint(
      canvas,
      Offset(
        center.dx - percentPainter.width / 2,
        center.dy - percentPainter.height / 2 - 8,
      ),
    );

    // Subtitle text - State of Charge
    final labelPainter = TextPainter(
      text: const TextSpan(
        text: 'State of Charge',
        style: TextStyle(
          color: CarviaColors.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    labelPainter.paint(
      canvas,
      Offset(
        center.dx - labelPainter.width / 2,
        center.dy + percentPainter.height / 2 - 4,
      ),
    );
  }

  @override
  bool shouldRepaint(covariant BatteryArcPainter oldDelegate) {
    return oldDelegate.percent != percent;
  }
}
