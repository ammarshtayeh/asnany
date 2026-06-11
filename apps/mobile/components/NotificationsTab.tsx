import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

interface NotificationsTabProps {
  notificationsEnabled: boolean;
  requestNotificationPermission: () => void;
  triggerTestNotification: () => void;
}

export default function NotificationsTab({
  notificationsEnabled,
  requestNotificationPermission,
  triggerTestNotification
}: NotificationsTabProps) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🔔 مركز تنبيهات ملامح.ps</Text>
        <Text style={styles.bioText}>قم بتفعيل التنبيهات على هاتفك لتصلك إشعارات حية حول العروض والخصومات وحجوزات عيادتك فوراً.</Text>

        <View style={styles.notificationStatusBox}>
          <Text style={styles.statusLabelText}>حالة التنبيهات في الهاتف حالياً:</Text>
          <View style={[styles.statusIndicator, { backgroundColor: notificationsEnabled ? "#ecfdf5" : "#fef2f2" }]}>
            <Text style={[styles.statusIndicatorText, { color: notificationsEnabled ? "#047857" : "#ef4444" }]}>
              {notificationsEnabled ? "مفعلة ونشطة بالكامل ✅" : "غير مفعلة حالياً ❌"}
            </Text>
          </View>
        </View>

        {!notificationsEnabled ? (
          <Pressable onPress={requestNotificationPermission} style={[styles.button, { backgroundColor: "#0d9488" }]}>
            <Text style={styles.buttonText}>🔔 طلب الإذن وتفعيل التنبيهات الآن</Text>
          </Pressable>
        ) : (
          <View style={{ gap: 10 }}>
            <Pressable onPress={triggerTestNotification} style={[styles.button, { backgroundColor: "#0f172a" }]}>
              <Text style={styles.buttonText}>🚀 إرسال تنبيه تجريبي لهاتفي فوراً</Text>
            </Pressable>
            <Text style={styles.testDescText}>انقر على الزر أعلاه لتلقي إشعار فوري وتجربة نظام التنبيهات المعتمد في التطبيق.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: 16
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingBottom: 8,
    textAlign: "right"
  },
  bioText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "right",
    lineHeight: 20
  },
  notificationStatusBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 10
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b"
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14
  },
  statusIndicatorText: {
    fontSize: 12,
    fontWeight: "900"
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900"
  },
  testDescText: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "600"
  }
});
