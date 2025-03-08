export const ONE_MINUTE = 1000 * 60;
export const FIVE_MINUTES = ONE_MINUTE * 5;
export const ONE_HOUR = ONE_MINUTE * 60;

export const WORKING_OPTIONS = [1, 15, 20, 25, 30, 45, 50, 60].map((option) =>
  (option * ONE_MINUTE).toString()
);

export const BREAK_OPTIONS = [1, 3, 5, 7, 10].map((option) =>
  (option * ONE_MINUTE).toString()
);

export const LONG_BREAK_OPTIONS = [1, 10, 15, 20, 25, 30].map((option) =>
  (option * ONE_MINUTE).toString()
);

export const ULTRA_FOCUS_MODE_OPTIONS = [1, 25, 60, 120, 180, 240, 300].map(
  (option) => (option * ONE_MINUTE).toString()
);

export const REVIEW_PAGE =
  "https://chromewebstore.google.com/detail/pomodoro-grande/hmkklgcpkihbecjbohepediganhefdof/reviews";
