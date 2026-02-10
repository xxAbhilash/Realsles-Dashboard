import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./AuthReducer";
import scenarioLibraryReducer from "./scenarioLibraryReducer";

const store = configureStore({
  reducer: {
    auth: AuthReducer,
    scenarioLibrary: scenarioLibraryReducer,
  },
});

export default store;
