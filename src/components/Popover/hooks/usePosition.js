import { useCallback, useState } from 'react';
import { EDGE_PADDING } from '../constants';
import { checkConstraints } from '../helpers';
import popoverPropsGetters from '../placementsConfig';

export default ({
  contentDimensions,
  triggerElementRef,
  placement,
  offset,
  withArrow,
  guessBetterPosition,
  animation,
  animationTranslateDistance,
}) => {
  const [containerProps, setContainerProps] = useState({});

  const updatePosition = useCallback(() => {
    if (!triggerElementRef.current || !contentDimensions.current) {
      return;
    }

    const rect = triggerElementRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const {
      height: targetHeight,
      width: targetWidth,
    } = contentDimensions.current;

    const params = {
      bottom: scrollTop + rect.bottom,
      right: scrollLeft + rect.right,
      top: scrollTop + rect.top,
      left: scrollLeft + rect.left,
      width: rect.width,
      height: rect.height,
    };

    let actualPlacement = placement;

    if (guessBetterPosition) {
      const { scrollHeight, scrollWidth } = document.documentElement;
      const topConstraint = targetHeight;
      const bottomConstraint = scrollHeight - targetHeight - EDGE_PADDING;
      const rightConstraint = scrollWidth - targetWidth - EDGE_PADDING;
      const leftConstraint = targetWidth;

      // two times to avoid wrong position replacement (second time returns old placement in wrong case)
      for (let i = 0; i < 2; i++) {
        actualPlacement = checkConstraints(
          actualPlacement,
          ['bottom', params.bottom, bottomConstraint],
          ['top', params.top, topConstraint]
        );
      }

      for (let i = 0; i < 2; i++) {
        actualPlacement = checkConstraints(
          actualPlacement,
          ['right', params.right, rightConstraint],
          ['left', params.left, leftConstraint]
        );
      }
    }

    setContainerProps(
      popoverPropsGetters[actualPlacement](params, {
        offset,
        withArrow,
        animation,
        animationTranslateDistance,
      })
    );
  }, [
    triggerElementRef,
    guessBetterPosition,
    offset,
    placement,
    contentDimensions,
    withArrow,
    animation,
    animationTranslateDistance,
  ]);

  return [containerProps, updatePosition];
};
