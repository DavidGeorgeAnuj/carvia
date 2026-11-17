import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'models/ev_station.dart';
import 'screens/charge_screen.dart';
import 'screens/garage_screen.dart';
import 'screens/map_screen.dart';
import 'screens/stations_screen.dart';
import 'theme/colors.dart';
import 'widgets/custom_tab_bar.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CarviaApp());
}

class CarviaApp extends StatelessWidget {
  const CarviaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CARVIA',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: CarviaColors.bg,
        colorScheme: const ColorScheme.dark(
          primary: CarviaColors.green,
          surface: CarviaColors.surface,
        ),
        textTheme: GoogleFonts.interTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  EVStation? _selectedChargeStation;

  void _onStartChargeFromMap(EVStation station) {
    setState(() {
      _selectedChargeStation = station;
      _currentIndex = 2; // Switch to Charge tab
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      MapScreen(onStartCharge: _onStartChargeFromMap),
      StationsScreen(onSelectStation: _onStartChargeFromMap),
      ChargeScreen(
        station: _selectedChargeStation,
        initialCharging: _selectedChargeStation != null,
        onFindStation: () {
          setState(() {
            _currentIndex = 0; // Go to Map
          });
        },
      ),
      const GarageScreen(),
    ];

    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: CustomTabBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
