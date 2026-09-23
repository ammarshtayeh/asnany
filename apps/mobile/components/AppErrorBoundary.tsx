import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Prevents a single screen crash from taking down the whole mobile app.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AppErrorBoundary", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: "#f7f5f0", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#0a1628", textAlign: "center" }}>حدث خطأ مؤقت</Text>
          <Text style={{ marginTop: 10, fontSize: 14, fontWeight: "700", color: "#64748b", textAlign: "center", lineHeight: 22 }}>
            التطبيق واجه مشكلة في هذه الشاشة. يمكنك إعادة المحاولة للمتابعة.
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            style={{ marginTop: 24, backgroundColor: "#295f59", borderRadius: 14, paddingHorizontal: 22, paddingVertical: 14 }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
