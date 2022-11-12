import React, { useState, useEffect, useContext } from 'react';
import RWindowRealm from "../RWindowRealm.js";
import RWindowEditor from "./RWindowEditor.js";

/** Displays all RWindows that are currently open/active.
 *  Provides methods for interacting with RWindow apis. */
const RWindowList = props => {
  /** The current state & methods for interacting with the parent realm. */
  const { state, api } = useContext(RWindowRealm);

  /** Key/Id of the list item that is currently focused by the mouse. */
  const [hovered, setHovered] = useState(null);

  /** Sets hovered when the mouse is focusing an item. */
  const handleMouseOver = (key) => { setHovered(key); };

  /** Sets hovered when the mouse is focusing an item. */
  const handleMouseOut = (key) => { setHovered(null); };

  /** Opens an RWindowEditor window within the parent realm
   *  targeting the RWindow with the key/id of the clicked item. */
  const handleClick = (e) => {
    let target = api.getApi(e.key);
    if(!target) return;
    api.add(null, { title: "Wizard ¤", size: "lg" },
      <RWindowEditor targetId={e.key} targetApi={target.api} />);
  };

  return (
    <>
      {
        state.windowPool.map(e =>
          <div key={"ttl-"+e.key} style={{
            display: "grid",
            gridTemplateColumns: "max-content max-content",
            margin: 5,
            backgroundColor: (hovered === e.key) ? "#E0E0E0FF" : "transparent"
          }}
          onMouseOver={() => {handleMouseOver(e.key);}}
          onMouseOut={() => {handleMouseOut(e.key);}}
          onClick={() => {handleClick(e);}}>
            <span style={{ marginRight: "18px", marginBottom: "8px", userSelect: "none" }}>
              {e.props.options.title}
            </span>
            <span style={{userSelect: "none" }}>
              {e.key}
            </span>
          </div>
        )
      }
    </>
  );
}

export default RWindowList;
