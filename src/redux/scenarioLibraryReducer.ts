import { createSlice } from "@reduxjs/toolkit";

const initialState: { refreshTrigger: number } = {
  refreshTrigger: 0,
};

const scenarioLibrarySlice = createSlice({
  name: "scenarioLibrary",
  initialState,
  reducers: {
    triggerRefresh: (state) => {
      state.refreshTrigger += 1;
    },
  },
});

export const { triggerRefresh } = scenarioLibrarySlice.actions;
export default scenarioLibrarySlice.reducer;
