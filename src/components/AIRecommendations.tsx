'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Target, 
  RefreshCw, 
  Star,
  Clock,
  MapPin,
  ChefHat,
  Zap,
  Heart,
  Eye,
  ThumbsUp,
  Settings
} from 'lucide-react';
import { useAIRecommendations, useDynamicPricing } from '@/hooks/useAIRecommendations';
import { useCart } from '@/hooks/useCart';
import { ProductRecommendation } from '@/lib/ai-recommendations';
import ImageWithFallback from './ui/ImageWithFallback';
import toast from 'react-hot-toast';

interface AIRecommendationsProps {
  pageType: 'homepage' | 'restaurant' | 'search' | 'cart' | 'checkout';
  title?: string;
  maxResults?: number;
  showConfidence?: boolean;
  showExplanations?: boolean;
  className?: string;
  variant?: 'grid' | 'list' | 'carousel';
  autoRefresh?: boolean;
}

export default function AIRecommendations({
  pageType,
  title,
  maxResults = 8,
  showConfidence = true,
  showExplanations = true,
  className = '',
  variant = 'grid',
  autoRefresh = true
}: AIRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'personalized' | 'popular' | 'trending'>('personalized');

  const {
    recommendations,
    isLoading,
    error,
    confidence,
    personalizedScore,
    refreshRecommendations,
    trackInteraction
  } = useAIRecommendations({
    pageType,
    maxResults,
    autoRefresh
  });

  const { addToCart } = useCart();

  // Handle product click
  const handleProductClick = (product: ProductRecommendation) => {
    trackInteraction('view', product.productId, {
      recommendationScore: product.score,
      reasons: product.reasons,
      source: 'ai_recommendations'
    });
  };

  // Handle add to cart
  const handleAddToCart = (product: ProductRecommendation) => {
    // Mock product data (would come from product service in real app)
    const mockProduct = {
      id: product.productId,
      name: product.metadata?.productName || 'AI Önerisi',
      price: product.metadata?.estimatedPrice || 25,
      category: product.category,
      restaurantId: product.restaurantId,
      isActive: true,
      image: '/food-placeholder.jpg'
    };

    addToCart(mockProduct as any, 1);
    
    trackInteraction('add_cart', product.productId, {
      recommendationScore: product.score,
      source: 'ai_recommendations'
    });

    toast.success(`${mockProduct.name} sepete eklendi`);
  };

  // Get title based on page type
  const getTitle = () => {
    if (title) return title;
    
    const titles = {
      homepage: '🤖 Size Özel AI Önerileri',
      restaurant: '🍽️ Bu Restorandan Öneriler',
      search: '🔍 Arama Sonuçlarına Özel',
      cart: '🛒 Sepetinize Uygun Öneriler',
      checkout: '✨ Son Dakika Önerileri'
    };
    
    return titles[pageType] || 'AI Önerileri';
  };

  // Filter recommendations by category
  const filteredRecommendations = recommendations?.recommendations.filter(rec => 
    selectedCategory === 'all' || rec.category === selectedCategory
  ) || [];

  // Get unique categories
  const categories = ['all', ...new Set(recommendations?.recommendations.map(rec => rec.category) || [])];

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Önerileri Yüklenemedi</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshRecommendations}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">{getTitle()}</h2>
              <p className="text-purple-100 text-sm">
                AI destekli kişiselleştirilmiş öneriler
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Confidence Score */}
            {showConfidence && recommendations && (
              <div className="text-right">
                <div className="text-sm text-purple-100">Güven Skoru</div>
                <div className="text-lg font-bold">
                  {Math.round(confidence * 100)}%
                </div>
              </div>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={refreshRecommendations}
              disabled={isLoading}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Stats */}
        {recommendations && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{recommendations.recommendations.length}</div>
              <div className="text-xs text-purple-200">Öneri</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(personalizedScore * 100)}%</div>
              <div className="text-xs text-purple-200">Kişisel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(recommendations.diversityScore * 100)}%</div>
              <div className="text-xs text-purple-200">Çeşitlilik</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Tümü' : category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Explanations */}
        {showExplanations && recommendations?.explanations && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Neden Bu Öneriler?
            </h4>
            <ul className="space-y-1">
              {recommendations.explanations.map((explanation, index) => (
                <li key={index} className="text-blue-800 text-sm flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {explanation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Grid */}
        {!isLoading && filteredRecommendations.length > 0 && (
          <div className={
            variant === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : variant === 'list'
              ? 'space-y-4'
              : 'flex space-x-4 overflow-x-auto pb-4'
          }>
            <AnimatePresence>
              {filteredRecommendations.map((product, index) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  index={index}
                  variant={variant}
                  onView={() => handleProductClick(product)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecommendations.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Öneri Yok</h3>
            <p className="text-gray-500 mb-4">
              Daha fazla etkileşimde bulunarak kişiselleştirilmiş öneriler alabilirsiniz.
            </p>
            <button
              onClick={refreshRecommendations}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Öneriler Oluştur
            </button>
          </div>
        )}

        {/* Strategy Info */}
        {recommendations && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  {recommendations.strategyUsed === 'ai-powered' ? 'AI Destekli' : 'Kural Tabanlı'}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Şimdi güncellendi
                </span>
              </div>
              <span className="text-xs">
                Güven: {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: ProductRecommendation;
  index: number;
  variant: 'grid' | 'list' | 'carousel';
  onView: () => void;
  onAddToCart: () => void;
}

function ProductCard({ product, index, variant, onView, onAddToCart }: ProductCardProps) {
  const { suggestedPrice, discount } = useDynamicPricing(
    product.productId, 
    product.metadata?.estimatedPrice || 25
  );

  const isGrid = variant === 'grid';
  const isList = variant === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${
        variant === 'carousel' ? 'min-w-[280px]' : ''
      }`}
      onClick={onView}
    >
      <div className={isList ? 'flex' : ''}>
        {/* Image */}
        <div className={`relative ${isList ? 'w-24 h-24' : 'h-48'}`}>
          <ImageWithFallback
            src="/food-placeholder.jpg"
            alt={product.metadata?.productName || 'Ürün'}
            className="w-full h-full object-cover"
          />
          
          {/* Score Badge */}
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(product.score * 100)}%
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ₺{discount} İndirim
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-4 ${isList ? 'flex-1' : ''}`}>
          <div className="mb-2">
            <h3 className={`font-semibold text-gray-900 ${isList ? 'text-sm' : 'text-base'}`}>
              {product.metadata?.productName || `${product.category} Önerisi`}
            </h3>
            <p className="text-sm text-gray-500">
              {product.metadata?.restaurantName || 'Restoran'}
            </p>
          </div>

          {/* Rating & Category */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.estimatedRating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{product.category}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {discount > 0 ? (
                <>
                  <span className="text-lg font-bold text-green-600">₺{suggestedPrice}</span>
                  <span className="text-sm text-gray-400 line-through">
                    ₺{product.metadata?.estimatedPrice || 25}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">₺{suggestedPrice}</span>
              )}
            </div>
          </div>

          {/* Reasons */}
          {!isList && product.reasons.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {product.reasons[0]}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className={`w-full bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors ${
              isList ? 'py-1 text-sm' : 'py-2'
            }`}
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </motion.div>
  );
}
