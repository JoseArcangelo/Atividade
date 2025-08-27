import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

type ListaParticipantesRouteProp = RouteProp<
  RootStackParamList,
  "ListaParticipantes"
>;

type Props = {
  route: ListaParticipantesRouteProp;
};

type Participante = {
  id: string;
  name: string;
  email?: string;
  checkedIn: boolean;
};

const ListaParticipantesScreen = ({ route }: Props) => {
  const { itemId, title } = route.params;
  const [attendees, setAttendees] = useState<Participante[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await fetch(
          `http://172.16.1.235:5044/events/${itemId}/attendees`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJldmVudC1jaGVja2luLWFwaSIsInN1YiI6Im9wZXJhdG9yIiwiZXZlbnRJZCI6ImV2dF8xMjMiLCJpYXQiOjE3MjQ4ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.8b7cRrJq1u8hQWmF2Z0k3yV5aN4pX6sT9uE1L3cB7Dg",
            },
          }
        );

        const data = await response.json();
        setAttendees(
          Array.isArray(data.data)
            ? data.data.map((p: any) => ({
                id: p.id,
                name: p.name,
                email: p.email,
                checkedIn: !!p.checkedInAt, 
              }))
            : []
        );
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
      }
    };

    fetchAttendees();
  }, [itemId]);

  const confirmCheckIn = async (id: string) => {
    const participante = attendees.find((p) => p.id === id);
    if (!participante) return;

    Alert.alert(
      "Confirmação",
      `Deseja confirmar o check-in de ${participante.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const response = await fetch(
                `http://172.16.1.235:5044/events/${itemId}/checkin`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization:
                      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJldmVudC1jaGVja2luLWFwaSIsInN1YiI6Im9wZXJhdG9yIiwiZXZlbnRJZCI6ImV2dF8xMjMiLCJpYXQiOjE3MjQ4ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.8b7cRrJq1u8hQWmF2Z0k3yV5aN4pX6sT9uE1L3cB7Dg",
                  },
                  body: JSON.stringify({ attendeeId: id }),
                }
              );


              setAttendees((prev) =>
                prev.map((p) =>
                  p.id === id ? { ...p, checkedIn: true } : p
                )
              );
            } catch (error) {
              console.error(error);
              Alert.alert("Erro", "Não foi possível confirmar o check-in.");
            }
          },
        },
      ]
    );
  };

  const filteredAttendees = attendees.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCheckIn = attendees.filter((p) => p.checkedIn).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Participantes do evento: {title}</Text>

      <Text style={styles.counter}>
        Check-ins confirmados: {totalCheckIn} / {attendees.length}
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar"
        value={search}
        onChangeText={setSearch}
      />

      {filteredAttendees.length === 0 ? (
        <Text>Nenhum participante encontrado.</Text>
      ) : (
        <FlatList
          data={filteredAttendees}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                item.checkedIn && { backgroundColor: "#d4edda" },
              ]}
              onPress={() => confirmCheckIn(item.id)}
              disabled={item.checkedIn}
            >
              <Text style={styles.name}>{item.name}</Text>
              {item.email && <Text style={styles.email}>{item.email}</Text>}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 5, fontWeight: "bold" },
  counter: { fontSize: 16, marginBottom: 10, color: "#333" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 15,
  },
  card: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 6,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 14, color: "#666" },
});

export default ListaParticipantesScreen;
