import { GetStaticProps, NextPage } from "next";
import React from "react";
import { apiRequestURLs } from "src/utils/apiRequestURLs";
import Layout from "./Layout";

interface AppRootProps {}

const AppRoot: NextPage<AppRootProps> = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export default AppRoot;
