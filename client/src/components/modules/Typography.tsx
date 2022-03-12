import theme from "src/styles/theme";
import styled from "styled-components";

export interface TypographyProps {
  children?: React.ReactNode;
  color?: keyof typeof theme.palette;
  fontSize?: keyof typeof theme.size;
}

export const Span = styled.span<TypographyProps>`
  color: ${({ theme: t, color: c }) => (c ? t.palette[c] : "inherit")};
  font-size: ${({ theme: t, fontSize: f }) => (f ? t.size[f] : "inherit")};
`;

export const Paragraph = styled.p<TypographyProps>`
  color: ${({ theme: t, color: c }) => (c ? t.palette[c] : "inherit")};
  font-size: ${({ theme: t, fontSize: f }) => (f ? t.size[f] : "inherit")};
`;

export const MonoFontTypography = styled.span`
  font-family: "Roboto Mono", monospace; ;
`;

export const HoverUnderLineAnchor = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;
