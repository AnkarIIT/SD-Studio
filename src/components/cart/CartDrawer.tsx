import { useCartStore } from '../../store/useCartStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  // Handle Escape key to close cart
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleCart();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, toggleCart]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={toggleCart}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-black border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-brand-cyan" size={24} />
            <h2 className="text-xl font-heading tracking-widest uppercase">Your Cart</h2>
          </div>
          <button onClick={toggleCart} className="text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
              <ShoppingBag size={48} />
              <p className="uppercase tracking-widest text-sm">Cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 glass p-4 rounded-2xl border border-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Img</span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold uppercase tracking-tight line-clamp-1">{item.title}</h3>
                    <p className="text-brand-cyan font-bold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg border border-white/10 px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-white/50 hover:text-white">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white/50 hover:text-white">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[10px] uppercase text-red-400 hover:text-red-300 font-bold tracking-widest">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 glass bg-black/50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-white/50 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-black text-brand-cyan">₹{getCartTotal().toLocaleString()}</span>
            </div>
            <button 
              onClick={() => {
                toggleCart();
                navigate('/checkout');
              }}
              className="w-full bg-brand-cyan text-black font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
