import React from "react";
import styled, { useTheme } from "styled-components";
import {
  FlexAlignItemsCenterBox,
  FlexSpaceBetweenEndBox,
} from "../modules/Box";
import { FaBitcoin } from "react-icons/fa";
import { AiTwotoneSetting } from "react-icons/ai";

const Container = styled.header`
  height: ${({ theme }) => theme.spacing(5)};
`;

const Inner = styled(FlexSpaceBetweenEndBox)`
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing(1.5)};
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
          <FaBitcoin />
        </FlexAlignItemsCenterBox>
        <FlexAlignItemsCenterBox>
          <AiTwotoneSetting />
        </FlexAlignItemsCenterBox>
      </Inner>
    </Container>
  );
};

Header.displayName = "Header";

export default Header;
