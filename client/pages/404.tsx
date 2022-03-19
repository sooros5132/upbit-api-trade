import { Typography } from '@mui/material';
import React from 'react';
import { FlexCenterCenterBox } from 'src/components/modules/Box';
import styled from 'styled-components';

const Container = styled(FlexCenterCenterBox)`
  flex: 1 0 auto;
  display: flex;
`;

const InnerBox = styled.div`
  padding: ${({ theme }) => theme.spacing(0.5)};
`;
const RightBox = styled(InnerBox)`
  padding-right: ${({ theme }) => theme.spacing(2.5)};
  color: ${({ theme }) => theme.palette.mainLightText};
`;
const LeftBox = styled(InnerBox)`
  border-left: 1px solid ${({ theme }) => theme.palette.white};
  padding-left: ${({ theme }) => theme.spacing(2.5)};
`;

const Custom404: React.FC = () => {
  return (
    <Container>
      <RightBox>
        <Typography fontSize="px24">404</Typography>
      </RightBox>
      <LeftBox>
        <Typography fontSize="px24">This page could not be found.</Typography>
      </LeftBox>
    </Container>
  );
};

Custom404.displayName = 'Custom404';

export default Custom404;
