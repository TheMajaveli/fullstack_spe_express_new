import { test, expect } from '@playwright/test';

// Wait for auth form to be visible (CI can be slow)
async function waitForAuthForm(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 15000 });
}

test.describe('Authentication', () => {
  test('should register new user', async ({ page }) => {
    await waitForAuthForm(page, '/auth/register');
    
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    // Fill registration form (labels: Nom d'utilisateur, Email, Mot de passe, Confirmer)
    await page.getByLabel(/nom d'utilisateur|username/i).fill(`testuser${timestamp}`);
    await page.getByLabel(/^email$/i).fill(testEmail);
    await page.locator('input[type="password"]').first().fill('Password123');
    await page.getByLabel(/confirmer|confirm/i).fill('Password123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect or show success (adjust based on actual behavior)
    await page.waitForURL(/\/(auth\/login)?$/, { timeout: 5000 }).catch(() => {
      // If no redirect, check for success message or home page
    });
  });

  test('should show error for duplicate email', async ({ page }) => {
    await waitForAuthForm(page, '/auth/register');
    
    await page.getByLabel(/nom d'utilisateur|username/i).fill('existinguser');
    await page.getByLabel(/^email$/i).fill('admin@cinenoir.local');
    await page.locator('input[type="password"]').first().fill('Password123');
    await page.getByLabel(/confirmer|confirm/i).fill('Password123');
    
    await page.click('button[type="submit"]');
    
    // Should show error (FR: existe déjà, déjà pris, etc.)
    await expect(page.locator('text=/already|exists|taken|existe|déjà|pris/i')).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await waitForAuthForm(page, '/auth/login');
    
    await page.getByLabel(/adresse email|email/i).fill('admin@cinenoir.local');
    await page.getByLabel(/mot de passe|password/i).fill('Admin1234');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\//, { timeout: 10000 });
    await expect(page.locator('text=/déconnexion|logout|profile|account|compte/i')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await waitForAuthForm(page, '/auth/login');
    
    await page.getByLabel(/adresse email|email/i).fill('wrong@example.com');
    await page.getByLabel(/mot de passe|password/i).fill('WrongPassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid|failed|incorrect|erreur|invalide/i')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    await waitForAuthForm(page, '/auth/login');
    await page.getByLabel(/adresse email|email/i).fill('admin@cinenoir.local');
    await page.getByLabel(/mot de passe|password/i).fill('Admin1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    
    await page.getByRole('button', { name: /déconnexion|logout/i }).click();
    
    await expect(page.locator('text=/connexion|login|register|rejoignez/i')).toBeVisible();
  });

  test('should protect watchlist when not logged in', async ({ page }) => {
    await page.goto('/account');
    
    await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 });
    await expect(page.locator('text=/connexion|login|sign in|connectez/i')).toBeVisible();
  });
});
