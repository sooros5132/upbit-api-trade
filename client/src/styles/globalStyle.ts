import { createGlobalStyle, css } from "styled-components";
import { reset } from "styled-reset";
import { media } from "./media";
import theme from "./theme";

const GlobalStyle = createGlobalStyle`
  ${reset}
  :focus {
    outline: none;
    border: none;
  }
  /* ::-webkit-scrollbar {
    display: none;
  } */
  html{
    font-size: 14px;
    -webkit-text-size-adjust: none;
    font-family: -apple-system,BlinkMacSystemFont,helvetica,Apple SD Gothic Neo,sans-serif;       
    font-display: fallback;

    ${({ theme }) => `
      ${theme.mediaQuery.mobile} {
        font-size: 12px;
      }
    `}
    -ms-overflow-style: none;
    scrollbar-width: none;
    background-color: ${({ theme }) => theme.palette.htmlBackground};
    color: ${({ theme }) => theme.palette.textDefaultWhite}
  }
  button {
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;
    &:disabled {
      cursor: default;
      fill: #f2f3f4;
    }
  }
  .pc-tablet-only {
    display: block;
    ${({ theme }) => css`
      ${theme.mediaQuery.mobile} {
        display: none;
      }
    `}
  }
  .tablet-mobile-only{
    display: none;
    ${({ theme }) => css`
      ${theme.mediaQuery.tablet} {
        display: block;
      }
    `}
  }
  .mobile-only {
    display: none;
    ${({ theme }) => css`
      ${theme.mediaQuery.mobile} {
        display: block;
      }
    `}
  }
`;
export default GlobalStyle;
