import React, { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RWindow from "./RWindow.js";

/** Object used to set the initial values of useReducer. */
 const defaults = {
   /** Jsx of RWindow components */
   windowPool: [],

   /** Apis provided by RWindow components that make direct interaction possible. */
   windowApis: [],

   /** Key/Id of the RWindow that was most-recently focused. */
   focused: null,

   /** The number of RWindows that have been closed in this realm.
    *  RWindows that are closed via their own api are not counted. */
   closeCount: 0
 };

 const reducer = (state, action) => {
   const { id } = action.payload;

   switch(action.type) {
     /** Creates & adds a new RWindow object to the windowPool.
      *  Provides the addApi & removeApi functions, see below. */
     case "add":
       let { options, content, addApi, removeApi } = action.payload;
       let rWindow = (
         <RWindow key={id} options={{...options, id}}
                  addApi={addApi} removeApi={removeApi}>
          {content} </RWindow> );

       return {...state, windowPool: [...state.windowPool, rWindow]};

     /** Removes an RWindow object from the windowPool &
      *  increments closeCount. */
    case "remove":
      let pooli = state.windowPool.map(e => e.key).indexOf(action.payload);
      if(!~pooli) return state;
      return {
        ...state,
        windowPool: state.windowPool.filter(e => e.key !== action.payload),
        closeCount: state.closeCount+1
      };

    /** Sets the Key/Id of the most-recently focused RWindow. */
    case "set_focused": return {...state, focused: action.payload};

    /** Adds RWindow apis to windowApis. */
    case "add_api":
      let { api } = action.payload;
      return {...state, windowApis: [...state.windowApis, { id, api }]};

    /** Removes an api from windowApis. */
    case "remove_api":
      let apii = state.windowApis.map(e => e.id).indexOf(action.payload);
      if(!~apii) return state;
      return {...state, windowApis: state.windowApis.filter(e => e.id !== action.payload)};

    /** Unknown/uncaught case. */
    default: throw Error("Unknown dispatch type: " + action.type);
   }
 };

/** RWindowRealm & RWindowRealmProvider provide an api that allows
 *  interactions between the realm, all RWindows inside it,
 *  & the realm's parent. */
const RWindowRealm = React.createContext();

export const RWindowRealmProvider = props => {
  /** State is held in a reducer to make the api concise. */
  const [state, dispatch] = useReducer(reducer, defaults);

  /** Not provided in the api but called by api.add */
  const addApi = (id, api) => {
    dispatch({type: "add_api", payload: { id, api }});
  };

  /** Not provided in the api but called by api.add */
  const removeApi = (id) => { dispatch({type: "remove_api", payload: id}); };

  let api = {
    /** Provides the necessary information to trigger the creation of
     *  an RWindow object. */
    add: (_id, options, content) => {
      var id = _id ? _id : "KEY-"+uuidv4();
      dispatch({ type: "add", payload: { id, options, content, addApi, removeApi } });
      return id;
    },

    /** Triggers the removal of an RWindow from windowPool. */
    remove: (id) => { dispatch({ type: "remove", payload: id }); },

    /** Sets the Key/Id of the most-recently focused RWindow. */
    setFocused:  (id) => { dispatch({ type: "set_focused", payload: id }); },

    /** Returns the RWindow Jsx object from windowPool. */
    getJsx: (id) => {
      var i = state.windowPool.map(e => e.key).indexOf(id);
      if(~i) return state.windowPool[i];
      return null;
    },

    /** Returns the RWindow api object from windowApis. */
    getApi: (id) => {
      var i = state.windowApis.map(e => e.id).indexOf(id);
      if(~i) return state.windowApis[i];
      return null;
    }
  };

  return (
    <RWindowRealm.Provider value={{ api, state }}>
      <div style={{ position: "absolute", width: "100%", height: "100vh"}}>
        {state.windowPool}
        {props.children}
      </div>
    </RWindowRealm.Provider>
  );
};

export default RWindowRealm;
