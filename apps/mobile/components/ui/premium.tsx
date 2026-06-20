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
    backgroundColor: theme.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderLight,
    shadowColor: theme.navy,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 28,
    elevation: 5,
  } as ViewStyle,
  h1: { fontSize: 28, fontWeight: "900" as const, color: theme.text, textAlign: "right" as const },
  h2: { fontSize: 18, fontWeight: "900" as const, color: theme.text, textAlign: "right" as const },
  body: { fontSize: 13, fontWeight: "600" as const, color: theme.textMuted, textAlign: "right" as const, lineHeight: 20 },
  caption: { fontSize: 11, fontWeight: "700" as const, color: theme.textSoft, textAlign: "right" as const },
};

export function MalamihLogo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const box = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const title = size === "sm" ? 18 : size === "lg" ? 26 : 22;

  return (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
      <Image
        source={require("../../assets/logo-full.png")}
        style={{
          width: box,
          height: box,
          borderRadius: box / 2,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: theme.borderLight,
        }}
        resizeMode="contain"
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
  featured,
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
  featured?: boolean;
  onPress: () => void;
  onWhatsApp?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[ui.card, { overflow: "hidden", padding: 0 }]}>
      <View style={{ height: 4, backgroundColor: featured ? theme.gold : theme.tealMuted }} />
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
              {featured ? (
                <View style={{ backgroundColor: theme.goldMuted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 9, fontWeight: "900", color: "#b45309" }}>مميز</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ fontSize: 12, color: theme.teal, fontWeight: "800", textAlign: "right", marginTop: 2 }}>{specialty}</Text>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Feather name="map-pin" size={11} color={theme.textSoft} />
              <Text style={ui.caption}>
                {city}
                {area ? ` · ${area}` : ""}
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
          <Pressable onPress={onPress} style={{ flex: 1, backgroundColor: theme.teal, borderRadius: 12, paddingVertical: 11, alignItems: "center" }}>
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
    <View style={{ backgroundColor: theme.navy, paddingTop, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden" }}>
      <View style={{ position: "absolute", top: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(16,185,129,0.12)" }} />
      <View style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(212,175,55,0.08)" }} />
      {badge ? (
        <View style={{ alignSelf: "flex-end", backgroundColor: "rgba(212,175,55,0.15)", borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 }}>
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 11 }}>{badge}</Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.white, textAlign: "right", lineHeight: 34 }}>{title}</Text>
      {subtitle ? <Text style={[ui.body, { color: "#cbd5e1", marginTop: 8 }]}>{subtitle}</Text> : null}
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
          <Feather name="cpu" size={24} color={theme.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "900", color: theme.white, textAlign: "right" }}>الحكيم اللبيب</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#94a3b8", textAlign: "right", marginTop: 3 }}>
            مستشارك الطبي الذكي — اسأل عن أي تخصص
          </Text>
        </View>
        <Feather name="chevron-left" size={20} color={theme.gold} />
      </View>
    </Pressable>
  );
}
