import React from "react";
import styled from "styled-components";
import { Heartbeat, ShieldCheck } from "@phosphor-icons/react";

const teal = "#1a7a5e";
const textDark = "#192343";
const textMid = "#5a5e65";

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8eef3 0%, #f0f4f8 40%, #e2ece9 100%);
  font-family: "DM Sans", "Helvetica Neue", sans-serif;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px 28px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const LogoBox = styled.div`
  width: 36px;
  height: 36px;
  background: ${teal};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: ${textDark};
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: ${textMid};
  margin: 0 0 24px 0;
`;

const HipaaBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
`;

const AuthCard = ({ children, title, subtitle }) => (
  <Page>
    <Card>
      <LogoBox>
        <Heartbeat size={24} color="white" weight="regular" />
      </LogoBox>
      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      {/* Le contenu de tes pages (formulaires, boutons) sera injecté ici */}
      {children}
    </Card>

    <HipaaBar>
      <ShieldCheck size={14} color="#9ca3af" weight="fill" />
      HIPAA-compliant · End-to-end encrypted · v2.4
    </HipaaBar>
  </Page>
);

export default AuthCard;
