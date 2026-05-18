import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { demoDoctors } from "@pal-dental/shared";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Palestine Dental Directory</Text>
        <Text style={styles.title}>Find nearby dentists from your phone.</Text>
        <Text style={styles.copy}>
          React Native patient experience for search, doctor discovery, and guest
          appointment requests.
        </Text>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>City</Text>
          <Text>Ramallah</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Specialty</Text>
          <Text>Orthodontics</Text>
        </View>
      </View>

      <View style={styles.stack}>
        {demoDoctors.map((doctor) => (
          <Link href={`/doctor/${doctor.id}`} asChild key={doctor.id}>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{doctor.name}</Text>
              <Text style={styles.cardMeta}>
                {doctor.specialty} - {doctor.city}
              </Text>
              <Text style={styles.cardMeta}>
                {doctor.isFeatured ? "Featured" : "Directory listing"} - Rating {doctor.rating}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    gap: 18
  },
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    gap: 12
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.3,
    color: "#0e766e",
    textTransform: "uppercase"
  },
  title: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "700",
    color: "#18342f"
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: "#506560"
  },
  filterRow: {
    flexDirection: "row",
    gap: 12
  },
  field: {
    flex: 1,
    backgroundColor: "#fffaf2",
    borderRadius: 18,
    padding: 16
  },
  fieldLabel: {
    fontSize: 12,
    color: "#6f7d79",
    marginBottom: 6
  },
  stack: {
    gap: 14
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    gap: 8
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#18342f"
  },
  cardMeta: {
    fontSize: 15,
    color: "#5d726d"
  }
});
