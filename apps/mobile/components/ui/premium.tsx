import { ReactNode } from "react";
import { Image, Pressable, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

type IconName = keyof typeof Feather.glyphMap;

export const ui = {
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.borderLight,
    ...theme.shadow.card,
  } as ViewStyle,
  cardElevated: {
    backgroundColor: theme.cardGlass,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.8)",
    ...theme.shadow.float,
  } as ViewStyle,
  h1: { fontSize: 30, fontWeight: "900" as const, color: theme.text, textAlign: "right" as const, letterSpacing: -0.5 },
  h2: { fontSize: 19, fontWeight: "900" as const, color: theme.text, textAlign: "right" as const, letterSpacing: -0.3 },
  body: { fontSize: 14, fontWeight: "600" as const, color: theme.textMuted, textAlign: "right" as const, lineHeight: 22 },
  caption: { fontSize: 11, fontWeight: "700" as const, color: theme.textSoft, textAlign: "right" as const },
};

export function MalamihLogo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const box = size === "sm" ? 38 : size === "lg" ? 56 : 46;
  const title = size === "sm" ? 18 : size === "lg" ? 26 : 22;

  return (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
      <Image
        source={require("../../assets/logo-mark.png")}
        style={{
          width: box,
          height: box,
          borderRadius: box / 2,
          backgroundColor: "#f7f5f0",
        }}
        resizeMode="cover"
      />
      {showText ? (
        <Text style={{ fontSize: title, fontWeight: "900", color: theme.white }}>
          ملامح<Text style={{ color: theme.gold }}>.ps</Text>
        </Text>
      ) : null}
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, flex: 1 }}>
          {icon ? (
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
              <Feather name={icon} size={16} color={theme.teal} />
            </View>
          ) : null}
          <Text style={ui.h2}>{title}</Text>
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction}>
            <Text style={{ fontSize: 12, fontWeight: "900", color: theme.teal }}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? <Text style={[ui.caption, { marginTop: 4 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function SearchField({ style, ...props }: TextInputProps) {
  return (
    <View style={[ui.cardElevated, { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, minHeight: 54 }, style]}>
      <Feather name="search" size={18} color={theme.teal} style={{ marginLeft: 10 }} />
      <TextInput
        placeholderTextColor={theme.textSoft}
        style={{ flex: 1, textAlign: "right", fontWeight: "700", fontSize: 14, color: theme.text, height: 52 }}
        {...props}
      />
    </View>
  );
}

export function SurfaceCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[ui.card, { padding: 16 }, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  style,
  icon,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: theme.teal,
          borderRadius: theme.radius.md,
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: pressed ? 0.92 : 1,
          shadowColor: theme.teal,
          shadowOpacity: 0.28,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 16,
          elevation: 3,
        },
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={18} color={theme.white} /> : null}
      <Text style={{ color: theme.white, fontWeight: "900", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, style }: { label: string; onPress: () => void; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: theme.card,
          borderRadius: theme.radius.md,
          paddingVertical: 14,
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: theme.border,
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: theme.text, fontWeight: "900", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <SurfaceCard style={{ alignItems: "center", paddingVertical: 36, borderStyle: "dashed" }}>
      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Feather name={icon} size={24} color={theme.teal} />
      </View>
      <Text style={[ui.h2, { textAlign: "center" }]}>{title}</Text>
      {description ? <Text style={[ui.body, { textAlign: "center", marginTop: 6 }]}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={{ marginTop: 16, backgroundColor: theme.teal, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ color: theme.white, fontWeight: "900", fontSize: 13 }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </SurfaceCard>
  );
}

export function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.teal : theme.card,
        borderWidth: 1,
        borderColor: active ? theme.teal : theme.border,
      }}
    >
      <Text style={{ color: active ? theme.white : theme.textMuted, fontWeight: "900", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

export function CategoryPill({
  label,
  icon,
  color,
  bg,
  active,
  onPress,
}: {
  label: string;
  icon: IconName;
  color: string;
  bg: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 14,
        backgroundColor: active ? color : bg,
        borderWidth: 1,
        borderColor: active ? color : color + "30",
      }}
    >
      <Feather name={icon} size={16} color={active ? theme.white : color} />
      <Text style={{ fontSize: 12, fontWeight: "900", color: active ? theme.white : color }}>{label}</Text>
    </Pressable>
  );
}

export function QuickActionTile({
  label,
  desc,
  icon,
  color,
  bg,
  onPress,
}: {
  label: string;
  desc?: string;
  icon: IconName;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[ui.card, { width: "48%", padding: 16 }]}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: bg, alignItems: "center", justifyContent: "center", marginBottom: 10, alignSelf: "flex-end" }}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 14, fontWeight: "900", color: theme.text, textAlign: "right" }}>{label}</Text>
      {desc ? <Text style={[ui.caption, { marginTop: 3 }]}>{desc}</Text> : null}
    </Pressable>
  );
}

export function DoctorListCard({
  name,
  specialty,
  city,
  area,
  imageUrl,
  rating,
  verified,
  distanceLabel,
  onPress,
  onWhatsApp,
}: {
  name: string;
  specialty: string;
  city?: string;
  area?: string;
  imageUrl?: string | null;
  rating?: number;
  verified?: boolean;
  distanceLabel?: string;
  onPress: () => void;
  onWhatsApp?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[ui.cardElevated, { overflow: "hidden", padding: 0 }]}>
      <View style={{ height: 3, backgroundColor: theme.tealLight, opacity: 0.5 }} />
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
          <View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: theme.borderLight, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={{ width: 58, height: 58 }} resizeMode="cover" />
            ) : (
              <Feather name="user" size={24} color={theme.textSoft} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text, textAlign: "right", flex: 1 }}>{name}</Text>
              {verified ? <Feather name="check-circle" size={16} color={theme.tealLight} /> : null}
            </View>
            <Text style={{ fontSize: 12, color: theme.teal, fontWeight: "800", textAlign: "right", marginTop: 2 }}>{specialty}</Text>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Feather name="map-pin" size={11} color={theme.textSoft} />
              <Text style={ui.caption}>
                {city}
                {area ? ` · ${area}` : ""}
                {distanceLabel ? ` · ${distanceLabel}` : ""}
              </Text>
            </View>
          </View>
        </View>

        {rating && rating > 0 ? (
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
            <Feather name="star" size={13} color={theme.goldLight} />
            <Text style={{ fontSize: 12, fontWeight: "900", color: theme.text }}>{rating.toFixed(1)}</Text>
          </View>
        ) : null}

        <View style={{ flexDirection: "row-reverse", gap: 8 }}>
          <Pressable onPress={onPress} style={{ flex: 1, backgroundColor: theme.teal, borderRadius: theme.radius.md, paddingVertical: 12, alignItems: "center", ...theme.shadow.glow }}>
            <Text style={{ color: theme.white, fontWeight: "900", fontSize: 13 }}>عرض الملف</Text>
          </Pressable>
          {onWhatsApp ? (
            <Pressable onPress={onWhatsApp} style={{ backgroundColor: theme.tealMuted, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, alignItems: "center", justifyContent: "center" }}>
              <Feather name="message-circle" size={18} color={theme.teal} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function ScreenHero({
  badge,
  title,
  subtitle,
  children,
  paddingTop = 0,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  paddingTop?: number;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.navy,
        paddingTop,
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: theme.radius.xxl,
        borderBottomRightRadius: theme.radius.xxl,
        overflow: "hidden",
        ...theme.shadow.float,
      }}
    >
      <View style={{ position: "absolute", top: -60, right: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(16,185,129,0.14)" }} />
      <View style={{ position: "absolute", bottom: -40, left: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(212,175,55,0.1)" }} />
      <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,22,40,0.15)" }} />
      {badge ? (
        <View
          style={{
            alignSelf: "flex-end",
            backgroundColor: "rgba(212,175,55,0.12)",
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.35)",
            borderRadius: theme.radius.pill,
            paddingHorizontal: 14,
            paddingVertical: 6,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 11 }}>{badge}</Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 28, fontWeight: "900", color: theme.white, textAlign: "right", lineHeight: 36, letterSpacing: -0.5 }}>{title}</Text>
      {subtitle ? <Text style={[ui.body, { color: "#cbd5e1", marginTop: 10, fontSize: 14 }]}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function AssistantPromoCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: theme.navy, borderRadius: theme.radius.xl, padding: 18, overflow: "hidden" }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(16,185,129,0.08)" }} />
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 14 }}>
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(212,175,55,0.15)", borderWidth: 1, borderColor: "rgba(212,175,55,0.25)", alignItems: "center", justifyContent: "center" }}>
          <Feather name="message-circle" size={24} color={theme.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "900", color: theme.white, textAlign: "right" }}>مساعدة ملامح</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#94a3b8", textAlign: "right", marginTop: 3 }}>
            اسأل عن التخصصات، العروض، أو الحجز
          </Text>
        </View>
        <Feather name="chevron-left" size={20} color={theme.gold} />
      </View>
    </Pressable>
  );
}
