import React, { useEffect } from "react";
import { CalendarScreen } from "../../src/screens/CalendarScreen";
import { useFocusEffect } from "@react-navigation/native";

export default function Calendar() {
  // Refresh calendar data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      // CalendarScreen will handle refresh via its own useEffect
      console.log('Calendar tab focused');
    }, [])
  );

  return <CalendarScreen />;
}
