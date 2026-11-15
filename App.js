import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

// Importăm ecranele direct din fișierele aflate în folderul principal
import HomeScreen from './HomeScreen';
import AddPartScreen from './AddPartScreen';
import AddCarScreen from './AddCarScreen';
import StockScreen from './StockScreen';
import SalesScreen from './SalesScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen navigateTo={setCurrentScreen} />;
      case 'addPart':
        return <AddPartScreen goBack={() => setCurrentScreen('home')} />;
      case 'addCar':
        return <AddCarScreen goBack={() => setCurrentScreen('home')} />;
      case 'stock':
        return <StockScreen goBack={() => setCurrentScreen('home')} />;
      case 'sales':
        return <SalesScreen goBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen navigateTo={setCurrentScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1115" />
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  content: {
    flex: 1,
  },
});
    
