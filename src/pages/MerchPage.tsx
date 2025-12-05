import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { products } from '../data/merch-products';
import type { Product } from '../data/merch-products';
import type { CartItem } from '../components/MerchCart';
import MerchProductCard from '../components/MerchProductCard';
import MerchCart from '../components/MerchCart';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { api } from '../services/api';

const MERCH_OG_IMAGE = 'https://vnvnc.ru/merch/VNVNC-10.jpg';

const MerchPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('vnvnc_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [cartOpen, setCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

    const handleOpenLightbox = (images: string[], index: number) => {
        setLightboxSlides(images.map(src => ({ src })));
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Load cart from localStorage
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerComment, setCustomerComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSummary, setOrderSummary] = useState<{ couponCode?: string; discount?: number; total: number } | null>(null);

    useEffect(() => {
        localStorage.setItem('vnvnc_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, variantId: string) => {
        const variant = product.variants.find(v => v.id === variantId);
        if (!variant) return;

        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id && item.variant.id === variant.id);
            if (existing) {
                return prev.map(item =>
                    item === existing ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product, variant, quantity: 1 }];
        });
        setCartOpen(true);
    };

    const updateQuantity = (productId: string, variantId: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.product.id === productId && item.variant.id === variantId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const removeItem = (productId: string, variantId: string) => {
        setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.variant.id === variantId)));
    };

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
        const discount = orderSummary?.discount || 0;
        return subtotal - discount;
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const total = calculateTotal();
            const discount = orderSummary?.discount || 0;

            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    variantId: item.variant.id,
                    variantName: item.variant.name,
                    price: item.variant.price,
                    quantity: item.quantity
                })),
                total,
                discount,
                couponCode: orderSummary?.couponCode,
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    comment: customerComment,
                }
            };

            const result = await api.submitMerchOrder(orderData);

            if (result.success) {
                alert(`Заказ успешно оформлен! Номер заказа: ${result.orderId}. Мы свяжемся с вами для подтверждения.`);
                setCartItems([]);
                setCartOpen(false);
                setIsCheckoutOpen(false);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerComment('');
                setOrderSummary(null);
            } else {
                throw new Error(result.message || 'Failed to submit order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 relative">
            <Seo
                title="VNVNC Merch Store"
                description="Лимитированный дроп 2025: худи, футболки и аксессуары VNVNC. Бронируйте онлайн — забирайте в клубе."
                canonical="https://vnvnc.ru/merch"
                ogImage={MERCH_OG_IMAGE}
                additionalMeta={[
                    { property: 'og:image:width', content: '3459' },
                    { property: 'og:image:height', content: '5189' },
                    { property: 'og:image:alt', content: 'VNVNC merch drop 2025' },
                ]}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        {/* Header removed as per request */}
                    </div>

                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                        <ShoppingBag className="text-white group-hover:scale-110 transition-transform" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-black">
                                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Categories / Filter could go here */}

                {/* Categories / Filter could go here */}

                <div className="mb-8"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <MerchProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            onImageClick={handleOpenLightbox}
                        />
                    ))}
                </div>
            </div>

            <MerchCart
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onCheckout={(couponCode, discount) => {
                    const total = cartItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
                    setOrderSummary({
                        couponCode,
                        discount,
                        total: total - (discount || 0)
                    });
                    setCartOpen(false);
                    setIsCheckoutOpen(true);
                }}
            />

            {/* Checkout Modal */}
            <AnimatePresence>
                {isCheckoutOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsCheckoutOpen(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <button
                                onClick={() => setIsCheckoutOpen(false)}
                                className="absolute right-4 top-4 text-white/50 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-display font-bold mb-6 lowercase">оформление заказа</h2>

                            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-1 lowercase">имя</label>
                                    <input
                                        type="text"
                                        required
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-red transition-colors"
                                        placeholder="ваше имя"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1 lowercase">телефон</label>
                                    <input
                                        type="tel"
                                        required
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-red transition-colors"
                                        placeholder="+7 (999) 000-00-00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1 lowercase">комментарий</label>
                                    <textarea
                                        value={customerComment}
                                        onChange={(e) => setCustomerComment(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-red transition-colors h-24 resize-none"
                                        placeholder="комментарий к заказу"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        glow
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'оформляем...' : 'подтвердить заказ'}
                                    </Button>
                                    <p className="text-white/40 text-xs text-center mt-3">
                                        Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides}
            />
        </div>
    );
};

export default MerchPage;
