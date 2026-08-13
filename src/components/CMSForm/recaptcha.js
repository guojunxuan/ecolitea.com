/**
 * @param {boolean | null | undefined} value
 * @returns {boolean}
 */
export const isRecaptchaRequired = (value) => value === true;

/**
 * @param {boolean | null | undefined} requireRecaptcha
 * @param {() => string | null | undefined} getCaptchaValue
 * @returns {{ captchaValue: string | undefined; shouldBlockSubmission: boolean }}
 */
export const getRecaptchaSubmissionState = (
  requireRecaptcha,
  getCaptchaValue,
) => {
  if (!isRecaptchaRequired(requireRecaptcha)) {
    return {
      captchaValue: undefined,
      shouldBlockSubmission: false,
    };
  }

  const captchaValue = getCaptchaValue() || undefined;

  return {
    captchaValue,
    shouldBlockSubmission: !captchaValue,
  };
};
