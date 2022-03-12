import Link from "next/link";
import React from "react";
import styled, { useTheme } from "styled-components";
import {
  Flex0033Box,
  Flex0066Box,
  FlexAlignItemsCenterBox,
  FlexAlignItemsCenterHeight100Box,
  FlexCenterCenterBox,
  FlexJustifyContentCenterBox,
  TextAlignCenterBox,
  Width100Box,
} from "../modules/Box";
import { HoverUnderLineAnchor, Paragraph, Span } from "../modules/Typography";

const Container = styled.footer`
  background-color: ${({ theme }) => theme.palette.mainDeepDrakBackground};
`;
const Inner = styled(FlexJustifyContentCenterBox)`
  min-height: 100px;
  ${({ theme }) => theme.mediaQuery.desktop} {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const LogoBox = styled(TextAlignCenterBox)`
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.palette.mainLightText};
  font-weight: bold;
  font-size: ${({ theme }) => theme.size.px30};
`;

const ContactBox = styled(TextAlignCenterBox)``;

const DescriptionContainer = styled(FlexAlignItemsCenterBox)`
  height: 100%;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  line-height: 1.25em;
`;
const DescriptionInner = styled.div`
  border-left: 1px solid ${({ theme }) => theme.palette.mainLightText}CC;
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

// const ContactContainer = styled(FlexJustifyContentFlexEndBox)`
//   margin-right: ${({ theme }) => theme.spacing(1.25)};
//   padding-bottom: ${({ theme }) => theme.spacing(4)};
// `;

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}) => {
  const [pending, setPending] = React.useState(true);
  // const { data, error } = useSWR("/key", fetch);

  return (
    <Container>
      <Inner>
        <Flex0033Box>
          <FlexAlignItemsCenterHeight100Box>
            <Width100Box>
              <LogoBox>
                <Paragraph>SOOROS</Paragraph>
              </LogoBox>
              <ContactBox>
                <Paragraph color="textBlueGray">
                  <HoverUnderLineAnchor href="mailto:sooros5132@gmail.com">
                    sooros5132@gmail.com
                  </HoverUnderLineAnchor>
                </Paragraph>
              </ContactBox>
            </Width100Box>
          </FlexAlignItemsCenterHeight100Box>
        </Flex0033Box>
        <Flex0066Box>
          <DescriptionContainer>
            <DescriptionInner>
              <div>
                <Paragraph>
                  SOOROS(<Link href="https://sooros.com">sooros.com</Link>)는
                  사이트 내 모든 암호화폐 가격 정보에 대하여 어떠한 책임을 지지
                  않습니다.
                </Paragraph>
                <Paragraph>
                  디지털 자산 투자에 대한 손실은 본인의 책임이므로 투자에
                  유의하시기 바랍니다.
                </Paragraph>
              </div>
            </DescriptionInner>
          </DescriptionContainer>
        </Flex0066Box>
      </Inner>
    </Container>
  );
};

Footer.displayName = "Footer";

export default Footer;
