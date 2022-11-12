import React, {useState, useEffect, useRef, useContext} from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import stringifyObject from 'stringify-object';
import { RWindowContext } from "../RWindow.js";

/** A component that provides an interface for editing, viewing,
 *  & generating RWindow objects. */
const RWindowEditor = props => {
  /** Api for interacting with the parent RWindow. */
  const { api:windowApi } = useContext(RWindowContext);

  /** Dom object containing the JSONEditor object. */
  var editorContainer = useRef(null);

  /** The JSONEditor object.
   *  https://github.com/josdejong/jsoneditor/blob/master/docs/api.md */
  const [editor, setEditor] = useState(null);

  /** Describes if the editor or viewer is displayed.
   *  tree, pre */
  const [mode, setMode] = useState("tree");

  /** Describes if the viewer displays in Json or Js object format. */
  const [viewMode, setViewMode] = useState("json");

  /** Toggles the mode state property between "pre" and "tree". */
  const toggleMode = () => {
    if(mode === "tree") setMode("pre");
    else if(mode === "pre") setMode("tree");
  };

  /** Toggles the viewMode state property between "json" and "js". */
  const toggleViewMode = () => {
    if(viewMode === "json") setViewMode("js");
    else if(viewMode === "js") setViewMode("json");
  };

  useEffect(() => {
    /** Options used to initialize the JSONEditor object. */
    const editorOptions = {
      /** Default mode of the JSONEditor object. */
      mode: mode,

      onChangeText: (e) => {
        /** Changes the target RWindow's state to match the object
         *  returned by the JSONEditor object. */
        props.targetApi.updateState(JSON.parse(e));
      },

      /** Allows popup overflow like color pickers to remain visible
       *  outside of the RWindow wrapper. */
      popupAnchor: editorContainer
    };

    /** Instantiating the JSONEditor object. */
    let _editor = new JSONEditor(editorContainer, editorOptions);

    /** Set the initial state of the JSONEditor object. */
    props.targetApi.getState(state => { _editor.set(state); });

    props.targetApi.subscribeToState(props.targetId, (state, origin) => {
      /** If the target's state is null, there's nothing to edit. Close. */
      if(!state) return windowApi.close();

      /** Else, update the JSONEditor object to sync changes to target's state. */
      _editor.update(state);
    });

    /** Makes the JsonEditor object accessible outside of this useEffect function. */
    setEditor(_editor);

    return (() => {
      /** Only -you- can prevent memory leaks! */
      props.targetApi.unsubFromState(props.targetId);
      if(_editor) _editor.destroy();
    });
  }, []);

  useEffect(() => {
    if(!editor) return;

    /** Resyncs the JSONEditor object in case it gets reinstantiated. */
    props.targetApi.getState(state => { editor.update(state); });
  }, [editor]);

  return (
    <div style={{height: "100%", backgroundColor: "white"}}>
      <div ref={elem => editorContainer = elem} style={{
        display: mode === "tree" ? "block" : "none"
      }}/>

      { mode === "pre" ?
        <pre>
          { viewMode === "json" ?
            // Has quotes around object keys. Json format.
            JSON.stringify(editor?.get(), null, 2) :
            // Has no quotes around object keys. Js object format.
            stringifyObject(editor?.get(), {indent: '  ', singleQuotes: false})
          }
        </pre>
      : null}

      <div style={{
        display: "flex", gap: 10,
        position: "", bottom: "5px", right: "22px"
      }}>
        { mode === "tree" ? null :
          <>
            <button style={{minWidth: "60px"}} onClick={toggleViewMode}>
              { viewMode === "json" ? "JS" : "Json"}
            </button>

            <button style={{minWidth: "60px"}} onClick={() => {
              navigator.clipboard.writeText(
                viewMode === "json" ?
                  // Has quotes around object keys. Json format.
                  JSON.stringify(editor?.get(), null, 2) :
                  // Has no quotes around object keys. Js object format.
                  stringifyObject(editor?.get(), {indent: '  ', singleQuotes: false})
              );
              alert("Copied to clipboard!");
            }}>
              Copy
            </button>
          </>
        }

        <button style={{minWidth: "60px"}} onClick={toggleMode}>
          { mode === "tree" ? "View" : "Edit" }
        </button>
      </div>
    </div>
  );
};

export default RWindowEditor;
