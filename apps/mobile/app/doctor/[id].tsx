import { Stack, useLocalSearchParams } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { demoDoctors } from "@pal-dental/shared";

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctor = demoDoctors.find((entry) => entry.id === id);

  if (!doctor) {
    return (
      <View style={styles.page}>
        <Text style={styles.title}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: doctor.name }} />
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>{doctor.name}</Text>
        <Text style={styles.subtitle}>
          {doctor.specialty} - {doctor.area}, {doctor.city}
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Clinic details</Text>
          <Text style={styles.item}>{doctor.address}</Text>
          <Text style={styles.item}>Phone: {doctor.phone}</Text>
          <Text style={styles.item}>
            Insurance:{" "}
            {doctor.acceptsInsurance ? doctor.insuranceList.join(", ") : "Not listed"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Working hours</Text>
          {Object.entries(doctor.workingHours).map(([day, slot]) => (
            <Text style={styles.item} key={day}>
              {day}: {slot.closed ? "Closed" : `${slot.open} - ${slot.close}`}
            </Text>
          ))}
        </View>

        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL(`https://wa.me/${doctor.whatsapp.replace("+", "")}`)}
        >
          <Text style={styles.buttonText}>Request appointment on WhatsApp</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#18342f"
  },
  subtitle: {
    fontSize: 16,
    color: "#5d726d"
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#18342f"
  },
  item: {
    fontSize: 15,
    lineHeight: 22,
    color: "#526662"
  },
  button: {
    backgroundColor: "#0e766e",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700"
  }
});
