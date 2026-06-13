import { ServiceDetailScreen } from "../../components/ServiceDetailScreen";

export default function BeautyDetailScreen() {
  return (
    <ServiceDetailScreen
      type="beauty"
      title="مراكز التجميل"
      backPath="/beauty"
      accentColor="#ec4899"
      fallbackEmoji="💆"
    />
  );
}
