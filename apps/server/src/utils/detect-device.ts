import { DeviceType } from '@ecommerce/database';

export function detectDeviceType(userAgent: string) {
  const mobileRegex =
    /Mobile|Android|iP(?:hone|od)|IEMobile|BlackBerry|Opera Mini/i;
  const tabletRegex = /Tablet|iPad/i;

  if (mobileRegex.test(userAgent)) {
    return DeviceType.MOBILE;
  } else if (tabletRegex.test(userAgent)) {
    return DeviceType.TABLET;
  }
  return DeviceType.DESKTOP;
}
