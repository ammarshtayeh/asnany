import React from "react";
import { StyleSheet, Text, View, TextInput, Pressable } from "react-native";

interface JoinTabProps {
  regType: "doctor" | "store";
  setRegType: (type: "doctor" | "store") => void;
  regName: string;
  setRegName: (val: string) => void;
  regSpecialty: string;
  setRegSpecialty: (val: string) => void;
  regCity: string;
  setRegCity: (val: string) => void;
  regArea: string;
  setRegArea: (val: string) => void;
  regPhone: string;
  setRegPhone: (val: string) => void;
  regWhatsapp: string;
  setRegWhatsapp: (val: string) => void;
  regBio: string;
  setRegBio: (val: string) => void;
  regImageUrl: string;
  setRegImageUrl: (val: string) => void;
  regSuccess: boolean;
  setRegSuccess: (val: boolean) => void;
  regSaving: boolean;
  handleRegistrationSubmit: () => void;
}

export default function JoinTab({
  regType,
  setRegType,
  regName,
  setRegName,
  regSpecialty,
  setRegSpecialty,
  regCity,
  setRegCity,
  regArea,
  setRegArea,
  regPhone,
  setRegPhone,
  regWhatsapp,
  setRegWhatsapp,
  regBio,
  setRegBio,
  regImageUrl,
  setRegImageUrl,
  regSuccess,
  setRegSuccess,
  regSaving,
  handleRegistrationSubmit
}: JoinTabProps) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📝 انضم كشريك في أسناني.ps</Text>
        <Text style={styles.bioText}>املأ الاستمارة أدناه لتسجيل عيادتك الطبية أو متجر المستلزمات الخاص بك مباشرة في البوابة الحية بانتظار توثيق وتفعيل الإدارة.</Text>
        
        {regSuccess ? (
          <View style={styles.successFormContainer}>
            <Text style={styles.successFormTitle}>🎉 تم استلام طلبك بنجاح!</Text>
            <Text style={styles.successFormDesc}>شكراً لانضمامك إلى شبكة أسناني.ps. سيقوم مسؤول البوابة بمراجعة مستنداتك وتفعيل عيادتك/متجرك للجمهور فوراً.</Text>
            <Pressable onPress={() => setRegSuccess(false)} style={[styles.button, { backgroundColor: "#0f172a" }]}>
              <Text style={styles.buttonText}>تسجيل حساب آخر</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.formToggle}>
              <Pressable onPress={() => setRegType("doctor")} style={[styles.formToggleBtn, regType === "doctor" && styles.formToggleBtnActive]}>
                <Text style={[styles.formToggleText, regType === "doctor" && styles.formToggleTextActive]}>👨‍⚕️ تسجيل طبيب</Text>
              </Pressable>
              <Pressable onPress={() => setRegType("store")} style={[styles.formToggleBtn, regType === "store" && styles.formToggleBtnActive]}>
                <Text style={[styles.formToggleText, regType === "store" && styles.formToggleTextActive]}>🏪 تسجيل متجر</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>{regType === "doctor" ? "الاسم الكامل للطبيب *:" : "اسم متجر المستلزمات *:"}</Text>
            <TextInput value={regName} onChangeText={setRegName} placeholder="مثال: د. أحمد يوسف" style={styles.formInput} textAlign="right" />

            <Text style={styles.inputLabel}>{regType === "doctor" ? "التخصص الرئيسي *:" : "مجال التخصص *:"}</Text>
            <TextInput value={regSpecialty} onChangeText={setRegSpecialty} placeholder="مثال: زراعة وتقويم أسنان" style={styles.formInput} textAlign="right" />

            <Text style={styles.inputLabel}>المدينة *:</Text>
            <TextInput value={regCity} onChangeText={setRegCity} placeholder="رام الله، الخليل، نابلس..." style={styles.formInput} textAlign="right" />

            <Text style={styles.inputLabel}>العنوان بالتفصيل:</Text>
            <TextInput value={regArea} onChangeText={setRegArea} placeholder="مثال: شارع الإرسال، عمارة السلام" style={styles.formInput} textAlign="right" />

            <Text style={styles.inputLabel}>رقم الهاتف:</Text>
            <TextInput value={regPhone} onChangeText={setRegPhone} keyboardType="phone-pad" placeholder="مثال: 0599123456" style={styles.formInput} textAlign="right" />

            <Text style={styles.inputLabel}>رقم واتساب الحجز/المبيعات:</Text>
            <TextInput value={regWhatsapp} onChangeText={setRegWhatsapp} keyboardType="phone-pad" placeholder="مثال: +970599123456" style={styles.formInput} textAlign="right" />

            <Text style={styles.inputLabel}>رابط الصورة الشخصية/شعار المتجر:</Text>
            <TextInput value={regImageUrl} onChangeText={setRegImageUrl} placeholder="https://example.com/logo.jpg" style={styles.formInput} textAlign="right" />

            <Text style={styles.inputLabel}>{regType === "doctor" ? "نبذة مهنية وسيرة ذاتية:" : "وصف الشركة ومستلزماتها:"}</Text>
            <TextInput value={regBio} onChangeText={setRegBio} multiline numberOfLines={3} placeholder="اكتب نبذة هنا..." style={[styles.formInput, { height: 80 }]} textAlign="right" />

            <Pressable disabled={regSaving} onPress={handleRegistrationSubmit} style={[styles.button, { backgroundColor: "#0d9488", marginTop: 8 }]}>
              <Text style={styles.buttonText}>{regSaving ? "جاري إرسال طلبك..." : "💾 إرسال طلب الانضمام والتفعيل"}</Text>
            </Pressable>
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
  successFormContainer: {
    padding: 20,
    alignItems: "center",
    gap: 12
  },
  successFormTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#10b981"
  },
  successFormDesc: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600"
  },
  formToggle: {
    flexDirection: "row-reverse",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 6,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  formToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center"
  },
  formToggleBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  formToggleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b"
  },
  formToggleTextActive: {
    color: "#0f172a"
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#475569",
    textAlign: "right",
    marginTop: 8
  },
  formInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 6
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
  formContainer: {
    gap: 10
  }
});
