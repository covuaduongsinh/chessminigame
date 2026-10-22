import type { Square } from '@duongsinh/chess-core';
import { buildCustomGame, type CustomMode } from '@duongsinh/minigames';
import { Button, Card, colors, fonts } from '@duongsinh/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useCustomGames } from '@/lib/customStore';
import { useLang } from '@/lib/i18n';

const MODES: CustomMode[] = ['collect', 'capture', 'mate', 'race', 'play'];

/** Form tạo mini-game từ thế cờ đang xếp trên bàn (dành cho HLV/phụ huynh). */
export function CustomGameMaker({ fen, stars }: { fen: string; stars: Square[] }) {
  const { t, L } = useLang();
  const add = useCustomGames((s) => s.add);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<CustomMode>('collect');
  const [moveLimit, setMoveLimit] = useState(0);
  const [level, setLevel] = useState(2);
  const [avoid, setAvoid] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [mustCapture, setMustCapture] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; id?: string } | null>(null);

  const save = () => {
    const id = `local-${Date.now().toString(36)}`;
    const r = buildCustomGame(id, {
      title,
      fen,
      stars,
      mode,
      moveLimit,
      engineLevel: level,
      avoidAttacked: avoid,
      ordered,
      mustCapture,
    });
    if (!r.ok) {
      setResult({ ok: false, text: L(r.error) });
      return;
    }
    add({ id, title: L(r.def.title), def: r.def });
    setResult({
      ok: true,
      id,
      text: r.par !== undefined ? t('custom.saved', { par: r.par }) : t('custom.savedPlain'),
    });
  };

  const usesEngine = mode === 'mate' || mode === 'race' || mode === 'play';

  return (
    <Card style={{ gap: 10 }} testID="custom-maker">
      <Text style={styles.title}>🎯 {t('custom.title')}</Text>
      <Text style={styles.small}>{t('custom.subtitle')}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t('custom.name')}
        style={styles.input}
        testID="custom-title"
      />
      <Text style={styles.label}>{t('custom.mode')}</Text>
      <View style={styles.row}>
        {MODES.map((m) => (
          <Button
            key={m}
            title={t(`custom.modes.${m}`)}
            tone={mode === m ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setMode(m)}
            testID={`custom-mode-${m}`}
          />
        ))}
      </View>
      <View style={styles.row}>
        {(mode === 'collect' || mode === 'capture') && (
          <Button
            title={`${avoid ? '☑' : '☐'} ${t('custom.avoid')}`}
            tone="ghost"
            size="sm"
            onPress={() => setAvoid((v) => !v)}
          />
        )}
        {mode === 'collect' && (
          <Button
            title={`${ordered ? '☑' : '☐'} ${t('custom.ordered')}`}
            tone="ghost"
            size="sm"
            onPress={() => setOrdered((v) => !v)}
          />
        )}
        {mode === 'capture' && (
          <Button
            title={`${mustCapture ? '☑' : '☐'} ${t('custom.mustCapture')}`}
            tone="ghost"
            size="sm"
            onPress={() => setMustCapture((v) => !v)}
          />
        )}
      </View>
      {mode !== 'race' && mode !== 'play' && (
        <View style={styles.row}>
          <Text style={styles.label}>{t('custom.moveLimit')}</Text>
          <Button
            title="−"
            tone="ghost"
            size="sm"
            onPress={() => setMoveLimit((n) => Math.max(0, n - 1))}
          />
          <Text style={styles.value}>{moveLimit === 0 ? t('custom.noLimit') : moveLimit}</Text>
          <Button
            title="+"
            tone="ghost"
            size="sm"
            onPress={() => setMoveLimit((n) => Math.min(60, n + 1))}
          />
        </View>
      )}
      {usesEngine && (
        <View style={styles.row}>
          <Text style={styles.label}>{t('custom.level')}</Text>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Button
              key={n}
              title={String(n)}
              tone={level === n ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setLevel(n)}
            />
          ))}
        </View>
      )}
      <Button title={t('custom.save')} tone="accent" onPress={save} testID="custom-save" />
      {result && (
        <View style={styles.row}>
          <Text
            style={[styles.result, { color: result.ok ? colors.green : colors.red }]}
            testID="custom-result"
          >
            {result.text}
          </Text>
          {result.ok && result.id && (
            <Button
              title={t('custom.play')}
              tone="success"
              size="sm"
              onPress={() => router.push(`/tu-tao/${result.id}`)}
              testID="custom-play"
            />
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.black, fontSize: 18, color: colors.primary },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
    minWidth: 90,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    backgroundColor: colors.bg,
  },
  result: { fontFamily: fonts.medium, fontSize: 14, flexShrink: 1 },
});
