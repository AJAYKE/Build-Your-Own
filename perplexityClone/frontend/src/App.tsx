import { css } from "@emotion/react";
import ChatWindow from "./components/ ChatWindow";

const containerStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const cardStyle = css`
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

function App() {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;
