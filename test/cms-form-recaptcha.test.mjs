import assert from 'node:assert/strict'
import test from 'node:test'

import { isRecaptchaRequired } from '../src/components/CMSForm/recaptcha.js'

test('does not require reCAPTCHA unless the form explicitly enables it', () => {
  for (const value of [false, null, undefined]) {
    assert.equal(isRecaptchaRequired(value), false)
  }
})

test('requires reCAPTCHA when the form explicitly enables it', () => {
  assert.equal(isRecaptchaRequired(true), true)
})
