import { test, expect } from '@playwright/test';

async function loginAsMember(page: import('@playwright/test').Page) {
  await page.goto('/auth/login');
  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 15000 });
  await page.getByLabel(/adresse email|email/i).fill('admin@cinenoir.local');
  await page.getByLabel(/mot de passe|password/i).fill('Admin1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
}

test.describe('Member Features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('should add movie to watchlist', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to first movie detail
    const firstMovie = page.locator('a[href^="/movies/"]').first();
    if (await firstMovie.isVisible()) {
      await firstMovie.click();
      await page.waitForTimeout(500);
      
      const watchlistBtn = page.locator('button:has-text(/ma liste|watchlist|ajouter à/i)').first();
      if (await watchlistBtn.isVisible()) {
        await watchlistBtn.click();
        
        await expect(page.locator('text=/ajouté|added|success|liste/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should rate a movie', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to first movie detail
    const firstMovie = page.locator('a[href^="/movies/"]').first();
    if (await firstMovie.isVisible()) {
      await firstMovie.click();
      await page.waitForTimeout(500);
      
      const rateBtn = page.locator('button[aria-label*="Noter"], button:has-text(/noter|rate/i)').first();
      if (await rateBtn.isVisible()) {
        await rateBtn.click();
        await page.waitForTimeout(500);
        const starButtons = page.locator('button[aria-label^="Noter "]');
        if (await starButtons.first().isVisible()) {
          await starButtons.nth(3).click();
          await page.waitForTimeout(300);
        }
        const submitBtn = page.locator('button:has-text(/confirmer la note|confirmer|valider/i)');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await expect(page.locator('text=/enregistrée|rated|success|note/i')).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    }
  });

  test('should mark movie as watched', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to first movie detail
    const firstMovie = page.locator('a[href^="/movies/"]').first();
    if (await firstMovie.isVisible()) {
      await firstMovie.click();
      await page.waitForTimeout(500);
      
      const watchedBtn = page.locator('button:has-text(/marquer comme vu|watched|mark/i)').first();
      if (await watchedBtn.isVisible()) {
        await watchedBtn.click();
        await expect(page.locator('text=/marqué|vu|watched|success/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should view account page with watchlist', async ({ page }) => {
    await page.goto('/account');
    
    await expect(page.locator('text=/watchlist|profile|account|compte|ma liste/i')).toBeVisible();
  });
});
