import React from 'react';
import ReactDOM from 'react-dom/client';
import { RWindowRealmProvider } from "./RWindowRealm.js";
import RWindowRealmPanel from "./content/RWindowRealmPanel.js";

const App = props => {
  return (
    <RWindowRealmProvider>
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around"
      }}> <RWindowRealmPanel /> </div>
    </ RWindowRealmProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
