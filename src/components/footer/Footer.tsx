import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import React from 'react';
import {
  Flex0033Box,
  Flex0066Box,
  FlexAlignItemsCenterBox,
  FlexAlignItemsCenterHeight100Box,
  FlexJustifyContentCenterBox,
  TextAlignCenterBox,
  Width100Box
} from '../modules/Box';

const Container = styled('footer')(({ theme }) => ({
  backgroundColor: theme.color.gray90,
  color: theme.color.gray30
}));

const Inner = styled(FlexJustifyContentCenterBox)`
  padding: ${({ theme }) => theme.spacing(2)} 0;
  ${({ theme }) => theme.mediaQuery.mobile} {
    padding: ${({ theme }) => theme.spacing(3)} 0;
    flex-wrap: wrap;
    flex-direction: column-reverse;
  }
  ${({ theme }) => theme.mediaQuery.desktop} {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const LogoBox = styled(TextAlignCenterBox)`
  color: ${({ theme }) => theme.color.mainLightText};
  font-weight: bold;
  font-size: ${({ theme }) => theme.size.px30};
`;

const ContactBox = styled(TextAlignCenterBox)``;

const DescriptionContainer = styled(FlexAlignItemsCenterBox)`
  height: 100%;
  line-height: 1.25em;
`;
const DescriptionInner = styled('div')`
  ${({ theme }) => theme.mediaQuery.mobile} {
    padding-bottom: ${({ theme }) => theme.spacing(3)};
    text-align: center;
    border-left: 0;
  }
  border-left: 1px solid ${({ theme }) => theme.color.gray70};
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

// const ContactContainer = styled(FlexJustifyContentFlexEndBox)`
//   margin-right: ${({ theme }) => theme.spacing(1.25)};
//   padding-bottom: ${({ theme }) => theme.spacing(4)};
// `;

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}) => {
  // const { data, error } = useSWR("/key", fetch);

  return (
    <Container>
      <Inner>
        <Flex0033Box>
          <FlexAlignItemsCenterHeight100Box>
            <Width100Box>
              <LogoBox>
                <Typography>SOOROS</Typography>
              </LogoBox>
              <ContactBox>
                <Typography>
                  <Link href="mailto:sooros5132@gmail.com">
                    <a>sooros5132@gmail.com</a>
                  </Link>
                </Typography>
              </ContactBox>
            </Width100Box>
          </FlexAlignItemsCenterHeight100Box>
        </Flex0033Box>
        <Flex0066Box>
          <DescriptionContainer>
            <DescriptionInner>
              <Typography>
                SOOROS(
                <Link href="https://sooros.com">
                  <a>sooros.com</a>
                </Link>
                )는 토이프로젝트&amp;개인사용 목적으로 만들어진 사이트이며 사이트 내 모든 암호화폐
                가격 정보에 대하여 어떠한 책임을 지지 않습니다. 디지털 자산 투자에 대한 금전적
                손실은 본인 책임이며 투자에 유의하시기 바랍니다.
              </Typography>
            </DescriptionInner>
          </DescriptionContainer>
        </Flex0066Box>
      </Inner>
    </Container>
  );
};

Footer.displayName = 'Footer';

export default Footer;
