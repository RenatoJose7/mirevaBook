import { useEffect, type ReactNode } from 'react';
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
  zoomScale: number;
  onTurn: (page: number) => void;
  onTap: () => void;
  onZoomChange: (scale: number) => void;
}

export function PageTurn({
  width,
  currentPage,
  totalPages,
  current,
  previous,
  next,
  zoomScale,
  onTurn,
  onTap,
  onZoomChange,
}: PageTurnProps) {
  const translation = useSharedValue(0);
  const start = useSharedValue(0);
  const zoom = useSharedValue(zoomScale);
  const zoomStart = useSharedValue(zoomScale);

  const finishTurn = (page: number) => onTurn(page);
  const finishZoom = (scale: number) => onZoomChange(Math.round(scale * 100) / 100);

  useEffect(() => {
    zoom.value = withTiming(zoomScale, { duration: 140 });
  }, [zoom, zoomScale]);

  const pan = Gesture.Pan()
    .minDistance(8)
    .onBegin(() => {
      if (zoom.value > 1.01) return;
      start.value = translation.value;
    })
    .onUpdate((event) => {
      if (zoom.value > 1.01) return;
      let nextValue = start.value + event.translationX;
      if (currentPage <= 1) nextValue = Math.min(0, nextValue);
      if (currentPage >= totalPages) nextValue = Math.max(0, nextValue);
      translation.value = Math.max(-width, Math.min(width, nextValue));
    })
    .onEnd((event) => {
      if (zoom.value > 1.01) {
        translation.value = withTiming(0, { duration: 120 });
        return;
      }

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
      if (success && zoom.value <= 1.01) runOnJS(onTap)();
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      zoomStart.value = zoom.value;
    })
    .onUpdate((event) => {
      zoom.value = Math.max(1, Math.min(2.5, zoomStart.value * event.scale));
    })
    .onEnd(() => {
      const value = Math.max(1, Math.min(2.5, zoom.value));
      zoom.value = withTiming(value, { duration: 120 });
      runOnJS(finishZoom)(value);
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
      { scale: zoom.value * interpolate(Math.abs(translation.value), [0, width], [1, 0.985]) },
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
    <GestureDetector gesture={Gesture.Simultaneous(pinch, Gesture.Exclusive(pan, tap))}>
      <View style={styles.container}>
        <Animated.View style={[styles.layer, previousStyle]}>{previous}</Animated.View>
        <Animated.View style={[styles.layer, nextStyle]}>{next}</Animated.View>
        <Animated.View style={[styles.layer, styles.current, currentStyle]}>{current}</Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  current: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
});
