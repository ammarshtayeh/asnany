import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

type ToastType = "success" | "error" | "info";

type ToastState = {
  title: string;
  message?: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (toast: ToastState) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const palette = {
  success: { background: "#ecfdf5", border: "#bbf7d0", icon: "check-circle", color: "#047857" },
  error: { background: "#fef2f2", border: "#fecaca", icon: "alert-circle", color: "#b91c1c" },
  info: { background: "#eff6ff", border: "#bfdbfe", icon: "info", color: "#1d4ed8" },
} as const;

export function AppToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [translateY]);

  const showToast = useCallback(
    (nextToast: ToastState) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast(nextToast);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
      timeoutRef.current = setTimeout(hideToast, 3200);
    },
    [hideToast, translateY],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  const colors = toast ? palette[toast.type] : palette.info;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: insets.top + 10,
            left: 14,
            right: 14,
            zIndex: 50,
            transform: [{ translateY }],
          }}
        >
          <Pressable
            onPress={hideToast}
            style={{
              minHeight: 64,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              paddingHorizontal: 14,
              paddingVertical: 12,
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.12,
              shadowRadius: 22,
              elevation: 5,
            }}
          >
            <View style={{ flexDirection: "row-reverse", alignItems: "flex-start", gap: 10 }}>
              <Feather name={colors.icon} size={20} color={colors.color} />
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={{ textAlign: "right", color: colors.color, fontSize: 14, fontWeight: "900" }}>{toast.title}</Text>
                {toast.message ? (
                  <Text style={{ marginTop: 3, textAlign: "right", color: "#334155", fontSize: 12, fontWeight: "700", lineHeight: 18 }}>{toast.message}</Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAppToast must be used inside AppToastProvider");
  }
  return context;
}
