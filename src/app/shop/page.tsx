import StripeBuyButton from '@/components/stripe-buy-button';

const products = [
  {
    name: '15 Vegan Recipes Notion Bundle',
    description: 'The first 15 recipes on my site in Notion, ad-free.',
    buyButtonId: 'buy_btn_1SMfQCA32Su6hYKXu1SFKQZe',
  },
];

export default function ShopPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 pb-32"> {/* pb-32 ensures footer doesn’t overlap */}
      <h1 className="text-4xl font-bold text-center mb-8">Shop</h1>
      <p className="text-center text-muted-foreground mb-12">
        Buy my Notion recipe bundles and get instant access after purchase!
      </p>

      <div
        className={`grid gap-8 ${
          products.length === 1 ? 'grid-cols-1 justify-items-center' : 'md:grid-cols-2'
        }`}
      >
        {products.map((p) => (
          <div
            key={p.name}
            className="flex flex-col items-center justify-center space-y-4 w-full max-w-xs"
          >
            <h2 className="text-xl font-semibold text-center">{p.name}</h2>
            <p className="text-center text-muted-foreground">{p.description}</p>

            {/* Reserve space for Stripe button to prevent CLS */}
            <div className="w-full h-[250px] flex justify-center">
              <StripeBuyButton buyButtonId={p.buyButtonId} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
