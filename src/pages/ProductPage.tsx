import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductSpecs from '../components/ProductSpecs';
import ModelViewer from '../components/ModelViewer';
import ProductionTimeline from '../components/ProductionTimeline';

import { useProducts } from '../hooks/useProducts';
import { useCartStore, useWishlistStore } from '../utils/store';
import { formatPrice, calculateDiscount } from '../utils/formatting';
import { BRAND_NAME } from '../brand';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'model'>('specs');
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, addItem: addWishlist, removeItem: removeWishlist } = useWishlistStore();
  const cartCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    if (product?.modelUrl) setActiveTab('model');
    else setActiveTab('specs');
  }, [product?.id, product?.modelUrl]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | ${BRAND_NAME}`;
    }
    return () => {
      document.title = `${BRAND_NAME} | Premium 3D Prints`;
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0 || product.inStock === false) {
      toast.error('This product is out of stock');
      return;
    }
    addItem({ ...product, quantity });
    toast.success(`Added ${quantity} to bag`);
  };

  const inWishlist = product ? isInWishlist(product.id) : false;
  const discount = product?.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header
        cartCount={cartCount}
        onOpenCart={() => navigate('/?cart=1')}
        onOpenWishlist={() => navigate('/?wishlist=1')}
        onOpenOrders={() => navigate('/?track=orders')}
      />

      <main className="flex-grow pt-[7.5rem] md:pt-[8.25rem] lg:pt-[9.5rem]">
        <div className="do-container py-8 md:py-12">
          <Link
            to="/"
            className="do-link inline-flex items-center gap-1.5 mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to shop
          </Link>

          {loading && !product && (
            <div className="grid lg:grid-cols-2 gap-10 animate-pulse">
              <div className="aspect-square bg-[#f0f0f0] dark:bg-zinc-800" />
              <div className="space-y-4">
                <div className="h-8 bg-[#f0f0f0] dark:bg-zinc-800 w-2/3" />
                <div className="h-6 bg-[#f0f0f0] dark:bg-zinc-800 w-1/3" />
                <div className="h-24 bg-[#f0f0f0] dark:bg-zinc-800" />
              </div>
            </div>
          )}

          {!loading && !product && (
            <div className="text-center py-20 border border-dashed border-[#e8e8e8] dark:border-zinc-800">
              <p className="text-lg font-medium">Product not found</p>
              <Link to="/" className="do-btn-primary mt-6 inline-flex">
                Browse catalog
              </Link>
            </div>
          )}

          {product && (
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
              <div className="relative aspect-square bg-[#f5f5f5] dark:bg-zinc-800 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {discount > 0 && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-[#111] text-white px-2 py-1">
                    -{discount}%
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <p className="do-eyebrow">{product.category}</p>
                <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-[#111] dark:text-white mt-1">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-2xl font-semibold tabular-nums">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-[#6b6b6b] line-through tabular-nums">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6b6b6b] dark:text-zinc-400 mt-4 leading-relaxed">
                  {product.description}
                </p>

                {product.madeToOrder !== false && (
                  <div className="mt-6">
                    <ProductionTimeline
                      productionTime={product.productionTime}
                      madeToOrder={product.madeToOrder}
                      status="pending"
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-8 border-b border-[#e8e8e8] dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      activeTab === 'specs'
                        ? 'border-b-2 border-[#111] dark:border-white -mb-px text-[#111] dark:text-white'
                        : 'text-[#6b6b6b]'
                    }`}
                  >
                    Specs
                  </button>
                  {product.modelUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('model')}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                        activeTab === 'model'
                          ? 'border-b-2 border-[#111] dark:border-white -mb-px text-[#111] dark:text-white'
                          : 'text-[#6b6b6b]'
                      }`}
                    >
                      3D preview
                    </button>
                  )}
                </div>

                <div className="mt-6 min-h-[120px]">
                  {activeTab === 'specs' && <ProductSpecs product={product} />}
                  {activeTab === 'model' && (
                    <ModelViewer productName={product.name} modelUrl={product.modelUrl} />
                  )}
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <span className="text-xs font-semibold uppercase tracking-wider">Qty</span>
                  <div className="flex border border-[#e8e8e8] dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-[#f5f5f5] dark:hover:bg-zinc-800"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 min-w-[48px] text-center border-x border-[#e8e8e8] dark:border-zinc-700">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(Math.min(product.stock ?? quantity + 1, quantity + 1))
                      }
                      className="px-3 py-2 hover:bg-[#f5f5f5] dark:hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || product.inStock === false}
                    className="do-btn-primary flex-1 py-3.5 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Add to bag <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (inWishlist) {
                        removeWishlist(product.id);
                        toast.success('Removed from wishlist');
                      } else {
                        addWishlist(product.id);
                        toast.success('Saved to wishlist');
                      }
                    }}
                    className="do-btn-outline flex-1 py-3.5 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
                    {inWishlist ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer onTrackOrder={() => navigate('/?track=orders')} />
    </div>
  );
}