import theme from "src/styles/theme";
import styled, { useTheme } from "styled-components";

export const FullWidthBox = styled.div`
  width: 100%;
`;

export const FlexColumnBox = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FlexColumnHeight100Box = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FlexColumnAlignItemsCenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FlexColumnJustifyContentCenterBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const FlexColumnAlignItemsFlexEndBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const FlexColumnJustifyContentFlexEndBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

export const FlexColumnBottomBox = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: flex-end;
`;

export const FlexBox = styled.div`
  display: flex;
`;

export const FlexFullBox = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

export const FlexNoWrapBox = styled.div`
  display: flex;
  flex-wrap: nowrap;
`;

export const FlexWrapBox = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const FlexJustifyContentCenterBox = styled.div`
  display: flex;
  justify-content: center;
`;

export const FlexJustifyContentFlexEndBox = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const FlexAlignItemsCenterHeight100Box = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
`;

export const FlexAlignItemsCenterBox = styled.div`
  display: flex;
  align-items: center;
`;

export const FlexAlignItemsFlexEndBox = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const FlexEndEndBox = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
`;

export const FlexCenterCenterBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FlexCenterCenterFullBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const FlexSpaceAroundBox = styled.div`
  display: flex;
  justify-content: space-around;
`;

export const FlexSpaceBetweenBox = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const FlexSpaceBetweenCenterBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FlexSpaceBetweenEndBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const BackgroundBox = styled.div`
  background-color: white;
`;

export const GridBox = styled.div`
  display: grid;
`;
export const Width100Box = styled.div`
  width: 100%;
`;
export const Height100Box = styled.div`
  height: 100%;
`;

export const Flex11AutoBox = styled.div`
  flex: auto;
`;

export const Flex0025Box = styled.div`
  flex: 0 0 25%;
`;

export const Flex0033Box = styled.div`
  flex: 0 0 33.333333%;
`;

export const Flex0050Box = styled.div`
  flex: 0 0 50%;
`;

export const Flex0066Box = styled.div`
  flex: 0 0 66.666666%;
`;

export const Flex0075Box = styled.div`
  flex: 0 0 75%;
`;

export const TextAlignCenterBox = styled.div`
  text-align: center;
`;

export const TextAlignRightBox = styled.div`
  text-align: right;
`;

export const TextAlignLeftBox = styled.div`
  text-align: left;
`;

export const MonoFontBox = styled.div`
  font-family: "Roboto Mono", monospace; ;
`;

export const ColorBox = styled.div<{ color: keyof typeof theme.palette }>`
  color: ${({ theme: t, color: c }) => t.palette[c]};
`;
