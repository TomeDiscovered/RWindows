import React, { useReducer, useEffect, useContext } from 'react';
import RWindowRealm from "../RWindowRealm.js";
import RWindowList from "./RWindowList.js";

/** Displays useful information and buttons to interact with the RWindowRealm. */
const RWindowRealmPanel = props => {
  const { state, api } = useContext(RWindowRealm);

  /** Opens a generic RWindow for testing purposes. */
  const openGenericWindow = (e) => {
    api.add(null, {title: "Generic Window"}, <div>Generic Content</div>);
  };

  /** Opens a list that displays all RWindows that are currently open/active. */
  const openWindowList = (e) => {
    api.add(null, {title: "All Windows"}, <RWindowList />);
  };

  return (
    <div style={{padding: 10}}>
      <h3>RWindow Realm Panel</h3>

      <div style={{display: "flex", flexDirection: "column", gap: 5}}>
        <button onClick={openWindowList}>Window List</button>
        <button onClick={openGenericWindow}>New Generic Window</button>
      </div>

      <p> Open: {state.windowPool.length} </p>
      <p> Closed: {state.closeCount} </p>
    </div>
  );
}

export default RWindowRealmPanel;
