import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: ''
  },
  reducers: {
    setUserToken: (state, action) => {
      // notice: can be mutate
      state.token = action.payload
    },
  },
});

// 为每个 case reducer 函数生成 Action creators
export const { setUserToken} = userSlice.actions;

export default userSlice.reducer;