import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { whatsappHref } from "../lib/site-contact";

type EmptyStateCTAProps = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  whatsappMessage?: string;
  tips?: string[];
};

export function EmptyStateCTA({
  icon = "inbox",
  title,
  description,
  primaryHref = "/join",
  primaryLabel = "انضم كشريك",
  secondaryHref,
  secondaryLabel,
  whatsappMessage = "مرحباً، أريد الانضمام لمنصة ملامح.ps",
  tips,
}: EmptyStateCTAProps) {
  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: theme.radius.xxl,
        padding: 28,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: theme.border,
        borderStyle: "dashed",
        ...theme.shadow.card,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: theme.tealMuted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Feather name={icon} size={24} color={theme.teal} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: "900", color: theme.text, textAlign: "center" }}>{title}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textSoft, textAlign: "center", marginTop: 8, lineHeight: 22 }}>
        {description}
      </Text>
      {tips?.length ? (
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {tips.map((tip) => (
            <View key={tip} style={{ backgroundColor: theme.borderLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: theme.textSoft }}>{tip}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={{ gap: 10, marginTop: 18, width: "100%" }}>
        <Pressable
          onPress={() => router.push(primaryHref as any)}
          style={{ backgroundColor: theme.teal, borderRadius: 14, paddingVertical: 13, alignItems: "center", flexDirection: "row-reverse", justifyContent: "center", gap: 6 }}
        >
          <Text style={{ color: theme.white, fontWeight: "900", fontSize: 14 }}>{primaryLabel}</Text>
          <Feather name="arrow-left" size={16} color={theme.white} />
        </Pressable>
        {secondaryHref && secondaryLabel ? (
          <Pressable
            onPress={() => router.push(secondaryHref as any)}
            style={{ backgroundColor: theme.borderLight, borderRadius: 14, paddingVertical: 13, alignItems: "center", borderWidth: 1, borderColor: theme.border }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 14 }}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => void Linking.openURL(whatsappHref(whatsappMessage))}
          style={{ backgroundColor: "#ecfdf5", borderRadius: 14, paddingVertical: 13, alignItems: "center", flexDirection: "row-reverse", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "#a7f3d0" }}
        >
          <Feather name="message-circle" size={16} color="#047857" />
          <Text style={{ color: "#047857", fontWeight: "900", fontSize: 14 }}>واتساب</Text>
        </Pressable>
      </View>
    </View>
  );
}
