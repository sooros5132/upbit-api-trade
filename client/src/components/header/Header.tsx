import React from "react";
import {
  Flex11AutoBox,
  FlexAlignItemsCenterBox,
  FlexSpaceBetweenCenterBox,
} from "../modules/Box";
import { FaBitcoin } from "react-icons/fa";
import { AiTwotoneSetting } from "react-icons/ai";
import Link from "next/link";
import TradingViewTapeWidget from "../tradingview/Tape";
import { styled, useTheme } from "@mui/material/styles";

const Container = styled("header")`
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: ${({ theme }) => theme.color.mainDeepDrakBackground};
`;

const Inner = styled(FlexSpaceBetweenCenterBox)`
  height: ${({ theme }) => theme.spacing(5.5)};
  font-size: ${({ theme }) => theme.size.px20};
  ${({ theme }) => theme.mediaQuery.desktop} {
    max-width: 1200px;
    margin: 0 auto;
  }
  padding: 0 ${({ theme }) => theme.spacing(1.25)};
`;

const LogoBox = styled(FlexSpaceBetweenCenterBox)`
  color: ${({ theme }) => theme.color.mainLightText};
`;

const TapeWidget = styled(Flex11AutoBox)`
  padding: 0 ${({ theme }) => theme.spacing(1.25)};
`;

interface HeaderProps {}

const Header: React.FC<HeaderProps> = ({}) => {
  const theme = useTheme();
  const [pending, setPending] = React.useState(true);
  // const { data, error } = useSWR("/key", fetch);

  return (
    <Container>
      <Inner>
        <FlexAlignItemsCenterBox>
          <Link href={"/"}>
            <a>
              <LogoBox>
                <FaBitcoin />
              </LogoBox>
            </a>
          </Link>
        </FlexAlignItemsCenterBox>
        <TapeWidget>
          <TradingViewTapeWidget />
        </TapeWidget>
        <FlexAlignItemsCenterBox>
          <AiTwotoneSetting />
        </FlexAlignItemsCenterBox>
      </Inner>
    </Container>
  );
};

Header.displayName = "Header";

export default Header;
