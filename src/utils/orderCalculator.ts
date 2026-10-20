export interface OrderItemInput {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface OrderSummaryResult {
  totalUnits: number;
  subtotalCents: number;
  subtotalFormatted: string;
  hasItems: boolean;
  items: Array<
    OrderItemInput & {
      lineTotalCents: number;
      lineTotalFormatted: string;
    }
  >;
  whatsappUrl: string;
}

const WHATSAPP_BASE = 'https://wa.me/593995613421';

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.floor(value);
  if (rounded < 0) return 0;
  if (rounded > 99) return 99;
  return rounded;
}

export function formatUsdFromCents(cents: number): string {
  const safeCents = Number.isFinite(cents) && cents >= 0 ? Math.round(cents) : 0;
  return `USD ${(safeCents / 100).toFixed(2)}`;
}

export function updateSelectionMap(
  current: Record<string, number>,
  productId: string,
  deltaOrExact: number,
  mode: 'delta' | 'exact' = 'delta'
): Record<string, number> {
  const prev = current[productId] ?? 0;
  const nextQty =
    mode === 'delta' ? clampQuantity(prev + deltaOrExact) : clampQuantity(deltaOrExact);
  const updated = { ...current };
  if (nextQty <= 0) {
    delete updated[productId];
  } else {
    updated[productId] = nextQty;
  }
  return updated;
}

export function calculateOrderSummary(
  catalog: Array<{ id: string; name: string; priceCents: number }>,
  quantities: Record<string, number>
): OrderSummaryResult {
  const activeItems: OrderSummaryResult['items'] = [];
  let totalUnits = 0;
  let subtotalCents = 0;

  for (const product of catalog) {
    const rawQty = quantities[product.id] ?? 0;
    const quantity = clampQuantity(rawQty);
    if (quantity > 0) {
      const lineTotalCents = quantity * product.priceCents;
      totalUnits += quantity;
      subtotalCents += lineTotalCents;
      activeItems.push({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        quantity,
        lineTotalCents,
        lineTotalFormatted: formatUsdFromCents(lineTotalCents),
      });
    }
  }

  const hasItems = activeItems.length > 0;
  const subtotalFormatted = hasItems
    ? formatUsdFromCents(subtotalCents)
    : 'Pendiente de seleccionar productos';

  let message =
    'Hola, vi su página y quisiera información sobre yogures naturales y griegos. Estoy revisando una demostración de su catálogo.';

  if (hasItems) {
    const lines = activeItems.map(
      (item) => `• ${item.quantity}x ${item.name} (${item.lineTotalFormatted} ref.)`
    );
    message = [
      'Hola La Morlaka, estoy revisando la demostración de su catálogo en Cuenca y armé esta selección:',
      ...lines,
      `Total unidades: ${totalUnits}`,
      `Subtotal referencial demo: ${subtotalFormatted}`,
      '¿Podrían confirmar disponibilidad, precios oficiales, contenido neto y condiciones de entrega o retiro?',
    ].join('\n');
  }

  const whatsappUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;

  return {
    totalUnits,
    subtotalCents,
    subtotalFormatted,
    hasItems,
    items: activeItems,
    whatsappUrl,
  };
}
