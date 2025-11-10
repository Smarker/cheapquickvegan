import StripeBuyButton from '@/components/stripe-buy-button';

const products = [
  {
    name: '15 Vegan Recipes Notion Bundle',
    description: 'Easy, affordable, and delicious plant-based meals.',
    buyButtonId: 'buy_btn_1SMfQCA32Su6hYKXu1SFKQZe',
  },
];

export default function ShopPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Shop</h1>
      <p className="text-center text-muted-foreground mb-12">
        Buy my Notion recipe bundles — instant access after purchase!
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {products.map((p) => (
        <div key={p.name} className="flex items-center justify-between">
            <StripeBuyButton buyButtonId={p.buyButtonId} />
        </div>
        ))}
      </div>
    </main>
  );
}
