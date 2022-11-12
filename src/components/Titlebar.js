import React from 'react';
import styled from 'styled-components';

/** Styled components were required here to initialize with hover effects. */
const OtherButton = styled.button`
  background: none;
  border: none;
  min-width: 38px;
  width: max-content;
  &:hover {
    background: #F0F0F0AA;
  }
`;

/** CloseButton hover backgroundColor is red, color is white. */
const CloseButton = styled.button`
  background: none;
  border: none;
  min-width: 38px;
  &:hover {
    background: #f70d1a;
    color: white;
  }
`;

/** A dumb styling component that displays text and buttons that are
 *  useful within the parent RWindow. */
const Titlebar = props => {
  return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: props.minHeight,
        ...props.style
      }}>

        <div className={props.handleId} style={{
          width: "100%",
          height: props.minHeight,
          userSelect: "none",
          display:"flex",
          alignItems: "center",
          marginLeft: "4px" }}>
          {props.title}
        </div>

        <div style={{
          display: "flex", flexDirection: "row", gap: 4,
          width: "max-content", justifyContent: "flex-end"
        }}>

          {!props.hasMinimizeButton ? null :
            <OtherButton
              onClick={props.toggleIsMinimized}>
              {props.isMinimized ? "∨" : "∧"}
            </OtherButton>
          }

          {!props.hasCloseButton ? null :
            <CloseButton onClick={() => {
              if(props.isCloseable) props.close();
              else props.setIsHidden(true);
            }}>X</CloseButton>
          }
        </div>
      </div>
  );
};

export default Titlebar;
