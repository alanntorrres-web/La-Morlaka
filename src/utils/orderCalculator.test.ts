import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampQuantity,
  formatUsdFromCents,
  updateSelectionMap,
  calculateOrderSummary,
} from './orderCalculator.ts';

const SAMPLE_CATALOG = [
  { id: 'mora', name: 'Yogur artesanal de mora', priceCents: 300 },
  { id: 'fresa', name: 'Yogur artesanal de fresa', priceCents: 300 },
  { id: 'mango', name: 'Yogur artesanal de mango', priceCents: 350 },
  { id: 'griego-natural', name: 'Yogur griego natural', priceCents: 250 },
];

test('clampQuantity enforces 0..99 integer bounds', () => {
  assert.equal(clampQuantity(-5), 0);
  assert.equal(clampQuantity(0), 0);
  assert.equal(clampQuantity(4.8), 4);
  assert.equal(clampQuantity(150), 99);
  assert.equal(clampQuantity(Number.NaN), 0);
});

test('formatUsdFromCents formats cents accurately in USD', () => {
  assert.equal(formatUsdFromCents(300), 'USD 3.00');
  assert.equal(formatUsdFromCents(350), 'USD 3.50');
  assert.equal(formatUsdFromCents(250), 'USD 2.50');
  assert.equal(formatUsdFromCents(0), 'USD 0.00');
});

test('updateSelectionMap adds, increments, and removes zeroed items', () => {
  let state: Record<string, number> = {};
  state = updateSelectionMap(state, 'mora', 2, 'delta');
  assert.deepEqual(state, { mora: 2 });

  state = updateSelectionMap(state, 'mora', 1, 'delta');
  assert.deepEqual(state, { mora: 3 });

  state = updateSelectionMap(state, 'mora', -3, 'delta');
  assert.deepEqual(state, {});
});

test('calculateOrderSummary computes units, USD subtotal, and WhatsApp URL', () => {
  const emptySummary = calculateOrderSummary(SAMPLE_CATALOG, {});
  assert.equal(emptySummary.hasItems, false);
  assert.equal(emptySummary.totalUnits, 0);
  assert.equal(emptySummary.subtotalFormatted, 'Pendiente de seleccionar productos');
  assert.ok(emptySummary.whatsappUrl.startsWith('https://wa.me/593995613421?text='));

  const populatedSummary = calculateOrderSummary(SAMPLE_CATALOG, {
    mora: 2,
    mango: 1,
    'griego-natural': 2,
  });
  assert.equal(populatedSummary.hasItems, true);
  assert.equal(populatedSummary.totalUnits, 5);
  // 2*300 + 1*350 + 2*250 = 600 + 350 + 500 = 1450 cents = USD 14.50
  assert.equal(populatedSummary.subtotalCents, 1450);
  assert.equal(populatedSummary.subtotalFormatted, 'USD 14.50');
  assert.ok(
    decodeURIComponent(populatedSummary.whatsappUrl).includes('2x Yogur artesanal de mora')
  );
});
