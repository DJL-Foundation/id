import { describe, expect, it } from 'vitest'
import { createUnimplementedDeleteResponse } from './delete-account'

describe('createUnimplementedDeleteResponse', () => {
  it('returns HTTP 500 with Unimplemented body', async () => {
    const response = createUnimplementedDeleteResponse()
    expect(response.status).toBe(500)
    await expect(response.text()).resolves.toBe('Unimplemented')
  })
})
