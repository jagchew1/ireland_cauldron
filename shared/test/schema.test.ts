import { describe, it, expect } from 'vitest';
import { Player, IngredientCard } from '../src/schema';

describe('schemas', () => {
  it('parses player', () => {
    const p = Player.parse({ id: 'p1', name: 'Alice', isReady: false, connected: true });
    expect(p.name).toBe('Alice');
  });
  it('parses ingredient card', () => {
    const c = IngredientCard.parse({ id: 'i1', kind: 'INGREDIENT', name: 'Herb', image: '/assets/ingredients/herb.png' });
    expect(c.kind).toBe('INGREDIENT');
  });
});
