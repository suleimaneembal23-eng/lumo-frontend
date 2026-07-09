import React, { createContext, useState, useEffect } from "react";
import useSettings from "../hooks/useSettings";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { settings, loading, refreshSettings } = useSettings();



  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
