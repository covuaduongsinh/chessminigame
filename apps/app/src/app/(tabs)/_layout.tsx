import type { PieceType } from '@duongsinh/chess-core';
import { colors, fonts, Piece } from '@duongsinh/ui';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useLang } from '@/lib/i18n';

function TabIcon({ piece, focused }: { piece: PieceType; focused: boolean }) {
  return <Piece type={piece} color={focused ? 'b' : 'w'} size={28} />;
}

export default function TabsLayout() {
  const { t } = useLang();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const tabs: Array<{ name: string; title: string; piece: PieceType }> = [
    { name: 'index', title: t('tabs.learn'), piece: 'p' },
    { name: 'choi', title: t('tabs.play'), piece: 'n' },
    { name: 'tan-cuoc', title: t('tabs.endgames'), piece: 'r' },
    { name: 'phan-tich', title: t('tabs.analysis'), piece: 'b' },
    { name: 'clb', title: t('tabs.club'), piece: 'q' },
  ];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? 'left' : 'bottom',
        tabBarVariant: wide ? 'material' : 'uikit',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12 },
        tabBarStyle: wide
          ? { backgroundColor: colors.white, borderColor: colors.border, width: 220, minWidth: 220 }
          : { backgroundColor: colors.white, borderColor: colors.border, minHeight: 62 },
        tabBarActiveBackgroundColor: wide ? colors.primaryLight : undefined,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarButtonTestID: `tab-${tab.name}`,
            tabBarIcon: ({ focused }) => <TabIcon piece={tab.piece} focused={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}
