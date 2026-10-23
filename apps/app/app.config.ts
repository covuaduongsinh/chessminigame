import type { ConfigContext, ExpoConfig } from 'expo/config';

// Bản web trên GitHub Pages nằm ở đường dẫn con (/chessminigame); desktop, mobile và hosting
// ở tên miền gốc vẫn dùng "/". Đặt EXPO_BASE_URL khi xuất web để đổi.
export default ({ config }: ConfigContext): ExpoConfig => {
  const baseUrl = process.env.EXPO_BASE_URL;
  return {
    ...(config as ExpoConfig),
    ...(baseUrl ? { experiments: { ...config.experiments, baseUrl } } : {}),
  };
};
