# Telegram Sensors & Biometrics

## Sensors Overview (Bot API 8.0+)

| Sensor             | Data               | Use Cases           |
| ------------------ | ------------------ | ------------------- |
| Accelerometer      | X, Y, Z (m/s²)     | Motion games, shake |
| Gyroscope          | X, Y, Z (rad/s)    | VR, 3D controls     |
| Device Orientation | Alpha, Beta, Gamma | Compass, tilt       |
| Location           | Lat, Lng, Speed    | Maps, geofencing    |

## Accelerometer

```typescript
const accel = Telegram.WebApp.Accelerometer;

// Start
accel.start({ refresh_rate: 50 }, (started) => {
  if (started) console.log("Accelerometer active");
});

// Read values
Telegram.WebApp.onEvent("accelerometerChanged", () => {
  const { x, y, z } = accel;
  console.log(`Accel: ${x}, ${y}, ${z}`);
});

// Stop
accel.stop();
```

## Gyroscope

```typescript
const gyro = Telegram.WebApp.Gyroscope;

gyro.start({ refresh_rate: 50 }, (started) => {});

Telegram.WebApp.onEvent("gyroscopeChanged", () => {
  const { x, y, z } = gyro; // rad/s
});
```

## Device Orientation

```typescript
const orient = Telegram.WebApp.DeviceOrientation;

orient.start({ refresh_rate: 100, need_absolute: true }, (started) => {});

Telegram.WebApp.onEvent("deviceOrientationChanged", () => {
  const { alpha, beta, gamma, absolute } = orient;
  // alpha: compass direction (0-360)
  // beta: front-back tilt (-180 to 180)
  // gamma: left-right tilt (-90 to 90)
});
```

## Location

```typescript
Telegram.WebApp.LocationManager.init((inited) => {
  if (Telegram.WebApp.LocationManager.isLocationAvailable) {
    Telegram.WebApp.LocationManager.getLocation((location) => {
      if (location) {
        const { latitude, longitude, altitude, speed, course } = location;
      }
    });
  }
});
```

## Biometrics (Bot API 7.2+)

```typescript
const bio = Telegram.WebApp.BiometricManager;

// Initialize
bio.init(() => {
  console.log("Type:", bio.biometricType); // 'face', 'finger', 'unknown'
  console.log("Available:", bio.isBiometricAvailable);
});

// Request access
bio.requestAccess({ reason: "Enable quick login" }, (granted) => {
  if (granted) console.log("Access granted");
});

// Authenticate
bio.authenticate({ reason: "Confirm payment" }, (success, token) => {
  if (success) {
    console.log("Authenticated!");
    if (token) console.log("Token:", token);
  }
});

// Store token securely
bio.updateBiometricToken("my_secure_token", (updated) => {
  if (updated) console.log("Token stored");
});
```

## Best Practices

- Check `isVersionAtLeast('8.0')` before using sensors
- Request permissions before starting sensors
- Stop sensors when not needed (battery)
- Handle permission denials gracefully
- Test on real devices (simulators may differ)
