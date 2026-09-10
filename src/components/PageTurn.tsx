import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

interface PageTurnProps {
  width: number;
  currentPage: number;
  totalPages: number;
  current: ReactNode;
  previous: ReactNode;
  next: ReactNode;
  onTurn: (page: number) => void;
  onTap: () => void;
}

export function PageTurn({
  width,
  currentPage,
  totalPages,
  current,
  previous,
  next,
  onTurn,
  onTap,
}: PageTurnProps) {
  const translation = useSharedValue(0);
  const start = useSharedValue(0);

  const finishTurn = (page: number) => onTurn(page);

  const pan = Gesture.Pan()
    .minDistance(8)
    .onBegin(() => {
      start.value = translation.value;
    })
    .onUpdate((event) => {
      let nextValue = start.value + event.translationX;
      if (currentPage <= 1) nextValue = Math.min(0, nextValue);
      if (currentPage >= totalPages) nextValue = Math.max(0, nextValue);
      translation.value = Math.max(-width, Math.min(width, nextValue));
    })
    .onEnd((event) => {
      const threshold = width * 0.28;
      const goForward =
        currentPage < totalPages && (translation.value < -threshold || event.velocityX < -700);
      const goBack = currentPage > 1 && (translation.value > threshold || event.velocityX > 700);

      if (goForward || goBack) {
        const destination = goForward ? -width : width;
        const page = goForward ? currentPage + 1 : currentPage - 1;
        translation.value = withTiming(destination, { duration: 220 }, (finished) => {
          if (finished) runOnJS(finishTurn)(page);
        });
      } else {
        translation.value = withTiming(0, { duration: 200 });
      }
    });

  const tap = Gesture.Tap()
    .maxDuration(260)
    .onEnd((_event, success) => {
      if (success) runOnJS(onTap)();
    });

  const currentStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { translateX: translation.value },
      {
        rotateY: `${interpolate(
          translation.value,
          [-width, 0, width],
          [-18, 0, 18],
        )}deg`,
      },
      { scale: interpolate(Math.abs(translation.value), [0, width], [1, 0.985]) },
    ],
    shadowOpacity: interpolate(Math.abs(translation.value), [0, width], [0.08, 0.28]),
  }));

  const previousStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translation.value, [0, width * 0.12], [0, 1], 'clamp'),
  }));

  const nextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translation.value, [-width * 0.12, 0], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={styles.container}>
        <Animated.View style={[styles.layer, previousStyle]}>{previous}</Animated.View>
        <Animated.View style={[styles.layer, nextStyle]}>{next}</Animated.View>
        <Animated.View style={[styles.layer, styles.current, currentStyle]}>{current}</Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  current: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
});
