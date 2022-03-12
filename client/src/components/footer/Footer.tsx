import React from "react";
import styled, { useTheme } from "styled-components";

const Container = styled.footer`
  min-height: 500px;
`;

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}) => {
  const theme = useTheme();
  const [pending, setPending] = React.useState(true);
  // const { data, error } = useSWR("/key", fetch);

  return <Container></Container>;
};

Footer.displayName = "Footer";

export default Footer;
