import { test, expect } from '@playwright/test';

test.describe('Attachment Security & Validation', () => {
  const INVALID_FILE = 'tests/fixtures/virus.exe';
  const OVERSIZED_FILE = 'tests/fixtures/huge_file.zip'; // > 5MB limit

  test('TC-01: Verify rejection of invalid file types (API & UI)', async ({ request, page }) => {
    // 1. API Level Validation (Back-end)
    const response = await request.post('/api/tickets/upload', {
      multipart: { file: { name: 'virus.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('test') } }
    });
    expect(response.status()).toBe(400); // Bad Request
    const body = await response.json();
    expect(body.message).toContain('Invalid file type');

    // 2. UI Level Validation (Front-end)
    await page.goto('/tickets/create');
    await page.setInputFiles('input[type="file"]', INVALID_FILE);
    const errorMsg = page.locator('.upload-error-text');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText(/invalid file type/i);
  });
});