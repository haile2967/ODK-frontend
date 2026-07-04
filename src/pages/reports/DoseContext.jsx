// DoseContext.jsx
import React, { createContext, useState, useContext } from "react";

const DoseContext = createContext();

export function DoseProvider({ children }) {
  const [dosesPerVial, setDosesPerVial] = useState("");

  return (
    <DoseContext.Provider value={{ dosesPerVial, setDosesPerVial }}>
      {children}
    </DoseContext.Provider>
  );
}

export const useDose = () => useContext(DoseContext);