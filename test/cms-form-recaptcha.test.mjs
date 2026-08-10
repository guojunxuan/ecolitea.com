import assert from "node:assert/strict";
import test from "node:test";

import {
  getRecaptchaSubmissionState,
  isRecaptchaRequired,
} from "../src/components/CMSForm/recaptcha.js";

test("does not require reCAPTCHA unless the form explicitly enables it", () => {
  for (const value of [false, null, undefined]) {
    assert.equal(isRecaptchaRequired(value), false);
  }
});

test("requires reCAPTCHA when the form explicitly enables it", () => {
  assert.equal(isRecaptchaRequired(true), true);
});

test("does not read or block on a reCAPTCHA token when disabled", () => {
  let tokenReadCount = 0;

  const result = getRecaptchaSubmissionState(false, () => {
    tokenReadCount += 1;
    return "unused-token";
  });

  assert.equal(tokenReadCount, 0);
  assert.deepEqual(result, {
    captchaValue: undefined,
    shouldBlockSubmission: false,
  });
});

test("blocks a reCAPTCHA-enabled submission without a token", () => {
  const result = getRecaptchaSubmissionState(true, () => undefined);

  assert.deepEqual(result, {
    captchaValue: undefined,
    shouldBlockSubmission: true,
  });
});

test("returns the token without blocking a completed reCAPTCHA submission", () => {
  const result = getRecaptchaSubmissionState(true, () => "verified-token");

  assert.deepEqual(result, {
    captchaValue: "verified-token",
    shouldBlockSubmission: false,
  });
});
