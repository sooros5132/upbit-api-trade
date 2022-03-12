import { NextPage } from "next";
import React from "react";
import styled, { useTheme } from "styled-components";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import { FlexColumnHeight100Box } from "./modules/Box";

const LayoutContainer = styled(FlexColumnHeight100Box)`
  min-height: 100vh;
`;

const MainBox = styled.main`
  flex: 1 0 auto;
`;

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Header></Header>
      {children}
      <Footer></Footer>
    </LayoutContainer>
  );
};

export default Layout;
