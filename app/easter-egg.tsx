import EasterEggScreen from '../src/screens/EasterEggScreen';
import { Stack } from 'expo-router';

export default function EasterEggRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EasterEggScreen />
    </>
  );
}
