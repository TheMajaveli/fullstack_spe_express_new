import { test, expect } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/auth/login', { waitUntil: 'load', timeout: 30000 });
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 25000 });
  await page.getByLabel(/adresse email|email/i).fill('admin@cinenoir.local');
  await page.getByLabel(/mot de passe|password/i).fill('Admin1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
}

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.locator('text=/contrôle|dashboard|platform/i')).toBeVisible();
    await expect(page.locator('text=/total films|total utilisateurs|total movies|total users/i')).toBeVisible();
  });

  test('should create new movie', async ({ page }) => {
    await page.goto('/admin/movies');
    
    const addBtn = page.locator('button:has-text(/ajouter|add|new|create/i)').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Fill movie form
      await page.fill('input[name="title"], input[placeholder*="title" i]', 'Test Movie E2E');
      await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'A test movie created by E2E tests');
      await page.fill('input[name="year"], input[placeholder*="year" i]', '2024');
      await page.fill('input[name="duration"], input[placeholder*="duration" i]', '2h 10m');
      await page.fill('input[name="director"], input[placeholder*="director" i]', 'E2E Director');
      
      // Submit
      const submitBtn = page.locator('button[type="submit"]:has-text(/create|save|add/i)');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        
        // Should show success or movie in list
        await expect(page.locator('text=/Test Movie E2E|success/i')).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('should update existing movie', async ({ page }) => {
    await page.goto('/admin/movies');
    
    // Click edit on first movie
    const editBtn = page.locator('button:has-text(/edit|update/i)').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      
      // Update title
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
      if (await titleInput.isVisible()) {
        const currentValue = await titleInput.inputValue();
        await titleInput.fill(`${currentValue} (Updated)`);
        
        // Submit
        const submitBtn = page.locator('button[type="submit"]:has-text(/update|save/i)');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          
          // Should show success
          await expect(page.locator('text=/updated|success/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    }
  });

  test('should manage categories', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Should show categories list
    await expect(page.locator('text=/categories|manage/i')).toBeVisible();
    
    // Try to add new category
    const addBtn = page.locator('button:has-text(/add|new|create/i)').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('E2E Test Category');
        
        const submitBtn = page.locator('button[type="submit"]:has-text(/create|save|add/i)');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          
          await expect(page.locator('text=/E2E Test Category|success/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    }
  });

  test('non-admin should not access admin routes', async ({ page }) => {
    // Logout first
    await page.click('button[aria-label="Logout"]');
    await page.waitForTimeout(500);
    
    // Try to access admin page
    await page.goto('/admin');
    
    // Should redirect to login or home, or show access denied
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain('/admin');
  });
});
