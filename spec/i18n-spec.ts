var IS_DEV_BUILD = false;
import { i18n, logger } from "../src/utils/i18n";

describe("i18n", () => {
  beforeEach(() => {
    spyOn(logger, "error");
  });

  it("should log error and return key when key is empty", () => {
    const key = "";
    const result = i18n(key);
    expect(logger.error).toHaveBeenCalledWith(
      "A valid key is required for i18n, got",
      key,
    );
    expect(result).toBe(key);
  });
});
