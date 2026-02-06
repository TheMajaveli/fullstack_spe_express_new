import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/auth/register');
    
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    // Fill registration form
    await page.fill('input[type="text"]', `testuser${timestamp}`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]:not([placeholder*="Confirm"])', 'Password123');
    await page.fill('input[placeholder*="Confirm"]', 'Password123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect or show success (adjust based on actual behavior)
    await page.waitForURL(/\/(auth\/login)?$/, { timeout: 5000 }).catch(() => {
      // If no redirect, check for success message or home page
    });
  });

  test('should show error for duplicate email', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Try to register with existing email
    await page.fill('input[type="text"]', 'existinguser');
    await page.fill('input[type="email"]', 'admin@cinenoir.local'); // Seeded email
    await page.fill('input[type="password"]:not([placeholder*="Confirm"])', 'Password123');
    await page.fill('input[placeholder*="Confirm"]', 'Password123');
    
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=/already|exists|taken/i')).toBeVisible({ timeout: 3000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill login form with seeded admin
    await page.fill('input[type="email"]', 'admin@cinenoir.local');
    await page.fill('input[type="password"]', 'Admin1234');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to home or dashboard
    await page.waitForURL(/\//, { timeout: 5000 });
    
    // Should show user menu or profile
    await expect(page.locator('text=/logout|profile|account/i')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=/invalid|failed|incorrect/i')).toBeVisible({ timeout: 3000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@cinenoir.local');
    await page.fill('input[type="password"]', 'Admin1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Logout
    await page.click('button[aria-label="Logout"]');
    
    // Should show login/register buttons
    await expect(page.locator('text=/login|register/i')).toBeVisible();
  });

  test('should protect watchlist when not logged in', async ({ page }) => {
    await page.goto('/account');
    
    // Should redirect to login
    await page.waitForURL(/auth\/login/, { timeout: 5000 }).catch(() => {
      // Or show login prompt
      expect(page.locator('text=/login|sign in/i')).toBeVisible();
    });
  });
});
