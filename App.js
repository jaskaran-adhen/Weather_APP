import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);                                         

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          setLoading(false);
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const { latitude, longitude } = loc.coords;

        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        const city = geocode[0]?.city || geocode[0]?.region || 'Unknown Location';
        setCityName(city);

        // Get weather data
        const API_KEY = 'eeb493e0f70288c2047cd5783c04167b'; 
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

        const res = await axios.get(url);
        setWeather(res.data);
      } catch (err) {
        setErrorMsg('Could not fetch weather or location data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
  if (errorMsg) return <Text style={styles.error}>{errorMsg}</Text>;

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1050&q=80' }}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Text style={styles.city}>{cityName}</Text>
        <Text style={styles.temp}>{weather.main.temp}°C</Text>
        <Text style={styles.desc}>{weather.weather[0].description}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  background: { flex: 1, resizeMode: 'cover' },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  city: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  temp: { fontSize: 60, color: '#fff', fontWeight: '300' },
  desc: { fontSize: 24, fontStyle: 'italic', color: '#eee' },
  error: { flex: 1, justifyContent: 'center', textAlign: 'center', marginTop: 50, fontSize: 18, color: 'red' },
});
