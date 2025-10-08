import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { HomeScreen } from "../../src/screens/HomeScreen";
import { initDatabase } from "../../src/lib/database";

/**
 * Home tab - displays the main goal management screen
 */
export default function TabOneScreen() {
  const [_dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initialize database on component mount
  useEffect(() => {
    const initDb = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown database error";
        setDbError(errorMessage);
        console.error("Failed to initialize database:", error);
      }
    };

    initDb();
  }, []);

  if (dbError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Database Error: {dbError}</Text>
      </View>
    );
  }

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
