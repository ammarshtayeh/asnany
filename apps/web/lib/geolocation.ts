export type UserMapLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export const ACCURATE_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 20000,
};

export function toUserMapLocation(position: GeolocationPosition): UserMapLocation {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}

export function requestAccuratePosition(): Promise<UserMapLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(toUserMapLocation(pos)),
      (err) => reject(err),
      ACCURATE_GEO_OPTIONS
    );
  });
}

export function startAccuratePositionWatch(onUpdate: (location: UserMapLocation) => void) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => onUpdate(toUserMapLocation(pos)),
    () => {},
    ACCURATE_GEO_OPTIONS
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
