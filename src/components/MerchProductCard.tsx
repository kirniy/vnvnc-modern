import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Product, ProductVariant } from '../data/merch-products';
import { tagTranslations } from '../data/merch-products';
import { colors } from '../utils/colors';
import Button from './ui/Button';
import NeonText from './ui/NeonText';

interface MerchProductCardProps {
    product: Product;
    onAddToCart: (product: Product, variantId: string) => void;
    onImageClick: (images: string[], index: number) => void;
}

const MerchProductCard: React.FC<MerchProductCardProps> = ({ product, onAddToCart, onImageClick }) => {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);

    // Auto-slideshow
    useEffect(() => {
        if (!product.images || product.images.length <= 1 || isInteracting) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [product.images, isInteracting]);

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (product.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (product.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    };

    const handleDragEnd = (_: any, info: any) => {
        const swipeThreshold = 50;
        if (info.offset.x < -swipeThreshold) {
            nextImage();
        } else if (info.offset.x > swipeThreshold) {
            prevImage();
        }
    };

    const hasImages = product.images && product.images.length > 0;

    return (
        <motion.div
            className="relative group rounded-2xl overflow-hidden backdrop-blur-md border border-white/10 flex flex-col h-full"
            style={{ backgroundColor: colors.glass.dark }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
        >
            {/* Image Container */}
            <div
                className="relative aspect-[4/5] overflow-hidden cursor-pointer group"
                onClick={() => onImageClick(product.images, currentImageIndex)}
            >
                {hasImages ? (
                    <motion.img
                        key={currentImageIndex}
                        src={product.images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        whileTap={{ cursor: "grabbing" }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20">
                        <ShoppingBag size={48} />
                    </div>
                )}

                {/* Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                    {product.tags.map(tag => (
                        <span
                            key={tag}
                            className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-white"
                        >
                            {tagTranslations[tag] || tag}
                        </span>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* Image Dots Indicator */}
                {product.images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {product.images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-1 leading-tight">{product.name}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>

                {/* Variant Selector */}
                <div className="space-y-4">
                    {product.variants.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariant(variant)}
                                    disabled={!variant.inStock}
                                    className={`
                    px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200
                    ${selectedVariant.id === variant.id
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-white/70 border-white/20 hover:border-white/50'}
                    ${!variant.inStock ? 'opacity-50 cursor-not-allowed line-through' : ''}
                  `}
                                >
                                    {variant.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex flex-col">
                            <span className="text-white/40 text-sm line-through decoration-white/40 decoration-1">
                                {selectedVariant.price}₽
                            </span>
                            <NeonText variant="red" size="xl" glow className="font-bold">
                                {Math.round(selectedVariant.price * 0.7)}₽
                            </NeonText>
                        </div>

                        <Button
                            variant="primary"
                            className="text-sm py-2 px-4"
                            onClick={() => onAddToCart(product, selectedVariant.id)}
                            glow
                        >
                            <span className="flex items-center gap-2">
                                <ShoppingBag size={16} />
                                В корзину
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MerchProductCard;
