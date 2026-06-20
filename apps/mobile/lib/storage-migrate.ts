import AsyncStorage from "@react-native-async-storage/async-storage";

/** Copy legacy AsyncStorage key to new key once, then remove legacy. */
export async function migrateStorageKey(newKey: string, legacyKey: string) {
  if (newKey === legacyKey) return;
  const current = await AsyncStorage.getItem(newKey);
  if (current != null) return;
  const legacy = await AsyncStorage.getItem(legacyKey);
  if (legacy == null) return;
  await AsyncStorage.setItem(newKey, legacy);
  await AsyncStorage.removeItem(legacyKey);
}
