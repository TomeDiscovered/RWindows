import React, { useReducer, useEffect, useContext,
                createContext, useRef, useState, useMemo } from 'react';
import Draggable from 'react-draggable';
import RWindowRealm from "./RWindowRealm.js";
import Titlebar from "./components/Titlebar.js";

// Object used to set the initial values of useReducer.
const defaults = {
  /** Generalized selector to be used as the handle that initiates drag.
   *  wrapper, titlebar, content, footer */
  handleArea: "titlebar",

  /** Horizontal length of the RWindow dom object. */
  width: 600,

  /** Vertical length of the RWindow dom object. */
  height: 400,

  /** Auto-sizes width and height to commonly used proportions.
   *  sm, md, lg */
  size: "md",

  /** Text shown at the left of the titlebar if hasTitlebar is true. */
  title: "Example Titlebar",

  /** Vertical length of the RWindow when collapsed.
   *  Height of the titlebar if present. */
  minHeight: "24px",

  /** Describes if titlebar is present. */
  hasTitlebar: true,

  /** Describes if minimize button on the titlebar is present. */
  hasMinimizeButton: true,

  /** Describes if close button on the titlebar is present. */
  hasCloseButton: true,

  /** Describes if the RWindow is visible. */
  isHidden: false,

  /** Describes if the RWindow is currently minHeight. */
  isMinimized: false,

  /** Describes if the RWindow can be closed.
   * If hasCloseButton is true and isClosable is false, the RWindow
   * will be hidden when the close button is clicked. */
  isCloseable: true,

  /** Properties of the Draggable component.
   *  https://github.com/react-grid-layout/react-draggable#draggable-api */
  draggable: {
    axis: "both",
    defaultPosition: { x: 0, y: 0 },
    bounds: "parent",
    grid: [10, 10],
    onMouseDown: () => {},
    scale: 1
  },

  /** CSS styles applied to the component that contains everything
   *  within the RWindow. */
  wrapperStyle: {
    border: "1px solid black"
  },

  /** CSS styles applied to the component that contains everything
   *  within the Titlebar component. */
  titlebarStyle: {
    borderBottom: "1px solid black",
    backgroundColor: "#E0E0E0FF"
  },

  /** CSS styles applied to the component that contains everything
   *  within the component containing the supplied content (props.children). */
  contentStyle: {
    backgroundColor: "#FDFAFD"
  }
};

/** Returns a new object containing the entries of both state & obj arguments.
 *  Ensures all state variables are present, overwritten if present
 *  in both state & obj, & added if not present in state and present in obj. */
const spreadToState = (state, obj) => {
  if(!state || !obj) return defaults;

  return {
    ...state, ...obj,
    draggable:     {...state.draggable,     ...obj.draggable     },
    wrapperStyle:  {...state.wrapperStyle,  ...obj.wrapperStyle  },
    titlebarStyle: {...state.titlebarStyle, ...obj.titlebarStyle },
    contentStyle:  {...state.contentStyle,  ...obj.contentStyle  }
  }
};

const reducer = (state, action) => {
  switch(action.type){
    /** Toggles the boolean value isMinimized. */
    case "toggle_isMinimized":
      return { ...state, isMinimized: !state.isMinimized };

    /** Returns the current state as an argument to the supplied function.
     *  Ensures the current state is given, not the initial state. */
    case "get_state":
      action.payload(state);
      return state;

    /** Updates all properties of state given a comparable object. */
    case "update_state":
      return spreadToState(state, action.payload);

    /** Sets the isHidden boolean. */
    case "set_isHidden":
      return { ...state, isHidden: action.payload };

    /** Unknown/uncaught case. */
    default: throw Error("Unknown dispatch type: " + action.type);
  }
};

/** RWindowContext provides an api that allows the RWindow parent &
 *  supplied content (props.children).
 *  This api is also supplied to this component's parent
 *  realm via props.addApi. */
export const RWindowContext = createContext();

const RWindow = props => {
  /** Avoids React warnings caused by StrictMode - Draggable conflicts. */
  const nodeRef = useRef(null);

  /** State is held in a reducer to make the api concise. */
  const [state, dispatch] = useReducer(reducer, spreadToState(defaults, props.options));

  /** The api and current state of this component's parent realm. */
  const { api: realmApi, state: realmState } = useContext(RWindowRealm);

  /** Functions called when state changes. */
  const [stateSubscribers, setStateSubscribers] = useState([]);

  const api = useMemo(() => { return {
    /** The unique identifier of this RWindow Jsx and api. */
    id: props.options?.id,

      /** Toggles the boolean value isMinimized. */
    toggleIsMinimized: () => { dispatch({ type: "toggle_isMinimized" }); },

    /** Sets the isHidden boolean. */
    setIsHidden: (value) => { dispatch({type: "set_isHidden", payload: value}); },

    /** Sets the parent realm's focus property. */
    setFocused: () => { realmApi.setFocused(props.options?.id); },

    /** Triggers removal of this component from the parent realm.
     *  Updates stateSubscribers that this RWindow i to be closed. */
    close: () => {
      for(let sub of stateSubscribers){ sub.func(null);}
      realmApi.remove(props.options?.id);
    },

    /** Adds a function to stateSubscribers.
     *  This function receives state as an argument. */
    subscribeToState: (id, func) => {
      setStateSubscribers(prev => [...stateSubscribers, { id, func }]);
    },

    /** Removes a function from stateSubscribers. */
    unsubFromState: (id) => {
      setStateSubscribers(prev => [...stateSubscribers.filter(e => e.id !== id)]);
    },

    /** Updates all properties of state given a comparable object. */
    updateState: (value) => { dispatch({type: "update_state", payload: value}) },

    /** Returns the current state as an argument to the supplied function. */
    getState: (getState) => { dispatch({type: "get_state", payload: getState}) }
  } }, [props.options?.id, realmApi, stateSubscribers]);

  useEffect(() => {
    if(!api || !props) return;

    api.setFocused(props.options?.id);

    /** Registers the above api to be used within the realm
     *  to interact with this RWindow. */
    if(props.addApi) props.addApi(props.options?.id, api);

    return () => {
      /** Only -you- can prevent memory leaks! */
      if(props.removeApi) props.removeApi(props.options?.id);
    };

    /** If api is called within a useEffect, it should be accounted for (above)
     *  & ignored (below) */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(!stateSubscribers) return;

    /** State updated, let's update the stateSubscribers, too. */
    for(let sub of stateSubscribers){ sub.func(state);}
  }, [state, stateSubscribers]);

  // const syncWhToSize() => {
  useEffect(() => {
    if(!api) return;

    /** Auto-sizes width and height to commonly used proportions. */
    switch(state.size){
      case "custom": return;
      case "sm": api.updateState({width: 400, height: 200}); break;
      case "md": api.updateState({width: 600, height: 400}); break;
      case "lg": api.updateState({width: 800, height: 600}); break;
      default: api.updateState({size: "custom"});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.size]);

  const syncSizeToWh = () => {
    if(!api) return;
    let [w, h] = [state.width, state.height];

    if(w === 400 && h === 200) api.updateState({size: "sm"});
    else if(w === 600 && h === 400) api.updateState({size: "md"});
    else if(w === 800 && h === 600) api.updateState({size: "lg"});
  };

  return (
      <Draggable
        nodeRef={nodeRef}
        {...state.draggable}
        handle={"."+state.handleArea+"-"+props.options?.id}
        onMouseDown={api.setFocused}>

        <div ref={nodeRef}
          className={`r-window-wrapper wrapper-${props.options?.id}`}
          style={{
            position: "absolute",
            display: state.isHidden ? "none" : "flex",
            flexDirection: "column",
            overflow: "visible",
            width: state.width,
            height: state.isMinimized ? state.minHeight : state.height,
            zIndex: realmState.focused === props.options?.id ? 10 : 9,
            ...state.wrapperStyle
          }}>

          {!state.hasTitlebar ? null :
            <Titlebar
              handleId={"titlebar-"+props.options?.id}
              minHeight={state.minHeight}
              hasCloseButton={state.hasCloseButton}
              hasMinimizeButton={state.hasMinimizeButton}
              title={state.title}
              isMinimized={state.isMinimized}
              toggleIsMinimized={api.toggleIsMinimized}
              focus={api.focus}
              close={api.close}
              setIsHidden={api.setIsHidden}
              isCloseable={state.isCloseable}
              style={state.titlebarStyle} />
          }

          <div style={{
            height: "100%", width: "100%", overflow: "auto",
            ...state.contentStyle
          }}>
            <RWindowContext.Provider value={{ api }}>
              {props.children}
            </RWindowContext.Provider>
          </div>
        </div>
      </Draggable>
  );
}

export default RWindow;
