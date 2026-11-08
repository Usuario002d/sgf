import React, { createContext, useState, useContext } from 'react';

// Criação do contexto
const MenuContext = createContext();

// Provedor do contexto
export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);

  return (
    <MenuContext.Provider value={{ menus, setMenus }}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook personalizado para consumir o contexto
export const useMenu = () => {
  return useContext(MenuContext);
};
