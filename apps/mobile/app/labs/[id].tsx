import { ServiceDetailScreen } from "../../components/ServiceDetailScreen";

export default function LabDetailScreen() {
  return (
    <ServiceDetailScreen
      type="lab"
      title="المختبرات الطبية"
      backPath="/labs"
      accentColor="#0ea5e9"
      fallbackEmoji="🔬"
    />
  );
}
