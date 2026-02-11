import { createContext, useContext, useReducer, useCallback } from 'react';
import { MOCK_COFFEES } from '../data/mockCoffees';

const CoffeeContext = createContext(null);

const initialState = {
  coffees: MOCK_COFFEES,
  favorites: ['1', '3'],
  settings: {
    defaultBrewMethod: 'v60',
    temperatureUnit: 'fahrenheit',
    strengthPreference: 'medium',
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

function coffeeReducer(state, action) {
  switch (action.type) {
    case 'ADD_COFFEE':
      return { ...state, coffees: [action.payload, ...state.coffees] };
    case 'UPDATE_COFFEE':
      return {
        ...state,
        coffees: state.coffees.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    case 'DELETE_COFFEE':
      return {
        ...state,
        coffees: state.coffees.filter((c) => c.id !== action.payload),
        favorites: state.favorites.filter((id) => id !== action.payload),
      };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.payload)
          ? state.favorites.filter((id) => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

export function CoffeeProvider({ children }) {
  const [state, dispatch] = useReducer(coffeeReducer, initialState);

  const addCoffee = useCallback(
    (coffee) => dispatch({ type: 'ADD_COFFEE', payload: coffee }),
    []
  );
  const updateCoffee = useCallback(
    (coffee) => dispatch({ type: 'UPDATE_COFFEE', payload: coffee }),
    []
  );
  const deleteCoffee = useCallback(
    (id) => dispatch({ type: 'DELETE_COFFEE', payload: id }),
    []
  );
  const toggleFavorite = useCallback(
    (id) => dispatch({ type: 'TOGGLE_FAVORITE', payload: id }),
    []
  );
  const updateSettings = useCallback(
    (settings) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    []
  );

  const value = {
    ...state,
    addCoffee,
    updateCoffee,
    deleteCoffee,
    toggleFavorite,
    updateSettings,
    isFavorite: (id) => state.favorites.includes(id),
  };

  return (
    <CoffeeContext.Provider value={value}>{children}</CoffeeContext.Provider>
  );
}

export function useCoffee() {
  const context = useContext(CoffeeContext);
  if (!context) {
    throw new Error('useCoffee must be used within a CoffeeProvider');
  }
  return context;
}
