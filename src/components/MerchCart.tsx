import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import type { Product, ProductVariant } from '../data/merch-products';
import { coupons } from '../data/merch-products';
import Button from './ui/Button';
import NeonText from './ui/NeonText';

export interface CartItem {
    product: Product;
    variant: ProductVariant;
    quantity: number;
}

interface MerchCartProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (productId: string, variantId: string, delta: number) => void;
    onRemoveItem: (productId: string, variantId: string) => void;
    onCheckout: (couponCode?: string, discount?: number) => void;
}

const MerchCart = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: MerchCartProps) => {
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [couponError, setCouponError] = useState('');

    const subtotal = items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

    const handleApplyCoupon = () => {
        setCouponError('');
        const coupon = coupons.find(c => c.code === couponCode.toUpperCase());

        if (!coupon) {
            setCouponError('Неверный промокод');
            return;
        }

        if (coupon.minAmount && subtotal < coupon.minAmount) {
            setCouponError(`Минимальная сумма заказа: ${coupon.minAmount}₽`);
            return;
        }

        let discount = 0;
        if (coupon.discountType === 'percent') {
            discount = Math.round(subtotal * (coupon.value / 100));
        } else {
            discount = coupon.value;
        }

        setAppliedCoupon({ code: coupon.code, discount });
        setCouponCode('');
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const total = subtotal - (appliedCoupon?.discount || 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />

                    {/* Cart Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[150] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <ShoppingBag className="text-white/80" />
                                Корзина
                                <span className="text-sm font-sans font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <ShoppingBag size={64} className="text-white/20" />
                                    <p className="text-white/60 text-lg">Корзина пуста</p>
                                    <Button variant="secondary" onClick={onClose}>Перейти к покупкам</Button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <motion.div
                                        key={`${item.product.id}-${item.variant.id}`}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5"
                                    >
                                        {/* Image */}
                                        <div className="w-20 h-24 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-white font-medium line-clamp-1">{item.product.name}</h3>
                                                <p className="text-white/50 text-sm">Размер: {item.variant.name}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 bg-black/30 rounded-lg p-1">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.product.id, item.variant.id, -1)}
                                                        className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-white text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.product.id, item.variant.id, 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="text-white font-bold">
                                                    {item.variant.price * item.quantity}₽
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => onRemoveItem(item.product.id, item.variant.id)}
                                            className="text-white/30 hover:text-red-500 transition-colors self-start p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md space-y-4">

                                {/* Coupon Input */}
                                {!appliedCoupon ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Промокод"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none uppercase"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode}
                                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                            >
                                                Применить
                                            </button>
                                        </div>
                                        {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Tag size={16} />
                                            <span className="text-sm font-medium">Промокод {appliedCoupon.code}</span>
                                        </div>
                                        <button onClick={removeCoupon} className="text-white/40 hover:text-white">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-white/60 text-sm">
                                        <span>Подытог:</span>
                                        <span>{subtotal}₽</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex items-center justify-between text-green-400 text-sm">
                                            <span>Скидка:</span>
                                            <span>-{appliedCoupon.discount}₽</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-white pt-2 border-t border-white/10">
                                        <span className="text-white/80">Итого:</span>
                                        <NeonText variant="red" size="2xl" glow className="font-bold">
                                            {total}₽
                                        </NeonText>
                                    </div>
                                </div>

                                <p className="text-xs text-white/40 text-center">
                                    Оплата производится в клубе при получении
                                </p>
                                <Button
                                    variant="primary"
                                    className="w-full py-4 text-lg"
                                    onClick={() => onCheckout(appliedCoupon?.code, appliedCoupon?.discount)}
                                    glow
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Оформить заказ <ArrowRight size={20} />
                                    </span>
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MerchCart;
