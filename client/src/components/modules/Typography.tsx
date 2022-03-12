import theme from "src/styles/theme";
import styled, {
  css,
  DefaultTheme,
  StyledComponent,
  ThemedStyledFunction,
} from "styled-components";

export interface TypographyProps {
  children?: React.ReactNode;
  color?: keyof typeof theme.palette;
  fontSize?: keyof typeof theme.size;
  opacity?: number;
  cursor?:
    | "auto"
    | "default"
    | "none"
    | "context-menu"
    | "help"
    | "pointer"
    | "progress"
    | "wait"
    | "cell"
    | "crosshair"
    | "text"
    | "vertical-text"
    | "alias"
    | "copy"
    | "move"
    | "no-drop"
    | "not-allowed"
    | "e-resize"
    | "n-resize"
    | "ne-resize"
    | "nw-resize"
    | "s-resize"
    | "se-resize"
    | "sw-resize"
    | "w-resize"
    | "ew-resize"
    | "ns-resize"
    | "nesw-resize"
    | "nwse-resize"
    | "col-resize"
    | "row-resize"
    | "all-scroll"
    | "zoom-in"
    | "zoom-out"
    | "grab"
    | "grabbing";
}

const TypographyMixer = ({
  theme: t,
  color,
  fontSize,
  cursor,
  opacity,
}: TypographyProps & { theme: DefaultTheme }) => css`
  color: ${color ? t.palette[color] : "inherit"};
  font-size: ${fontSize ? t.size[fontSize] : "inherit"};
  cursor: ${cursor ? cursor : "initial"};
  opacity: ${opacity ? opacity : "initial"};
`;

export const Span = styled.span<TypographyProps>`
  ${(props) => TypographyMixer(props)}
`;

export const Paragraph = styled.p<TypographyProps>`
  ${(props) => TypographyMixer(props)}
`;

export const MonoFontTypography = styled.span`
  font-family: "Roboto Mono", monospace; ;
`;

export const HoverUnderLineAnchor = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;
