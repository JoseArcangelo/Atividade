// App.tsx
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types/navigation";
import EventosScreen from "./screens/EventosScreen";
import ListaParticipantesScreen from "./screens/ListaParticipantesScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Eventos">
        <Stack.Screen
          name="Eventos"
          component={EventosScreen}
          options={{ title: "Eventos" }}
        />
        <Stack.Screen
          name="ListaParticipantes"
          component={ListaParticipantesScreen}
          options={{ title: "Lista de Participantes" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
