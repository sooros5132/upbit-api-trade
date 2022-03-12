import { NextPage } from "next";
import React from "react";
import styled, { useTheme } from "styled-components";
import Footer from "./footer/Footer";
import Header from "./header/Header";

const LayoutContainer = styled.div``;
const MainBox = styled.main`
  min-height: 100vh;
`;

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Header></Header>
      <MainBox>{children}</MainBox>
      <Footer></Footer>
    </LayoutContainer>
  );
};

export default Layout;
