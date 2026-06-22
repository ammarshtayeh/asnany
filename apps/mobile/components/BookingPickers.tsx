import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

function FieldShell({ label, value, placeholder, onPress }: { label: string; value: string; placeholder: string; onPress: () => void }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={{
          minHeight: 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          paddingHorizontal: 14,
          paddingVertical: 12,
          justifyContent: "center",
        }}
      >
        <Text style={{ textAlign: "right", fontWeight: "700", color: value ? "#0f172a" : "#94a3b8" }}>{value || placeholder}</Text>
      </Pressable>
    </View>
  );
}

export function BookingDateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [show, setShow] = useState(false);
  const selected = value ? new Date(`${value}T12:00:00`) : new Date();

  const onPick = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (event.type === "dismissed" || !date) return;
    const iso = date.toISOString().split("T")[0];
    onChange(iso);
  };

  return (
    <>
      <FieldShell label={label} value={value} placeholder="اختر التاريخ" onPress={() => setShow(true)} />
      {show ? (
        <DateTimePicker value={selected} mode="date" minimumDate={new Date()} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onPick} />
      ) : null}
    </>
  );
}

export function BookingTimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [show, setShow] = useState(false);
  const selected = new Date();
  if (value) {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      selected.setHours(Number(match[1]), Number(match[2]), 0, 0);
    }
  }

  const onPick = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (event.type === "dismissed" || !date) return;
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "مساءً" : "صباحاً";
    const hour12 = hours % 12 || 12;
    onChange(`${hour12}:${minutes} ${period}`);
  };

  return (
    <>
      <FieldShell label={label} value={value} placeholder="اختر الوقت" onPress={() => setShow(true)} />
      {show ? (
        <DateTimePicker value={selected} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onPick} />
      ) : null}
    </>
  );
}
