import { describe, expect, it } from 'vitest'
import { apply } from '../src/index.ts'
describe('node half', () => { it('is inert', () => expect(() => apply()).not.toThrow()) })
