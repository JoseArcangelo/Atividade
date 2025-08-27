import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

interface Stats {
  total: number;
  checkedIn: number;
  absent: number;
}

interface Evento {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  stats: Stats;
}

type Props = NativeStackScreenProps<RootStackParamList, "Eventos">;

export default function EventosScreen({ navigation }: Props) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEventos = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setErrorMsg(null);

      const response = await fetch("http://172.16.1.235:5044/events", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJldmVudC1jaGVja2luLWFwaSIsInN1YiI6Im9wZXJhdG9yIiwiZXZlbnRJZCI6ImV2dF8xMjMiLCJpYXQiOjE3MjQ4ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.8b7cRrJq1u8hQWmF2Z0k3yV5aN4pX6sT9uE1L3cB7Dg",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: Evento[] = await response.json();
      setEventos(data);
    } catch (error: any) {
      console.error("Erro ao buscar eventos:", error.message);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const irListaParticipantes = (eventId: string, title: string) => {
    navigation.navigate("ListaParticipantes", {
      itemId: eventId,
      title: title,
    });
  };

  const renderItem = ({ item }: { item: Evento }) => (
    <View style={styles.eventCard}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>
        {new Date(item.startsAt).toLocaleString()} -{" "}
        {new Date(item.endsAt).toLocaleString()}
      </Text>
      <Text>{item.location}</Text>
      <View style={styles.kpiContainer}>
        <Text>Total: {item.stats.total}</Text>
        <Text>Presentes: {item.stats.checkedIn}</Text>
        <Text>Ausentes: {item.stats.absent}</Text>
      </View>
      <Button
        title="Listar Participantes"
        onPress={() => irListaParticipantes(item.id, item.title)}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando eventos...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Erro: {errorMsg}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={eventos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 20 }}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        fetchEventos();
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  eventCard: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  kpiContainer: { marginVertical: 10 },
  error: { color: "red", fontSize: 16 },
});
