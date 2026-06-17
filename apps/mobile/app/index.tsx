import { Redirect } from "expo-router";

export default function NativeEntryRedirect() {
  return <Redirect href="/(tabs)" />;
}
