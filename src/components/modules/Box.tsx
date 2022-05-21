import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const FullWidthBox = styled(Box)`
  width: 100%;
`;

export const PositionRelativeBox = styled(Box)`
  position: relative;
`;

export const PositionRelativeFullScreenBox = styled(Box)`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const PositionAbsoluteBox = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
`;

export const PositionAbsoluteCenterBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const PositionAbsoluteXCenterBox = styled(Box)`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
`;

export const PositionAbsoluteYCenterBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
`;

export const PositionTopStickyBox = styled(Box)`
  position: sticky;
  top: 0;
`;

export const FlexColumnBox = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const FlexColumnHeight100Box = styled(Box)`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

export const FlexColumnAlignItemsCenterBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FlexColumnJustifyContentCenterBox = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const FlexColumnAlignItemsFlexEndBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const FlexColumnJustifyContentFlexEndBox = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

export const FlexColumnBottomBox = styled(Box)`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: flex-end;
`;

export const FlexBox = styled(Box)`
  display: flex;
`;

export const FlexFullBox = styled(Box)`
  display: flex;
  width: 100%;
  height: 100%;
`;

export const FlexNoWrapBox = styled(Box)`
  display: flex;
  flex-wrap: nowrap;
`;

export const FlexWrapBox = styled(Box)`
  display: flex;
  flex-wrap: wrap;
`;

export const FlexJustifyContentCenterBox = styled(Box)`
  display: flex;
  justify-content: center;
`;

export const FlexJustifyContentFlexEndBox = styled(Box)`
  display: flex;
  justify-content: flex-end;
`;

export const FlexAlignItemsCenterHeight100Box = styled(Box)`
  display: flex;
  height: 100%;
  align-items: center;
`;

export const FlexAlignItemsCenterBox = styled(Box)`
  display: flex;
  align-items: center;
`;

export const FlexAlignItemsFlexEndBox = styled(Box)`
  display: flex;
  align-items: flex-end;
`;

export const FlexEndEndBox = styled(Box)`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
`;

export const FlexCenterCenterBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FlexCenterCenterFullBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const FlexSpaceAroundBox = styled(Box)`
  display: flex;
  justify-content: space-around;
`;

export const FlexSpaceBetweenBox = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

export const FlexSpaceBetweenCenterBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FlexSpaceBetweenEndBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const BackgroundBox = styled(Box)`
  background-color: white;
`;

export const GridBox = styled(Box)`
  display: grid;
`;
export const Width100Box = styled(Box)`
  width: 100%;
`;
export const Height100Box = styled(Box)`
  height: 100%;
`;

export const Flex11AutoBox = styled(Box)`
  flex: auto;
`;

export const Flex0025Box = styled(Box)`
  flex: 0 0 25%;
`;

export const Flex0033Box = styled(Box)`
  flex: 0 0 33.333333%;
`;

export const Flex0050Box = styled(Box)`
  flex: 0 0 50%;
`;

export const Flex0066Box = styled(Box)`
  flex: 0 0 66.666666%;
`;

export const Flex0075Box = styled(Box)`
  flex: 0 0 75%;
`;

export const TextAlignCenterBox = styled(Box)`
  text-align: center;
`;

export const TextAlignRightBox = styled(Box)`
  text-align: right;
`;

export const TextAlignLeftBox = styled(Box)`
  text-align: left;
`;

export const MonoFontBox = styled(Box)`
  font-family: 'Roboto Mono', monospace; ;
`;

export const CursorPointerBox = styled(Box)`
  cursor: pointer;
`;

export const FlexCursorPointerBox = styled(Box)`
  display: flex;
  cursor: pointer;
`;

export const BackgroundRedBox = styled(Box)(({ theme }) => ({
  borderRadius: 5,
  padding: `${theme.spacing(0.625)} ${theme.spacing(4)}`,
  backgroundColor: theme.color.redBackgroundDark,
  color: theme.color.redLight,
  marginBottom: theme.spacing(1)
}));

export const BackgroundGreenBox = styled(Box)(({ theme }) => ({
  borderRadius: 5,
  padding: `${theme.spacing(0.625)} ${theme.spacing(4)}`,
  backgroundColor: theme.color.redBackgroundDark,
  color: theme.color.redLight
}));

export const BackgroundBlueBox = styled(Box)(({ theme }) => ({
  borderRadius: 5,
  padding: `${theme.spacing(0.625)} ${theme.spacing(4)}`,
  backgroundColor: theme.color.blueBackgroundDark,
  color: theme.color.blueLight
}));

export const NoWrapBox = styled(Box)`
  white-space: nowrap;
`;

export const HoverUnderlineBox = styled(Box)`
  &:hover {
    text-decoration: underline;
  }
`;
export const FlexHoverUnderlineBox = styled(Box)`
  display: flex;

  &:hover {
    text-decoration: underline;
  }
`;
